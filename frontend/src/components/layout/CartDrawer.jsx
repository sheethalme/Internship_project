import { useEffect, useRef, useState } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, ChevronRight } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useOrders } from '../../contexts/OrdersContext';
import { useCanteens } from '../../contexts/CanteenContext';
import { useNotifications } from '../../contexts/NotificationsContext';
import { useToast } from '../../contexts/ToastContext';
import { formatCurrency, generateTimeSlots } from '../../data/mockData';
import CheckoutModal from '../modals/CheckoutModal';

export default function CartDrawer() {
  const { cart, isOpen, setIsOpen, updateQty, removeItem, clearCanteen, getTotal, getTotalItems } = useCart();
  const { user, updateUser } = useAuth();
  const { placeOrder } = useOrders();
  const { decrementStock, updateCanteenActiveOrders } = useCanteens();
  const { addNotification } = useNotifications();
  const { toast } = useToast();
  const drawerRef = useRef(null);
  const [checkoutCanteen, setCheckoutCanteen] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      if (isOpen && drawerRef.current && !drawerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, setIsOpen]);

  const canteenList = Object.values(cart);
  const totalItems = getTotalItems();

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`fixed right-0 top-0 h-full w-full sm:w-96 bg-navy-900/95 backdrop-blur-xl border-l border-white/10 z-50 flex flex-col transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <ShoppingBag size={22} className="text-gold-400" />
            <h2 className="text-lg font-bold text-white">Cart</h2>
            {totalItems > 0 && (
              <span className="bg-gold-500 text-navy-900 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{totalItems}</span>
            )}
          </div>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <X size={18} className="text-white/70" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {canteenList.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4 text-white/40">
              <ShoppingBag size={48} strokeWidth={1} />
              <p className="text-center font-medium">Your cart is empty<br /><span className="text-sm font-normal">Add items from any canteen to get started</span></p>
            </div>
          ) : (
            canteenList.map((canteen) => (
              <div key={canteen.canteen_id} className="glass-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gold-400 text-sm">{canteen.canteen_name}</h3>
                  <button onClick={() => clearCanteen(canteen.canteen_id)} className="text-red-400/70 hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="space-y-3">
                  {Object.values(canteen.items).map(({ item, qty }) => (
                    <div key={item.item_id} className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{item.name}</p>
                        <p className="text-gold-400 text-xs font-semibold">{formatCurrency(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQty(canteen.canteen_id, item.item_id, qty - 1)} className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                          <Minus size={10} className="text-white" />
                        </button>
                        <span className="text-white font-bold text-sm w-4 text-center">{qty}</span>
                        <button onClick={() => updateQty(canteen.canteen_id, item.item_id, qty + 1)} className="w-6 h-6 rounded-lg bg-gold-500/20 hover:bg-gold-500/30 flex items-center justify-center transition-colors">
                          <Plus size={10} className="text-gold-400" />
                        </button>
                      </div>
                      <p className="text-white/80 text-sm font-semibold w-12 text-right">{formatCurrency(item.price * qty)}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
                  <span className="text-white/60 text-sm">Subtotal</span>
                  <span className="text-white font-bold">{formatCurrency(getTotal(canteen.canteen_id))}</span>
                </div>
                <button
                  onClick={() => { setCheckoutCanteen(canteen); setIsOpen(false); }}
                  className="btn-gold w-full mt-3 flex items-center justify-center gap-2 text-sm"
                >
                  Checkout {canteen.canteen_name} <ChevronRight size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {checkoutCanteen && (
        <CheckoutModal
          canteen={checkoutCanteen}
          onClose={() => setCheckoutCanteen(null)}
        />
      )}
    </>
  );
}
