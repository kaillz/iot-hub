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

  addNotification: (title, message, type) => {
    const notification: Notification = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      title,
      message,
      type,
      timestamp: new Date(),
    };

    set((state) => {
      const newNotifications = [notification, ...state.notifications].slice(0, 5); // максимум 5 уведомлений

      // Автоудаление через 8 секунд
      setTimeout(() => {
        set((s) => ({
          notifications: s.notifications.filter((n) => n.id !== notification.id),
        }));
      }, 8000);

      return { notifications: newNotifications };
    });
  },

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  clearAll: () => set({ notifications: [] }),
}));