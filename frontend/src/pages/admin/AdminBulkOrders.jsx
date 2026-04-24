import { useState, useEffect } from 'react';
import { CalendarDays, Users, ChevronDown, ChevronUp, Check, X, AlertTriangle, Building2 } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useCanteens } from '../../contexts/CanteenContext';
import { api } from '../../api';
import { formatCurrency, timeAgo } from '../../data/mockData';

const STATUS_COLOR = {
  pending:   'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  approved:  'bg-green-500/20 text-green-400 border-green-500/30',
  rejected:  'bg-red-500/20 text-red-400 border-red-500/30',
  fulfilled: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};
const STATUS_ICON = { pending: '🟡', approved: '🟢', rejected: '🔴', fulfilled: '✅' };

export default function AdminBulkOrders() {
  const { canteens } = useCanteens();
  const { toast } = useToast();

  const [orders,         setOrders]         = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [expanded,       setExpanded]       = useState(null);
  const [statusFilter,   setStatusFilter]   = useState('all');
  const [canteenFilter,  setCanteenFilter]  = useState('all');
  const [approveId,      setApproveId]      = useState(null);
  const [rejectId,       setRejectId]       = useState(null);
  const [adminNote,      setAdminNote]      = useState('');
  const [rejectReason,   setRejectReason]   = useState('');
  const [actionLoading,  setActionLoading]  = useState(false);

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter  !== 'all') params.set('status',    statusFilter);
      if (canteenFilter !== 'all') params.set('canteen_id', canteenFilter);
      const data = await api.get(`/admin/bulk-orders?${params}`);
      setOrders(data);
    } catch { toast('Failed to load bulk orders', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [statusFilter, canteenFilter]);

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await api.put(`/admin/bulk-orders/${approveId}/approve`, { admin_note: adminNote });
      toast('Bulk order approved!', 'success');
      setOrders(prev => prev.map(o => o.bulk_order_id === approveId ? { ...o, status: 'approved', admin_note: adminNote } : o));
      setApproveId(null); setAdminNote('');
    } catch (err) { toast(err.message, 'error'); }
    finally { setActionLoading(false); }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) { toast('Please provide a rejection reason', 'warning'); return; }
    setActionLoading(true);
    try {
      await api.put(`/admin/bulk-orders/${rejectId}/reject`, { rejection_reason: rejectReason });
      toast('Bulk order rejected', 'warning');
      setOrders(prev => prev.map(o => o.bulk_order_id === rejectId ? { ...o, status: 'rejected', rejection_reason: rejectReason } : o));
      setRejectId(null); setRejectReason('');
    } catch (err) { toast(err.message, 'error'); }
    finally { setActionLoading(false); }
  };

  const pending = orders.filter(o => o.status === 'pending');

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            📦 Bulk Orders
          </h1>
          <p className="text-white/50 text-sm mt-1">{pending.length} pending review</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-dark text-sm appearance-none w-auto">
          <option value="all"      className="bg-navy-900">All Statuses</option>
          <option value="pending"  className="bg-navy-900">🟡 Pending</option>
          <option value="approved" className="bg-navy-900">🟢 Approved</option>
          <option value="rejected" className="bg-navy-900">🔴 Rejected</option>
          <option value="fulfilled" className="bg-navy-900">✅ Fulfilled</option>
        </select>
        <select value={canteenFilter} onChange={e => setCanteenFilter(e.target.value)} className="input-dark text-sm appearance-none w-auto">
          <option value="all" className="bg-navy-900">All Canteens</option>
          {canteens.map(c => <option key={c.canteen_id} value={c.canteen_id} className="bg-navy-900">{c.name}</option>)}
        </select>
      </div>

      {loading && <div className="text-center py-12"><p className="text-white/40">Loading…</p></div>}

      {!loading && orders.length === 0 && (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">📭</p>
          <p className="text-white/50 text-lg font-medium">No bulk orders found</p>
          <p className="text-white/30 text-sm mt-1">Bulk order requests from students will appear here</p>
        </div>
      )}

      <div className="space-y-3">
        {orders.map(order => {
          const isUrgent = order.is_urgent && order.status === 'pending';
          return (
            <div key={order.bulk_order_id} className={`glass-card overflow-hidden ${isUrgent ? 'border-red-500/50' : ''}`}>
              {isUrgent && (
                <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border-b border-red-500/20 text-red-400 text-xs">
                  <AlertTriangle size={12} /> Urgent — event is within 48 hours and still pending review
                </div>
              )}

              <div className="p-4 cursor-pointer" onClick={() => setExpanded(expanded === order.bulk_order_id ? null : order.bulk_order_id)}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="text-white font-bold">{order.event_name}</p>
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-semibold ${STATUS_COLOR[order.status]}`}>
                        {STATUS_ICON[order.status]} {order.status}
                      </span>
                    </div>
                    <p className="text-white/40 text-xs font-mono">{order.bulk_order_code}</p>
                    <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-white/50">
                      <span className="flex items-center gap-1"><Building2 size={10} /> {order.canteen_name}</span>
                      <span className="flex items-center gap-1"><CalendarDays size={10} /> {order.event_date} at {order.event_time}</span>
                      <span className="flex items-center gap-1"><Users size={10} /> {order.num_participants} participants</span>
                      <span>Submitted {timeAgo(order.submitted_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {expanded === order.bulk_order_id ? <ChevronUp size={14} className="text-white/40" /> : <ChevronDown size={14} className="text-white/40" />}
                  </div>
                </div>
              </div>

              {expanded === order.bulk_order_id && (
                <div className="px-4 pb-4 border-t border-white/5 pt-4 animate-fade-in space-y-4">
                  {/* Event info */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    {[
                      ['Organizer', order.organizer_name],
                      ['Roll No.', order.organizer_roll],
                      ['Phone', order.organizer_phone],
                      ['Department / Club', order.department_club || '—'],
                      ['Event Type', order.event_type || '—'],
                      ['Venue', order.venue],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <p className="text-white/40 text-xs">{k}</p>
                        <p className="text-white">{v}</p>
                      </div>
                    ))}
                  </div>
                  {order.additional_notes && (
                    <div className="p-3 bg-white/5 rounded-xl text-sm">
                      <p className="text-white/40 text-xs mb-1">Notes</p>
                      <p className="text-white/80">{order.additional_notes}</p>
                    </div>
                  )}

                  {/* Items */}
                  {order.items && (
                    <div className="space-y-1">
                      <p className="text-white/40 text-xs font-semibold uppercase tracking-wider">Menu Items</p>
                      {order.items.map(item => (
                        <div key={item.bulk_item_id} className="flex justify-between text-sm">
                          <span className="text-white/80">{item.name} × {item.quantity}</span>
                          <span className="text-white">{formatCurrency(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Admin note / rejection reason */}
                  {order.admin_note && (
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-xs text-green-300">
                      Admin note: {order.admin_note}
                    </div>
                  )}
                  {order.rejection_reason && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-300">
                      Rejection reason: {order.rejection_reason}
                    </div>
                  )}

                  {/* Actions */}
                  {order.status === 'pending' && (
                    <div className="flex gap-3">
                      <button onClick={() => { setApproveId(order.bulk_order_id); setAdminNote(''); }}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-500/20 hover:bg-green-500/30 text-green-400 text-sm font-semibold transition-colors">
                        <Check size={14} /> Approve Order
                      </button>
                      <button onClick={() => { setRejectId(order.bulk_order_id); setRejectReason(''); }}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-semibold transition-colors">
                        <X size={14} /> Reject Order
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Approve modal */}
      {approveId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setApproveId(null)} />
          <div className="relative glass-card w-full max-w-sm p-6 animate-scale-in">
            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2"><Check className="text-green-400" size={20} /> Approve Bulk Order</h3>
            <div className="mb-4">
              <label className="block text-white/60 text-xs mb-1.5">Note to organizer (optional)</label>
              <textarea value={adminNote} onChange={e => setAdminNote(e.target.value)} rows={3} placeholder="Any instructions or notes…" className="input-dark resize-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setApproveId(null)} className="btn-outline flex-1">Cancel</button>
              <button onClick={handleApprove} disabled={actionLoading} className="btn-gold flex-1 bg-green-500 from-green-500 to-green-400">
                {actionLoading ? 'Approving…' : '✅ Confirm Approve'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject modal */}
      {rejectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setRejectId(null)} />
          <div className="relative glass-card w-full max-w-sm p-6 animate-scale-in">
            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2"><X className="text-red-400" size={20} /> Reject Bulk Order</h3>
            <div className="mb-4">
              <label className="block text-white/60 text-xs mb-1.5">Rejection reason *</label>
              <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={3} placeholder="Reason for rejection (required)…" className={`input-dark resize-none ${!rejectReason.trim() ? '' : ''}`} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setRejectId(null)} className="btn-outline flex-1">Cancel</button>
              <button onClick={handleReject} disabled={actionLoading || !rejectReason.trim()}
                className="flex-1 py-3 rounded-xl bg-red-500/80 hover:bg-red-500 text-white font-bold text-sm transition-colors disabled:opacity-50">
                {actionLoading ? 'Rejecting…' : '❌ Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
