import { useState } from 'react';
import { Star, Trash2, Flag } from 'lucide-react';
import { useCanteens } from '../../contexts/CanteenContext';
import { useToast } from '../../contexts/ToastContext';
import { MOCK_REVIEWS } from '../../data/mockData';
import StarRating from '../../components/ui/StarRating';

export default function AdminReviews() {
  const { canteens } = useCanteens();
  const { toast } = useToast();
  const [reviews, setReviews] = useState(MOCK_REVIEWS);
  const [canteenFilter, setCanteenFilter] = useState('all');

  const filtered = reviews.filter(r => canteenFilter === 'all' || r.canteen_id === parseInt(canteenFilter));

  const removeReview = (id) => {
    setReviews(prev => prev.filter(r => r.review_id !== id));
    toast('Review removed', 'info');
  };

  const canteenAvg = (id) => {
    const cr = reviews.filter(r => r.canteen_id === id);
    return cr.length ? (cr.reduce((s, r) => s + r.rating, 0) / cr.length).toFixed(1) : '—';
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Reviews Center</h1>
        <p className="text-white/50 text-sm mt-1">{reviews.length} total reviews</p>
      </div>

      {/* Canteen rating summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {canteens.map(c => (
          <div key={c.canteen_id} className="glass-card p-4 text-center">
            <p className="text-white font-bold text-sm mb-2 truncate">{c.name}</p>
            <p className="text-gold-400 text-3xl font-black">{canteenAvg(c.canteen_id)}</p>
            <StarRating rating={parseFloat(canteenAvg(c.canteen_id)) || 0} size={12} />
            <p className="text-white/40 text-xs mt-1">{reviews.filter(r => r.canteen_id === c.canteen_id).length} reviews</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <select value={canteenFilter} onChange={e => setCanteenFilter(e.target.value)} className="input-dark text-sm appearance-none w-auto">
          <option value="all" className="bg-navy-900">All Canteens</option>
          {canteens.map(c => <option key={c.canteen_id} value={c.canteen_id} className="bg-navy-900">{c.name}</option>)}
        </select>
      </div>

      <div className="space-y-3">
        {filtered.map(r => {
          const canteen = canteens.find(c => c.canteen_id === r.canteen_id);
          return (
            <div key={r.review_id} className="glass-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-gold-500/20 flex items-center justify-center text-gold-400 font-bold text-sm">
                      {r.student_name?.[0] || 'S'}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{r.student_name || 'Anonymous'}</p>
                      <p className="text-white/40 text-xs">{canteen?.name}</p>
                    </div>
                    <StarRating rating={r.rating} size={13} />
                  </div>
                  {r.comment && <p className="text-white/70 text-sm italic">"{r.comment}"</p>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => removeReview(r.review_id)} className="p-2 hover:bg-red-500/20 rounded-xl text-white/30 hover:text-red-400 transition-colors" title="Remove review">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <div className="text-center py-12"><p className="text-white/30">No reviews found</p></div>}
      </div>
    </div>
  );
}
