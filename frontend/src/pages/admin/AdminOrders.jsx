import { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp, Truck, Package } from 'lucide-react';
import { useOrders } from '../../contexts/OrdersContext';
import { useToast } from '../../contexts/ToastContext';
import { useCanteens } from '../../contexts/CanteenContext';
import { api } from '../../api';
import { formatCurrency, timeAgo } from '../../data/mockData';

const STATUS_COLOR = {
  placed: 'bg-white/10 text-white/60', accepted: 'bg-yellow-500/20 text-yellow-400',
  preparing: 'bg-blue-500/20 text-blue-400', ready: 'bg-gold-500/20 text-gold-400',
  out_for_delivery: 'bg-orange-500/20 text-orange-400',
  delivered: 'bg-green-500/20 text-green-400',
  picked_up: 'bg-green-500/20 text-green-400', cancelled: 'bg-red-500/20 text-red-400',
};

export default function AdminOrders() {
  const { orders, updateOrderStatus } = useOrders();
  const { canteens } = useCanteens();
  const { toast } = useToast();

  const [search,           setSearch]           = useState('');
  const [canteenFilter,    setCanteenFilter]     = useState('all');
  const [statusFilter,     setStatusFilter]      = useState('all');
  const [fulfillmentFilter,setFulfillmentFilter] = useState('all');
  const [expanded,         setExpanded]          = useState(null);
  const [kpis,             setKpis]              = useState({ delivery_orders_today: 0, delivery_fees_today: 0 });

  useEffect(() => {
    api.get('/admin/dashboard').then(d => {
      setKpis({ delivery_orders_today: d.delivery_orders_today || 0, delivery_fees_today: d.delivery_fees_today || 0 });
    }).catch(() => {});
  }, []);

  const filtered = orders.filter(o => {
    const matchSearch = !search ||
      o.order_code.includes(search.toUpperCase()) ||
      o.canteen_name?.toLowerCase().includes(search.toLowerCase());
    const matchCanteen = canteenFilter === 'all' || o.canteen_id === parseInt(canteenFilter);
    const matchStatus  = statusFilter  === 'all' || o.status === statusFilter;
    const matchFulfill = fulfillmentFilter === 'all' || o.fulfillment_type === fulfillmentFilter;
    return matchSearch && matchCanteen && matchStatus && matchFulfill;
  });

  const deliveryOrders = orders.filter(o => o.fulfillment_type === 'delivery');
  const deliveryFeesTotal = deliveryOrders.reduce((s, o) => s + (o.delivery_fee || 0), 0);

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">All Orders</h1>
        <p className="text-white/50 text-sm mt-1">{filtered.length} orders</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-4 border border-orange-500/20 bg-orange-500/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <Truck size={18} className="text-orange-400" />
            </div>
            <div>
              <p className="text-white/50 text-xs">Delivery Orders Today</p>
              <p className="text-white text-xl font-black">{kpis.delivery_orders_today}</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4 border border-orange-500/20 bg-orange-500/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <Package size={18} className="text-orange-400" />
            </div>
            <div>
              <p className="text-white/50 text-xs">Delivery Fees Today</p>
              <p className="text-white text-xl font-black">{formatCurrency(kpis.delivery_fees_today)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input type="text" placeholder="Search by Order ID or canteen..." value={search}
            onChange={e => setSearch(e.target.value)} className="input-dark pl-9 text-sm" />
        </div>
        <select value={fulfillmentFilter} onChange={e => setFulfillmentFilter(e.target.value)} className="input-dark text-sm appearance-none w-auto">
          <option value="all"      className="bg-navy-900">All Types</option>
          <option value="pickup"   className="bg-navy-900">🏃 Pickup</option>
          <option value="delivery" className="bg-navy-900">🛵 Delivery</option>
        </select>
        <select value={canteenFilter} onChange={e => setCanteenFilter(e.target.value)} className="input-dark text-sm appearance-none w-auto">
          <option value="all" className="bg-navy-900">All Canteens</option>
          {canteens.map(c => <option key={c.canteen_id} value={c.canteen_id} className="bg-navy-900">{c.name}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-dark text-sm appearance-none w-auto">
          {['all','placed','accepted','preparing','ready','out_for_delivery','delivered','picked_up','cancelled'].map(s => (
            <option key={s} value={s} className="bg-navy-900 capitalize">{s === 'all' ? 'All Statuses' : s.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        {filtered.map(order => {
          const isDelivery = order.fulfillment_type === 'delivery';
          return (
            <div key={order.order_id} className={`glass-card overflow-hidden ${isDelivery ? 'border-orange-500/15' : ''}`}>
              <div className="p-4 flex items-center justify-between gap-3 cursor-pointer" onClick={() => setExpanded(expanded === order.order_id ? null : order.order_id)}>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-white font-bold text-sm">{order.order_code}</p>
                      {isDelivery && (
                        <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-400 font-semibold">
                          <Truck size={9} /> Delivery
                        </span>
                      )}
                    </div>
                    <p className="text-white/50 text-xs">{order.canteen_name} · {timeAgo(order.placed_at)}</p>
                    {isDelivery && order.delivery_location && (
                      <p className="text-orange-400/70 text-xs mt-0.5">→ {order.delivery_location}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[order.status]}`}>
                    {order.status.replace(/_/g, ' ')}
                  </span>
                  <span className="text-gold-400 font-bold">{formatCurrency(order.total_amount)}</span>
                  {expanded === order.order_id ? <ChevronUp size={14} className="text-white/40" /> : <ChevronDown size={14} className="text-white/40" />}
                </div>
              </div>

              {expanded === order.order_id && (
                <div className="px-4 pb-4 border-t border-white/5 pt-4 animate-fade-in">
                  <div className="space-y-1 mb-3">
                    {order.items?.map(item => (
                      <div key={item.item_id} className="flex justify-between text-sm">
                        <span className="text-white/70">{item.name} × {item.quantity}</span>
                        <span className="text-white">{formatCurrency(item.unit_price * item.quantity)}</span>
                      </div>
                    ))}
                    {isDelivery && (
                      <div className="flex justify-between text-sm">
                        <span className="text-orange-400 flex items-center gap-1"><Truck size={11} /> Delivery Fee</span>
                        <span className="text-orange-400">+{formatCurrency(order.delivery_fee || 15)}</span>
                      </div>
                    )}
                  </div>
                  {isDelivery && (
                    <div className="mb-3 p-3 bg-orange-500/5 border border-orange-500/20 rounded-xl text-xs space-y-1">
                      <p className="text-orange-400 font-semibold">Delivery Details</p>
                      <p className="text-white/60">Floor: {order.delivery_location}</p>
                      {order.delivery_agent_name && <p className="text-white/60">Agent: {order.delivery_agent_name}</p>}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {!['picked_up', 'delivered', 'cancelled'].includes(order.status) && (
                      <>
                        <button onClick={() => { updateOrderStatus(order.order_id, isDelivery ? 'delivered' : 'picked_up'); toast('Order marked as completed', 'success'); }}
                          className="text-xs px-3 py-1.5 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors">
                          Mark Completed
                        </button>
                        <button onClick={() => { updateOrderStatus(order.order_id, 'cancelled'); toast('Order cancelled', 'warning'); }}
                          className="text-xs px-3 py-1.5 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors">
                          Cancel Order
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-white/30">No orders match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
