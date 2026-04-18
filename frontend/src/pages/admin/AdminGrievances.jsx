import { useState } from 'react';
import { AlertCircle, MessageSquare, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { useOrders } from '../../contexts/OrdersContext';
import { useToast } from '../../contexts/ToastContext';
import { useCanteens } from '../../contexts/CanteenContext';
import { timeAgo } from '../../data/mockData';

const STATUS_COLOR = { open: 'badge-red', in_review: 'badge-yellow', resolved: 'badge-green' };
const ISSUE_LABELS = { wrong_item: 'Wrong Item', quality_issue: 'Quality Issue', long_wait: 'Long Wait', payment_issue: 'Payment Issue', other: 'Other' };

export default function AdminGrievances() {
  const { grievances, replyGrievance, resolveGrievance } = useOrders();
  const { canteens } = useCanteens();
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(null);
  const [replyText, setReplyText] = useState({});
  const [statusFilter, setStatusFilter] = useState('all');
  const [canteenFilter, setCanteenFilter] = useState('all');

  const isUrgent = (g) => g.status === 'open' && (Date.now() - new Date(g.created_at).getTime()) > 24 * 3600000;

  const filtered = grievances.filter(g => {
    const matchStatus = statusFilter === 'all' || g.status === statusFilter;
    const matchCanteen = canteenFilter === 'all' || g.canteen_id === parseInt(canteenFilter);
    return matchStatus && matchCanteen;
  }).sort((a, b) => isUrgent(b) - isUrgent(a));

  const submitReply = (id) => {
    if (!replyText[id]?.trim()) { toast('Reply cannot be empty', 'warning'); return; }
    replyGrievance(id, replyText[id], 'admin');
    toast('Admin reply sent', 'success');
    setReplyText(p => ({ ...p, [id]: '' }));
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Grievances Center</h1>
        <p className="text-white/50 text-sm mt-1">
          {grievances.filter(g => g.status === 'open').length} open · {filtered.filter(isUrgent).length > 0 && <span className="text-red-400">{filtered.filter(isUrgent).length} urgent</span>}
        </p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-dark text-sm appearance-none w-auto">
          {['all', 'open', 'in_review', 'resolved'].map(s => <option key={s} value={s} className="bg-navy-900 capitalize">{s === 'all' ? 'All Statuses' : s.replace('_', ' ')}</option>)}
        </select>
        <select value={canteenFilter} onChange={e => setCanteenFilter(e.target.value)} className="input-dark text-sm appearance-none w-auto">
          <option value="all" className="bg-navy-900">All Canteens</option>
          {canteens.map(c => <option key={c.canteen_id} value={c.canteen_id} className="bg-navy-900">{c.name}</option>)}
        </select>
      </div>

      <div className="space-y-3">
        {filtered.map(g => (
          <div key={g.grievance_id} className={`glass-card overflow-hidden ${isUrgent(g) ? 'border-red-500/40' : ''}`}>
            {isUrgent(g) && (
              <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border-b border-red-500/20 text-red-400 text-xs">
                <AlertTriangle size={12} /> Unresponded for over 24 hours — urgent
              </div>
            )}
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-gold-400 font-mono font-bold text-sm">{g.ticket_code}</span>
                    <span className={STATUS_COLOR[g.status]}>{g.status.replace('_', ' ')}</span>
                    <span className="badge-gold text-xs">{ISSUE_LABELS[g.issue_type]}</span>
                  </div>
                  <p className="text-white font-semibold text-sm">{g.canteen_name || canteens.find(c => c.canteen_id === g.canteen_id)?.name}</p>
                  <p className="text-white/40 text-xs">{timeAgo(g.created_at)}</p>
                </div>
                <button onClick={() => setExpanded(expanded === g.grievance_id ? null : g.grievance_id)} className="text-white/40">
                  {expanded === g.grievance_id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
            </div>

            {expanded === g.grievance_id && (
              <div className="px-4 pb-4 border-t border-white/5 pt-4 space-y-3 animate-fade-in">
                <div className="p-3 rounded-xl bg-white/5">
                  <p className="text-white/40 text-xs mb-1">Student Report</p>
                  <p className="text-white/80 text-sm">{g.description}</p>
                </div>
                {g.vendor_reply && (
                  <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <p className="text-blue-400 text-xs mb-1">Vendor Reply</p>
                    <p className="text-white/80 text-sm">{g.vendor_reply}</p>
                  </div>
                )}
                {g.admin_reply ? (
                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <p className="text-purple-400 text-xs mb-1">Admin Reply</p>
                    <p className="text-white/80 text-sm">{g.admin_reply}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <textarea placeholder="Admin reply..." value={replyText[g.grievance_id] || ''} onChange={e => setReplyText(p => ({ ...p, [g.grievance_id]: e.target.value }))} rows={2} className="input-dark resize-none text-sm" />
                    <div className="flex gap-2">
                      <button onClick={() => submitReply(g.grievance_id)} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 text-sm transition-colors">
                        <MessageSquare size={12} /> Reply
                      </button>
                      <button onClick={() => { resolveGrievance(g.grievance_id); toast('Ticket resolved', 'success'); }} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-500/20 hover:bg-green-500/30 text-green-400 text-sm transition-colors">
                        Close Ticket
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && <div className="text-center py-12"><p className="text-white/30">No grievances match filters</p></div>}
      </div>
    </div>
  );
}
