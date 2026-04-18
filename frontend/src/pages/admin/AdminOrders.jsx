import { useState } from 'react';
import { Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { useOrders } from '../../contexts/OrdersContext';
import { useToast } from '../../contexts/ToastContext';
import { useCanteens } from '../../contexts/CanteenContext';
import { formatCurrency, formatDate, timeAgo } from '../../data/mockData';

const STATUS_COLOR = {
  placed: 'bg-white/10 text-white/60', accepted: 'bg-yellow-500/20 text-yellow-400',
  preparing: 'bg-blue-500/20 text-blue-400', ready: 'bg-gold-500/20 text-gold-400',
  picked_up: 'bg-green-500/20 text-green-400', cancelled: 'bg-red-500/20 text-red-400',
};

export default function AdminOrders() {
  const { orders, updateOrderStatus } = useOrders();
  const { canteens } = useCanteens();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [canteenFilter, setCanteenFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);

  const filtered = orders.filter(o => {
    const matchSearch = !search || o.order_code.includes(search.toUpperCase()) || o.canteen_name?.toLowerCase().includes(search.toLowerCase());
    const matchCanteen = canteenFilter === 'all' || o.canteen_id === parseInt(canteenFilter);
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchCanteen && matchStatus;
  });

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">All Orders</h1>
        <p className="text-white/50 text-sm mt-1">{filtered.length} orders</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input type="text" placeholder="Search by Order ID or canteen..." value={search} onChange={e => setSearch(e.target.value)} className="input-dark pl-9 text-sm" />
        </div>
        <select value={canteenFilter} onChange={e => setCanteenFilter(e.target.value)} className="input-dark text-sm appearance-none w-auto">
          <option value="all" className="bg-navy-900">All Canteens</option>
          {canteens.map(c => <option key={c.canteen_id} value={c.canteen_id} className="bg-navy-900">{c.name}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-dark text-sm appearance-none w-auto">
          {['all', 'placed', 'accepted', 'preparing', 'ready', 'picked_up', 'cancelled'].map(s => (
            <option key={s} value={s} className="bg-navy-900 capitalize">{s === 'all' ? 'All Statuses' : s.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        {filtered.map(order => (
          <div key={order.order_id} className="glass-card overflow-hidden">
            <div className="p-4 flex items-center justify-between gap-3 cursor-pointer" onClick={() => setExpanded(expanded === order.order_id ? null : order.order_id)}>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div>
                  <p className="text-white font-bold text-sm">{order.order_code}</p>
                  <p className="text-white/50 text-xs">{order.canteen_name} · {timeAgo(order.placed_at)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[order.status]}`}>{order.status.replace('_', ' ')}</span>
                <span className="text-gold-400 font-bold">{formatCurrency(order.total_amount)}</span>
                {expanded === order.order_id ? <ChevronUp size={14} className="text-white/40" /> : <ChevronDown size={14} className="text-white/40" />}
              </div>
            </div>
            {expanded === order.order_id && (
              <div className="px-4 pb-4 border-t border-white/5 pt-4 animate-fade-in">
                <div className="space-y-1 mb-4">
                  {order.items?.map(item => (
                    <div key={item.item_id} className="flex justify-between text-sm">
                      <span className="text-white/70">{item.name} × {item.quantity}</span>
                      <span className="text-white">{formatCurrency(item.unit_price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {!['picked_up', 'cancelled'].includes(order.status) && (
                    <>
                      <button onClick={() => { updateOrderStatus(order.order_id, 'picked_up'); toast('Order marked as completed', 'success'); }} className="text-xs px-3 py-1.5 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors">
                        Mark Completed
                      </button>
                      <button onClick={() => { updateOrderStatus(order.order_id, 'cancelled'); toast('Order cancelled', 'warning'); }} className="text-xs px-3 py-1.5 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors">
                        Cancel Order
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white/30">No orders match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
