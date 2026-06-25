import { useState, useEffect } from 'react';
import Button from '../ui/Button';
import { Zap } from 'lucide-react';
import { api } from '../../lib/api';
import { useNotifications } from '../../store/useNotifications';
import { wsClient } from '../../lib/websocket';
import IRRemoteDetailModal from './IRRemoteDetailModal';

interface IRRemoteCardProps {
  id: string;
  name: string;
  room: string;
  onDelete?: (id: string) => void;
  onUpdate?: (id: string, data: any) => void;
}

export default function IRRemoteCard({ id, name, room, onDelete, onUpdate }: IRRemoteCardProps) {
  const [commands, setCommands] = useState<any[]>([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const { addNotification } = useNotifications();

  const loadCommands = async () => {
    try {
      const data = await api.getIRCommands(id);
      setCommands(data.sort((a: any, b: any) => a.order - b.order));
    } catch (err) {
      console.error(err);
      setCommands([
        { id: 'sample-1', name: 'Вкючение', code: '0x1FE48B7', order: 0 },
        { id: 'sample-2', name: 'Выключение', code: '0x1FEA05F', order: 1 },
        { id: 'sample-3', name: 'Тепло +', code: '0x1FE58A7', order: 2 },
        { id: 'sample-4', name: 'Тепло -', code: '0x1FEA857', order: 3 },
      ]);
    }
  };

  useEffect(() => {
    loadCommands();
  }, [id]);

  const sendCommand = (cmd: any, e: React.MouseEvent) => {
    e.stopPropagation();
    wsClient.send({ type: 'send_ir', code: cmd.code, name: cmd.name });
    addNotification('Команда отправлена', cmd.name, 'success');
  };

  return (
    <>
      <div 
        onClick={() => setShowDetailModal(true)}
        className="bg-zinc-900 border border-zinc-800 hover:border-amber-500/60 rounded-3xl p-6 cursor-pointer transition-all"
      >
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center">
              <Zap size={28} className="text-amber-400" />
            </div>
            <div>
              <h4 className="font-semibold text-lg">{name}</h4>
              <p className="text-zinc-500 text-sm">{room}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {commands.length > 0 ? (
            commands.slice(0, 6).map((cmd) => (
              <Button
                key={cmd.id}
                variant="secondary"
                className="h-9 text-xs truncate"
                onClick={(e) => sendCommand(cmd, e)}
              >
                {cmd.name}
              </Button>
            ))
          ) : (
            <div className="col-span-3 text-xs text-zinc-500 py-2 text-center">
              Нет кнопок
            </div>
          )}
        </div>
      </div>

      <IRRemoteDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        remote={{ id, name, room }}
        commands={commands}
        onUpdateRemote={onUpdate || (() => {})}
        onDeleteRemote={onDelete || (() => {})}
        onCommandsUpdated={loadCommands}
      />
    </>
  );
}