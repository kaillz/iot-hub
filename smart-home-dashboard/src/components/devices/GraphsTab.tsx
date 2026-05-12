import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useStore } from '../../store/useStore';
import { api } from '../../lib/api';

export default function GraphsTab() {
  const selectedSensorType = useStore((state) => state.selectedSensorType);
  const [currentSensor, setCurrentSensor] = useState<'temperature' | 'humidity' | 'light'>('light');
  const [chartData, setChartData] = useState<any[]>([]);

  // Загружаем историю из БД за последние 24 часа
  const loadHistory = async () => {
    try {
      const history = await api.getHistory('light1', 'light', 500); // 500 точек = много

      const formatted = history.map((m: any) => ({
        time: new Date(m.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        light: Math.round(m.value),
        temperature: 0,
        humidity: 0,
      }));

      setChartData(formatted);
    } catch (err) {
      console.error('Не удалось загрузить историю', err);
    }
  };

  useEffect(() => {
    loadHistory();
    const interval = setInterval(loadHistory, 60000); // обновляем график раз в минуту
    return () => clearInterval(interval);
  }, []);

  // При смене датчика (пока только light)
  useEffect(() => {
    if (selectedSensorType) setCurrentSensor(selectedSensorType);
  }, [selectedSensorType]);

  const sensorConfigs = {
    temperature: { key: 'temperature', label: 'Температура (°C)', color: '#f59e0b' },
    humidity: { key: 'humidity', label: 'Влажность (%)', color: '#3b82f6' },
    light: { key: 'light', label: 'Освещённость (lux)', color: '#eab308' },
  };

  const config = sensorConfigs[currentSensor];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-semibold">Аналитика и графики</h3>
          <p className="text-zinc-500 mt-1">Данные за последние 24 часа из SQLite</p>
        </div>

        <div className="flex gap-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-1">
          {Object.entries(sensorConfigs).map(([key, sensor]) => (
            <button
              key={key}
              onClick={() => setCurrentSensor(key as any)}
              className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
                currentSensor === key ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-950'
              }`}
            >
              {sensor.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8">
        <ResponsiveContainer width="100%" height={420}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="time" stroke="#52525b" />
            <YAxis stroke="#52525b" />
            <Tooltip contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '12px' }} />
            <Line
              type="natural"
              dataKey={config.key}
              stroke={config.color}
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}