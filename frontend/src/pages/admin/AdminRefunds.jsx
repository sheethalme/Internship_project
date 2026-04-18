import { RotateCcw, Check, X } from 'lucide-react';
import { useOrders } from '../../contexts/OrdersContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationsContext';
import { useToast } from '../../contexts/ToastContext';
import { formatCurrency, timeAgo } from '../../data/mockData';

const STATUS_COLOR = { requested: 'badge-yellow', under_review: 'badge-yellow', approved: 'badge-green', processed: 'badge-green', rejected: 'badge-red' };

export default function AdminRefunds() {
  const { refunds, orders, updateRefundStatus } = useOrders();
  const { addNotification } = useNotifications();
  const { toast } = useToast();

  const processRefund = (r) => {
    updateRefundStatus(r.refund_id, 'processed');
    addNotification('refund_processed', `💰 Refund of ${formatCurrency(r.amount)} has been credited to your GourmetWallet!`);
    toast(`Refund of ${formatCurrency(r.amount)} processed — wallet credited`, 'success');
  };

  const rejectRefund = (r) => {
    updateRefundStatus(r.refund_id, 'rejected');
    toast('Refund rejected', 'warning');
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Refunds Center</h1>
        <p className="text-white/50 text-sm mt-1">{refunds.filter(r => ['approved'].includes(r.status)).length} awaiting final processing</p>
      </div>

      {refunds.length === 0 ? (
        <div className="text-center py-16">
          <RotateCcw size={48} className="text-white/20 mx-auto mb-4" strokeWidth={1} />
          <p className="text-white/50">No refund requests</p>
        </div>
      ) : (
        <div className="space-y-3">
          {refunds.map(r => {
            const order = orders.find(o => o.order_id === r.order_id);
            const canProcess = r.status === 'approved';
            const canReject = ['requested', 'under_review'].includes(r.status);
            return (
              <div key={r.refund_id} className="glass-card p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-white font-bold">{order?.order_code}</p>
                    <p className="text-white/50 text-sm">{order?.canteen_name}</p>
                    <p className="text-white/60 text-sm mt-1 italic">"{r.reason}"</p>
                    <p className="text-white/30 text-xs mt-1">{timeAgo(r.requested_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gold-400 font-black text-xl">{formatCurrency(r.amount)}</p>
                    <span className={`${STATUS_COLOR[r.status]} mt-1`}>{r.status.replace('_', ' ')}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {canReject && (
                    <button onClick={() => rejectRefund(r)} className="flex items-center gap-2 flex-1 justify-center py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm transition-colors">
                      <X size={14} /> Reject
                    </button>
                  )}
                  {canProcess && (
                    <button onClick={() => processRefund(r)} className="flex items-center gap-2 flex-1 justify-center py-2 rounded-xl bg-green-500/20 hover:bg-green-500/30 text-green-400 text-sm font-semibold transition-colors">
                      <Check size={14} /> Process → Credit Wallet
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
