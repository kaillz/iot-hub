import Button from '../ui/Button';
import { Power, Thermometer, Droplet, Sun, Zap } from 'lucide-react';
import { useState } from 'react';
import DeviceDetailModal from './DeviceDetailModal';
import IRRemoteCard from './IRRemoteCard';
import { useStore } from '../../store/useStore';

interface DeviceCardProps {
  id: string;
  onToggle?: (id: string) => void;
  onUpdate?: (id: string, updatedData: any) => void;
  onDelete?: (id: string) => void;
  onShowHistory?: (device: any) => void;
}

export default function DeviceCard({
  id,
  onToggle,
  onUpdate,
  onDelete,
  onShowHistory,
}: DeviceCardProps) {
  const device = useStore((state) => state.devices.find((d) => d.id === id));

  const [isDetailOpen, setIsDetailOpen] = useState(false);

  if (!device) return null;

  // === ИК-ПУЛЬТ ===
  if (device.type === 'ir_remote') {
    return (
      <IRRemoteCard
        id={device.id}
        name={device.name}
        room={device.room}
        onDelete={onDelete}
      />
    );
  }

  // === ОБЫЧНЫЕ УСТРОЙСТВА ===
  const isRelay = device.type === 'relay';
  const isSensor = device.type === 'sensor';
  const isIR = device.type === 'ir';

  const isOn = isRelay && typeof device.status === 'boolean' ? device.status : false;

  const getIcon = () => {
    if (device.id === 'light1' || device.name.toLowerCase().includes('освещённость')) return Sun;
    if (isRelay) return Power;
    if (isSensor) return Thermometer;
    if (isIR) return Zap;
    return Sun;
  };

  const Icon = getIcon();

  const displayValue = device.value !== null && device.value !== undefined
    ? device.value.toFixed(0)
    : '—';

  return (
    <>
      <div
        onClick={() => setIsDetailOpen(true)}
        className="group bg-zinc-900 border border-zinc-800 hover:border-sky-600/60 rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5 cursor-pointer"
      >
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 flex-shrink-0 bg-zinc-800 rounded-2xl flex items-center justify-center group-hover:bg-sky-950/50 transition-colors">
                <Icon size={32} className="text-sky-400" />
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-lg leading-tight tracking-tight">{device.name}</h4>
                <p className="text-zinc-500 text-sm mt-1">{device.room}</p>
              </div>
            </div>

            {isRelay && (
              <div className={`px-4 py-1 text-xs font-semibold rounded-full border self-start mt-1 ${
                isOn ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-zinc-700 text-zinc-400 border-zinc-600'
              }`}>
                {isOn ? 'ВКЛ' : 'ВЫКЛ'}
              </div>
            )}

            {isIR && (
              <div className="px-4 py-1 text-xs font-semibold rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 self-start mt-1">
                ИК
              </div>
            )}
          </div>
        </div>

        {isSensor && (
          <div className="px-6 pb-8">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-6xl font-semibold tabular-nums tracking-tighter">
                {displayValue}
              </span>
              <span className="text-3xl text-zinc-500 font-medium">
                {device.unit || ''}
              </span>
            </div>
          </div>
        )}

        <div className="p-6 pt-2 border-t border-zinc-800">
          {isRelay && (
            <Button
              variant={isOn ? "primary" : "secondary"}
              className="w-full py-3.5 text-base font-medium"
              onClick={(e) => { e.stopPropagation(); onToggle?.(device.id); }}
            >
              {isOn ? "Выключить" : "Включить"}
            </Button>
          )}

          {isSensor && (
            <Button
              variant="ghost"
              className="w-full text-sky-400 hover:text-sky-300 py-3"
              onClick={(e) => {
                e.stopPropagation();
                onShowHistory?.(device);
              }}
            >
              Посмотреть историю измерений
            </Button>
          )}

          {isIR && (
            <Button
              variant="secondary"
              className="w-full py-3.5 text-base font-medium"
              onClick={(e) => { e.stopPropagation(); alert(`Отправлена ИК-команда для ${device.name}`); }}
            >
              Отправить команду
            </Button>
          )}
        </div>
      </div>

      <DeviceDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        device={device}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    </>
  );
}