import express from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const app = express();
const PORT = 3001;
const WS_PORT = 8080;

app.use(cors());
app.use(express.json());

let lastMeasurementTime = 0;
const MEASUREMENT_INTERVAL = 10 * 60 * 1000;

// ===================== Автоочистка старых измерений =====================
async function cleanOldMeasurements() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const deleted = await prisma.measurement.deleteMany({ where: { timestamp: { lt: sevenDaysAgo } } });
  if (deleted.count > 0) console.log(`🧹 Удалено ${deleted.count} записей`);
}
cleanOldMeasurements();
setInterval(cleanOldMeasurements, 24 * 60 * 60 * 1000);

// ===================== Seed =====================
async function seedDatabase() {
  const existing = await prisma.device.findUnique({ where: { id: 'light1' } });
  if (!existing) {
    await prisma.device.create({
      data: { id: 'light1', name: 'Освещённость', room: 'Гостиная', type: 'sensor', value: 0, unit: 'lux' },
    });
  }
}
seedDatabase();

// ===================== REST API =====================
app.get('/api/devices', async (req, res) => {
  const devices = await prisma.device.findMany({ include: { irRemote: true } });
  res.json(devices);
});

app.post('/api/devices', async (req, res) => {
  const { name, room, type } = req.body;

  const device = await prisma.device.create({
    data: { name, room, type, unit: type === 'sensor' ? 'lux' : undefined },
  });

  if (type === 'ir_remote') {
    await prisma.iRRemote.create({ data: { deviceId: device.id, name, room } });
  }

  res.status(201).json(device);
});

app.put('/api/devices/:id', async (req, res) => {
  const { id } = req.params;
  const { name, room } = req.body;
  const device = await prisma.device.upsert({
    where: { id },
    update: { name, room },
    create: { id, name: name || 'Новое устройство', room: room || 'Гостиная', type: 'sensor', value: 0, unit: 'lux' },
  });
  res.json(device);
});

app.delete('/api/devices/:id', async (req, res) => {
  await prisma.device.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

app.get('/api/devices/:id/history', async (req, res) => {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const measurements = await prisma.measurement.findMany({
    where: { deviceId: req.params.id, timestamp: { gte: oneDayAgo } },
    orderBy: { timestamp: 'asc' },
  });
  res.json(measurements);
});

// ===================== ИК-КОМАНДЫ =====================
app.post('/api/ir-remotes/:remoteId/commands', async (req, res) => {
  const { remoteId } = req.params;
  const { name, code, protocol, bits } = req.body;

  try {
    const irRemote = await prisma.iRRemote.findFirst({ where: { deviceId: remoteId } });
    if (!irRemote) return res.status(404).json({ error: 'IRRemote не найден' });

    const command = await prisma.iRCommand.create({
      data: {
        remoteId: irRemote.id,
        name: name || `Кнопка ${Date.now()}`,
        code: String(code),
        protocol: protocol || 'NEC',
        bits: bits || 32,
        order: 999,
      },
    });

    console.log(`✅ Команда сохранена: ${command.name}`);
    res.status(201).json(command);
  } catch (err: any) {
    console.error('❌ Ошибка сохранения команды:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/ir-remotes/:remoteId/commands', async (req, res) => {
  const remoteId = req.params.remoteId;
  const irRemote = await prisma.iRRemote.findFirst({ where: { deviceId: remoteId } });
  if (!irRemote) return res.json([]);

  const commands = await prisma.iRCommand.findMany({
    where: { remoteId: irRemote.id },
    orderBy: { order: 'asc' },
  });
  res.json(commands);
});

app.delete('/api/ir-commands/:commandId', async (req, res) => {
  await prisma.iRCommand.delete({ where: { id: req.params.commandId } });
  res.status(204).send();
});

app.put('/api/ir-commands/:commandId', async (req, res) => {
  const { commandId } = req.params;
  const { name, code, protocol, bits } = req.body;

  try {
    const command = await prisma.iRCommand.update({
      where: { id: commandId },
      data: {
        name: name || undefined,
        code: code ? String(code) : undefined,
        protocol: protocol || undefined,
        bits: bits || undefined,
      },
    });
    res.json(command);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ===================== WebSocket =====================
const wss = new WebSocketServer({ port: WS_PORT });

wss.on('connection', (ws) => {
  console.log('✅ ESP8266 подключён');

  const connectMsg = JSON.stringify({
    type: 'notification',
    title: 'Устройство подключено',
    message: 'ESP8266 успешно подключился',
    notificationType: 'success',
  });
  wss.clients.forEach((client) => client.readyState === WebSocket.OPEN && client.send(connectMsg));

  ws.on('message', async (message: string) => {
    try {
      const data = JSON.parse(message.toString());

      if (data.type === 'send_ir') {
        console.log(`📤 Отправка ИК-команды на STM32: ${data.name} (${data.code})`);
        const payload = JSON.stringify({ type: 'send_ir', code: data.code });
        wss.clients.forEach((client) => client.readyState === WebSocket.OPEN && client.send(payload));
        return;
      }

      if (data.ir_received !== undefined) {
        const broadcast = JSON.stringify({
          type: 'ir_learned',
          code: data.ir_received,
          protocol: data.protocol || 'NEC',
          bits: data.bits || 32,
        });
        wss.clients.forEach((client) => client.readyState === WebSocket.OPEN && client.send(broadcast));
      }

      if (data.light_raw !== undefined) {
        const raw = Number(data.light_raw);
        const lux = Math.max(0, Math.min(1000, Math.floor((950 - raw) * 0.12)));

        const now = Date.now();

        await prisma.device.upsert({
          where: { id: 'light1' },
          update: { value: lux, raw, lastUpdated: new Date() },
          create: { id: 'light1', name: 'Освещённость', room: 'Гостиная', type: 'sensor', value: lux, unit: 'lux', raw },
        });

        if (now - lastMeasurementTime >= MEASUREMENT_INTERVAL) {
          lastMeasurementTime = now;

          await prisma.measurement.create({
            data: {
              deviceId: 'light1',
              type: 'light',
              value: lux,
              timestamp: new Date(),
            }
          });

          console.log(`✅ Сохранено в Measurement (throttled): lux=${lux}`);
        }

        const broadcastData = JSON.stringify({ light_raw: raw, lux });
        wss.clients.forEach((client) => client.readyState === WebSocket.OPEN && client.send(broadcastData));
      }
    } catch (e) {
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  console.log(`🔌 WebSocket on ws://localhost:${WS_PORT}`);
});