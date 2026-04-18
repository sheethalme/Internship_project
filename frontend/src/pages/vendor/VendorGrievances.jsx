import { useState } from 'react';
import { AlertCircle, MessageSquare, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useOrders } from '../../contexts/OrdersContext';
import { useToast } from '../../contexts/ToastContext';
import { timeAgo } from '../../data/mockData';

const ISSUE_LABELS = { wrong_item: 'Wrong Item', quality_issue: 'Quality Issue', long_wait: 'Long Wait', payment_issue: 'Payment Issue', other: 'Other' };
const STATUS_COLOR = { open: 'badge-red', in_review: 'badge-yellow', resolved: 'badge-green' };

export default function VendorGrievances() {
  const { user } = useAuth();
  const { grievances, replyGrievance, resolveGrievance } = useOrders();
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(null);
  const [replyText, setReplyText] = useState({});

  const myGrievances = grievances.filter(g => g.canteen_id === user?.canteen_id);

  const submitReply = (id) => {
    if (!replyText[id]?.trim()) { toast('Reply cannot be empty', 'warning'); return; }
    replyGrievance(id, replyText[id], 'vendor');
    toast('Reply sent to student', 'success');
    setReplyText(p => ({ ...p, [id]: '' }));
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Grievances</h1>
        <p className="text-white/50 text-sm mt-1">{myGrievances.filter(g => g.status === 'open').length} open tickets</p>
      </div>

      {myGrievances.length === 0 ? (
        <div className="text-center py-16">
          <AlertCircle size={48} className="text-white/20 mx-auto mb-4" strokeWidth={1} />
          <p className="text-white/50">No grievances raised against your canteen</p>
        </div>
      ) : (
        <div className="space-y-3">
          {myGrievances.map(g => (
            <div key={g.grievance_id} className={`glass-card overflow-hidden ${g.status === 'open' ? 'border-red-500/20' : ''}`}>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-gold-400 font-mono font-bold text-sm">{g.ticket_code}</span>
                      <span className={STATUS_COLOR[g.status]}>{g.status.replace('_', ' ')}</span>
                      <span className="badge-gold text-xs">{ISSUE_LABELS[g.issue_type]}</span>
                    </div>
                    <p className="text-white/50 text-xs">{timeAgo(g.created_at)}</p>
                  </div>
                  <button onClick={() => setExpanded(expanded === g.grievance_id ? null : g.grievance_id)} className="text-white/40">
                    {expanded === g.grievance_id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {expanded === g.grievance_id && (
                <div className="px-4 pb-4 border-t border-white/5 pt-4 space-y-4 animate-fade-in">
                  <div className="p-3 rounded-xl bg-white/5">
                    <p className="text-white/40 text-xs mb-1">Student Report</p>
                    <p className="text-white/80 text-sm">{g.description}</p>
                  </div>

                  {g.vendor_reply ? (
                    <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                      <p className="text-blue-400 text-xs mb-1">Your Reply</p>
                      <p className="text-white/80 text-sm">{g.vendor_reply}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <textarea
                        placeholder="Write a reply to the student..."
                        value={replyText[g.grievance_id] || ''}
                        onChange={e => setReplyText(p => ({ ...p, [g.grievance_id]: e.target.value }))}
                        rows={3}
                        className="input-dark resize-none text-sm"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => submitReply(g.grievance_id)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-sm font-semibold transition-colors">
                          <MessageSquare size={14} /> Send Reply
                        </button>
                        {g.status !== 'resolved' && (
                          <button onClick={() => { resolveGrievance(g.grievance_id); toast('Ticket resolved', 'success'); }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/20 hover:bg-green-500/30 text-green-400 text-sm font-semibold transition-colors">
                            <Check size={14} /> Mark Resolved
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
