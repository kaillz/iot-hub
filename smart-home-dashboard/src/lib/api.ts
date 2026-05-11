// src/lib/api.ts
import type { Device } from '../types';

const STORAGE_KEY = 'smart-home-devices';

export const deviceApi = {
  // === GET ALL DEVICES ===
  getAllDevices: async (): Promise<Device[]> => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
      return [];
    } catch (error) {
      console.error('Ошибка загрузки устройств:', error);
      return [];
    }
  },

  // === SAVE DEVICES ===
  saveDevices: async (devices: Device[]): Promise<void> => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(devices));
    } catch (error) {
      console.error('Ошибка сохранения устройств:', error);
    }
  },

  // === TOGGLE RELAY ===
  toggleRelay: async (deviceId: string): Promise<boolean> => {
    try {
      // Имитация задержки сети (потом заменишь на fetch к ESP)
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log(`[API] Переключено реле: ${deviceId}`);
      return true;
    } catch (error) {
      console.error('Ошибка переключения реле:', error);
      throw error;
    }
  },

  // === UPDATE DEVICE ===
  updateDevice: async (deviceId: string, data: Partial<Device>): Promise<Device> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 250));
      console.log(`[API] Обновлено устройство ${deviceId}:`, data);
      return { id: deviceId, ...data } as Device;
    } catch (error) {
      console.error('Ошибка обновления устройства:', error);
      throw error;
    }
  },

  // === DELETE DEVICE ===
  deleteDevice: async (deviceId: string): Promise<boolean> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      console.log(`[API] Удалено устройство: ${deviceId}`);
      return true;
    } catch (error) {
      console.error('Ошибка удаления устройства:', error);
      throw error;
    }
  },

  // === SEND IR COMMAND ===
  sendIRCommand: async (deviceId: string, command: string): Promise<boolean> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      console.log(`[IR] Команда отправлена на ${deviceId}: ${command}`);
      return true;
    } catch (error) {
      console.error('Ошибка отправки ИК команды:', error);
      throw error;
    }
  }
};