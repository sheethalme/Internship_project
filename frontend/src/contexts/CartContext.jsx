import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('gg_cart') || '{}'); } catch { return {}; }
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('gg_cart', JSON.stringify(cart));
  }, [cart]);

  // cart = { [canteen_id]: { canteen_name, items: { [item_id]: { item, qty } } } }

  const addItem = (canteen_id, canteen_name, item, qty = 1) => {
    setCart(prev => {
      const existing = prev[canteen_id] || { canteen_id, canteen_name, items: {} };
      const existingQty = existing.items[item.item_id]?.qty || 0;
      return {
        ...prev,
        [canteen_id]: {
          ...existing,
          canteen_name,
          items: {
            ...existing.items,
            [item.item_id]: { item, qty: existingQty + qty },
          },
        },
      };
    });
  };

  const removeItem = (canteen_id, item_id) => {
    setCart(prev => {
      const c = { ...prev[canteen_id] };
      delete c.items[item_id];
      if (Object.keys(c.items).length === 0) {
        const { [canteen_id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [canteen_id]: c };
    });
  };

  const updateQty = (canteen_id, item_id, qty) => {
    if (qty <= 0) { removeItem(canteen_id, item_id); return; }
    setCart(prev => ({
      ...prev,
      [canteen_id]: {
        ...prev[canteen_id],
        items: {
          ...prev[canteen_id].items,
          [item_id]: { ...prev[canteen_id].items[item_id], qty },
        },
      },
    }));
  };

  const clearCanteen = (canteen_id) => {
    setCart(prev => {
      const { [canteen_id]: _, ...rest } = prev;
      return rest;
    });
  };

  const clearAll = () => setCart({});

  const getTotal = (canteen_id) => {
    const c = cart[canteen_id];
    if (!c) return 0;
    return Object.values(c.items).reduce((sum, { item, qty }) => sum + item.price * qty, 0);
  };

  const getTotalItems = () =>
    Object.values(cart).reduce(
      (sum, c) => sum + Object.values(c.items).reduce((s, { qty }) => s + qty, 0),
      0
    );

  const getCanteenCount = () => Object.keys(cart).length;

  return (
    <CartContext.Provider value={{
      cart, isOpen, setIsOpen,
      addItem, removeItem, updateQty, clearCanteen, clearAll,
      getTotal, getTotalItems, getCanteenCount,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
