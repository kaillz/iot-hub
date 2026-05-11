import Button from '../ui/Button';
import { Power, Thermometer, Droplet, Sun, Zap } from 'lucide-react';
import { useState } from 'react';
import DeviceDetailModal from './DeviceDetailModal';

interface DeviceCardProps {
  id: string;
  name: string;
  room: string;
  type: 'relay' | 'sensor' | 'ir';
  status: boolean | number | string;
  value?: number | null;
  unit?: string;
  onToggle?: (id: string) => void;
  onUpdate?: (id: string, updatedData: any) => void;
  onDelete?: (id: string) => void;
  onShowHistory?: (device: any) => void;
}

export default function DeviceCard({
  id,
  name,
  room,
  type,
  status,
  value,
  unit,
  onToggle,
  onUpdate,
  onDelete,
  onShowHistory
}: DeviceCardProps) {

  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const isRelay = type === 'relay';
  const isSensor = type === 'sensor';
  const isIR = type === 'ir';

  const isOn = isRelay && typeof status === 'boolean' ? status : false;

  // Безопасное форматирование значения
  const displayValue = isSensor && value !== null && value !== undefined 
    ? value.toFixed(value % 1 === 0 ? 0 : 1) 
    : null;

  const Icon = type === 'relay' ? Power 
             : type === 'sensor' ? Thermometer 
             : type === 'ir' ? Zap 
             : Sun;

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
                <h4 className="font-semibold text-lg leading-tight tracking-tight">{name}</h4>
                <p className="text-zinc-500 text-sm mt-1">{room}</p>
              </div>
            </div>

            {isRelay && (
              <div className={`px-4 py-1 text-xs font-semibold rounded-full border self-start mt-1 ${
                isOn 
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                  : 'bg-zinc-700 text-zinc-400 border-zinc-600'
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

        {/* Значение для датчиков */}
        {isSensor && (
          <div className="px-6 pb-8">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-6xl font-semibold tabular-nums tracking-tighter">
                {displayValue !== null ? displayValue : '—'}
              </span>
              <span className="text-3xl text-zinc-500 font-medium">
                {unit || ''}
              </span>
            </div>
            <div className="text-center text-xs text-zinc-500 mt-3">
              Ожидаем данные от датчика...
            </div>
          </div>
        )}

        <div className="p-6 pt-2 border-t border-zinc-800">
          {isRelay && (
            <Button 
              variant={isOn ? "primary" : "secondary"}
              className="w-full py-3.5 text-base font-medium"
              onClick={(e) => { e.stopPropagation(); onToggle?.(id); }}
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
                onShowHistory?.({ id, name, room, type, status, value, unit });
              }}
            >
              Посмотреть историю измерений
            </Button>
          )}

          {isIR && (
            <Button 
              variant="secondary"
              className="w-full py-3.5 text-base font-medium"
              onClick={(e) => { e.stopPropagation(); alert(`Отправлена ИК-команда для ${name}`); }}
            >
              Отправить команду
            </Button>
          )}
        </div>
      </div>

      <DeviceDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        device={{ id, name, room, type, status, value, unit }}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    </>
  );
}