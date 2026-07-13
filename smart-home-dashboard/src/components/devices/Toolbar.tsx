import { Plus } from 'lucide-react';
import Button from '../ui/Button';

type FilterType = 'all' | 'sensor' | 'relay' | 'ir';

interface ToolbarProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  onAddDevice: () => void;
}

const filterButtons = [
  { id: 'all', label: 'Все' },
  { id: 'sensor', label: 'Датчики' },
  { id: 'relay', label: 'Реле' },
  { id: 'ir', label: 'ИК' },
] as const;

export default function Toolbar({ activeFilter, onFilterChange, onAddDevice }: ToolbarProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h3 className="text-2xl font-semibold">Устройства</h3>
        <p className="text-zinc-500 text-sm mt-1">Управление и мониторинг всех подключённых устройств</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-1">
          {filterButtons.map((btn) => (
            <button
              key={btn.id}
              onClick={() => onFilterChange(btn.id as FilterType)}
              className={`px-5 py-2 text-sm font-medium rounded-xl transition-all ${
                activeFilter === btn.id
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-950'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        <Button icon={Plus} onClick={onAddDevice}>
          Добавить устройство
        </Button>
      </div>
    </div>
  );
}