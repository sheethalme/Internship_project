import { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_NOTIFICATIONS } from '../data/mockData';

const NotificationsContext = createContext();

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState(() => {
    try { return JSON.parse(localStorage.getItem('gg_notifs') || JSON.stringify(MOCK_NOTIFICATIONS)); }
    catch { return MOCK_NOTIFICATIONS; }
  });

  useEffect(() => { localStorage.setItem('gg_notifs', JSON.stringify(notifications)); }, [notifications]);

  const addNotification = (type, message) => {
    const n = {
      notification_id: Date.now(),
      type, message, is_read: false,
      created_at: new Date().toISOString(),
    };
    setNotifications(prev => [n, ...prev]);
    return n;
  };

  const markRead = (id) => {
    setNotifications(prev => prev.map(n => n.notification_id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const dismiss = (id) => {
    setNotifications(prev => prev.filter(n => n.notification_id !== id));
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <NotificationsContext.Provider value={{ notifications, addNotification, markRead, markAllRead, dismiss, unreadCount }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationsContext);
