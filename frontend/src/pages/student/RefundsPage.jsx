import { useState } from 'react';
import { RotateCcw, Plus } from 'lucide-react';
import { useOrders } from '../../contexts/OrdersContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationsContext';
import { useToast } from '../../contexts/ToastContext';
import { formatCurrency, timeAgo } from '../../data/mockData';

const STATUS_COLOR = {
  requested: 'badge-yellow', under_review: 'badge-yellow',
  approved: 'badge-green', processed: 'badge-green', rejected: 'badge-red',
};

export default function RefundsPage() {
  const { orders, refunds, addRefund, grievances } = useOrders();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState('');
  const [reason, setReason] = useState('');

  const myRefunds = refunds.filter(r => r.student_id === user?.student_id);
  const eligibleOrders = orders.filter(o =>
    o.status !== 'cancelled' &&
    !refunds.find(r => r.order_id === o.order_id)
  );

  const handleSubmit = () => {
    if (!selectedOrder || !reason.trim()) { toast('Please fill all fields', 'warning'); return; }
    const order = orders.find(o => o.order_id === parseInt(selectedOrder));
    addRefund({
      order_id: order.order_id,
      student_id: user?.student_id,
      amount: order.total_amount,
      reason,
    });
    addNotification('refund_requested', `💰 Refund request submitted for order ${order.order_code}`);
    toast('Refund request submitted!', 'success');
    setShowForm(false);
    setSelectedOrder('');
    setReason('');
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <RotateCcw size={24} className="text-gold-400" /> Refunds
          </h1>
          <p className="text-white/50 text-sm mt-1">Track your refund requests</p>
        </div>
        <button onClick={() => setShowForm(p => !p)} className="btn-outline text-sm flex items-center gap-2">
          <Plus size={14} /> Request Refund
        </button>
      </div>

      {showForm && (
        <div className="glass-card p-5 animate-fade-in">
          <h3 className="text-white font-bold mb-4">New Refund Request</h3>
          <div className="space-y-4">
            <select
              value={selectedOrder}
              onChange={e => setSelectedOrder(e.target.value)}
              className="input-dark appearance-none"
            >
              <option value="" className="bg-navy-900">Select an order...</option>
              {eligibleOrders.map(o => {
                const itemNames = o.items?.map(i => i.name).join(', ') || 'Items';
                return (
                  <option key={o.order_id} value={o.order_id} className="bg-navy-900">
                    {o.order_code} — {o.canteen_name} ({itemNames}) — {formatCurrency(o.total_amount)}
                  </option>
                );
              })}
            </select>
            <textarea
              placeholder="Reason for refund..."
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={3}
              className="input-dark resize-none"
            />
            <div className="flex gap-3">
              <button onClick={() => setShowForm(false)} className="btn-outline flex-1 text-sm">Cancel</button>
              <button onClick={handleSubmit} className="btn-gold flex-1 text-sm">Submit</button>
            </div>
          </div>
        </div>
      )}

      {myRefunds.length === 0 && !showForm ? (
        <div className="text-center py-16">
          <RotateCcw size={48} className="text-white/20 mx-auto mb-4" strokeWidth={1} />
          <p className="text-white/50">No refund requests</p>
        </div>
      ) : (
        <div className="space-y-3">
          {myRefunds.map(r => {
            const order = orders.find(o => o.order_id === r.order_id);
            return (
              <div key={r.refund_id} className="glass-card p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white font-bold">{order?.order_code || `Order #${r.order_id}`}</p>
                    <p className="text-white/50 text-sm">{order?.canteen_name}</p>
                    <p className="text-white/40 text-xs mt-1">{timeAgo(r.requested_at)}</p>
                    <p className="text-white/60 text-sm mt-2 italic">"{r.reason}"</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gold-400 font-black text-lg">{formatCurrency(r.amount)}</p>
                    <span className={`${STATUS_COLOR[r.status]} mt-1`}>{r.status.replace('_', ' ')}</span>
                  </div>
                </div>
                {/* Status tracker */}
                <div className="mt-4 flex items-center gap-1">
                  {['requested', 'under_review', 'approved', 'processed'].map((s, i) => {
                    const steps = ['requested', 'under_review', 'approved', 'processed'];
                    const currentIdx = steps.indexOf(r.status);
                    const thisIdx = i;
                    return (
                      <div key={s} className="flex items-center flex-1">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] flex-shrink-0 ${thisIdx <= currentIdx ? 'border-gold-500 bg-gold-500/20 text-gold-400' : 'border-white/20 text-white/30'}`}>
                          {thisIdx < currentIdx ? '✓' : thisIdx === currentIdx ? '●' : '○'}
                        </div>
                        {i < 3 && <div className={`flex-1 h-0.5 ${thisIdx < currentIdx ? 'bg-gold-500' : 'bg-white/10'}`} />}
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-[10px] text-white/30 mt-1">
                  <span>Requested</span><span>Under Review</span><span>Approved</span><span>Processed</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
