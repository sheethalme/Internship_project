import { createContext, useContext, useState } from 'react';
import { CANTEENS, MENU_ITEMS } from '../data/mockData';

const CanteenContext = createContext();

export function CanteenProvider({ children }) {
  const [canteens, setCanteens] = useState(() => {
    try { return JSON.parse(localStorage.getItem('gg_canteens') || JSON.stringify(CANTEENS)); }
    catch { return CANTEENS; }
  });
  const [menuItems, setMenuItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('gg_menu') || JSON.stringify(MENU_ITEMS)); }
    catch { return MENU_ITEMS; }
  });

  const saveCanteens = (data) => {
    setCanteens(data);
    localStorage.setItem('gg_canteens', JSON.stringify(data));
  };

  const saveMenu = (data) => {
    setMenuItems(data);
    localStorage.setItem('gg_menu', JSON.stringify(data));
  };

  const updateCanteenStatus = (canteen_id, status) => {
    saveCanteens(canteens.map(c => c.canteen_id === canteen_id ? { ...c, status } : c));
  };

  const updateCanteenActiveOrders = (canteen_id, delta) => {
    saveCanteens(canteens.map(c =>
      c.canteen_id === canteen_id
        ? { ...c, active_orders: Math.max(0, (c.active_orders || 0) + delta) }
        : c
    ));
  };

  const toggleMenuItem = (canteen_id, item_id) => {
    const updated = { ...menuItems };
    updated[canteen_id] = updated[canteen_id].map(item =>
      item.item_id === item_id ? { ...item, is_available: !item.is_available } : item
    );
    saveMenu(updated);
  };

  const restockItem = (canteen_id, item_id) => {
    const updated = { ...menuItems };
    updated[canteen_id] = updated[canteen_id].map(item =>
      item.item_id === item_id
        ? { ...item, stock_remaining: item.daily_stock_limit, is_available: true }
        : item
    );
    saveMenu(updated);
  };

  const updateMenuItem = (canteen_id, item_id, changes) => {
    const updated = { ...menuItems };
    updated[canteen_id] = updated[canteen_id].map(item =>
      item.item_id === item_id ? { ...item, ...changes } : item
    );
    saveMenu(updated);
  };

  const addMenuItem = (canteen_id, item) => {
    const newItem = { ...item, item_id: Date.now(), canteen_id, avg_rating: 0, stock_remaining: item.daily_stock_limit };
    const updated = { ...menuItems, [canteen_id]: [...(menuItems[canteen_id] || []), newItem] };
    saveMenu(updated);
  };

  const deleteMenuItem = (canteen_id, item_id) => {
    const updated = { ...menuItems };
    updated[canteen_id] = updated[canteen_id].filter(item => item.item_id !== item_id);
    saveMenu(updated);
  };

  const decrementStock = (canteen_id, item_id, qty) => {
    const updated = { ...menuItems };
    updated[canteen_id] = updated[canteen_id].map(item => {
      if (item.item_id !== item_id) return item;
      const newStock = Math.max(0, item.stock_remaining - qty);
      return { ...item, stock_remaining: newStock, is_available: newStock > 0 };
    });
    saveMenu(updated);
  };

  const updateCanteen = (canteen_id, changes) => {
    saveCanteens(canteens.map(c => c.canteen_id === canteen_id ? { ...c, ...changes } : c));
  };

  const getCanteen = (id) => canteens.find(c => c.canteen_id === parseInt(id));
  const getMenu = (id) => menuItems[parseInt(id)] || [];

  return (
    <CanteenContext.Provider value={{
      canteens, menuItems,
      getCanteen, getMenu,
      updateCanteenStatus, updateCanteenActiveOrders,
      toggleMenuItem, restockItem, updateMenuItem, addMenuItem, deleteMenuItem, decrementStock,
      updateCanteen,
    }}>
      {children}
    </CanteenContext.Provider>
  );
}

export const useCanteens = () => useContext(CanteenContext);
