import { useState, useEffect, useCallback } from 'react';
import { Check, ChevronRight, AlertTriangle, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationsContext';
import { useToast } from '../../contexts/ToastContext';
import { api } from '../../api';
import { formatCurrency, timeAgo } from '../../data/mockData';

const STATUS_FLOW  = { placed: 'accepted', accepted: 'preparing', preparing: 'ready', ready: 'picked_up' };
const STATUS_LABEL = { placed: 'New Order', accepted: 'Accepted', preparing: 'Preparing', ready: 'Ready' };
const STATUS_NEXT  = { placed: 'Accept Order', accepted: 'Mark Preparing', preparing: 'Mark Ready', ready: 'Mark Picked Up' };

const STATUS_API = {
  placed:    (id) => api.put(`/vendor/orders/${id}/accept`),
  accepted:  (id) => api.put(`/vendor/orders/${id}/prepare`),
  preparing: (id) => api.put(`/vendor/orders/${id}/ready`),
  ready:     (id) => api.put(`/vendor/orders/${id}/complete`),
};

const normalizeOrder = (o) => ({
  ...o,
  total: o.total_amount ?? o.total,
  items: (o.items || []).map(i => ({ name: i.name, qty: i.quantity ?? i.qty })),
});

export default function OrderQueue() {
  const { user }            = useAuth();
  const { addNotification } = useNotifications();
  const { toast }           = useToast();

  const [queue,       setQueue]       = useState([]);
  const [completed,   setCompleted]   = useState([]);
  const [tab,         setTab]         = useState('active');
  const [verifyInput, setVerifyInput] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);
  const [loading,     setLoading]     = useState(true);

  // ── Fetch live orders from API ──────────────────────────────
  const fetchOrders = useCallback(async () => {
    try {
      const data = await api.get('/vendor/orders/live');
      const active    = data.filter(o => o.status !== 'picked_up').map(normalizeOrder);
      const done      = data.filter(o => o.status === 'picked_up').map(normalizeOrder);
      setQueue(active);
      setCompleted(done);
    } catch {
      // silently keep existing state on poll failure
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 8000); // poll every 8 s
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // ── Advance order status ────────────────────────────────────
  const advance = async (order_id) => {
    const order = queue.find(o => o.order_id === order_id);
    if (!order) return;

    const next = STATUS_FLOW[order.status];
    if (!next) return;

    try {
      await STATUS_API[order.status](order_id);

      if (next === 'picked_up') {
        setQueue(prev => prev.filter(o => o.order_id !== order_id));
        setCompleted(prev => [{ ...order, status: 'picked_up' }, ...prev]);
        addNotification('order_ready', `✅ Order ${order.order_code} marked as picked up`);
        toast('Order completed!', 'success');
      } else {
        setQueue(prev => prev.map(o => o.order_id === order_id ? { ...o, status: next } : o));
        const msgs = {
          accepted:  `🍳 Your order ${order.order_code} has been accepted!`,
          preparing: `👨‍🍳 Your order ${order.order_code} is being prepared.`,
          ready:     `🔔 Your order ${order.order_code} is ready for pickup!`,
        };
        addNotification('order_update', msgs[next] || '');
        toast(`Order ${order.order_code} → ${next}`, 'order');
      }
    } catch (err) {
      toast(`Failed to update order: ${err.message}`, 'error');
    }
  };

  const verifyOrder = () => {
    const found = [...queue, ...completed].find(o => o.order_code === verifyInput.trim());
    setVerifyResult(found || { error: 'Order not found' });
  };

  const active = queue.filter(o => o.status !== 'picked_up');
  const shown  = tab === 'active' ? active : completed;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Order Queue</h1>
        <p className="text-white/50 text-sm mt-1">{active.length} active orders</p>
      </div>

      {/* Verify Order */}
      <div className="glass-card p-5">
        <h3 className="text-white font-bold mb-3">🔍 Verify Order</h3>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Enter Order ID (e.g. GG-2025-00142)"
            value={verifyInput}
            onChange={e => setVerifyInput(e.target.value)}
            className="input-dark flex-1"
          />
          <button onClick={verifyOrder} className="btn-gold text-sm px-4">Verify</button>
        </div>
        {verifyResult && (
          <div className={`mt-3 p-3 rounded-xl text-sm ${verifyResult.error ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-green-500/10 border border-green-500/20'}`}>
            {verifyResult.error ? verifyResult.error : (
              <div>
                <p className="text-green-400 font-bold">{verifyResult.order_code} — {verifyResult.student_name}</p>
                <p className="text-white/70">{verifyResult.items?.map(i => `${i.name} ×${i.qty}`).join(', ')}</p>
                <p className="text-gold-400 font-semibold">{formatCurrency(verifyResult.total)}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl bg-white/5 p-1">
        {['active', 'completed'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t ? 'bg-gold-500 text-navy-900' : 'text-white/50 hover:text-white'}`}>
            {t === 'active' ? `Active (${active.length})` : `Completed (${completed.length})`}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {loading && (
          <div className="text-center py-12">
            <p className="text-white/40 text-sm">Loading orders…</p>
          </div>
        )}

        {!loading && shown.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">{tab === 'active' ? '🎉' : '📋'}</p>
            <p className="text-white/50">{tab === 'active' ? 'No pending orders!' : 'No completed orders yet'}</p>
          </div>
        )}

        {shown.map(order => {
          const isUrgent = order.status === 'accepted' && new Date() - new Date(order.placed_at) > 8 * 60000;
          return (
            <div key={order.order_id} className={`glass-card p-4 ${isUrgent ? 'border-red-500/40' : ''}`}>
              {isUrgent && (
                <div className="flex items-center gap-2 mb-3 text-red-400 text-xs">
                  <AlertTriangle size={12} /> Urgent — customer waiting
                </div>
              )}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-white font-bold">{order.student_name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      order.status === 'placed'    ? 'bg-white/10 text-white/60' :
                      order.status === 'accepted'  ? 'bg-yellow-500/20 text-yellow-400' :
                      order.status === 'preparing' ? 'bg-blue-500/20 text-blue-400' :
                                                     'bg-green-500/20 text-green-400'
                    }`}>{STATUS_LABEL[order.status] || order.status}</span>
                  </div>
                  <p className="text-white/40 text-xs font-mono">{order.order_code}</p>
                  <p className="text-white/60 text-sm mt-2">{order.items.map(i => `${i.name} ×${i.qty}`).join(' · ')}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-white/50">
                    <span className="flex items-center gap-1"><Clock size={11} /> Pickup: {order.pickup_slot}</span>
                    <span>✅ Paid</span>
                    <span>{timeAgo(order.placed_at)}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-gold-400 font-black text-lg">{formatCurrency(order.total)}</p>
                  {tab === 'active' && STATUS_NEXT[order.status] && (
                    <button
                      onClick={() => advance(order.order_id)}
                      className="mt-2 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gold-500/20 hover:bg-gold-500/30 text-gold-400 text-xs font-semibold transition-colors"
                    >
                      <Check size={12} /> {STATUS_NEXT[order.status]}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pre-orders tab */}
      <div className="glass-card p-5">
        <h3 className="text-white font-bold mb-3">📅 Tomorrow's Pre-orders</h3>
        <p className="text-white/40 text-sm">No pre-orders for tomorrow yet.</p>
      </div>
    </div>
  );
}
