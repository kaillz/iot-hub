import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useStore } from '../../store/useStore';

const initialChartData = [
  { time: '00:00', temperature: 22.1, humidity: 48, light: 12 },
  { time: '04:00', temperature: 21.4, humidity: 52, light: 8 },
  { time: '08:00', temperature: 23.8, humidity: 45, light: 180 },
  { time: '12:00', temperature: 26.2, humidity: 38, light: 890 },
  { time: '16:00', temperature: 25.7, humidity: 42, light: 650 },
  { time: '20:00', temperature: 24.1, humidity: 47, light: 95 },
];

export default function GraphsTab() {
  const selectedSensorType = useStore((state) => state.selectedSensorType);

  const [currentSensor, setCurrentSensor] = useState<'temperature' | 'humidity' | 'light'>('temperature');
  const [chartData, setChartData] = useState(initialChartData);

  // Автоматически переключаем график при выборе датчика из карточки
  useEffect(() => {
    if (selectedSensorType) {
      setCurrentSensor(selectedSensorType);
    }
  }, [selectedSensorType]);

  const sensorConfigs = {
    temperature: { key: 'temperature', label: 'Температура (°C)', color: '#f59e0b' },
    humidity:    { key: 'humidity', label: 'Влажность (%)', color: '#3b82f6' },
    light:       { key: 'light', label: 'Освещённость (lux)', color: '#eab308' },
  };

  const config = sensorConfigs[currentSensor];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-semibold">Аналитика и графики</h3>
          <p className="text-zinc-500 mt-1">Реальные данные с BME280 и KY-018</p>
        </div>

        <div className="flex gap-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-1">
          {Object.entries(sensorConfigs).map(([key, sensor]) => (
            <button
              key={key}
              onClick={() => setCurrentSensor(key as any)}
              className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
                currentSensor === key
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:bg-zinc-950'
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
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#18181b', 
                border: 'none', 
                borderRadius: '12px',
                color: '#fff'
              }} 
            />

            <Line 
              type="natural"
              dataKey={config.key} 
              stroke={config.color} 
              strokeWidth={3}
              dot={{ fill: config.color, r: 5 }}
              activeDot={{ r: 7 }}
              name={config.label}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 text-center text-xs text-zinc-500">
        Ожидаем реальные данные от ESP8266 • Обновление каждые 2 секунды
      </div>
    </div>
  );
}