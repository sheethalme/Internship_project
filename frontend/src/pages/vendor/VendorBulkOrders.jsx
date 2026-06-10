import { useState, useEffect } from 'react';
import { CalendarDays, Users, Building2, Phone, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { api } from '../../api';
import { formatCurrency, timeAgo } from '../../data/mockData';

export default function VendorBulkOrders() {
  const { toast } = useToast();
  const [orders,        setOrders]        = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [subTab,        setSubTab]        = useState('pending');
  const [expanded,      setExpanded]      = useState(null);
  const [fulfillLoading,setFulfillLoading] = useState(null);

  const fetchOrders = async () => {
    try {
      const data = await api.get('/vendor/bulk-orders');
      setOrders(data);
    } catch { toast('Failed to load bulk orders', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleFulfill = async (bulkOrderId) => {
    setFulfillLoading(bulkOrderId);
    try {
      await api.put(`/vendor/bulk-orders/${bulkOrderId}/fulfill`);
      toast('Bulk order marked as fulfilled!', 'success');
      setOrders(prev => prev.map(o => o.bulk_order_id === bulkOrderId ? { ...o, status: 'fulfilled' } : o));
    } catch (err) {
      toast(err.message || 'Failed to fulfill', 'error');
    } finally {
      setFulfillLoading(null);
    }
  };

  const pending   = orders.filter(o => o.status === 'approved');
  const completed = orders.filter(o => o.status === 'fulfilled');
  const shown     = subTab === 'pending' ? pending : completed;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">📦 Bulk Orders</h1>
        <p className="text-white/50 text-sm mt-1">{pending.length} approved orders awaiting preparation</p>
      </div>

      {/* Sub-tabs */}
      <div className="flex rounded-xl bg-white/5 p-1 gap-1">
        <button onClick={() => setSubTab('pending')} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${subTab === 'pending' ? 'bg-gold-500 text-navy-900' : 'text-white/50 hover:text-white'}`}>
          Approved ({pending.length})
        </button>
        <button onClick={() => setSubTab('completed')} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${subTab === 'completed' ? 'bg-gold-500 text-navy-900' : 'text-white/50 hover:text-white'}`}>
          Completed ({completed.length})
        </button>
      </div>

      {loading && <div className="text-center py-12"><p className="text-white/40">Loading…</p></div>}

      {!loading && shown.length === 0 && (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">{subTab === 'pending' ? '📅' : '✅'}</p>
          <p className="text-white/50 text-lg font-medium">
            {subTab === 'pending' ? 'No pending bulk orders' : 'No fulfilled orders yet'}
          </p>
          <p className="text-white/30 text-sm mt-1">
            {subTab === 'pending' ? 'Approved bulk orders for your canteen will appear here' : 'Fulfilled bulk orders will be listed here'}
          </p>
        </div>
      )}

      <div className="space-y-4">
        {shown.map(order => {
          const estimatedTotal = (order.items || []).reduce((s, i) => s + i.price * i.quantity, 0);
          return (
            <div key={order.bulk_order_id} className="glass-card overflow-hidden border-green-500/10">
              <div className="p-4 cursor-pointer" onClick={() => setExpanded(expanded === order.bulk_order_id ? null : order.bulk_order_id)}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-white font-bold text-base mb-0.5">{order.event_name}</p>
                    <p className="text-white/40 text-xs font-mono mb-2">{order.bulk_order_code}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-white/50">
                      <span className="flex items-center gap-1"><CalendarDays size={10} /> {order.event_date} at {order.event_time}</span>
                      <span className="flex items-center gap-1"><Building2 size={10} /> {order.venue}</span>
                      <span className="flex items-center gap-1"><Users size={10} /> {order.num_participants} participants</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${order.status === 'approved' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                      {order.status === 'approved' ? '🟢 Approved' : '✅ Fulfilled'}
                    </span>
                    {expanded === order.bulk_order_id ? <ChevronUp size={14} className="text-white/40" /> : <ChevronDown size={14} className="text-white/40" />}
                  </div>
                </div>
              </div>

              {expanded === order.bulk_order_id && (
                <div className="px-4 pb-4 border-t border-white/5 pt-4 animate-fade-in space-y-4">
                  {/* Organizer contact */}
                  <div className="p-3 bg-white/5 rounded-xl space-y-1.5">
                    <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-2">Organizer Contact</p>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-white/60">Name:</span>
                      <span className="text-white">{order.organizer_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone size={12} className="text-white/40" />
                      <span className="text-gold-400 font-semibold">{order.organizer_phone}</span>
                    </div>
                    {order.department_club && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-white/60">Dept/Club:</span>
                        <span className="text-white">{order.department_club}</span>
                      </div>
                    )}
                  </div>

                  {/* Menu items */}
                  <div>
                    <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-2">Items to Prepare</p>
                    <div className="space-y-2">
                      {(order.items || []).map(item => (
                        <div key={item.bulk_item_id} className="flex justify-between items-start text-sm p-2 bg-white/5 rounded-lg">
                          <div>
                            <span className="text-white font-medium">{item.name}</span>
                            <span className="text-white/50 ml-2">× {item.quantity}</span>
                            {item.special_instructions && (
                              <p className="text-yellow-400/70 text-xs mt-0.5">📝 {item.special_instructions}</p>
                            )}
                          </div>
                          <span className="text-gold-400 font-semibold">{formatCurrency(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between font-bold text-sm mt-3 pt-3 border-t border-white/10">
                      <span className="text-white/60">Estimated Total</span>
                      <span className="text-gold-400">{formatCurrency(estimatedTotal)}</span>
                    </div>
                  </div>

                  {order.status === 'approved' && (
                    <button
                      onClick={() => handleFulfill(order.bulk_order_id)}
                      disabled={fulfillLoading === order.bulk_order_id}
                      className="btn-gold w-full flex items-center justify-center gap-2"
                    >
                      {fulfillLoading === order.bulk_order_id
                        ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-navy-900/50 border-t-navy-900 rounded-full animate-spin" /> Fulfilling…</span>
                        : <><Check size={16} /> Mark as Fulfilled</>
                      }
                    </button>
                  )}

                  {order.status === 'fulfilled' && order.fulfilled_at && (
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-300 flex items-center gap-2">
                      <Check size={12} /> Fulfilled {timeAgo(order.fulfilled_at)}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
