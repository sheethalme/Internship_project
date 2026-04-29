import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api';

const NotificationsContext = createContext();

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  // Remove old localStorage-based notifications (migration cleanup)
  useEffect(() => { localStorage.removeItem('gg_notifs'); }, []);

  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem('gg_token');
    if (!token) return;
    try {
      const data = await api.get('/notifications');
      setNotifications(data);
    } catch {}
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markRead = async (id) => {
    setNotifications(prev => prev.map(n => n.notification_id === id ? { ...n, is_read: 1 } : n));
    try { await api.put(`/notifications/${id}/read`); } catch {}
  };

  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    try { await api.put('/notifications/read-all'); } catch {}
  };

  const dismiss = async (id) => {
    setNotifications(prev => prev.filter(n => n.notification_id !== id));
    try { await api.delete(`/notifications/${id}`); } catch {}
  };

  const addNotification = (type, message) => {
    const n = {
      notification_id: Date.now(),
      type, message, is_read: 0,
      created_at: new Date().toISOString(),
    };
    setNotifications(prev => [n, ...prev]);
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <NotificationsContext.Provider value={{ notifications, addNotification, markRead, markAllRead, dismiss, unreadCount, fetchNotifications }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationsContext);
