import { useState } from 'react';
import { RotateCcw, Check, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useOrders } from '../../contexts/OrdersContext';
import { useToast } from '../../contexts/ToastContext';
import { formatCurrency, timeAgo } from '../../data/mockData';

const STATUS_COLOR = { requested: 'badge-yellow', under_review: 'badge-yellow', approved: 'badge-green', processed: 'badge-green', rejected: 'badge-red' };

export default function VendorRefunds() {
  const { user } = useAuth();
  const { refunds, orders, updateRefundStatus } = useOrders();
  const { toast } = useToast();

  const myRefunds = refunds.filter(r => {
    const order = orders.find(o => o.order_id === r.order_id);
    return order?.canteen_id === user?.canteen_id;
  });

  const handleAction = (id, action) => {
    updateRefundStatus(id, action === 'approve' ? 'approved' : 'rejected');
    toast(action === 'approve' ? 'Refund approved — sent to admin for processing' : 'Refund rejected', action === 'approve' ? 'success' : 'warning');
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Refund Requests</h1>
        <p className="text-white/50 text-sm mt-1">{myRefunds.filter(r => r.status === 'requested').length} pending review</p>
      </div>

      {myRefunds.length === 0 ? (
        <div className="text-center py-16">
          <RotateCcw size={48} className="text-white/20 mx-auto mb-4" strokeWidth={1} />
          <p className="text-white/50">No refund requests for your canteen</p>
        </div>
      ) : (
        <div className="space-y-3">
          {myRefunds.map(r => {
            const order = orders.find(o => o.order_id === r.order_id);
            const canAct = r.status === 'requested' || r.status === 'under_review';
            return (
              <div key={r.refund_id} className="glass-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-white font-bold">{order?.order_code}</p>
                    <p className="text-white/50 text-sm">{r.reason}</p>
                    <p className="text-white/40 text-xs mt-1">{timeAgo(r.requested_at)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-gold-400 font-black text-lg">{formatCurrency(r.amount)}</p>
                    <span className={`${STATUS_COLOR[r.status]} mt-1`}>{r.status.replace('_', ' ')}</span>
                  </div>
                </div>
                {canAct && (
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => handleAction(r.refund_id, 'reject')} className="flex items-center gap-2 flex-1 justify-center py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-semibold transition-colors">
                      <X size={14} /> Reject
                    </button>
                    <button onClick={() => handleAction(r.refund_id, 'approve')} className="flex items-center gap-2 flex-1 justify-center py-2 rounded-xl bg-green-500/20 hover:bg-green-500/30 text-green-400 text-sm font-semibold transition-colors">
                      <Check size={14} /> Approve
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
