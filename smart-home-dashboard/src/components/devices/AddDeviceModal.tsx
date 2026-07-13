import { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { api } from '../../lib/api';
import { useStore } from '../../store/useStore';

interface AddDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddDeviceModal({ isOpen, onClose }: AddDeviceModalProps) {
  const { loadDevices } = useStore();

  const [formData, setFormData] = useState({
    name: '',
    type: 'network' as 'network' | 'ir_remote',
    room: 'Гостиная',
    ip: '',
  });

  const rooms = ['Гостиная', 'Кухня', 'Спальня', 'Ванная', 'Коридор'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      await api.addDevice({
        name: formData.name.trim(),
        room: formData.room,
        type: formData.type,
        ip: formData.type === 'network' ? formData.ip.trim() : undefined,
      });

      await loadDevices();
      onClose();

      setFormData({ name: '', type: 'network', room: 'Гостиная', ip: '' });
    } catch (err) {
      console.error('Ошибка добавления устройства', err);
      alert('Не удалось добавить устройство');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Добавить устройство">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm text-zinc-400 mb-2">Название устройства</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-zinc-950 border border-zinc-700 rounded-2xl px-4 py-3 focus:outline-none focus:border-sky-600"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-2">Тип устройства</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'network' })}
              className={`py-4 rounded-2xl text-sm font-medium transition-all ${
                formData.type === 'network'
                  ? 'bg-sky-600 text-white'
                  : 'bg-zinc-800 hover:bg-zinc-700'
              }`}
            >
              🌐 Сетевое устройство
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'ir_remote' })}
              className={`py-4 rounded-2xl text-sm font-medium transition-all ${
                formData.type === 'ir_remote'
                  ? 'bg-amber-600 text-white'
                  : 'bg-zinc-800 hover:bg-zinc-700'
              }`}
            >
              📡 ИК-пульт (обучаемый)
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-2">Комната</label>
          <select
            value={formData.room}
            onChange={(e) => setFormData({ ...formData, room: e.target.value })}
            className="w-full bg-zinc-950 border border-zinc-700 rounded-2xl px-4 py-3 focus:outline-none focus:border-sky-600"
          >
            {rooms.map((room) => (
              <option key={room} value={room}>{room}</option>
            ))}
          </select>
        </div>

        {formData.type === 'network' && (
          <div>
            <label className="block text-sm text-zinc-400 mb-2">IP-адрес (опционально)</label>
            <input
              type="text"
              value={formData.ip}
              onChange={(e) => setFormData({ ...formData, ip: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-2xl px-4 py-3 focus:outline-none focus:border-sky-600"
            />
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            className="flex-1 py-3"
            onClick={onClose}
          >
            Отмена
          </Button>
          <Button type="submit" variant="primary" className="flex-1 py-3">
            Добавить
          </Button>
        </div>
      </form>
    </Modal>
  );
}