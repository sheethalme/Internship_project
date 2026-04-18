import { useState } from 'react';
import { TrendingUp, ShoppingBag, Star, Clock, ToggleLeft, ToggleRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCanteens } from '../../contexts/CanteenContext';
import { useOrders } from '../../contexts/OrdersContext';
import { useToast } from '../../contexts/ToastContext';
import { CANTEENS, formatCurrency, VENDOR_QUEUE_ORDERS } from '../../data/mockData';

export default function VendorDashboard() {
  const { user } = useAuth();
  const { canteens, updateCanteenStatus } = useCanteens();
  const { orders } = useOrders();
  const { toast } = useToast();

  const canteen = canteens.find(c => c.canteen_id === user?.canteen_id);
  const myOrders = (VENDOR_QUEUE_ORDERS[user?.canteen_id] || []);
  const todayRevenue = myOrders.reduce((s, o) => s + o.total, 0) + 3420;
  const pendingOrders = myOrders.filter(o => o.status === 'placed').length;

  const cycleStatus = () => {
    const next = { open: 'closed', closed: 'unavailable', unavailable: 'open' };
    const newStatus = next[canteen?.status] || 'open';
    updateCanteenStatus(user?.canteen_id, newStatus);
    toast(`Canteen status set to: ${newStatus}`, newStatus === 'open' ? 'success' : 'warning');
  };

  const stats = [
    { icon: <ShoppingBag size={20} />, label: 'Orders Today', value: myOrders.length + 24, color: 'text-blue-400' },
    { icon: <TrendingUp size={20} />, label: 'Revenue Today', value: formatCurrency(todayRevenue), color: 'text-green-400' },
    { icon: <Clock size={20} />, label: 'Pending', value: pendingOrders, color: 'text-yellow-400' },
    { icon: <Star size={20} />, label: 'Avg Rating', value: canteen?.avg_rating || '—', color: 'text-gold-400' },
  ];

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="glass-card p-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">{canteen?.name}</h1>
          <p className="text-white/50 text-sm mt-1">Vendor Dashboard · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`badge-${canteen?.status === 'open' ? 'green' : canteen?.status === 'unavailable' ? 'yellow' : 'red'} text-sm px-3 py-1.5`}>
            <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
            {canteen?.status?.charAt(0).toUpperCase() + canteen?.status?.slice(1) || 'Unknown'}
          </div>
          <button onClick={cycleStatus} className="btn-outline text-sm flex items-center gap-2">
            {canteen?.status === 'open' ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
            Change Status
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="stat-card">
            <div className={`${s.color} mb-2`}>{s.icon}</div>
            <p className="text-2xl font-black text-white">{s.value}</p>
            <p className="text-white/50 text-xs">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Queue summary */}
      <div className="glass-card p-5">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <ShoppingBag size={18} className="text-gold-400" /> Live Queue
          <span className="bg-gold-500/20 text-gold-400 text-xs px-2 py-0.5 rounded-full ml-1">{myOrders.length} orders</span>
        </h3>
        {myOrders.length === 0 ? (
          <p className="text-white/40 text-sm text-center py-6">No active orders in queue</p>
        ) : (
          <div className="space-y-2">
            {myOrders.slice(0, 3).map(o => (
              <div key={o.order_id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <div>
                  <p className="text-white text-sm font-semibold">{o.student_name}</p>
                  <p className="text-white/50 text-xs">{o.items.map(i => `${i.name} ×${i.qty}`).join(', ')}</p>
                </div>
                <div className="text-right">
                  <p className="text-gold-400 font-bold text-sm">{formatCurrency(o.total)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${o.status === 'preparing' ? 'bg-blue-500/20 text-blue-400' : o.status === 'accepted' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/10 text-white/50'}`}>{o.status}</span>
                </div>
              </div>
            ))}
            {myOrders.length > 3 && <p className="text-white/40 text-xs text-center pt-1">+{myOrders.length - 3} more in queue</p>}
          </div>
        )}
      </div>

      {/* Operating hours */}
      <div className="glass-card p-5">
        <h3 className="text-white font-bold mb-3 flex items-center gap-2">
          <Clock size={18} className="text-gold-400" /> Operating Hours
        </h3>
        <p className="text-white/70">{canteen?.operating_hours}</p>
        <p className="text-white/40 text-sm mt-2">{canteen?.description}</p>
      </div>
    </div>
  );
}
