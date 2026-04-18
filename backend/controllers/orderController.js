const db = require('../config/db');
const { generateQR } = require('../utils/qrGenerator');
const { awardPoints, redeemPoints } = require('../utils/loyaltyEngine');

const genOrderCode = () => {
  const year = new Date().getFullYear();
  const num = String(Math.floor(10000 + Math.random() * 90000)).padStart(5, '0');
  return `GG-${year}-${num}`;
};

exports.placeOrder = async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const { canteen_id, pickup_slot, is_preorder, preorder_date, items, loyalty_used } = req.body;
    const studentId = req.user.id;

    // Validate items & calculate total
    let total = 0;
    for (const item of items) {
      const [rows] = await conn.query('SELECT price, stock_remaining, is_available FROM menu_items WHERE item_id = ? AND canteen_id = ?', [item.item_id, canteen_id]);
      if (!rows.length || !rows[0].is_available || rows[0].stock_remaining < item.quantity) {
        await conn.rollback();
        return res.status(400).json({ error: `Item ${item.item_id} unavailable or insufficient stock` });
      }
      total += rows[0].price * item.quantity;
    }

    // Apply loyalty discount
    let discount = 0;
    if (loyalty_used && loyalty_used > 0) {
      discount = Math.floor(loyalty_used / 100) * 10;
      total = Math.max(0, total - discount);
    }

    const orderCode = genOrderCode();
    const qrData = await generateQR(orderCode);

    const [orderResult] = await conn.query(
      'INSERT INTO orders (order_code, student_id, canteen_id, pickup_slot, is_preorder, preorder_date, total_amount, loyalty_used, qr_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [orderCode, studentId, canteen_id, pickup_slot, is_preorder || 0, preorder_date || null, total, loyalty_used || 0, qrData]
    );
    const orderId = orderResult.insertId;

    // Insert order items & decrement stock
    for (const item of items) {
      const [priceRow] = await conn.query('SELECT price FROM menu_items WHERE item_id = ?', [item.item_id]);
      await conn.query('INSERT INTO order_items (order_id, item_id, quantity, unit_price) VALUES (?, ?, ?, ?)', [orderId, item.item_id, item.quantity, priceRow[0].price]);
      await conn.query('UPDATE menu_items SET stock_remaining = stock_remaining - ? WHERE item_id = ?', [item.quantity, item.item_id]);
      await conn.query('UPDATE menu_items SET is_available = FALSE WHERE item_id = ? AND stock_remaining <= 0', [item.item_id]);
    }

    // Loyalty operations
    if (loyalty_used > 0) await redeemPoints(studentId, orderId, loyalty_used);

    // Notification for vendor
    const [canteen] = await conn.query('SELECT vendor_id FROM vendors WHERE canteen_id = ?', [canteen_id]);
    if (canteen.length) {
      await conn.query('INSERT INTO notifications (user_id, user_role, type, message) VALUES (?, "vendor", "new_order", ?)', [canteen[0].vendor_id, `New order ${orderCode} received!`]);
    }
    // Notification for student
    await conn.query('INSERT INTO notifications (user_id, user_role, type, message) VALUES (?, "student", "order_placed", ?)', [studentId, `✅ Order ${orderCode} confirmed!`]);

    await conn.commit();
    res.status(201).json({ order_id: orderId, order_code: orderCode, total_amount: total, qr_code: qrData });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT o.*, c.name as canteen_name FROM orders o
       JOIN canteens c ON o.canteen_id = c.canteen_id
       WHERE o.student_id = ? ORDER BY o.placed_at DESC`,
      [req.user.id]
    );
    for (const order of orders) {
      const [items] = await db.query(
        `SELECT oi.*, mi.name FROM order_items oi JOIN menu_items mi ON oi.item_id = mi.item_id WHERE oi.order_id = ?`,
        [order.order_id]
      );
      order.items = items;
    }
    res.json(orders);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getOrder = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT o.*, c.name as canteen_name FROM orders o JOIN canteens c ON o.canteen_id = c.canteen_id WHERE o.order_id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Order not found' });
    const order = rows[0];
    const [items] = await db.query(`SELECT oi.*, mi.name FROM order_items oi JOIN menu_items mi ON oi.item_id = mi.item_id WHERE oi.order_id = ?`, [order.order_id]);
    order.items = items;
    res.json(order);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.trackOrder = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM orders WHERE order_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Order not found' });
    const order = rows[0];
    const [queueRows] = await db.query(
      `SELECT COUNT(*) as position FROM orders WHERE canteen_id = ? AND status IN ('accepted','preparing') AND order_id <= ?`,
      [order.canteen_id, order.order_id]
    );
    res.json({ status: order.status, queue_position: queueRows[0].position, pickup_slot: order.pickup_slot });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.cancelOrder = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM orders WHERE order_id = ? AND student_id = ?', [req.params.id, req.user.id]);
    if (!rows.length) return res.status(404).json({ error: 'Order not found' });
    if (rows[0].status !== 'placed') return res.status(400).json({ error: 'Cannot cancel order at this stage' });
    await db.query('UPDATE orders SET status = "cancelled" WHERE order_id = ?', [req.params.id]);
    res.json({ message: 'Order cancelled' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
