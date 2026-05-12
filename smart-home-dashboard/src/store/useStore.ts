import { create } from 'zustand';
import { wsClient } from '../lib/websocket';
import type { Device } from '../types';

interface StoreState {
  isDark: boolean;
  currentRoomId: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  devices: Device[];
  setDevices: (devices: Device[]) => void;
  isConnected: boolean;
  setConnected: (connected: boolean) => void;

  initWebSocket: () => void;
}

export const useStore = create<StoreState>((set, get) => ({
  isDark: true,
  currentRoomId: 'all',
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  devices: [],
  setDevices: (devices) => set({ devices }),
  isConnected: false,
  setConnected: (connected) => set({ isConnected: connected }),

  initWebSocket: () => {
    wsClient.setOnMessage(null); // очистка старого

  wsClient.setOnMessage((data: any) => {
    if (data.light_raw === undefined) return;

    const raw = Number(data.light_raw);

    // 🔥 ИНВЕРТИРОВАННАЯ КАЛИБРОВКА под твою схему
    // raw ~920 (темнота) → lux ~4
    // raw ~468 (свет)   → lux ~55
    const lux = Math.max(0, Math.min(1000, Math.floor((950 - raw) * 0.12)));

    console.log(`📡 RAW: ${raw}  →  LUX: ${lux} (темнота=${raw > 800})`);

    const lightDevice: Device = {
      id: 'light1',
      name: 'Освещённость',
      room: 'Гостиная',
      type: 'sensor',
      status: lux,
      value: lux,
      unit: 'lux',
      raw: raw,                    // для отладки
      lastUpdated: new Date().toISOString(),
    };

    set({ devices: [lightDevice] });
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