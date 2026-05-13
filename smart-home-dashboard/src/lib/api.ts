// src/lib/api.ts
const API_BASE = 'http://localhost:3001/api';

export const api = {
  // Получить все устройства
  async getAllDevices(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/devices`);
    if (!res.ok) throw new Error('Failed to fetch devices');
    return res.json();
  },

  // Обновить устройство (имя, комнату и т.д.)
  async updateDevice(id: string, data: any): Promise<any> {
    const res = await fetch(`${API_BASE}/devices/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update device');
    return res.json();
  },

  // Удалить устройство
  async deleteDevice(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/devices/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete device');
  },

  // Получить историю измерений (для графиков)
  async getHistory(deviceId: string, type: string = 'light', limit: number = 200) {
    const res = await fetch(
      `${API_BASE}/devices/${deviceId}/history?type=${type}&limit=${limit}`
    );
    if (!res.ok) throw new Error('Failed to fetch history');
    return res.json();
  },

  // Заглушка для реле и ИК (пока)
  async toggleRelay(deviceId: string): Promise<boolean> {
    console.log(`[API] Переключение реле ${deviceId} (будет реализовано позже)`);
    return true;
  },

  async sendIRCommand(deviceId: string, command: string): Promise<boolean> {
    console.log(`[IR] Команда ${command} на устройство ${deviceId}`);
    return true;
  },

  async addDevice(deviceData: any): Promise<any> {
    const res = await fetch(`${API_BASE}/devices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(deviceData),
    });

    if (!res.ok) throw new Error('Не удалось добавить устройство');
    return res.json();
  },

  // === ИК-ПУЛЬТЫ ===
  async addIRRemote(name: string, room: string) {
    const res = await fetch(`${API_BASE}/devices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, room, type: 'ir_remote' }),
    });
    if (!res.ok) throw new Error('Не удалось добавить ИК-пульт');
    return res.json();
  },

  async getIRCommands(remoteId: string) {
    const res = await fetch(`${API_BASE}/ir-remotes/${remoteId}/commands`);
    if (!res.ok) throw new Error('Не удалось загрузить команды');
    return res.json();
  },

  async addIRCommand(remoteId: string, commandData: any) {
    const res = await fetch(`${API_BASE}/ir-remotes/${remoteId}/commands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(commandData),
    });
    if (!res.ok) throw new Error('Не удалось добавить команду');
    return res.json();
  },

  async deleteIRCommand(commandId: string) {
    const res = await fetch(`${API_BASE}/ir-commands/${commandId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Не удалось удалить команду');
  },

  updateIRCommand: async (commandId: string, data: any): Promise<any> => {
    const res = await fetch(`http://localhost:3001/api/ir-commands/${commandId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Ошибка обновления команды');
    return res.json();
  },
};