import { useState } from 'react';
import { X } from 'lucide-react';
import { useOrders } from '../../contexts/OrdersContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationsContext';
import { useToast } from '../../contexts/ToastContext';

const ISSUE_TYPES = [
  { id: 'wrong_item', label: 'Wrong Item Delivered' },
  { id: 'quality_issue', label: 'Quality Issue' },
  { id: 'long_wait', label: 'Long Wait Time' },
  { id: 'payment_issue', label: 'Payment Not Refunded' },
  { id: 'other', label: 'Other' },
];

export default function GrievanceModal({ order, onClose }) {
  const { addGrievance } = useOrders();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const { toast } = useToast();
  const [issueType, setIssueType] = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [ticket, setTicket] = useState(null);

  const handleSubmit = () => {
    if (!issueType || !description.trim()) { toast('Please fill all fields', 'warning'); return; }
    const g = addGrievance({
      order_id: order.order_id,
      student_id: user?.student_id,
      canteen_id: order.canteen_id,
      canteen_name: order.canteen_name,
      issue_type: issueType,
      description,
    });
    addNotification('grievance_submitted', `📋 Grievance ${g.ticket_code} submitted for order ${order.order_code}`);
    setTicket(g);
    setSubmitted(true);
    toast('Grievance submitted successfully', 'success');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card w-full max-w-sm p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Report an Issue</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl"><X size={16} className="text-white/60" /></button>
        </div>

        {submitted && ticket ? (
          <div className="text-center py-4">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-white font-bold">Grievance Submitted</p>
            <p className="text-gold-400 font-mono font-bold mt-1">{ticket.ticket_code}</p>
            <p className="text-white/50 text-sm mt-2">We'll look into this and get back to you shortly.</p>
            <button onClick={onClose} className="btn-gold w-full mt-6">Done</button>
          </div>
        ) : (
          <>
            <p className="text-white/60 text-sm mb-4">Order: <span className="text-gold-400 font-mono">{order.order_code}</span></p>
            <div className="space-y-2 mb-4">
              {ISSUE_TYPES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setIssueType(t.id)}
                  className={`w-full text-left p-3 rounded-xl text-sm transition-all border ${issueType === t.id ? 'border-gold-500 bg-gold-500/10 text-gold-400' : 'border-white/10 bg-white/5 text-white/70 hover:border-white/20'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <textarea
              placeholder="Describe the issue..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="input-dark resize-none mb-4"
            />
            <button onClick={handleSubmit} className="btn-gold w-full">Submit Grievance</button>
          </>
        )}
      </div>
    </div>
  );
}
