import { Thermometer, Droplet, Sun, Wifi } from 'lucide-react';
import { useState, useEffect } from 'react';
import { wsClient } from '../../lib/websocket';

export default function QuickStatsBar() {
  const [temp, setTemp] = useState<number | null>(null);
  const [humidity, setHumidity] = useState<number | null>(null);
  const [light, setLight] = useState<number | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    wsClient.setOnMessage((data) => {
      if (data.temperature !== undefined) setTemp(data.temperature);
      if (data.humidity !== undefined) setHumidity(data.humidity);
      
      if (data.light_raw !== undefined) {
        // Калибровка освещённости
        let normalized = 1000 - Math.floor(data.light_raw / 4.5);
        normalized = Math.max(0, Math.min(1000, normalized));
        setLight(normalized);
      }
      
      setConnected(true);
    });
  }, []);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-8 py-5 mb-8 flex items-center justify-between text-sm">
      <div className="flex items-center gap-12">
        {/* Температура */}
        <div className="flex items-center gap-3">
          <Thermometer size={24} className="text-orange-400" />
          <div>
            <span className="font-semibold text-xl">{temp !== null ? temp.toFixed(1) : '—'}</span>
            <span className="text-zinc-500 ml-1">°C</span>
          </div>
        </div>

        {/* Влажность */}
        <div className="flex items-center gap-3">
          <Droplet size={24} className="text-sky-400" />
          <div>
            <span className="font-semibold text-xl">{humidity !== null ? humidity.toFixed(1) : '—'}</span>
            <span className="text-zinc-500 ml-1">%</span>
          </div>
        </div>

        {/* Освещённость */}
        <div className="flex items-center gap-3">
          <Sun size={24} className="text-yellow-400" />
          <div>
            <span className="font-semibold text-xl">{light !== null ? light : '—'}</span>
            <span className="text-zinc-500 ml-1">lux</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 text-sm">
        <Wifi size={20} className={connected ? "text-emerald-400" : "text-zinc-500"} />
        <span className={connected ? "text-emerald-400" : "text-zinc-500"}>
          {connected ? "Подключено к ESP8266" : "Ожидание данных..."}
        </span>
      </div>
    </div>
  );
}