import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';
import { MOCK_GRIEVANCES, MOCK_REFUNDS } from '../data/mockData';

const OrdersContext = createContext();

export function OrdersProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [bulkOrders, setBulkOrders] = useState([]);
  const [grievances, setGrievances] = useState(() => {
    try { return JSON.parse(localStorage.getItem('gg_grievances') || JSON.stringify(MOCK_GRIEVANCES)); }
    catch { return MOCK_GRIEVANCES; }
  });
  const [refunds, setRefunds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('gg_refunds') || JSON.stringify(MOCK_REFUNDS)); }
    catch { return MOCK_REFUNDS; }
  });

  useEffect(() => { localStorage.setItem('gg_grievances', JSON.stringify(grievances)); }, [grievances]);
  useEffect(() => { localStorage.setItem('gg_refunds',    JSON.stringify(refunds));    }, [refunds]);

  useEffect(() => {
    const token = localStorage.getItem('gg_token');
    const auth  = localStorage.getItem('gg_auth');
    if (!token || !auth) return;
    try {
      const { role } = JSON.parse(auth);
      if (role === 'student') {
        const fetchOrders = () => {
          api.get('/orders/my').then(data => {
            const fetched = normalizeOrders(data);
            // Use API status (real vendor updates), only preserve local 'rated' flag
            setOrders(prev => fetched.map(o => {
              const local = prev.find(p => p.order_id === o.order_id);
              return local ? { ...o, rated: local.rated } : o;
            }));
          }).catch(() => {});
        };
        fetchOrders();
        const interval = setInterval(fetchOrders, 8000);
        api.get('/bulk-orders/my').then(data => setBulkOrders(data)).catch(() => {});
        return () => clearInterval(interval);
      }
    } catch {}
  }, []);

  const normalizeOrders = (rawOrders) =>
    rawOrders.map(o => ({
      ...o,
      items: (o.items || []).map(i => ({
        item_id:    i.item_id,
        name:       i.name,
        quantity:   i.quantity,
        unit_price: i.unit_price,
      })),
      rated: false,
    }));

  // ── PLACE ORDER ──────────────────────────────────────────────
  const placeOrder = async (orderData) => {
    const apiItems    = orderData.items.map(i => ({ item_id: i.item_id, quantity: i.quantity }));
    const loyalty_used = orderData.loyalty_used || 0;

    const result = await api.post('/orders', {
      canteen_id:        orderData.canteen_id,
      pickup_slot:       orderData.pickup_slot,
      is_preorder:       false,
      items:             apiItems,
      loyalty_used,
      fulfillment_type:  orderData.fulfillment_type || 'pickup',
      delivery_location: orderData.delivery_location || null,
    });

    try {
      const payment = await api.post('/payments/initiate', {
        order_id: result.order_id,
        method:   orderData.payment_method,
        amount:   result.total_amount,
      });
      await api.post('/payments/confirm', { payment_id: payment.payment_id });
    } catch {
      // payment tracking failure doesn't block order
    }

    const newOrder = {
      order_id:          result.order_id,
      order_code:        result.order_code,
      student_id:        orderData.student_id,
      canteen_id:        orderData.canteen_id,
      canteen_name:      orderData.canteen_name,
      status:            'placed',
      pickup_slot:       orderData.pickup_slot,
      is_preorder:       false,
      preorder_date:     null,
      total_amount:      result.total_amount,
      loyalty_used,
      items:             orderData.items,
      payment_method:    orderData.payment_method,
      placed_at:         new Date().toISOString(),
      rated:             false,
      fulfillment_type:  orderData.fulfillment_type || 'pickup',
      delivery_location: orderData.delivery_location || null,
      delivery_fee:      result.delivery_fee || 0,
    };

    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  const updateOrderStatus = (order_id, status) => {
    setOrders(prev => prev.map(o => o.order_id === order_id ? { ...o, status } : o));
  };

  const markRated = (order_id) => {
    setOrders(prev => prev.map(o => o.order_id === order_id ? { ...o, rated: true } : o));
  };

  // ── BULK ORDERS ──────────────────────────────────────────────
  const submitBulkOrder = async (data) => {
    const result = await api.post('/bulk-orders', data);
    const newBulk = {
      ...data,
      bulk_order_id:   result.bulk_order_id,
      bulk_order_code: result.bulk_order_code,
      status:          'pending',
      submitted_at:    new Date().toISOString(),
    };
    setBulkOrders(prev => [newBulk, ...prev]);
    return result;
  };

  const refreshBulkOrders = async () => {
    try {
      const data = await api.get('/bulk-orders/my');
      setBulkOrders(data);
    } catch {}
  };

  // ── GRIEVANCES ───────────────────────────────────────────────
  const addGrievance = (data) => {
    const newG = {
      grievance_id: Date.now(),
      ticket_code:  `GRV-${String(Math.floor(1000 + Math.random() * 9000))}`,
      ...data,
      status:       'open',
      vendor_reply: null,
      admin_reply:  null,
      created_at:   new Date().toISOString(),
    };
    setGrievances(prev => [newG, ...prev]);
    return newG;
  };

  const replyGrievance = (id, reply, from = 'vendor') => {
    setGrievances(prev => prev.map(g =>
      g.grievance_id === id
        ? { ...g, [`${from}_reply`]: reply, status: 'in_review' }
        : g
    ));
  };

  const resolveGrievance = (id) => {
    setGrievances(prev => prev.map(g => g.grievance_id === id ? { ...g, status: 'resolved' } : g));
  };

  // ── REFUNDS ──────────────────────────────────────────────────
  const addRefund = (data) => {
    const newR = {
      refund_id:    Date.now(),
      ...data,
      status:       'requested',
      requested_at: new Date().toISOString(),
      processed_at: null,
    };
    setRefunds(prev => [newR, ...prev]);
    return newR;
  };

  const updateRefundStatus = (id, status) => {
    setRefunds(prev => prev.map(r =>
      r.refund_id === id
        ? { ...r, status, processed_at: status === 'processed' ? new Date().toISOString() : r.processed_at }
        : r
    ));
  };

  const getActiveOrders = (canteen_id) =>
    orders.filter(o => o.canteen_id === canteen_id && !['picked_up', 'delivered', 'cancelled'].includes(o.status));

  const getQueuePosition = (order_id, canteen_id) => {
    const active = orders.filter(o =>
      o.canteen_id === canteen_id &&
      ['accepted', 'preparing'].includes(o.status) &&
      o.order_id <= order_id
    );
    return active.findIndex(o => o.order_id === order_id) + 1;
  };

  return (
    <OrdersContext.Provider value={{
      orders, bulkOrders, grievances, refunds,
      placeOrder, updateOrderStatus, markRated,
      submitBulkOrder, refreshBulkOrders,
      addGrievance, replyGrievance, resolveGrievance,
      addRefund, updateRefundStatus,
      getActiveOrders, getQueuePosition,
    }}>
      {children}
    </OrdersContext.Provider>
  );
}

export const useOrders = () => useContext(OrdersContext);
