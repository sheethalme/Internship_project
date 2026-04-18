import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Clock, Plus, Minus, ShoppingBag, Users, Search } from 'lucide-react';
import { useCanteens } from '../../contexts/CanteenContext';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastContext';
import { COMBOS, formatCurrency, getCapacityInfo } from '../../data/mockData';
import StarRating from '../../components/ui/StarRating';

const FILTERS = ['All', 'Veg', 'Non-Veg', 'Snacks', 'Meals', 'Beverages', 'Healthy', 'Bakery'];

export default function CanteenMenu() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getCanteen, getMenu } = useCanteens();
  const { addItem, updateQty, removeItem, cart, setIsOpen } = useCart();
  const { toast } = useToast();
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const canteen = getCanteen(id);
  const menu = getMenu(id);

  if (!canteen) return <div className="text-white">Canteen not found.</div>;

  const cap = getCapacityInfo(canteen.active_orders || 0, canteen.max_capacity);

  const filtered = menu.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'All' ||
      (filter === 'Veg' && item.is_veg) ||
      (filter === 'Non-Veg' && !item.is_veg) ||
      filter.toLowerCase() === item.category;
    return matchSearch && matchFilter;
  });

  const topRated = menu.reduce((best, item) => (!best || item.avg_rating > best.avg_rating ? item : best), null);

  const getQty = (item_id) => {
    const canteenCart = cart[id];
    return canteenCart?.items?.[item_id]?.qty || 0;
  };

  const handleAdd = (item) => {
    if (!item.is_available) { toast('Item is currently sold out', 'warning'); return; }
    addItem(id, canteen.name, item);
    toast(`${item.name} added to cart`, 'success');
  };

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <button onClick={() => navigate('/student/canteens')} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-4 text-sm">
        <ArrowLeft size={16} /> All Canteens
      </button>

      {/* Banner */}
      <div className="relative h-48 md:h-64 rounded-2xl overflow-hidden mb-6">
        <img src={canteen.banner_image} alt={canteen.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/90 via-navy-900/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h1 className="text-3xl font-black text-white">{canteen.name}</h1>
          <div className="flex flex-wrap items-center gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <Star size={14} className="text-gold-400 fill-gold-400" />
              <span className="text-gold-400 font-bold">{canteen.avg_rating}</span>
            </div>
            <div className="flex items-center gap-1.5 text-white/70 text-sm">
              <Users size={14} />
              <span>{canteen.active_orders || 0} orders in queue</span>
            </div>
            <span className={`badge-${cap.color === 'green' ? 'green' : cap.color === 'yellow' ? 'yellow' : 'red'}`}>
              <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              {cap.label}
            </span>
            <div className="flex items-center gap-1.5 text-white/60 text-sm">
              <Clock size={14} />
              {canteen.operating_hours}
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search menu..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-dark pl-9"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${filter === f ? 'bg-gold-500 text-navy-900' : 'glass-card text-white/60 hover:text-white'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Cart summary bar */}
      {cart[id] && Object.keys(cart[id].items || {}).length > 0 && (
        <div className="fixed bottom-20 lg:bottom-6 left-4 right-4 lg:left-auto lg:right-6 lg:w-80 z-30 glass-card p-4 border-gold-500/30 bg-navy-900/90 flex items-center justify-between shadow-gold">
          <div>
            <p className="text-white font-bold text-sm">
              {Object.values(cart[id].items).reduce((s, { qty }) => s + qty, 0)} items in cart
            </p>
            <p className="text-gold-400 font-black">{formatCurrency(Object.values(cart[id].items).reduce((s, { item, qty }) => s + item.price * qty, 0))}</p>
          </div>
          <button onClick={() => setIsOpen(true)} className="btn-gold text-sm flex items-center gap-2">
            <ShoppingBag size={16} /> View Cart
          </button>
        </div>
      )}

      {/* Menu grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(item => {
          const qty = getQty(item.item_id);
          const isFav = item === topRated;
          const combo = COMBOS[item.item_id];

          return (
            <div
              key={item.item_id}
              className={`glass-card p-4 transition-all ${!item.is_available ? 'opacity-60' : 'hover:-translate-y-0.5 hover:shadow-lift'}`}
            >
              {/* Item image */}
              <div className="relative h-32 rounded-xl overflow-hidden mb-3">
                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                {!item.is_available && (
                  <div className="absolute inset-0 bg-navy-900/70 flex items-center justify-center">
                    <span className="badge-red text-sm px-3 py-1">🔴 Sold Out</span>
                  </div>
                )}
                {isFav && item.is_available && (
                  <div className="absolute top-2 left-2 badge-gold text-xs">
                    ✨ Fan Favourite
                  </div>
                )}
              </div>

              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {/* Veg/Non-veg indicator */}
                    <div className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center flex-shrink-0 ${item.is_veg ? 'border-green-500' : 'border-red-500'}`}>
                      <div className={`w-2 h-2 rounded-full ${item.is_veg ? 'bg-green-500' : 'bg-red-500'}`} />
                    </div>
                    <p className="text-white font-bold text-sm truncate">{item.name}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-gold-400 font-black">{formatCurrency(item.price)}</span>
                    <div className="flex items-center gap-1 text-white/50 text-xs">
                      <Clock size={11} />~{item.prep_time_mins} mins
                    </div>
                    <StarRating rating={item.avg_rating} size={11} />
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-white/40">
                    <span>{item.stock_remaining}/{item.daily_stock_limit} left</span>
                  </div>
                  {combo && (
                    <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-medium">
                      Often paired with: {combo.name}
                    </div>
                  )}
                </div>

                {/* Add/qty controls */}
                <div className="flex-shrink-0">
                  {qty === 0 ? (
                    <button
                      onClick={() => handleAdd(item)}
                      disabled={!item.is_available}
                      className="w-9 h-9 rounded-xl bg-gold-500/20 hover:bg-gold-500/30 flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Plus size={18} className="text-gold-400" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQty(id, item.item_id, qty - 1)} className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                        <Minus size={12} className="text-white" />
                      </button>
                      <span className="text-white font-bold text-sm w-5 text-center">{qty}</span>
                      <button onClick={() => handleAdd(item)} className="w-7 h-7 rounded-lg bg-gold-500/20 hover:bg-gold-500/30 flex items-center justify-center transition-colors">
                        <Plus size={12} className="text-gold-400" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">🍽️</p>
          <p className="text-white/50">No items found</p>
          <button onClick={() => { setFilter('All'); setSearch(''); }} className="btn-outline mt-4 text-sm">Clear filters</button>
        </div>
      )}
    </div>
  );
}
