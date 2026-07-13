import { useState, useEffect, useRef } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useStore } from '../../store/useStore';

interface DeviceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  device: any;
  onUpdate?: (id: string, updatedData: any) => void;
  onDelete?: (id: string) => void;
}

export default function DeviceDetailModal({
  isOpen,
  onClose,
  device: initialDevice,
  onUpdate,
  onDelete,
}: DeviceDetailModalProps) {
  const { devices, updateDevice, deleteDevice } = useStore();

  const currentDevice = devices.find((d) => d.id === initialDevice?.id);

  const [name, setName] = useState('');
  const [room, setRoom] = useState('Гостиная');

  const prevOpenRef = useRef(false);

  useEffect(() => {
    if (isOpen && !prevOpenRef.current && currentDevice) {
      setName(currentDevice.name || '');
      setRoom(currentDevice.room || 'Гостиная');
    }
    prevOpenRef.current = isOpen;
  }, [isOpen, currentDevice]);

  const handleSave = () => {
    if (!currentDevice?.id) return;

    const updatedData = { name, room };

    onUpdate?.(currentDevice.id, updatedData);
    updateDevice(currentDevice.id, updatedData);

    onClose();
  };

  const handleDelete = () => {
    if (!currentDevice?.id) return;
    if (confirm(`Удалить устройство "${name}"?`)) {
      onDelete?.(currentDevice.id);
      deleteDevice(currentDevice.id);
      onClose();
    }
  };

  if (!isOpen || !currentDevice) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Настройка устройства">
      <div className="space-y-6">
        <div>
          <label className="block text-sm text-zinc-400 mb-2">Название устройства</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-700 rounded-2xl px-4 py-3 focus:outline-none focus:border-sky-600"
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-2">Комната</label>
          <select
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-700 rounded-2xl px-4 py-3 focus:outline-none focus:border-sky-600"
          >
            <option value="Гостиная">Гостиная</option>
            <option value="Кухня">Кухня</option>
            <option value="Спальня">Спальня</option>
            <option value="Ванная">Ванная</option>
            <option value="Коридор">Коридор</option>
          </select>
        </div>

        <div className="flex gap-3 pt-6">
          <Button
            variant="secondary"
            className="flex-1 py-3"
            onClick={onClose}
          >
            Отмена
          </Button>
          <Button
            variant="primary"
            className="flex-1 py-3"
            onClick={handleSave}
          >
            Сохранить
          </Button>
        </div>

        <div className="pt-6 border-t border-red-900/30">
          <Button
            variant="ghost"
            className="w-full text-red-400 hover:text-red-500 py-3"
            onClick={handleDelete}
          >
            Удалить устройство
          </Button>
        </div>
      </div>
    </Modal>
  );
}