import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { Star, Clock, ShoppingBag, Repeat, Coins, ChevronRight, Zap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCanteens } from '../../contexts/CanteenContext';
import { useOrders } from '../../contexts/OrdersContext';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastContext';
import { getCapacityInfo, formatCurrency, MOCK_ORDERS, MENU_ITEMS } from '../../data/mockData';
import StarRating from '../../components/ui/StarRating';

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const getSmartPick = (canteens, menuItems) => {
  const h = new Date().getHours();
  let canteenPick = canteens.find(c => c.status === 'open' && (c.active_orders || 0) < 10) || canteens[0];
  const items = menuItems[canteenPick?.canteen_id] || [];
  const available = items.filter(i => i.is_available);
  let itemPick;
  if (h < 11) itemPick = available.find(i => i.category === 'meals' || i.category === 'beverages');
  else if (h < 15) itemPick = available.find(i => i.category === 'meals');
  else itemPick = available.find(i => i.category === 'snacks' || i.category === 'beverages');
  return { canteen: canteenPick, item: itemPick || available[0] };
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const { canteens } = useCanteens();
  const { menuItems } = useCanteens();
  const { orders } = useOrders();
  const { addItem, setIsOpen } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const recentOrders = orders.filter(o => o.student_id === user?.student_id).slice(0, 3);
  const smartPick = getSmartPick(canteens, menuItems);

  useEffect(() => {
    if (!containerRef.current) return;
    gsap.fromTo(containerRef.current.querySelectorAll('.dash-card'),
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out' }
    );
  }, []);

  const handleReorder = (order) => {
    order.items.forEach(item => {
      const menuItem = (menuItems[order.canteen_id] || []).find(m => m.item_id === item.item_id);
      if (menuItem) addItem(order.canteen_id, order.canteen_name, menuItem, item.quantity);
    });
    setIsOpen(true);
    toast(`Re-added ${order.items.length} item(s) to cart`, 'success');
  };

  return (
    <div ref={containerRef} className="space-y-6 max-w-5xl">
      {/* Welcome */}
      <div className="dash-card glass-card p-6 bg-gradient-to-r from-gold-500/10 to-transparent border-gold-500/20">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white">
              {getGreeting()}, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-white/60 mt-1">What are you craving today?</p>
            <div className="flex items-center gap-2 mt-3">
              <span className="badge-gold">
                <span>🪙</span> {user?.loyalty_points || 0} GourmetCoins
              </span>
              <span className="badge-green">
                <span>💳</span> {formatCurrency(user?.wallet_balance || 500)} Wallet
              </span>
            </div>
          </div>
          <div className="hidden sm:block text-6xl">🍽️</div>
        </div>
      </div>

      {/* Canteen Grid */}
      <div className="dash-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title mb-0">Canteens</h2>
          <button onClick={() => navigate('/student/canteens')} className="text-gold-400 text-sm font-medium flex items-center gap-1 hover:text-gold-300">
            View all <ChevronRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {canteens.map(c => {
            const cap = getCapacityInfo(c.active_orders || 0, c.max_capacity);
            return (
              <div
                key={c.canteen_id}
                onClick={() => navigate(`/student/canteens/${c.canteen_id}`)}
                className="group glass-card p-4 card-hover cursor-pointer"
              >
                <div className="relative h-24 rounded-xl overflow-hidden mb-3">
                  <img src={c.banner_image} alt={c.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-900/60 to-transparent" />
                  {c.status !== 'open' && (
                    <div className="absolute inset-0 bg-navy-900/70 flex items-center justify-center">
                      <span className="text-white/70 text-xs font-bold uppercase">{c.status}</span>
                    </div>
                  )}
                </div>
                <p className="text-white font-bold text-sm truncate">{c.name}</p>
                <div className="flex items-center justify-between mt-2">
                  <div className={`badge-${cap.color === 'green' ? 'green' : cap.color === 'yellow' ? 'yellow' : 'red'} text-[10px]`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                    {cap.label}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={10} className="text-gold-400 fill-gold-400" />
                    <span className="text-gold-400 text-[10px]">{c.avg_rating}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Smart Pick */}
        {smartPick.item && (
          <div className="dash-card glass-card p-5 border-gold-500/20 bg-gradient-to-br from-gold-500/5 to-transparent">
            <div className="flex items-center gap-2 mb-4">
              <Zap size={16} className="text-gold-400" />
              <h3 className="text-white font-bold">Smart Pick for You</h3>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                <img src={smartPick.item.image_url} alt={smartPick.item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold truncate">{smartPick.item.name}</p>
                <p className="text-white/50 text-sm">{smartPick.canteen?.name}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-gold-400 font-bold">{formatCurrency(smartPick.item.price)}</span>
                  <span className="text-white/40 text-xs">~{smartPick.item.prep_time_mins} mins</span>
                  <StarRating rating={smartPick.item.avg_rating} size={10} />
                </div>
              </div>
              <button
                onClick={() => {
                  addItem(smartPick.canteen.canteen_id, smartPick.canteen.name, smartPick.item);
                  setIsOpen(true);
                }}
                className="btn-gold text-sm px-3 py-2 flex-shrink-0"
              >
                Add
              </button>
            </div>
          </div>
        )}

        {/* GourmetCoins */}
        <div className="dash-card glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🪙</span>
            <h3 className="text-white font-bold">GourmetCoins</h3>
          </div>
          <div className="flex items-end gap-2 mb-3">
            <span className="text-4xl font-black text-gold-400">{user?.loyalty_points || 0}</span>
            <span className="text-white/50 text-sm mb-1">coins</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full mb-2">
            <div
              className="h-full bg-gradient-to-r from-gold-500 to-gold-300 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(100, ((user?.loyalty_points || 0) % 100))}%` }}
            />
          </div>
          <p className="text-white/50 text-xs">{100 - ((user?.loyalty_points || 0) % 100)} coins to next ₹10 reward</p>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="p-3 rounded-xl bg-white/5 text-center">
              <p className="text-gold-400 font-bold">{Math.floor((user?.loyalty_points || 0) / 100)}</p>
              <p className="text-white/50 text-xs">Redeemable (×₹10)</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 text-center">
              <p className="text-gold-400 font-bold">{formatCurrency(Math.floor((user?.loyalty_points || 0) / 100) * 10)}</p>
              <p className="text-white/50 text-xs">Saved Value</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Reorder */}
      {recentOrders.length > 0 && (
        <div className="dash-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title mb-0 flex items-center gap-2">
              <Repeat size={18} className="text-gold-400" />
              Quick Reorder
            </h2>
            <button onClick={() => navigate('/student/orders')} className="text-gold-400 text-sm font-medium flex items-center gap-1">
              All orders <ChevronRight size={14} />
            </button>
          </div>
          <div className="space-y-3">
            {recentOrders.map(order => (
              <div key={order.order_id} className="glass-card p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-white font-semibold text-sm">{order.canteen_name}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      order.status === 'picked_up' ? 'bg-green-500/20 text-green-400' :
                      order.status === 'ready' ? 'bg-gold-500/20 text-gold-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>{order.status.replace('_', ' ')}</span>
                  </div>
                  <p className="text-white/50 text-xs truncate">{order.items.map(i => i.name).join(', ')}</p>
                  <p className="text-gold-400 text-xs font-semibold mt-1">{formatCurrency(order.total_amount)}</p>
                </div>
                <button
                  onClick={() => handleReorder(order)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gold-500/10 hover:bg-gold-500/20 text-gold-400 text-sm font-semibold transition-colors flex-shrink-0"
                >
                  <Repeat size={14} /> Reorder
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
