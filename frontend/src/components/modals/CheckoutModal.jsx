import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { X, Zap, CreditCard, Smartphone, Wallet, Check, Truck, PersonStanding } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useOrders } from '../../contexts/OrdersContext';
import { useCanteens } from '../../contexts/CanteenContext';
import { useNotifications } from '../../contexts/NotificationsContext';
import { useToast } from '../../contexts/ToastContext';
import { formatCurrency, generateTimeSlots } from '../../data/mockData';
import QRCodeDisplay from '../ui/QRCodeDisplay';
import Confetti from '../ui/Confetti';

const DELIVERY_FEE = 15;
const DELIVERY_FLOORS = [
  'Central Block — 1st Floor',
  'Central Block — 2nd Floor',
  'Central Block — 3rd Floor',
  'Central Block — 4th Floor',
  'Central Block — 5th Floor',
  'Central Block — 6th Floor',
  'Central Block — 7th Floor',
  'Central Block — 8th Floor',
  'Central Block — 9th Floor',
  'Central Block — 10th Floor',
];

export default function CheckoutModal({ canteen, onClose }) {
  const { getTotal, clearCanteen } = useCart();
  const { user, updateUser } = useAuth();
  const { placeOrder } = useOrders();
  const { decrementStock, updateCanteenActiveOrders } = useCanteens();
  const { addNotification } = useNotifications();
  const { toast } = useToast();

  const [step, setStep] = useState('slot');
  const [fulfillmentType, setFulfillmentType] = useState('pickup');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [useCoins, setUseCoins] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const deliveryPanelRef = useRef(null);
  const pickupPanelRef = useRef(null);
  const feeChipRef = useRef(null);

  const slots = generateTimeSlots(canteen.canteen_id);
  const subtotal = getTotal(canteen.canteen_id);
  const coinsDiscount = useCoins ? Math.floor((user?.loyalty_points || 0) / 100) * 10 : 0;
  const deliveryFee = fulfillmentType === 'delivery' ? DELIVERY_FEE : 0;
  const total = Math.max(0, subtotal - coinsDiscount + deliveryFee);
  const items = Object.values(canteen.items).map(({ item, qty }) => ({
    item_id: item.item_id, name: item.name, quantity: qty, unit_price: item.price,
  }));

  // Animate delivery/pickup panel swap
  useEffect(() => {
    if (fulfillmentType === 'delivery') {
      if (pickupPanelRef.current) gsap.to(pickupPanelRef.current, { opacity: 0, y: -8, height: 0, overflow: 'hidden', duration: 0.25, ease: 'power2.in' });
      if (deliveryPanelRef.current) gsap.fromTo(deliveryPanelRef.current, { opacity: 0, y: 10, height: 0 }, { opacity: 1, y: 0, height: 'auto', overflow: 'visible', duration: 0.3, ease: 'power2.out', delay: 0.1 });
      if (feeChipRef.current) gsap.fromTo(feeChipRef.current, { opacity: 0, y: -6, scaleY: 0.5 }, { opacity: 1, y: 0, scaleY: 1, duration: 0.3, ease: 'back.out(1.7)', delay: 0.2 });
    } else {
      if (deliveryPanelRef.current) gsap.to(deliveryPanelRef.current, { opacity: 0, y: -8, height: 0, overflow: 'hidden', duration: 0.25, ease: 'power2.in' });
      if (feeChipRef.current) gsap.to(feeChipRef.current, { opacity: 0, scaleY: 0, duration: 0.2 });
      if (pickupPanelRef.current) gsap.fromTo(pickupPanelRef.current, { opacity: 0, y: 10, height: 0 }, { opacity: 1, y: 0, height: 'auto', overflow: 'visible', duration: 0.3, ease: 'power2.out', delay: 0.1 });
    }
  }, [fulfillmentType]);

  const handlePay = async () => {
    if (fulfillmentType === 'pickup' && !selectedSlot) { toast('Please select a pickup time slot', 'warning'); return; }
    if (fulfillmentType === 'delivery' && !selectedFloor) { toast('Please select your delivery floor', 'warning'); return; }
    if (paymentMethod === 'wallet' && (user?.wallet_balance || 0) < total) {
      toast('Insufficient wallet balance', 'error'); return;
    }
    setProcessing(true);
    try {
      await new Promise(r => setTimeout(r, 1500));

      const order = await placeOrder({
        student_id: user?.student_id,
        canteen_id: parseInt(canteen.canteen_id),
        canteen_name: canteen.canteen_name,
        pickup_slot: fulfillmentType === 'pickup' ? selectedSlot : null,
        total_amount: total,
        loyalty_used: useCoins ? Math.floor((user?.loyalty_points || 0) / 100) * 100 : 0,
        items,
        payment_method: paymentMethod,
        fulfillment_type: fulfillmentType,
        delivery_location: fulfillmentType === 'delivery' ? selectedFloor : null,
        delivery_fee: deliveryFee,
      });

      items.forEach(item => decrementStock(parseInt(canteen.canteen_id), item.item_id, item.quantity));
      updateCanteenActiveOrders(parseInt(canteen.canteen_id), 1);

      const earned = Math.floor(total / 10);
      const newPoints = (user?.loyalty_points || 0) + earned - (useCoins ? Math.floor((user?.loyalty_points || 0) / 100) * 100 : 0);
      let newBalance = user?.wallet_balance || 0;
      if (paymentMethod === 'wallet') newBalance -= total;
      updateUser({ loyalty_points: Math.max(0, newPoints), wallet_balance: newBalance });

      if (fulfillmentType === 'delivery') {
        addNotification('order_placed', `🛵 Order ${order.order_code} confirmed! Delivering to ${selectedFloor} (~25 mins)`);
      } else {
        addNotification('order_placed', `✅ Order ${order.order_code} confirmed at ${canteen.canteen_name}. Pickup: ${selectedSlot}`);
      }
      addNotification('loyalty_earned', `🪙 You earned ${earned} GourmetCoins!`);

      clearCanteen(canteen.canteen_id);
      setPlacedOrder(order);
      setShowConfetti(true);
      setStep('success');
      toast('Order placed successfully! 🎉', 'success');
    } catch (err) {
      toast(err.message || 'Failed to place order. Please try again.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={step === 'success' ? onClose : undefined} />
      <div className="relative glass-card w-full max-w-md max-h-[90vh] overflow-y-auto animate-scale-in">
        {step === 'success' && <Confetti active={showConfetti} />}

        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">
              {step === 'slot' ? 'Fulfillment & Slot' : step === 'payment' ? 'Payment' : '🎉 Order Confirmed!'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
              <X size={18} className="text-white/70" />
            </button>
          </div>

          {step === 'slot' && (
            <>
              {/* Fulfillment toggle */}
              <div className="flex rounded-xl bg-white/5 p-1 gap-1 mb-5">
                <button
                  onClick={() => setFulfillmentType('pickup')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${fulfillmentType === 'pickup' ? 'bg-gold-500 text-navy-900' : 'text-white/50 hover:text-white'}`}
                >
                  <PersonStanding size={15} /> Pickup
                </button>
                <button
                  onClick={() => setFulfillmentType('delivery')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${fulfillmentType === 'delivery' ? 'bg-gold-500 text-navy-900' : 'text-white/50 hover:text-white'}`}
                >
                  <Truck size={15} /> Deliver to Me
                </button>
              </div>

              {/* Delivery fee chip */}
              {fulfillmentType === 'delivery' && (
                <div ref={feeChipRef} className="flex items-center gap-2 mb-4 origin-top">
                  <span className="inline-flex items-center gap-1.5 bg-orange-500/20 border border-orange-500/40 text-orange-400 text-xs font-semibold px-3 py-1.5 rounded-full">
                    <Truck size={11} /> + ₹{DELIVERY_FEE} Delivery Fee
                  </span>
                  <span className="text-white/40 text-xs">~25 mins to your floor</span>
                </div>
              )}

              {/* Delivery panel */}
              <div ref={deliveryPanelRef} style={{ height: fulfillmentType === 'delivery' ? 'auto' : 0, overflow: 'hidden', opacity: fulfillmentType === 'delivery' ? 1 : 0 }}>
                {fulfillmentType === 'delivery' && (
                  <div className="mb-4">
                    <p className="text-white/60 text-sm mb-2 font-medium">Select your floor in Central Block</p>
                    <select
                      value={selectedFloor}
                      onChange={e => setSelectedFloor(e.target.value)}
                      className="input-dark text-sm"
                    >
                      <option value="" className="bg-navy-900">— Choose floor —</option>
                      {DELIVERY_FLOORS.map(f => (
                        <option key={f} value={f} className="bg-navy-900">{f}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Pickup panel */}
              <div ref={pickupPanelRef} style={{ height: fulfillmentType === 'pickup' ? 'auto' : 0, overflow: 'hidden', opacity: fulfillmentType === 'pickup' ? 1 : 0 }}>
                {fulfillmentType === 'pickup' && (
                  <>
                    <p className="text-white/60 text-sm mb-4">Select a 15-minute pickup window from {canteen.canteen_name}</p>
                    <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1 mb-4">
                      {slots.map((slot) => {
                        const isRed = slot.order_count >= 15;
                        const isYellow = slot.order_count >= 8 && !isRed;
                        return (
                          <button
                            key={slot.time}
                            onClick={() => setSelectedSlot(slot.display)}
                            className={`relative p-2 rounded-xl text-xs font-medium border transition-all ${
                              selectedSlot === slot.display
                                ? 'border-gold-500 bg-gold-500/20 text-gold-300'
                                : isRed
                                ? 'border-red-500/30 bg-red-500/10 text-red-400'
                                : isYellow
                                ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400'
                                : 'border-white/10 bg-white/5 text-white/80 hover:border-white/30'
                            }`}
                          >
                            {slot.recommended && (
                              <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                <Zap size={8} className="text-white" />
                              </span>
                            )}
                            <div>{slot.display}</div>
                            <div className="text-[10px] opacity-70">{slot.order_count} orders</div>
                            {isRed && <div className="text-[10px] text-red-400 font-bold">Almost Full</div>}
                          </button>
                        );
                      })}
                    </div>
                    {selectedSlot && (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/30 mb-4">
                        <Zap size={14} className="text-green-400" />
                        <p className="text-green-400 text-xs font-medium">⚡ {selectedSlot} selected</p>
                      </div>
                    )}
                  </>
                )}
              </div>

              <button
                onClick={() => setStep('payment')}
                disabled={fulfillmentType === 'pickup' ? !selectedSlot : !selectedFloor}
                className="btn-gold w-full mt-2"
              >
                Continue to Payment
              </button>
            </>
          )}

          {step === 'payment' && (
            <>
              {/* Order Summary */}
              <div className="glass-card p-4 mb-4 space-y-2">
                <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">Order Summary</p>
                {items.map(item => (
                  <div key={item.item_id} className="flex justify-between text-sm">
                    <span className="text-white/80">{item.name} × {item.quantity}</span>
                    <span className="text-white">{formatCurrency(item.unit_price * item.quantity)}</span>
                  </div>
                ))}
                <div className="border-t border-white/10 pt-2 flex justify-between font-semibold text-sm">
                  <span className="text-white/60">Subtotal</span>
                  <span className="text-white">{formatCurrency(subtotal)}</span>
                </div>
                {deliveryFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1 text-orange-400"><Truck size={12} /> Delivery Fee</span>
                    <span className="text-orange-400">+{formatCurrency(deliveryFee)}</span>
                  </div>
                )}
                {user?.loyalty_points >= 100 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="useCoins" checked={useCoins} onChange={e => setUseCoins(e.target.checked)} className="accent-gold-500" />
                      <label htmlFor="useCoins" className="text-xs text-gold-400 cursor-pointer">
                        Use {user.loyalty_points} coins (save {formatCurrency(Math.floor(user.loyalty_points / 100) * 10)})
                      </label>
                    </div>
                  </div>
                )}
                {useCoins && coinsDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-400">
                    <span>Coin Discount</span>
                    <span>-{formatCurrency(coinsDiscount)}</span>
                  </div>
                )}
                {fulfillmentType === 'delivery' && (
                  <div className="text-xs text-orange-400/80 bg-orange-500/10 rounded-lg px-3 py-1.5 border border-orange-500/20">
                    🛵 Delivering to {selectedFloor}
                  </div>
                )}
                <div className="border-t border-white/10 pt-2 flex justify-between font-bold">
                  <span className="text-white">Total</span>
                  <span className="text-gold-400 text-lg">{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Payment Methods */}
              <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">Payment Method</p>
              <div className="space-y-2 mb-6">
                {[
                  { id: 'upi', icon: <Smartphone size={18} />, label: 'UPI', sub: 'PhonePe / GPay / Paytm' },
                  { id: 'card', icon: <CreditCard size={18} />, label: 'Card', sub: 'Debit / Credit' },
                  { id: 'wallet', icon: <Wallet size={18} />, label: 'GourmetWallet', sub: `Balance: ${formatCurrency(user?.wallet_balance || 500)}` },
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${paymentMethod === m.id ? 'border-gold-500 bg-gold-500/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}
                  >
                    <span className={paymentMethod === m.id ? 'text-gold-400' : 'text-white/60'}>{m.icon}</span>
                    <div className="text-left">
                      <p className="text-white text-sm font-semibold">{m.label}</p>
                      <p className="text-white/40 text-xs">{m.sub}</p>
                    </div>
                    {paymentMethod === m.id && <Check size={16} className="text-gold-400 ml-auto" />}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep('slot')} className="btn-outline flex-1">Back</button>
                <button onClick={handlePay} disabled={processing} className="btn-gold flex-1">
                  {processing
                    ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-navy-900/50 border-t-navy-900 rounded-full animate-spin" />Processing...</span>
                    : `Pay ${formatCurrency(total)}`
                  }
                </button>
              </div>
            </>
          )}

          {step === 'success' && placedOrder && (
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${fulfillmentType === 'delivery' ? 'bg-orange-500/20' : 'bg-green-500/20'}`}>
                {fulfillmentType === 'delivery'
                  ? <Truck size={32} className="text-orange-400" />
                  : <Check size={32} className="text-green-400" />
                }
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">Order Placed!</h3>
              <p className="text-gold-400 font-mono font-bold text-lg mb-1">{placedOrder.order_code}</p>
              {fulfillmentType === 'delivery' ? (
                <p className="text-white/60 text-sm mb-6">🛵 Delivering to {placedOrder.delivery_location}</p>
              ) : (
                <p className="text-white/60 text-sm mb-6">Pickup: {placedOrder.pickup_slot} at {canteen.canteen_name}</p>
              )}

              {fulfillmentType === 'delivery' ? (
                <div className="glass-card p-5 mb-6 text-left space-y-3">
                  <div className="flex items-center gap-2 text-orange-400 font-semibold">
                    <Truck size={18} /> Your order is on its way!
                  </div>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/50">Drop location</span>
                      <span className="text-white font-medium">{placedOrder.delivery_location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">Est. delivery</span>
                      <span className="text-white font-medium">~25 mins</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">Delivery agent</span>
                      <span className="text-white font-medium">Assigned on dispatch</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center mb-6">
                  <div className="p-3 bg-white rounded-2xl shadow-gold">
                    <QRCodeDisplay value={placedOrder.order_code} size={140} />
                  </div>
                </div>
              )}

              <div className="glass-card p-4 mb-6 text-left space-y-2">
                {items.map(item => (
                  <div key={item.item_id} className="flex justify-between text-sm">
                    <span className="text-white/80">{item.name} × {item.quantity}</span>
                    <span className="text-white">{formatCurrency(item.unit_price * item.quantity)}</span>
                  </div>
                ))}
                {deliveryFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-orange-400">Delivery Fee</span>
                    <span className="text-orange-400">+{formatCurrency(deliveryFee)}</span>
                  </div>
                )}
                <div className="border-t border-white/10 pt-2 flex justify-between font-bold">
                  <span className="text-white">Total Paid</span>
                  <span className="text-gold-400">{formatCurrency(placedOrder.total_amount)}</span>
                </div>
              </div>

              <div className="bg-gold-500/10 border border-gold-500/30 rounded-xl p-3 mb-6">
                <p className="text-gold-400 text-sm font-medium">
                  {fulfillmentType === 'delivery' ? '🛵 Your order is being prepared for delivery' : '🪙 Your order is being prepared'}
                </p>
                <p className="text-white/60 text-xs mt-1">You'll get notified when it's {fulfillmentType === 'delivery' ? 'out for delivery' : 'ready'}!</p>
              </div>

              <button onClick={onClose} className="btn-gold w-full">Done</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
