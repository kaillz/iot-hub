import { create } from 'zustand';
import { api } from '../lib/api';
import { wsClient } from '../lib/websocket';
import type { Device } from '../types';

const HISTORY_UPDATE_INTERVAL = 600000;

const roomNameMap: Record<string, string> = {
  living: 'Гостиная',
  kitchen: 'Кухня',
  bedroom: 'Спальня',
  bathroom: 'Ванная',
  all: 'all',
};

interface StoreState {
  devices: Device[];
  isConnected: boolean;
  activeTab: 'devices' | 'graphs' | 'scenarios';
  currentRoomId: string;
  activeFilter: 'all' | 'sensor' | 'relay' | 'ir';
  searchQuery: string;
  selectedSensorType: 'temperature' | 'humidity' | 'light' | null;

  lightHistory: { timestamp: string; lux: number }[];
  lastLightUpdate: number;

  loadDevices: () => Promise<void>;
  addDevice: (deviceData: any) => Promise<void>;
  updateDevice: (id: string, data: any) => Promise<void>;
  deleteDevice: (id: string) => Promise<void>;
  initWebSocket: () => void;

  setActiveTab: (tab: 'devices' | 'graphs' | 'scenarios') => void;
  setCurrentRoom: (roomId: string) => void;
  setActiveFilter: (filter: 'all' | 'sensor' | 'relay' | 'ir') => void;
  setSearchQuery: (query: string) => void;
  setSelectedSensorType: (type: 'temperature' | 'humidity' | 'light' | null) => void;
  addToLightHistory: (lux: number) => void;

  getFilteredDevices: () => Device[];
}

export const useStore = create<StoreState>((set, get) => ({
  devices: [],
  isConnected: false,
  activeTab: 'devices',
  currentRoomId: 'all',
  activeFilter: 'all',
  searchQuery: '',
  selectedSensorType: null,
  lightHistory: [],
  lastLightUpdate: 0,

  loadDevices: async () => {
    try {
      const devices = await api.getAllDevices();
      set({ devices });
    } catch (err) {
      console.error('Не удалось загрузить устройства', err);
    }
  },

  addDevice: async (deviceData: any) => {
    try {
      await api.addDevice(deviceData);
      await get().loadDevices();
    } catch (err) {
      console.error(err);
    }
  },

  updateDevice: async (id: string, data: any) => {
    try {
      await api.updateDevice(id, data);
      await get().loadDevices();
    } catch (err) {
      console.error(err);
    }
  },

  deleteDevice: async (id: string) => {
    try {
      await api.deleteDevice(id);
      await get().loadDevices();
    } catch (err) {
      console.error(err);
    }
  },

  initWebSocket: () => {
    // Подписываемся на сообщения через addListener (новый API)
    const handleMessage = (data: any) => {
      if (data.light_raw !== undefined || data.lux !== undefined) {
        const lux = data.lux !== undefined 
          ? data.lux 
          : Math.max(0, Math.min(1000, Math.floor((950 - Number(data.light_raw)) * 0.12)));

        set((state) => {
          const devices = [...state.devices];
          const index = devices.findIndex(d => d.id === 'light1');

          if (index !== -1) {
            devices[index] = {
              ...devices[index],
              value: lux,
              status: lux,
              raw: data.light_raw !== undefined ? data.light_raw : devices[index].raw,
              lastUpdated: new Date().toISOString(),
            };
          } else {
            devices.push({
              id: 'light1',
              name: 'Освещённость',
              room: 'Гостиная',
              type: 'sensor',
              value: lux,
              status: lux,
              unit: 'lux',
              raw: data.light_raw,           // raw теперь разрешён
              lastUpdated: new Date().toISOString(),
            });
          }
          return { devices };
        });

        get().addToLightHistory(lux);
      }
    };

    wsClient.addListener(handleMessage);

    // Подписка на open/close для статуса подключения
    const handleOpen = () => set({ isConnected: true });
    const handleClose = () => set({ isConnected: false });
    const handleError = () => set({ isConnected: false });

    if (wsClient.ws) {
      wsClient.ws.addEventListener('open', handleOpen);
      wsClient.ws.addEventListener('close', handleClose);
      wsClient.ws.addEventListener('error', handleError);
    }

    wsClient.connect();
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setCurrentRoom: (roomId) => set({ currentRoomId: roomId }),
  setActiveFilter: (filter) => set({ activeFilter: filter }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedSensorType: (type) => set({ selectedSensorType: type }),

  addToLightHistory: (lux) => {
    const now = Date.now();
    if (now - get().lastLightUpdate < HISTORY_UPDATE_INTERVAL) return;
    set((state) => ({
      lightHistory: [...state.lightHistory, { timestamp: new Date().toISOString(), lux }].slice(-48),
      lastLightUpdate: now,
    }));
  },

  getFilteredDevices: () => {
    const { devices, activeFilter, currentRoomId, searchQuery } = get();
    return devices.filter((device) => {
      if (activeFilter !== 'all' && device.type !== activeFilter) return false;
      if (currentRoomId !== 'all') {
        const expected = roomNameMap[currentRoomId] || currentRoomId;
        if (device.room !== expected) return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return device.name.toLowerCase().includes(q) || device.room.toLowerCase().includes(q);
      }
      return true;
    });
  },
}));