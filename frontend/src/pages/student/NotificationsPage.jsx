import { Bell, Check, Trash2 } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationsContext';
import { timeAgo } from '../../data/mockData';

const TYPE_ICONS = {
  order_ready: '🔔',
  order_accepted: '🍳',
  order_placed: '✅',
  order_picked_up: '✅',
  loyalty_earned: '🪙',
  grievance_update: '📋',
  grievance_submitted: '📋',
  refund_processed: '💰',
  pre_order_reminder: '⏰',
  default: 'ℹ️',
};

export default function NotificationsPage() {
  const { notifications, markRead, markAllRead, dismiss, unreadCount } = useNotifications();

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Bell size={24} className="text-gold-400" /> Notifications
          </h1>
          {unreadCount > 0 && <p className="text-white/50 text-sm mt-1">{unreadCount} unread</p>}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-2 text-sm text-gold-400 hover:text-gold-300 transition-colors">
            <Check size={14} /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16">
          <Bell size={48} className="text-white/20 mx-auto mb-4" strokeWidth={1} />
          <p className="text-white/50">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div
              key={n.notification_id}
              onClick={() => markRead(n.notification_id)}
              className={`glass-card p-4 cursor-pointer transition-all hover:bg-white/10 ${!n.is_read ? 'border-gold-500/30 bg-gold-500/5' : ''}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0 mt-0.5">{TYPE_ICONS[n.type] || TYPE_ICONS.default}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-relaxed ${n.is_read ? 'text-white/60' : 'text-white font-medium'}`}>{n.message}</p>
                  <p className="text-white/30 text-xs mt-1">{timeAgo(n.created_at)}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!n.is_read && <div className="w-2 h-2 rounded-full bg-gold-400" />}
                  <button
                    onClick={(e) => { e.stopPropagation(); dismiss(n.notification_id); }}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-white/30 hover:text-white/60 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
