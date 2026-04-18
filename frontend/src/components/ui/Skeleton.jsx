export function SkeletonCard() {
  return (
    <div className="glass-card p-4 animate-pulse">
      <div className="shimmer h-32 rounded-xl mb-4" />
      <div className="shimmer h-4 rounded w-3/4 mb-2" />
      <div className="shimmer h-3 rounded w-1/2 mb-4" />
      <div className="shimmer h-8 rounded-xl" />
    </div>
  );
}

export function SkeletonList({ count = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card p-4 flex gap-4 animate-pulse">
          <div className="shimmer w-16 h-16 rounded-xl flex-shrink-0" />
          <div className="flex-1">
            <div className="shimmer h-4 rounded w-3/4 mb-2" />
            <div className="shimmer h-3 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div className="glass-card p-6 animate-pulse">
      <div className="shimmer h-3 rounded w-1/2 mb-3" />
      <div className="shimmer h-8 rounded w-2/3" />
    </div>
  );
}
