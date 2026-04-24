const db = require('../config/db');

exports.getDashboard = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const [[{ total_orders }]] = await db.query('SELECT COUNT(*) as total_orders FROM orders WHERE DATE(placed_at) = ?', [today]);
    const [[{ revenue }]] = await db.query(
      'SELECT COALESCE(SUM(p.amount), 0) as revenue FROM payments p WHERE DATE(p.paid_at) = ? AND p.status = "completed"',
      [today]
    );
    const [[{ active_canteens }]] = await db.query('SELECT COUNT(*) as active_canteens FROM canteens WHERE status = "open"');
    const [[{ open_grievances }]] = await db.query('SELECT COUNT(*) as open_grievances FROM grievances WHERE status = "open"');
    const [[{ pending_refunds }]] = await db.query('SELECT COUNT(*) as pending_refunds FROM refunds WHERE status IN ("requested","under_review","approved")');
    // Delivery KPIs
    const [[{ delivery_orders_today }]] = await db.query(
      'SELECT COUNT(*) as delivery_orders_today FROM orders WHERE fulfillment_type = "delivery" AND DATE(placed_at) = ?',
      [today]
    );
    const [[{ delivery_fees_today }]] = await db.query(
      'SELECT COALESCE(SUM(delivery_fee), 0) as delivery_fees_today FROM orders WHERE fulfillment_type = "delivery" AND DATE(placed_at) = ?',
      [today]
    );
    // Pending bulk orders
    const [[{ pending_bulk }]] = await db.query('SELECT COUNT(*) as pending_bulk FROM bulk_orders WHERE status = "pending"');
    res.json({
      total_orders, revenue, active_canteens, open_grievances, pending_refunds,
      delivery_orders_today, delivery_fees_today, pending_bulk,
      avg_wait_time: '8 mins',
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getAllOrders = async (req, res) => {
  try {
    const { canteen_id, status, date, fulfillment_type } = req.query;
    let query = `SELECT o.*, c.name as canteen_name, s.name as student_name
                 FROM orders o
                 JOIN canteens c ON o.canteen_id = c.canteen_id
                 JOIN students s ON o.student_id = s.student_id
                 WHERE 1=1`;
    const params = [];
    if (canteen_id)       { query += ' AND o.canteen_id = ?';       params.push(canteen_id); }
    if (status)           { query += ' AND o.status = ?';           params.push(status); }
    if (date)             { query += ' AND DATE(o.placed_at) = ?';  params.push(date); }
    if (fulfillment_type) { query += ' AND o.fulfillment_type = ?'; params.push(fulfillment_type); }
    query += ' ORDER BY o.placed_at DESC LIMIT 100';
    const [orders] = await db.query(query, params);
    res.json(orders);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateOrder = async (req, res) => {
  try {
    const { status } = req.body;
    await db.query('UPDATE orders SET status = ? WHERE order_id = ?', [status, req.params.id]);
    res.json({ message: 'Order updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getAllCanteens = async (req, res) => {
  try {
    const [canteens] = await db.query('SELECT * FROM canteens');
    for (const c of canteens) {
      const [[{ active_orders }]] = await db.query(
        'SELECT COUNT(*) as active_orders FROM orders WHERE canteen_id = ? AND status NOT IN ("picked_up","delivered","cancelled")',
        [c.canteen_id]
      );
      c.active_orders = active_orders;
      c.capacity_pct = Math.round((active_orders / c.max_capacity) * 100);
    }
    res.json(canteens);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateCanteen = async (req, res) => {
  try {
    const { name, description, operating_hours, status, banner_image } = req.body;
    await db.query(
      'UPDATE canteens SET name=COALESCE(?,name), description=COALESCE(?,description), operating_hours=COALESCE(?,operating_hours), status=COALESCE(?,status), banner_image=COALESCE(?,banner_image) WHERE canteen_id=?',
      [name, description, operating_hours, status, banner_image, req.params.id]
    );
    res.json({ message: 'Canteen updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getAllGrievances = async (req, res) => {
  try {
    const [grievances] = await db.query(
      `SELECT g.*, s.name as student_name, c.name as canteen_name,
       (g.status = 'open' AND g.created_at < DATE_SUB(NOW(), INTERVAL 24 HOUR)) as is_urgent
       FROM grievances g
       JOIN students s ON g.student_id = s.student_id
       JOIN canteens c ON g.canteen_id = c.canteen_id
       ORDER BY is_urgent DESC, g.created_at DESC`
    );
    res.json(grievances);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.replyGrievance = async (req, res) => {
  try {
    const { reply } = req.body;
    await db.query('UPDATE grievances SET admin_reply = ?, status = "in_review" WHERE grievance_id = ?', [reply, req.params.id]);
    const [[g]] = await db.query('SELECT student_id, ticket_code FROM grievances WHERE grievance_id = ?', [req.params.id]);
    await db.query(
      'INSERT INTO notifications (user_id, user_role, type, message) VALUES (?, "student", "grievance_update", ?)',
      [g.student_id, `📋 Admin replied to your grievance ${g.ticket_code}`]
    );
    res.json({ message: 'Reply sent' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getAllRefunds = async (req, res) => {
  try {
    const [refunds] = await db.query(
      `SELECT r.*, s.name as student_name, o.order_code
       FROM refunds r
       JOIN students s ON r.student_id = s.student_id
       JOIN orders o ON r.order_id = o.order_id
       ORDER BY r.requested_at DESC`
    );
    res.json(refunds);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.processRefund = async (req, res) => {
  try {
    const [[refund]] = await db.query('SELECT * FROM refunds WHERE refund_id = ?', [req.params.id]);
    if (!refund) return res.status(404).json({ error: 'Refund not found' });
    await db.query('UPDATE students SET wallet_balance = wallet_balance + ? WHERE student_id = ?', [refund.amount, refund.student_id]);
    await db.query('UPDATE refunds SET status = "processed", processed_at = NOW() WHERE refund_id = ?', [req.params.id]);
    await db.query(
      'INSERT INTO notifications (user_id, user_role, type, message) VALUES (?, "student", "refund_processed", ?)',
      [refund.student_id, `💰 Refund of ₹${refund.amount} credited to your GourmetWallet!`]
    );
    res.json({ message: 'Refund processed and wallet credited' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getAnalytics = async (req, res) => {
  try {
    const [heatmap] = await db.query(
      'SELECT DAYOFWEEK(placed_at) as day, HOUR(placed_at) as hour, COUNT(*) as order_count FROM orders WHERE status != "cancelled" GROUP BY day, hour ORDER BY day, hour'
    );
    const [canteenStats] = await db.query(
      `SELECT c.canteen_id, c.name, c.avg_rating,
              COUNT(o.order_id) as total_orders,
              COALESCE(SUM(o.total_amount), 0) as revenue
       FROM canteens c LEFT JOIN orders o ON c.canteen_id = o.canteen_id AND o.status NOT IN ('cancelled')
       GROUP BY c.canteen_id`
    );
    const [loyaltyStats] = await db.query(
      'SELECT SUM(points_earned) as total_issued, SUM(points_redeemed) as total_redeemed FROM loyalty_log'
    );
    res.json({ heatmap, canteen_stats: canteenStats, loyalty: loyaltyStats[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
