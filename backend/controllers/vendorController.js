const db = require('../config/db');

const DELIVERY_AGENTS = ['Rajesh K.', 'Suresh M.', 'Vinod P.', 'Deepak R.', 'Arjun S.'];
const pickAgent = () => DELIVERY_AGENTS[Math.floor(Math.random() * DELIVERY_AGENTS.length)];

exports.getDashboard = async (req, res) => {
  try {
    const canteenId = req.user.canteen_id;
    const today = new Date().toISOString().split('T')[0];
    const [[{ total_orders }]] = await db.query(
      'SELECT COUNT(*) as total_orders FROM orders WHERE canteen_id = ? AND DATE(placed_at) = ?',
      [canteenId, today]
    );
    const [[{ revenue }]] = await db.query(
      `SELECT COALESCE(SUM(o.total_amount), 0) as revenue
       FROM orders o JOIN payments p ON o.order_id = p.order_id
       WHERE o.canteen_id = ? AND DATE(o.placed_at) = ? AND p.status = "completed"`,
      [canteenId, today]
    );
    const [[{ pending }]] = await db.query(
      'SELECT COUNT(*) as pending FROM orders WHERE canteen_id = ? AND status IN ("placed","accepted","preparing")',
      [canteenId]
    );
    const [[{ avg_rating }]] = await db.query('SELECT avg_rating FROM canteens WHERE canteen_id = ?', [canteenId]);
    res.json({ total_orders, revenue, pending_orders: pending, avg_rating });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getLiveOrders = async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT o.*, s.name as student_name
       FROM orders o JOIN students s ON o.student_id = s.student_id
       WHERE o.canteen_id = ? AND o.status NOT IN ('picked_up','delivered','cancelled')
       ORDER BY o.placed_at ASC`,
      [req.user.canteen_id]
    );
    for (const o of orders) {
      const [items] = await db.query(
        `SELECT oi.quantity, mi.name FROM order_items oi JOIN menu_items mi ON oi.item_id = mi.item_id WHERE oi.order_id = ?`,
        [o.order_id]
      );
      o.items = items;
    }
    res.json(orders);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.acceptOrder = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM orders WHERE order_id = ? AND canteen_id = ?', [req.params.id, req.user.canteen_id]);
    if (!rows.length) return res.status(404).json({ error: 'Order not found' });
    await db.query('UPDATE orders SET status = "accepted" WHERE order_id = ?', [req.params.id]);
    await db.query(
      'INSERT INTO notifications (user_id, user_role, type, message) VALUES (?, "student", "order_accepted", ?)',
      [rows[0].student_id, `🍳 Your order ${rows[0].order_code} has been accepted!`]
    );
    res.json({ message: 'Order accepted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.markPreparing = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM orders WHERE order_id = ? AND canteen_id = ?', [req.params.id, req.user.canteen_id]);
    if (!rows.length) return res.status(404).json({ error: 'Order not found' });
    await db.query('UPDATE orders SET status = "preparing" WHERE order_id = ?', [req.params.id]);
    res.json({ message: 'Order marked preparing' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.markReady = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM orders WHERE order_id = ? AND canteen_id = ?', [req.params.id, req.user.canteen_id]);
    if (!rows.length) return res.status(404).json({ error: 'Order not found' });
    const order = rows[0];

    if (order.fulfillment_type === 'delivery') {
      const agent = pickAgent();
      await db.query(
        'UPDATE orders SET status = "out_for_delivery", ready_at = NOW(), delivery_agent_name = ? WHERE order_id = ?',
        [agent, req.params.id]
      );
      await db.query(
        'INSERT INTO notifications (user_id, user_role, type, message) VALUES (?, "student", "out_for_delivery", ?)',
        [order.student_id, `🛵 Your order ${order.order_code} is out for delivery with ${agent}! Arriving at ${order.delivery_location} in ~25 mins.`]
      );
      return res.json({ message: 'Order out for delivery', delivery_agent_name: agent });
    }

    await db.query('UPDATE orders SET status = "ready", ready_at = NOW() WHERE order_id = ?', [req.params.id]);
    await db.query(
      'INSERT INTO notifications (user_id, user_role, type, message) VALUES (?, "student", "order_ready", ?)',
      [order.student_id, `🔔 Your order ${order.order_code} is ready for pickup!`]
    );
    res.json({ message: 'Order marked ready' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.markDelivered = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM orders WHERE order_id = ? AND canteen_id = ?', [req.params.id, req.user.canteen_id]);
    if (!rows.length) return res.status(404).json({ error: 'Order not found' });
    const order = rows[0];
    if (order.fulfillment_type !== 'delivery') return res.status(400).json({ error: 'Not a delivery order' });

    await db.query('UPDATE orders SET status = "delivered", delivered_at = NOW() WHERE order_id = ?', [req.params.id]);
    const { awardPoints } = require('../utils/loyaltyEngine');
    await awardPoints(order.student_id, order.order_id, order.total_amount);
    await db.query(
      'INSERT INTO notifications (user_id, user_role, type, message) VALUES (?, "student", "order_delivered", ?)',
      [order.student_id, `✅ Your order ${order.order_code} has arrived at ${order.delivery_location}! 🛵`]
    );
    res.json({ message: 'Order delivered' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.completeOrder = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM orders WHERE order_id = ? AND canteen_id = ?', [req.params.id, req.user.canteen_id]);
    if (!rows.length) return res.status(404).json({ error: 'Order not found' });
    await db.query('UPDATE orders SET status = "picked_up", picked_at = NOW() WHERE order_id = ?', [req.params.id]);
    const { awardPoints } = require('../utils/loyaltyEngine');
    await awardPoints(rows[0].student_id, rows[0].order_id, rows[0].total_amount);
    res.json({ message: 'Order completed' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateCanteenStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['open', 'closed', 'unavailable'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
    await db.query('UPDATE canteens SET status = ? WHERE canteen_id = ?', [status, req.user.canteen_id]);
    res.json({ message: `Canteen status set to ${status}` });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getAnalytics = async (req, res) => {
  try {
    const canteenId = req.user.canteen_id;
    const [revenue] = await db.query(
      `SELECT DATE(placed_at) as date, SUM(total_amount) as revenue, COUNT(*) as orders
       FROM orders WHERE canteen_id = ? AND status NOT IN ('cancelled')
       AND placed_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY DATE(placed_at) ORDER BY date`,
      [canteenId]
    );
    const [topItems] = await db.query(
      `SELECT mi.name, COUNT(oi.item_id) as order_count FROM order_items oi
       JOIN menu_items mi ON oi.item_id = mi.item_id
       JOIN orders o ON oi.order_id = o.order_id
       WHERE o.canteen_id = ? AND o.status NOT IN ('cancelled')
       GROUP BY oi.item_id ORDER BY order_count DESC LIMIT 5`,
      [canteenId]
    );
    const [heatmap] = await db.query(
      `SELECT DAYOFWEEK(placed_at) as day, HOUR(placed_at) as hour, COUNT(*) as count
       FROM orders WHERE canteen_id = ? AND status NOT IN ('cancelled') GROUP BY day, hour`,
      [canteenId]
    );
    // Delivery vs Pickup split
    const [fulfillmentSplit] = await db.query(
      `SELECT fulfillment_type, COUNT(*) as count
       FROM orders WHERE canteen_id = ? AND status NOT IN ('cancelled')
       GROUP BY fulfillment_type`,
      [canteenId]
    );
    const [[{ delivery_revenue }]] = await db.query(
      `SELECT COALESCE(SUM(delivery_fee), 0) as delivery_revenue
       FROM orders WHERE canteen_id = ? AND fulfillment_type = 'delivery' AND status NOT IN ('cancelled')`,
      [canteenId]
    );
    const [[completion]] = await db.query(
      `SELECT
        SUM(CASE WHEN status IN ('picked_up','delivered') THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status IN ('placed','accepted','preparing','ready','out_for_delivery') THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
       FROM orders WHERE canteen_id = ?`,
      [canteenId]
    );
    res.json({ revenue, top_items: topItems, heatmap, fulfillment_split: fulfillmentSplit, delivery_revenue, completion });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getPreorders = async (req, res) => {
  try {
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    const [orders] = await db.query(
      `SELECT o.*, s.name as student_name FROM orders o JOIN students s ON o.student_id = s.student_id
       WHERE o.canteen_id = ? AND o.is_preorder = 1 AND DATE(o.preorder_date) = ?`,
      [req.user.canteen_id, dateStr]
    );
    res.json(orders);
  } catch (err) { res.status(500).json({ error: err.message }); }
};
