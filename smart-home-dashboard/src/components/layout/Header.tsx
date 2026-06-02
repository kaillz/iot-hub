import { Plus, Search, Sun, Moon, Home } from 'lucide-react';
import Button from '../ui/Button';
import { useStore } from '../../store/useStore';

type TabType = 'devices' | 'graphs' | 'scenarios';

interface HeaderProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onAddDevice: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const tabs = [
  { id: 'devices' as const, label: 'Устройства' },
  { id: 'scenarios' as const, label: 'Сценарии' },
  { id: 'graphs' as const, label: 'Графики' },
];

export default function Header({ 
  activeTab, 
  onTabChange, 
  onAddDevice, 
  searchQuery, 
  onSearchChange 
}: HeaderProps) {
  const { isDark, toggleTheme } = useStore();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 border-b border-zinc-800 bg-zinc-950 px-8 flex items-center z-50">
      {/* Левая часть */}
      <div className="flex items-center gap-8 flex-1">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <Home size={20} className="text-white" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Мой Умный Дом</h1>
        </div>

        <div className="px-5 py-1.5 bg-zinc-900 border border-zinc-700 rounded-2xl text-sm flex items-center gap-2 text-zinc-400">
          Главный дом 
          <span className="text-xs">▼</span>
        </div>

        <div className="flex items-center gap-10 ml-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`text-base font-medium pb-1 transition-all relative ${
                activeTab === tab.id
                  ? 'text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute -bottom-px left-0 right-0 h-0.5 bg-sky-500 rounded" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Правая часть */}
      <div className="flex items-center gap-4">
        {/* Поиск — только здесь */}
        <div className="relative w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Поиск устройств или комнат..."
            className="w-full bg-zinc-900 border border-zinc-700 pl-11 py-2.5 rounded-2xl text-sm focus:outline-none focus:border-sky-600 placeholder:text-zinc-500"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              ✕
            </button>
          )}
        </div>

        {/* Добавить устройство */}
        <Button 
          variant="secondary" 
          size="sm"
          icon={Plus}
          className="w-10 h-10 p-0"
          onClick={onAddDevice}
          title="Добавить устройство"
        />

        {/* Тема */}
        <button
          onClick={toggleTheme}
          className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-zinc-900 transition-colors text-zinc-400 hover:text-white"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
}