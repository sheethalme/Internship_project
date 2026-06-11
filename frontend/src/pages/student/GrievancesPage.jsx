import { useState } from 'react';
import { AlertCircle, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { useOrders } from '../../contexts/OrdersContext';
import { useAuth } from '../../contexts/AuthContext';
import { timeAgo } from '../../data/mockData';

const STATUS_COLOR = { open: 'badge-red', in_review: 'badge-yellow', resolved: 'badge-green' };
const ISSUE_LABELS = {
  wrong_item: 'Wrong Item', quality_issue: 'Quality Issue', long_wait: 'Long Wait',
  payment_issue: 'Payment Issue', other: 'Other',
};

export default function GrievancesPage() {
  const { grievances } = useOrders();
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(null);

  const myGrievances = grievances.filter(g => g.student_id === user?.student_id);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <AlertCircle size={24} className="text-gold-400" /> My Grievances
        </h1>
        <p className="text-white/50 text-sm mt-1">Track issues raised with canteens</p>
      </div>

      {myGrievances.length === 0 ? (
        <div className="text-center py-16">
          <AlertCircle size={48} className="text-white/20 mx-auto mb-4" strokeWidth={1} />
          <p className="text-white/50">No grievances raised</p>
          <p className="text-white/30 text-sm mt-1">Use "Report an Issue" on a completed order</p>
        </div>
      ) : (
        <div className="space-y-3">
          {myGrievances.map(g => (
            <div key={g.grievance_id} className="glass-card overflow-hidden">
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-gold-400 font-mono text-sm font-bold">{g.ticket_code}</span>
                      <span className={STATUS_COLOR[g.status]}>{g.status.replace('_', ' ')}</span>
                      <span className="badge-gold text-xs">{ISSUE_LABELS[g.issue_type]}</span>
                    </div>
                    <p className="text-white font-semibold text-sm">{g.canteen_name}</p>
                    <p className="text-white/50 text-xs mt-1">{timeAgo(g.created_at)}</p>
                  </div>
                  <button onClick={() => setExpanded(expanded === g.grievance_id ? null : g.grievance_id)} className="text-white/40 hover:text-white transition-colors">
                    {expanded === g.grievance_id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {expanded === g.grievance_id && (
                <div className="px-4 pb-4 border-t border-white/5 pt-4 space-y-4 animate-fade-in">
                  <div>
                    <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-2">Your Report</p>
                    <p className="text-white/80 text-sm">{g.description}</p>
                  </div>

                  {g.vendor_reply && (
                    <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                      <p className="text-blue-400 text-xs font-semibold mb-1 flex items-center gap-1.5">
                        <MessageSquare size={12} /> Vendor Reply
                      </p>
                      <p className="text-white/80 text-sm">{g.vendor_reply}</p>
                    </div>
                  )}

                  {g.admin_reply && (
                    <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                      <p className="text-purple-400 text-xs font-semibold mb-1 flex items-center gap-1.5">
                        <MessageSquare size={12} /> Admin Reply
                      </p>
                      <p className="text-white/80 text-sm">{g.admin_reply}</p>
                    </div>
                  )}

                  {!g.vendor_reply && !g.admin_reply && (
                    <p className="text-white/30 text-sm italic">Awaiting response from canteen...</p>
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
