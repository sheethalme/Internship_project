import { useState } from 'react';
import { ChevronDown, ChevronUp, QrCode, Repeat, Star, AlertCircle, Truck } from 'lucide-react';
import { useOrders } from '../../contexts/OrdersContext';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useCanteens } from '../../contexts/CanteenContext';
import { useToast } from '../../contexts/ToastContext';
import { formatCurrency, formatDate, formatTime, timeAgo } from '../../data/mockData';
import QRCodeDisplay from '../../components/ui/QRCodeDisplay';
import RatingModal from '../../components/modals/RatingModal';
import GrievanceModal from '../../components/modals/GrievanceModal';

const PICKUP_STEPS = [
  { key: 'placed',    label: 'Placed',    icon: '✅' },
  { key: 'accepted',  label: 'Accepted',  icon: '⏳' },
  { key: 'preparing', label: 'Preparing', icon: '🍳' },
  { key: 'ready',     label: 'Ready',     icon: '🔔' },
  { key: 'picked_up', label: 'Picked Up', icon: '✅' },
];

const DELIVERY_STEPS = [
  { key: 'placed',           label: 'Placed',      icon: '✅' },
  { key: 'accepted',         label: 'Accepted',    icon: '⏳' },
  { key: 'preparing',        label: 'Preparing',   icon: '🍳' },
  { key: 'out_for_delivery', label: 'On the Way',  icon: '🛵' },
  { key: 'delivered',        label: 'Delivered',   icon: '✅' },
];

const PICKUP_IDX   = { placed: 0, accepted: 1, preparing: 2, ready: 3, picked_up: 4, cancelled: -1 };
const DELIVERY_IDX = { placed: 0, accepted: 1, preparing: 2, out_for_delivery: 3, delivered: 4, cancelled: -1 };

function OrderStepper({ status, isDelivery }) {
  const steps = isDelivery ? DELIVERY_STEPS : PICKUP_STEPS;
  const idx   = (isDelivery ? DELIVERY_IDX : PICKUP_IDX)[status] ?? 0;
  return (
    <div className="flex items-center gap-1 mt-4">
      {steps.map((step, i) => (
        <div key={step.key} className="flex items-center flex-1">
          <div className={`flex flex-col items-center flex-shrink-0 ${i <= idx ? 'opacity-100' : 'opacity-30'}`}>
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm transition-all
              ${i <= idx ? 'border-gold-500 bg-gold-500/20' : 'border-white/20 bg-white/5'}
              ${i === idx ? 'animate-pulse-gold' : ''}`}>
              {step.icon}
            </div>
            <span className="text-[9px] text-white/50 mt-1 text-center w-12 hidden sm:block">{step.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-1 ${i < idx ? 'bg-gold-500' : 'bg-white/10'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

const TERMINAL = ['picked_up', 'delivered', 'cancelled'];

export default function MyOrders() {
  const { orders, updateOrderStatus } = useOrders();
  const { user } = useAuth();
  const { addItem, setIsOpen } = useCart();
  const { menuItems } = useCanteens();
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(null);
  const [showQR, setShowQR] = useState(null);
  const [rateOrder, setRateOrder] = useState(null);
  const [grievanceOrder, setGrievanceOrder] = useState(null);
  const [tab, setTab] = useState('active');

  const myOrders = orders.filter(o => o.student_id === user?.student_id);
  const active   = myOrders.filter(o => !TERMINAL.includes(o.status));
  const history  = myOrders.filter(o => TERMINAL.includes(o.status));
  const shown    = tab === 'active' ? active : history;

  const monthSpend = history.filter(o => {
    const d = new Date(o.placed_at), now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((s, o) => s + o.total_amount, 0);

  const simAdvance = (order) => {
    const isDelivery = order.fulfillment_type === 'delivery';
    const next = isDelivery
      ? { placed: 'accepted', accepted: 'preparing', preparing: 'out_for_delivery', out_for_delivery: 'delivered' }
      : { placed: 'accepted', accepted: 'preparing', preparing: 'ready', ready: 'picked_up' };
    if (next[order.status]) {
      updateOrderStatus(order.order_id, next[order.status]);
      toast(`Order status updated to: ${next[order.status].replace(/_/g, ' ')}`, 'order');
    }
  };

  const handleReorder = (order) => {
    order.items.forEach(item => {
      const menuItem = (menuItems[order.canteen_id] || []).find(m => m.item_id === item.item_id);
      if (menuItem) addItem(order.canteen_id, order.canteen_name, menuItem, item.quantity);
    });
    setIsOpen(true);
    toast('Items added to cart!', 'success');
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">My Orders</h1>
        {tab === 'history' && (
          <p className="text-white/50 text-sm mt-1">You've spent <span className="text-gold-400 font-bold">{formatCurrency(monthSpend)}</span> this month</p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl bg-white/5 p-1 gap-1">
        {['active', 'history'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t ? 'bg-gold-500 text-navy-900' : 'text-white/50 hover:text-white'}`}>
            {t === 'active' ? `Active Orders${active.length > 0 ? ` (${active.length})` : ''}` : 'History'}
          </button>
        ))}
      </div>

      {shown.length === 0 && (
        <div className="text-center py-16">
          <p className="text-6xl mb-4">{tab === 'active' ? '🍳' : '📋'}</p>
          <p className="text-white/50 text-lg font-medium">{tab === 'active' ? 'No active orders' : 'No order history'}</p>
          <p className="text-white/30 text-sm mt-1">{tab === 'active' ? 'Place an order from any canteen to get started' : 'Your completed orders will appear here'}</p>
        </div>
      )}

      <div className="space-y-4">
        {shown.map(order => {
          const isDelivery = order.fulfillment_type === 'delivery';
          const isTerminal = TERMINAL.includes(order.status);
          return (
            <div key={order.order_id} className="glass-card overflow-hidden">
              {/* Order header */}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-white font-bold">{order.canteen_name}</p>
                      {isDelivery && (
                        <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 font-semibold">
                          <Truck size={9} /> Delivery
                        </span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        order.status === 'picked_up' || order.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                        order.status === 'out_for_delivery' ? 'bg-orange-500/20 text-orange-400' :
                        order.status === 'ready'    ? 'bg-gold-500/20 text-gold-400' :
                        order.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>{order.status.replace(/_/g, ' ')}</span>
                    </div>
                    <p className="text-white/40 text-xs font-mono">{order.order_code}</p>
                    {isDelivery
                      ? <p className="text-white/40 text-xs">{timeAgo(order.placed_at)} · 🛵 {order.delivery_location}</p>
                      : <p className="text-white/40 text-xs">{timeAgo(order.placed_at)} · Pickup: {order.pickup_slot}</p>
                    }
                  </div>
                  <div className="text-right">
                    <p className="text-gold-400 font-black text-lg">{formatCurrency(order.total_amount)}</p>
                    <button onClick={() => setExpanded(expanded === order.order_id ? null : order.order_id)} className="text-white/40 hover:text-white transition-colors mt-1">
                      {expanded === order.order_id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {!isTerminal && (
                  <OrderStepper status={order.status} isDelivery={isDelivery} />
                )}
              </div>

              {/* Expanded details */}
              {expanded === order.order_id && (
                <div className="px-4 pb-4 border-t border-white/5 pt-4 space-y-3 animate-fade-in">
                  {/* Items */}
                  <div className="space-y-2">
                    {order.items.map(item => (
                      <div key={item.item_id} className="flex justify-between text-sm">
                        <span className="text-white/70">{item.name} × {item.quantity}</span>
                        <span className="text-white">{formatCurrency(item.unit_price * item.quantity)}</span>
                      </div>
                    ))}
                    {order.loyalty_used > 0 && (
                      <div className="flex justify-between text-sm text-green-400">
                        <span>Coin Discount</span>
                        <span>-{formatCurrency(order.loyalty_used / 10)}</span>
                      </div>
                    )}
                    {isDelivery && order.delivery_fee > 0 && (
                      <div className="flex justify-between text-sm text-orange-400">
                        <span className="flex items-center gap-1"><Truck size={11} /> Delivery Fee</span>
                        <span>+{formatCurrency(order.delivery_fee)}</span>
                      </div>
                    )}
                    <div className="border-t border-white/10 pt-2 flex justify-between font-bold">
                      <span className="text-white/60">Total</span>
                      <span className="text-gold-400">{formatCurrency(order.total_amount)}</span>
                    </div>
                  </div>

                  {/* QR for pickup orders only */}
                  {!isDelivery && (
                    <div className="flex items-center justify-center p-3 bg-white rounded-xl w-fit mx-auto">
                      <QRCodeDisplay value={order.order_code} size={100} />
                    </div>
                  )}

                  {/* Delivery agent info if assigned */}
                  {isDelivery && order.delivery_agent_name && (
                    <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl text-sm">
                      <p className="text-orange-400 font-medium flex items-center gap-1.5">
                        <Truck size={13} /> Delivery Agent: {order.delivery_agent_name}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {!isTerminal && (
                      <button onClick={() => simAdvance(order)} className="btn-gold text-xs px-3 py-2">
                        Simulate Next Step
                      </button>
                    )}
                    {isTerminal && order.status !== 'cancelled' && (
                      <>
                        <button onClick={() => handleReorder(order)} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 transition-colors">
                          <Repeat size={12} /> Reorder
                        </button>
                        {!order.rated && (
                          <button onClick={() => setRateOrder(order)} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl bg-gold-500/10 hover:bg-gold-500/20 text-gold-400 transition-colors">
                            <Star size={12} /> Rate
                          </button>
                        )}
                        <button onClick={() => setGrievanceOrder(order)} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors">
                          <AlertCircle size={12} /> Report Issue
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {rateOrder && <RatingModal order={rateOrder} onClose={() => setRateOrder(null)} />}
      {grievanceOrder && <GrievanceModal order={grievanceOrder} onClose={() => setGrievanceOrder(null)} />}
    </div>
  );
}
