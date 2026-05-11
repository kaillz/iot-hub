import { create } from 'zustand';

export type NotificationType = 'success' | 'warning' | 'error' | 'info';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: Date;
}

interface NotificationsState {
  notifications: Notification[];
  addNotification: (title: string, message: string, type: NotificationType) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotifications = create<NotificationsState>((set) => ({
  notifications: [],

  addNotification: (title, message, type) => 
    set((state) => ({
      notifications: [
        {
          id: Date.now().toString(),
          title,
          message,
          type,
          timestamp: new Date(),
        },
        ...state.notifications.slice(0, 4), // оставляем максимум 5 уведомлений
      ],
    })),

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  clearAll: () => set({ notifications: [] }),
}));