import { useNavigate } from 'react-router-dom';
import { Star, Clock, Users, ChevronRight } from 'lucide-react';
import { useCanteens } from '../../contexts/CanteenContext';
import { getCapacityInfo } from '../../data/mockData';

export default function BrowseCanteens() {
  const { canteens } = useCanteens();
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Browse Canteens</h1>
        <p className="text-white/50 text-sm mt-1">4 canteens · Live capacity indicators</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {canteens.map((c) => {
          const cap = getCapacityInfo(c.active_orders || 0, c.max_capacity);
          return (
            <div
              key={c.canteen_id}
              onClick={() => navigate(`/student/canteens/${c.canteen_id}`)}
              className="glass-card overflow-hidden card-hover group cursor-pointer"
            >
              <div className="relative h-44 overflow-hidden">
                <img src={c.banner_image} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 to-transparent" />
                {c.status !== 'open' && (
                  <div className="absolute inset-0 bg-navy-900/60 flex items-center justify-center">
                    <span className="text-white font-bold uppercase text-sm px-4 py-2 rounded-xl border border-white/30">{c.status}</span>
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <span className={`badge-${cap.color === 'green' ? 'green' : cap.color === 'yellow' ? 'yellow' : 'red'}`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                    {cap.label}
                  </span>
                </div>
                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="text-white font-black text-xl">{c.name}</h3>
                  <p className="text-white/70 text-sm">{c.cuisine}</p>
                </div>
              </div>

              <div className="p-4">
                <p className="text-white/60 text-sm mb-4 line-clamp-2">{c.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Star size={14} className="text-gold-400 fill-gold-400" />
                      <span className="text-gold-400 font-bold">{c.avg_rating}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-white/50">
                      <Users size={14} />
                      <span>{c.active_orders || 0} in queue</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-white/50">
                      <Clock size={14} />
                      <span>~{Math.max(5, (c.active_orders || 0) * 2)} min</span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-white/30 group-hover:text-gold-400 group-hover:translate-x-1 transition-all" />
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${cap.color === 'green' ? 'bg-green-500' : cap.color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${cap.pct}%` }}
                    />
                  </div>
                  <span className="text-white/40 text-xs">{Math.round(cap.pct)}% capacity</span>
                </div>
                <p className="text-white/40 text-xs mt-2">{c.operating_hours}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
