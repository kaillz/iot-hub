import { useState, useEffect } from 'react';
import Button from '../ui/Button';
import { Zap, Plus, Trash2 } from 'lucide-react';
import { api } from '../../lib/api';
import { useNotifications } from '../../store/useNotifications';
import { wsClient } from '../../lib/websocket';

interface IRRemoteCardProps {
  id: string;
  name: string;
  room: string;
  onDelete?: (id: string) => void;
}

export default function IRRemoteCard({ id, name, room, onDelete }: IRRemoteCardProps) {
  const [commands, setCommands] = useState<any[]>([]);
  const [isLearning, setIsLearning] = useState(false);
  const [learningName, setLearningName] = useState('');
  const { addNotification } = useNotifications();

  const loadCommands = async () => {
    try {
      const data = await api.getIRCommands(id);
      setCommands(data.sort((a: any, b: any) => a.order - b.order));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadCommands();
  }, [id]);

  useEffect(() => {
    const handleIRMessage = (data: any) => {
      if (data.type === 'ir_learned' && isLearning) {
        saveCommand(data.code, data.protocol, data.bits);
      }
    };

    wsClient.addListener(handleIRMessage);
    return () => wsClient.removeListener(handleIRMessage);
  }, [isLearning]);

  const saveCommand = async (code: number, protocol: any, bits: any) => {
    try {
      await api.addIRCommand(id, {
        name: learningName.trim() || `Кнопка ${commands.length + 1}`,
        code: String(code),
        protocol: protocol || 'NEC',
        bits: bits || 32,
      });

      addNotification('Команда сохранена', `"${learningName || 'Новая'}" успешно записана`, 'success');
      loadCommands();
    } catch (err) {
      addNotification('Ошибка', 'Не удалось сохранить команду', 'error');
    }

    setIsLearning(false);
    setLearningName('');
  };

  const startLearning = () => {
    setIsLearning(true);
    setLearningName('');
    addNotification('Режим обучения', 'Наведите пульт на TL1838 и нажмите кнопку', 'info');
  };

  const deleteCommand = async (commandId: string) => {
    if (!confirm('Удалить эту команду?')) return;
    try {
      await api.deleteIRCommand(commandId);
      loadCommands();
    } catch (err) {
      console.error(err);
    }
  };

  const sendCommand = (cmd: any) => {
    wsClient.ws?.send(JSON.stringify({
      type: 'send_ir',
      code: cmd.code,
      name: cmd.name
    }));

    addNotification('Команда отправлена', cmd.name, 'success');
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
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

        <Button variant="ghost" size="sm" onClick={() => onDelete?.(id)}>
          <Trash2 size={18} />
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {commands.map((cmd) => (
          <Button
            key={cmd.id}
            variant="secondary"
            className="h-12 text-sm"
            onClick={() => sendCommand(cmd)}
          >
            {cmd.name}
          </Button>
        ))}

        <Button
          variant="ghost"
          className="h-12 border-dashed border-zinc-700 hover:border-amber-400 text-amber-400 flex items-center justify-center gap-2"
          onClick={startLearning}
        >
          <Plus size={20} />
          {isLearning ? 'Ожидание сигнала...' : 'Новая команда'}
        </Button>
      </div>

      {isLearning && (
        <div className="mt-6 p-5 bg-zinc-950 border border-amber-500/30 rounded-2xl">
          <p className="text-amber-400 text-sm mb-3">Название кнопки (можно оставить пустым):</p>
          <input
            type="text"
            value={learningName}
            onChange={(e) => setLearningName(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl px-4 py-3 mb-4"
            placeholder="Например: Вкл / Temp Up"
            autoFocus
          />
          <Button variant="secondary" className="w-full" onClick={() => setIsLearning(false)}>
            Отмена
          </Button>
        </div>
      )}
    </div>
  );
}