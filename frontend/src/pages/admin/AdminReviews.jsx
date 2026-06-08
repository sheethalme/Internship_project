import { useState, useEffect } from 'react';
import { Star, Trash2 } from 'lucide-react';
import { useCanteens } from '../../contexts/CanteenContext';
import { useToast } from '../../contexts/ToastContext';
import { api } from '../../api';
import StarRating from '../../components/ui/StarRating';

export default function AdminReviews() {
  const { canteens } = useCanteens();
  const { toast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [canteenFilter, setCanteenFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const url = canteenFilter !== 'all' ? `/admin/reviews?canteen_id=${canteenFilter}` : '/admin/reviews';
    api.get(url).then(data => { setReviews(data); setLoading(false); }).catch(() => setLoading(false));
  }, [canteenFilter]);

  const removeReview = async (id) => {
    try {
      await api.delete(`/admin/reviews/${id}`);
      setReviews(prev => prev.filter(r => r.review_id !== id));
      toast('Review removed', 'info');
    } catch {
      toast('Failed to remove review', 'error');
    }
  };

  const canteenAvg = (id) => {
    const cr = reviews.filter(r => r.canteen_id === id);
    return cr.length ? (cr.reduce((s, r) => s + r.rating, 0) / cr.length).toFixed(1) : '—';
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2"><Star size={22} className="text-gold-400" /> Reviews Center</h1>
        <p className="text-white/50 text-sm mt-1">{reviews.length} total reviews</p>
      </div>

      {/* Per-canteen averages */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {canteens.map(c => (
          <div key={c.canteen_id} className="glass-card p-4 text-center">
            <p className="text-white font-bold text-sm mb-2 truncate">{c.name}</p>
            <p className="text-gold-400 text-3xl font-black">{parseFloat(c.avg_rating || 0).toFixed(1)}</p>
            <StarRating rating={parseFloat(c.avg_rating || 0)} size={12} />
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <select value={canteenFilter} onChange={e => setCanteenFilter(e.target.value)} className="input-dark text-sm appearance-none w-auto">
          <option value="all" className="bg-navy-900">All Canteens</option>
          {canteens.map(c => <option key={c.canteen_id} value={c.canteen_id} className="bg-navy-900">{c.name}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12"><p className="text-white/30">Loading reviews...</p></div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12">
          <Star size={40} className="text-white/10 mx-auto mb-3" strokeWidth={1} />
          <p className="text-white/30">No reviews yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map(r => (
            <div key={r.review_id} className="glass-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-gold-500/20 flex items-center justify-center text-gold-400 font-bold text-sm">
                      {r.student_name?.[0] || 'S'}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{r.student_name || 'Anonymous'}</p>
                      <p className="text-white/40 text-xs">{r.canteen_name}</p>
                    </div>
                    <StarRating rating={r.rating} size={13} />
                  </div>
                  {r.comment && <p className="text-white/70 text-sm italic">"{r.comment}"</p>}
                </div>
                <button onClick={() => removeReview(r.review_id)} className="p-2 hover:bg-red-500/20 rounded-xl text-white/30 hover:text-red-400 transition-colors" title="Remove review">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
