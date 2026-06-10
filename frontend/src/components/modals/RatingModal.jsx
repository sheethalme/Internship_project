import { useState } from 'react';
import { X, Star } from 'lucide-react';
import { useOrders } from '../../contexts/OrdersContext';
import { useToast } from '../../contexts/ToastContext';

export default function RatingModal({ order, onClose }) {
  const { markRated } = useOrders();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (rating === 0) { toast('Please select a rating', 'warning'); return; }
    markRated(order.order_id);
    setSubmitted(true);
    setTimeout(() => {
      toast('Review submitted! Thanks 🌟', 'success');
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card w-full max-w-sm p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Rate Your Order</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl"><X size={16} className="text-white/60" /></button>
        </div>

        {submitted ? (
          <div className="text-center py-4">
            <p className="text-4xl mb-3">🌟</p>
            <p className="text-white font-bold">Thanks for your feedback!</p>
          </div>
        ) : (
          <>
            <p className="text-white/60 text-sm mb-2">How was your experience at <span className="text-white font-semibold">{order.canteen_name}</span>?</p>
            <div className="flex gap-2 justify-center my-6">
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} onClick={() => setRating(s)}>
                  <Star size={32} className={s <= rating ? 'text-gold-400 fill-gold-400' : 'text-white/20'} />
                </button>
              ))}
            </div>
            <textarea
              placeholder="Optional comment..."
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={3}
              className="input-dark resize-none mb-4"
            />
            <button onClick={handleSubmit} className="btn-gold w-full">Submit Review</button>
          </>
        )}
      </div>
    </div>
  );
}
