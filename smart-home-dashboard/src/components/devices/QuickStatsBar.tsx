import { Thermometer, Droplet, Sun, Wifi } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function QuickStatsBar() {
  const { devices, isConnected } = useStore();
  const lightDevice = devices.find(d => d.id === 'light1');
  const lux = lightDevice?.value ?? null;
  const raw = lightDevice?.raw ?? null;   // ← отладка

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-8 py-5 mb-8 flex items-center justify-between text-sm">
      <div className="flex items-center gap-12">
        <div className="flex items-center gap-3">
          <Sun size={24} className="text-yellow-400" />
          <div>
            <span className="font-semibold text-xl">{lux !== null ? lux : '—'}</span>
            <span className="text-zinc-500 ml-1">lux</span>
            {raw !== null && (
              <div className="text-[10px] text-zinc-500 mt-0.5">raw: {raw}</div>
            )}
          </div>
        </div>

        {/* заглушки BME */}
        <div className="flex items-center gap-3 opacity-40">
          <Thermometer size={24} className="text-orange-400" />
          <div><span className="font-semibold text-xl">—</span><span className="text-zinc-500 ml-1">°C</span></div>
        </div>
        <div className="flex items-center gap-3 opacity-40">
          <Droplet size={24} className="text-sky-400" />
          <div><span className="font-semibold text-xl">—</span><span className="text-zinc-500 ml-1">%</span></div>
        </div>
      </div>

      <div className="flex items-center gap-3 text-sm">
        <Wifi size={20} className={isConnected ? "text-emerald-400" : "text-zinc-500"} />
        <span className={isConnected ? "text-emerald-400" : "text-zinc-500"}>
          {isConnected ? "Подключено" : "Ожидание..."}
        </span>
      </div>
    </div>
  );
}