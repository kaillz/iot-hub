import { create } from 'zustand';

interface AppState {
  currentRoomId: string | null;
  searchQuery: string;
  selectedSensorType: 'temperature' | 'humidity' | 'light' | null;
  
  setCurrentRoom: (roomId: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedSensorType: (type: 'temperature' | 'humidity' | 'light' | null) => void;
  
  isDark: boolean;
  toggleTheme: () => void;
}

export const useStore = create<AppState>((set) => ({
  currentRoomId: null,
  searchQuery: '',
  selectedSensorType: null,
  
  setCurrentRoom: (roomId) => set({ currentRoomId: roomId }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedSensorType: (type) => set({ selectedSensorType: type }),
  
  isDark: true,
  toggleTheme: () => set((state) => ({ isDark: !state.isDark })),
}));