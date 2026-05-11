import { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface AddDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (device: any) => void;
}

export default function AddDeviceModal({ isOpen, onClose, onAdd }: AddDeviceModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'relay' as 'relay' | 'sensor' | 'ir',
    room: 'Гостиная',
  });

  const rooms = ['Гостиная', 'Кухня', 'Спальня', 'Ванная', 'Коридор'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    onAdd({
      id: Date.now().toString(),
      name: formData.name.trim(),
      room: formData.room,
      type: formData.type,
      status: formData.type === 'relay' ? false : formData.type === 'sensor' ? 0 : 'ready',
      icon: null,
    });

    setFormData({ name: '', type: 'relay', room: 'Гостиная' });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Добавить новое устройство">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm text-zinc-400 mb-2">Название устройства</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-zinc-950 border border-zinc-700 rounded-2xl px-4 py-3 focus:outline-none focus:border-sky-600"
            placeholder="Например: Освещение над столом"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-2">Тип устройства</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'relay', label: 'Реле' },
              { value: 'sensor', label: 'Датчик' },
              { value: 'ir', label: 'ИК' },
            ].map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setFormData({ ...formData, type: t.value as any })}
                className={`py-3 rounded-2xl text-sm font-medium transition-all ${
                  formData.type === t.value
                    ? 'bg-sky-600 text-white'
                    : 'bg-zinc-800 hover:bg-zinc-700'
                }`}
              >
                {t.label}
              </button>
            ))}
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

        <div className="flex gap-3 pt-4">
          <Button 
            type="button" 
            variant="secondary" 
            className="flex-1 py-3"
            onClick={onClose}
          >
            Отмена
          </Button>
          <Button 
            type="submit" 
            variant="primary" 
            className="flex-1 py-3"
          >
            Добавить устройство
          </Button>
        </div>
      </form>
    </Modal>
  );
}