import { useState, useEffect } from 'react';
import Button from '../ui/Button';
import { X, Trash2, Edit2 } from 'lucide-react';
import { api } from '../../lib/api';
import { useNotifications } from '../../store/useNotifications';
import { wsClient } from '../../lib/websocket';

interface IRRemoteDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  remote: {
    id: string;
    name: string;
    room: string;
  };
  commands: any[];
  onUpdateRemote: (id: string, data: any) => void;
  onDeleteRemote: (id: string) => void;
  onCommandsUpdated: () => void;
}

export default function IRRemoteDetailModal({
  isOpen,
  onClose,
  remote,
  commands,
  onUpdateRemote,
  onDeleteRemote,
  onCommandsUpdated
}: IRRemoteDetailModalProps) {
  const [name, setName] = useState(remote.name);
  const [room, setRoom] = useState(remote.room);
  const [editingCommandId, setEditingCommandId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newCommandName, setNewCommandName] = useState('');
  const [isReRecording, setIsReRecording] = useState(false);
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (!isOpen) return;

    const handleIRMessage = (data: any) => {
      if (data.type !== 'ir_learned') return;

      if (isAdding && newCommandName) {
        saveNewCommand(data.code, data.protocol, data.bits);
      } else if (isReRecording && editingCommandId) {
        updateCommandCode(editingCommandId, data.code, data.protocol, data.bits);
      }
    };

    wsClient.addListener(handleIRMessage);
    return () => wsClient.removeListener(handleIRMessage);
  }, [isOpen, isAdding, isReRecording, newCommandName, editingCommandId]);

  if (!isOpen) return null;

  const saveNewCommand = async (code: number, protocol: any, bits: any) => {
    try {
      await api.addIRCommand(remote.id, {
        name: newCommandName.trim(),
        code: String(code),
        protocol: protocol || 'NEC',
        bits: bits || 32,
      });
      addNotification('Команда сохранена', `"${newCommandName}"`, 'success');
      onCommandsUpdated();
      resetStates();
    } catch (err) {
      addNotification('Ошибка', 'Не удалось сохранить команду', 'error');
    }
  };

  const updateCommandCode = async (commandId: string, code: number, protocol: any, bits: any) => {
    try {
      await api.updateIRCommand(commandId, { code: String(code), protocol, bits });
      addNotification('Код успешно перезаписан', '', 'success');
      onCommandsUpdated();
      resetStates();
    } catch (err) {
      addNotification('Ошибка', 'Не удалось перезаписать код', 'error');
    }
  };

  const resetStates = () => {
    setIsAdding(false);
    setIsReRecording(false);
    setNewCommandName('');
    setEditingCommandId(null);
  };

  const handleSaveRemote = async () => {
    try {
      await api.updateDevice(remote.id, { name, room });
      onUpdateRemote(remote.id, { name, room });
      addNotification('Пульт обновлён', '', 'success');
      onClose();
    } catch (err) {
      addNotification('Ошибка', 'Не удалось обновить пульт', 'error');
    }
  };

  const handleDeleteRemote = () => {
    if (confirm(`Удалить пульт "${remote.name}"?`)) {
      onDeleteRemote(remote.id);
      onClose();
    }
  };

  const handleEditCommand = (cmd: any) => {
    setEditingCommandId(cmd.id);
    setEditingName(cmd.name);
    setIsReRecording(false);
  };

  const handleSaveCommandName = async () => {
    if (!editingCommandId || !editingName.trim()) return;
    try {
      await api.updateIRCommand(editingCommandId, { name: editingName.trim() });
      addNotification('Название изменено', '', 'success');
      onCommandsUpdated();
      setEditingCommandId(null);
    } catch (err) {
      addNotification('Ошибка', 'Не удалось изменить название', 'error');
    }
  };

  const handleDeleteCommand = async (commandId: string) => {
    if (!confirm('Удалить эту команду?')) return;
    try {
      await api.deleteIRCommand(commandId);
      onCommandsUpdated();
      addNotification('Команда удалена', '', 'success');
    } catch (err) {
      addNotification('Ошибка', 'Не удалось удалить команду', 'error');
    }
  };

  const startLearningNewCommand = () => {
    if (!newCommandName.trim()) {
      addNotification('Ошибка', 'Введите название кнопки', 'error');
      return;
    }
    setIsReRecording(false);
    setIsAdding(false);
    addNotification('Режим обучения', 'Наведите пульт и нажмите кнопку', 'info');
  };

  const startReRecording = () => {
    setIsReRecording(true);
    addNotification('Перезапись кода', 'Наведите пульт и нажмите кнопку заново', 'info');
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-8 w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold">Настройка ИК-пульта</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Название пульта</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-2xl px-4 py-3"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Комната</label>
              <select
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-2xl px-4 py-3"
              >
                <option value="Гостиная">Гостиная</option>
                <option value="Кухня">Кухня</option>
                <option value="Спальня">Спальня</option>
                <option value="Ванная">Ванная</option>
                <option value="Коридор">Коридор</option>
              </select>
            </div>
          </div>

          <Button variant="primary" className="w-full py-3" onClick={handleSaveRemote}>
            Сохранить изменения пульта
          </Button>

          {!isAdding ? (
            <Button 
              variant="ghost" 
              className="w-full border border-dashed border-amber-500/50 hover:border-amber-500 text-amber-400 py-3"
              onClick={() => setIsAdding(true)}
            >
              + Добавить новую команду
            </Button>
          ) : (
            <div className="p-4 bg-zinc-950 border border-amber-500/30 rounded-2xl">
              <div className="mb-3">
                <label className="block text-sm text-zinc-400 mb-2">Название новой кнопки</label>
                <input
                  type="text"
                  value={newCommandName}
                  onChange={(e) => setNewCommandName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl px-4 py-3"
                  placeholder="Например: Вкл / Temp +"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => { setIsAdding(false); setNewCommandName(''); }}>
                  Отмена
                </Button>
                <Button variant="primary" className="flex-1" onClick={startLearningNewCommand}>
                  Готово — жду сигнал
                </Button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm text-zinc-400 mb-3">Кнопки пульта ({commands.length})</label>
            <div className="space-y-2 max-h-80 overflow-auto pr-2">
              {commands.length > 0 ? (
                commands.map((cmd) => (
                  <div key={cmd.id} className="flex items-center gap-3 bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 group">
                    {editingCommandId === cmd.id ? (
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onBlur={handleSaveCommandName}
                          className="flex-1 bg-zinc-900 border border-sky-500 rounded-xl px-3 py-2 text-sm"
                          autoFocus
                        />
                        <button
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            startReRecording();
                          }}
                          className="p-2 text-zinc-400 hover:text-amber-400 transition-colors"
                          title="Перезаписать код"
                        >
                          <Edit2 size={18} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex-1 font-medium">{cmd.name}</div>
                    )}

                    {!editingCommandId && (
                      <>
                        <button onClick={() => handleEditCommand(cmd)} className="text-zinc-400 hover:text-white p-2">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDeleteCommand(cmd.id)} className="text-red-400 hover:text-red-500 p-2">
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-zinc-500 text-sm">Нет кнопок</div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-zinc-800 mt-6">
          <Button 
            variant="ghost" 
            className="w-full text-red-400 hover:text-red-500 py-3"
            onClick={handleDeleteRemote}
          >
            Удалить пульт
          </Button>
        </div>
      </div>
    </div>
  );
}