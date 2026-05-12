import { create } from 'zustand';
import { wsClient } from '../lib/websocket';
import type { Device } from '../types';

const HISTORY_UPDATE_INTERVAL = 600000; // 10 минут

const roomNameMap: Record<string, string> = {
  'living': 'Гостиная',
  'kitchen': 'Кухня',
  'bedroom': 'Спальня',
  'bathroom': 'Ванная',
  'all': 'all',
};

interface StoreState {
  isDark: boolean;
  currentRoomId: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  activeFilter: 'all' | 'sensor' | 'relay' | 'ir';
  setActiveFilter: (filter: 'all' | 'sensor' | 'relay' | 'ir') => void;

  devices: Device[];
  setDevices: (devices: Device[]) => void;
  isConnected: boolean;
  setConnected: (connected: boolean) => void;

  selectedSensorType: 'temperature' | 'humidity' | 'light' | null;
  setSelectedSensorType: (type: 'temperature' | 'humidity' | 'light' | null) => void;

  lightHistory: { timestamp: string; lux: number }[];
  lastLightUpdate: number;
  addToLightHistory: (lux: number) => void;

  activeTab: 'devices' | 'graphs' | 'scenarios';
  setActiveTab: (tab: 'devices' | 'graphs' | 'scenarios') => void;

  setCurrentRoom: (roomId: string) => void;

  updateDevice: (id: string, updatedData: any) => void;
  deleteDevice: (id: string) => void;

  getFilteredDevices: () => Device[];
}

export const useStore = create<StoreState>((set, get) => ({
  isDark: true,
  currentRoomId: 'all',
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  activeFilter: 'all',
  setActiveFilter: (filter) => set({ activeFilter: filter }),

  devices: [],
  setDevices: (devices) => set({ devices }),
  isConnected: false,
  setConnected: (connected) => set({ isConnected: connected }),

  selectedSensorType: null,
  setSelectedSensorType: (type) => set({ selectedSensorType: type }),

  lightHistory: [],
  lastLightUpdate: 0,

  addToLightHistory: (lux) => {
    const now = Date.now();
    if (now - get().lastLightUpdate < HISTORY_UPDATE_INTERVAL) return;

    set((state) => ({
      lightHistory: [...state.lightHistory, { timestamp: new Date().toISOString(), lux }].slice(-48),
      lastLightUpdate: now,
    }));
  },

  activeTab: 'devices',
  setActiveTab: (tab) => set({ activeTab: tab }),

  setCurrentRoom: (roomId) => set({ currentRoomId: roomId }),

  updateDevice: (id: string, updatedData: any) => {
    set((state) => ({
      devices: state.devices.map((d) =>
        d.id === id ? { ...d, ...updatedData } : d
      ),
    }));
  },

  deleteDevice: (id: string) => {
    set((state) => ({
      devices: state.devices.filter((d) => d.id !== id),
    }));
  },

  getFilteredDevices: () => {
    const { devices, activeFilter, currentRoomId, searchQuery } = get();
    return devices.filter((device) => {
      if (activeFilter !== 'all' && device.type !== activeFilter) return false;
      if (currentRoomId !== 'all') {
        const expectedRoomName = roomNameMap[currentRoomId] || currentRoomId;
        if (device.room !== expectedRoomName) return false;
      }
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          device.name.toLowerCase().includes(query) ||
          device.room.toLowerCase().includes(query)
        );
      }
      return true;
    });
  },

  initWebSocket: () => {
    wsClient.setOnMessage(null);

    wsClient.setOnMessage((data: any) => {
      if (data.light_raw === undefined) return;

      const raw = Number(data.light_raw);
      const lux = Math.max(0, Math.min(1000, Math.floor((950 - raw) * 0.12)));

      set((state) => {
        const existing = state.devices.find((d) => d.id === 'light1');
        const updatedDevice: Device = {
          ...(existing || {}),           // сохраняем name, room и все предыдущие настройки
          id: 'light1',
          name: existing?.name || 'Освещённость',
          room: existing?.room || 'Гостиная',
          type: 'sensor',
          status: lux,
          value: lux,
          unit: 'lux',
          raw,
          lastUpdated: new Date().toISOString(),
        };

        return {
          devices: [updatedDevice],      // пока у нас только одно устройство
        };
      });

      get().addToLightHistory(lux);
    });

    const handleOpen = () => get().setConnected(true);
    const handleClose = () => get().setConnected(false);
    const handleError = () => get().setConnected(false);

    wsClient.ws?.addEventListener?.('open', handleOpen);
    wsClient.ws?.addEventListener?.('close', handleClose);
    wsClient.ws?.addEventListener?.('error', handleError);

    wsClient.connect();
  },
}));