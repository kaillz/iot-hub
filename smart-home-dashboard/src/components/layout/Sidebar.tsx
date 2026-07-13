import { Home, Zap, Sun, Droplet } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useNotifications } from '../../store/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

const rooms = [
  { id: 'all', name: 'Все комнаты', icon: Home },
  { id: 'living', name: 'Гостиная', icon: Home },
  { id: 'kitchen', name: 'Кухня', icon: Zap },
  { id: 'bedroom', name: 'Спальня', icon: Sun },
  { id: 'bathroom', name: 'Ванная', icon: Droplet },
];

export default function Sidebar() {
  const { currentRoomId, setCurrentRoom } = useStore();
  const { notifications, removeNotification, clearAll } = useNotifications();

  return (
    <div className="w-72 border-r border-zinc-800 bg-zinc-950 flex flex-col h-full overflow-auto">
      <div className="p-6 pt-8">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-widest text-zinc-500 mb-2 px-3">ДОМ</div>
          <div className="px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-2xl flex items-center justify-between text-sm">
            Главный дом
            <span className="text-xs text-zinc-500">▼</span>
          </div>
        </div>

        <div className="uppercase text-xs font-semibold tracking-widest text-zinc-500 mb-4 px-3">
          КОМНАТЫ
        </div>

        <div className="space-y-1">
          {rooms.map((room) => {
            const Icon = room.icon;
            const isActive = currentRoomId === room.id;

            return (
              <button
                key={room.id}
                onClick={() => setCurrentRoom(room.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all group ${
                  isActive
                    ? 'bg-zinc-800 text-white'
                    : 'hover:bg-zinc-900 text-zinc-400 hover:text-zinc-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} className={isActive ? 'text-sky-400' : ''} />
                  <span className="font-medium">{room.name}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-auto border-t border-zinc-800 p-6">
        <div className="uppercase text-xs font-semibold tracking-widest text-zinc-500 mb-3 px-3 flex justify-between items-center">
          <span>УВЕДОМЛЕНИЯ</span>
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Очистить
            </button>
          )}
        </div>

        <div className="space-y-3 max-h-80 overflow-auto">
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => removeNotification(notif.id)}
                className={`p-4 rounded-2xl border-l-4 cursor-pointer hover:bg-zinc-800 transition-all ${
                  notif.type === 'success' ? 'border-emerald-500 bg-emerald-950/30' :
                  notif.type === 'warning' ? 'border-amber-500 bg-amber-950/30' :
                  notif.type === 'error' ? 'border-red-500 bg-red-950/30' :
                  'border-zinc-600 bg-zinc-900'
                }`}
              >
                <div className="font-medium text-sm">{notif.title}</div>
                <div className="text-zinc-400 text-sm mt-1">{notif.message}</div>
                <div className="text-[10px] text-zinc-500 mt-2.5">
                  {formatDistanceToNow(notif.timestamp, { addSuffix: true, locale: ru })}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-zinc-400 text-sm text-center py-6">
              Пока нет уведомлений
            </div>
          )}
        </div>
      </div>
    </div>
  );
}