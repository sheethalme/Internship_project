import { useState } from 'react';
import { X, Zap, CreditCard, Smartphone, Wallet, Check } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useOrders } from '../../contexts/OrdersContext';
import { useCanteens } from '../../contexts/CanteenContext';
import { useNotifications } from '../../contexts/NotificationsContext';
import { useToast } from '../../contexts/ToastContext';
import { formatCurrency, generateTimeSlots } from '../../data/mockData';
import QRCodeDisplay from '../ui/QRCodeDisplay';
import Confetti from '../ui/Confetti';

export default function CheckoutModal({ canteen, onClose }) {
  const { getTotal, clearCanteen } = useCart();
  const { user, updateUser } = useAuth();
  const { placeOrder } = useOrders();
  const { decrementStock, updateCanteenActiveOrders } = useCanteens();
  const { addNotification } = useNotifications();
  const { toast } = useToast();

  const [step, setStep] = useState('slot'); // slot | payment | success
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [useCoins, setUseCoins] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const slots = generateTimeSlots(canteen.canteen_id);
  const subtotal = getTotal(canteen.canteen_id);
  const coinsDiscount = useCoins ? Math.floor((user?.loyalty_points || 0) / 100) * 10 : 0;
  const total = Math.max(0, subtotal - coinsDiscount);
  const items = Object.values(canteen.items).map(({ item, qty }) => ({
    item_id: item.item_id, name: item.name, quantity: qty, unit_price: item.price,
  }));

  const handlePay = async () => {
    if (!selectedSlot) { toast('Please select a pickup time slot', 'warning'); return; }
    if (paymentMethod === 'wallet' && (user?.wallet_balance || 0) < total) {
      toast('Insufficient wallet balance', 'error'); return;
    }
    setProcessing(true);
    await new Promise(r => setTimeout(r, 1500));

    const order = await placeOrder({
      student_id: user?.student_id,
      canteen_id: parseInt(canteen.canteen_id),
      canteen_name: canteen.canteen_name,
      pickup_slot: selectedSlot,
      total_amount: total,
      loyalty_used: useCoins ? Math.floor((user?.loyalty_points || 0) / 100) * 100 : 0,
      items,
      payment_method: paymentMethod,
    });

    // Decrement stock
    items.forEach(item => decrementStock(parseInt(canteen.canteen_id), item.item_id, item.quantity));
    updateCanteenActiveOrders(parseInt(canteen.canteen_id), 1);

    // Award loyalty points (1 per ₹10)
    const earned = Math.floor(total / 10);
    const newPoints = (user?.loyalty_points || 0) + earned - (useCoins ? Math.floor((user?.loyalty_points || 0) / 100) * 100 : 0);
    let newBalance = user?.wallet_balance || 0;
    if (paymentMethod === 'wallet') newBalance = newBalance - total;
    updateUser({ loyalty_points: Math.max(0, newPoints), wallet_balance: newBalance });

    addNotification('order_placed', `✅ Order ${order.order_code} confirmed at ${canteen.canteen_name}. Pickup: ${selectedSlot}`);
    addNotification('loyalty_earned', `🪙 You earned ${earned} GourmetCoins!`);

    clearCanteen(canteen.canteen_id);
    setPlacedOrder(order);
    setProcessing(false);
    setShowConfetti(true);
    setStep('success');
    toast('Order placed successfully! 🎉', 'success');
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
              {step === 'slot' ? 'Choose Pickup Slot' : step === 'payment' ? 'Payment' : '🎉 Order Confirmed!'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
              <X size={18} className="text-white/70" />
            </button>
          </div>

          {step === 'slot' && (
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
              <button onClick={() => setStep('payment')} disabled={!selectedSlot} className="btn-gold w-full">Continue to Payment</button>
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
                {user?.loyalty_points >= 100 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="useCoins" checked={useCoins} onChange={e => setUseCoins(e.target.checked)} className="accent-gold-500" />
                      <label htmlFor="useCoins" className="text-xs text-gold-400 cursor-pointer">Use {user.loyalty_points} coins (save {formatCurrency(Math.floor(user.loyalty_points / 100) * 10)})</label>
                    </div>
                  </div>
                )}
                {useCoins && coinsDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-400">
                    <span>Coin Discount</span>
                    <span>-{formatCurrency(coinsDiscount)}</span>
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
                  {processing ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-navy-900/50 border-t-navy-900 rounded-full animate-spin" />Processing...</span> : `Pay ${formatCurrency(total)}`}
                </button>
              </div>
            </>
          )}

          {step === 'success' && placedOrder && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={32} className="text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">Order Placed!</h3>
              <p className="text-gold-400 font-mono font-bold text-lg mb-1">{placedOrder.order_code}</p>
              <p className="text-white/60 text-sm mb-6">Pickup: {placedOrder.pickup_slot} at {canteen.canteen_name}</p>

              <div className="flex justify-center mb-6">
                <div className="p-3 bg-white rounded-2xl shadow-gold">
                  <QRCodeDisplay value={placedOrder.order_code} size={140} />
                </div>
              </div>

              <div className="glass-card p-4 mb-6 text-left space-y-2">
                {items.map(item => (
                  <div key={item.item_id} className="flex justify-between text-sm">
                    <span className="text-white/80">{item.name} × {item.quantity}</span>
                    <span className="text-white">{formatCurrency(item.unit_price * item.quantity)}</span>
                  </div>
                ))}
                <div className="border-t border-white/10 pt-2 flex justify-between font-bold">
                  <span className="text-white">Total Paid</span>
                  <span className="text-gold-400">{formatCurrency(placedOrder.total_amount)}</span>
                </div>
              </div>

              <div className="bg-gold-500/10 border border-gold-500/30 rounded-xl p-3 mb-6">
                <p className="text-gold-400 text-sm font-medium">🪙 Your order is being prepared</p>
                <p className="text-white/60 text-xs mt-1">You'll get notified when it's ready!</p>
              </div>

              <button onClick={onClose} className="btn-gold w-full">Done</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
