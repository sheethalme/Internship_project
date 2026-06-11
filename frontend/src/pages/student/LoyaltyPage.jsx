import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../data/mockData';
import { Coins, TrendingUp, Gift, Info } from 'lucide-react';

export default function LoyaltyPage() {
  const { user } = useAuth();
  const points = user?.loyalty_points || 0;
  const redeemable = Math.floor(points / 100);
  const savings = redeemable * 10;
  const progress = points % 100;

  const history = [
    { type: 'earned', amount: 10, desc: 'Order GG-2025-00142', date: 'Today' },
    { type: 'earned', amount: 15, desc: 'Order GG-2025-00139', date: 'Today' },
    { type: 'earned', amount: 22, desc: 'Order GG-2025-00128', date: '2 days ago' },
    { type: 'redeemed', amount: 100, desc: 'Redeemed ₹10 discount', date: '2 days ago' },
    { type: 'earned', amount: 21, desc: 'Order GG-2025-00117', date: '3 days ago' },
  ];

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">GourmetCoins</h1>
        <p className="text-white/50 text-sm mt-1">Earn 1 coin per ₹10 spent · 100 coins = ₹10 off</p>
      </div>

      {/* Main coins card */}
      <div className="glass-card p-6 bg-gradient-to-br from-gold-500/10 to-transparent border-gold-500/20 relative overflow-hidden">
        <div className="absolute top-4 right-4 text-8xl opacity-10">🪙</div>
        <p className="text-white/60 text-sm font-medium mb-2">Your Balance</p>
        <div className="flex items-end gap-3 mb-4">
          <span className="text-6xl font-black text-gradient-gold">{points}</span>
          <span className="text-white/50 text-xl mb-2">coins</span>
        </div>
        <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden mb-2">
          <div className="h-full bg-gradient-to-r from-gold-500 to-gold-300 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-white/50 text-xs">{100 - progress} more coins to unlock next ₹10 reward</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: '🎁', label: 'Redeemable', value: `${redeemable}×`, sub: '₹10 each' },
          { icon: '💰', label: 'Total Saved', value: formatCurrency(savings), sub: 'via coins' },
          { icon: '📈', label: 'Lifetime', value: `${points + 200}`, sub: 'coins earned' },
        ].map((s, i) => (
          <div key={i} className="glass-card p-4 text-center">
            <p className="text-2xl mb-2">{s.icon}</p>
            <p className="text-white font-black text-xl">{s.value}</p>
            <p className="text-white/50 text-xs">{s.label}</p>
            <p className="text-white/30 text-xs">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className="glass-card p-5">
        <h3 className="text-white font-bold flex items-center gap-2 mb-4">
          <Info size={16} className="text-gold-400" /> How GourmetCoins Work
        </h3>
        <div className="space-y-3">
          {[
            { icon: '🛒', text: 'Earn 1 GourmetCoin for every ₹10 spent' },
            { icon: '🪙', text: '100 coins = ₹10 discount at checkout' },
            { icon: '✅', text: 'Apply coins automatically during payment' },
            { icon: '🎁', text: 'Welcome bonus: 50 coins on registration' },
          ].map((tip, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <span className="text-xl">{tip.icon}</span>
              <span className="text-white/70">{tip.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction history */}
      <div className="glass-card p-5">
        <h3 className="text-white font-bold mb-4">Transaction History</h3>
        <div className="space-y-3">
          {history.map((h, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm ${h.type === 'earned' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                  {h.type === 'earned' ? '⬆️' : '⬇️'}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{h.desc}</p>
                  <p className="text-white/40 text-xs">{h.date}</p>
                </div>
              </div>
              <span className={`font-bold ${h.type === 'earned' ? 'text-green-400' : 'text-red-400'}`}>
                {h.type === 'earned' ? '+' : '-'}{h.amount}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
