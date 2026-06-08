import { Star } from 'lucide-react';

export default function StarRating({ rating, max = 5, size = 14, interactive = false, onChange }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={`${i < Math.round(rating) ? 'text-gold-400 fill-gold-400' : 'text-white/20'} ${interactive ? 'cursor-pointer hover:text-gold-400 hover:fill-gold-400 transition-colors' : ''}`}
          onClick={() => interactive && onChange && onChange(i + 1)}
        />
      ))}
    </div>
  );
}
