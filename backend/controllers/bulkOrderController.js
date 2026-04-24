const db = require('../config/db');

const genBulkCode = async (conn) => {
  const year = new Date().getFullYear();
  const [[{ cnt }]] = await conn.query('SELECT COUNT(*) as cnt FROM bulk_orders');
  return `BULK-${year}-${String(cnt + 1).padStart(5, '0')}`;
};

// ── Student: Submit bulk order ────────────────────────────────────────────────
exports.submitBulkOrder = async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const {
      canteen_id, event_name, event_type, venue,
      event_date, event_time, num_participants,
      organizer_name, organizer_roll, organizer_phone,
      department_club, additional_notes, items,
    } = req.body;
    const studentId = req.user.id;

    // Validations
    const eventDt = new Date(event_date);
    const minDate = new Date(); minDate.setDate(minDate.getDate() + 2);
    if (eventDt < minDate) {
      await conn.rollback();
      return res.status(400).json({ error: 'Event date must be at least 2 days from today' });
    }
    if (!num_participants || num_participants < 10) {
      await conn.rollback();
      return res.status(400).json({ error: 'Minimum 10 participants required for bulk orders' });
    }
    if (!items || !items.length) {
      await conn.rollback();
      return res.status(400).json({ error: 'At least one item is required' });
    }
    for (const item of items) {
      if (item.quantity < 5) {
        await conn.rollback();
        return res.status(400).json({ error: `Minimum quantity per item is 5 (item_id: ${item.item_id})` });
      }
    }

    const bulkCode = await genBulkCode(conn);

    const [result] = await conn.query(
      `INSERT INTO bulk_orders
         (bulk_order_code, student_id, canteen_id, event_name, event_type, venue,
          event_date, event_time, num_participants, organizer_name, organizer_roll,
          organizer_phone, department_club, additional_notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        bulkCode, studentId, canteen_id, event_name, event_type || null, venue,
        event_date, event_time, num_participants, organizer_name, organizer_roll,
        organizer_phone, department_club || null, additional_notes || null,
      ]
    );
    const bulkOrderId = result.insertId;

    for (const item of items) {
      await conn.query(
        'INSERT INTO bulk_order_items (bulk_order_id, item_id, quantity, special_instructions) VALUES (?, ?, ?, ?)',
        [bulkOrderId, item.item_id, item.quantity, item.special_instructions || null]
      );
    }

    // Notify student
    await conn.query(
      'INSERT INTO notifications (user_id, user_role, type, message) VALUES (?, "student", "bulk_submitted", ?)',
      [studentId, `📦 Your bulk order ${bulkCode} has been submitted and is under review.`]
    );

    // Notify admin (hardcoded id=1 per auth setup)
    await conn.query(
      'INSERT INTO notifications (user_id, user_role, type, message) VALUES (1, "admin", "bulk_new", ?)',
      [`📦 New bulk order request ${bulkCode} from ${organizer_name} for "${event_name}"`]
    );

    await conn.commit();
    res.status(201).json({ bulk_order_id: bulkOrderId, bulk_order_code: bulkCode, status: 'pending' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
};

// ── Student: My bulk orders ───────────────────────────────────────────────────
exports.getMyBulkOrders = async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT bo.*, c.name as canteen_name
       FROM bulk_orders bo JOIN canteens c ON bo.canteen_id = c.canteen_id
       WHERE bo.student_id = ? ORDER BY bo.submitted_at DESC`,
      [req.user.id]
    );
    for (const o of orders) {
      const [items] = await db.query(
        `SELECT boi.*, mi.name, mi.price
         FROM bulk_order_items boi JOIN menu_items mi ON boi.item_id = mi.item_id
         WHERE boi.bulk_order_id = ?`,
        [o.bulk_order_id]
      );
      o.items = items;
    }
    res.json(orders);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── Shared: Get bulk order detail ─────────────────────────────────────────────
exports.getBulkOrder = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT bo.*, c.name as canteen_name
       FROM bulk_orders bo JOIN canteens c ON bo.canteen_id = c.canteen_id
       WHERE bo.bulk_order_id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Bulk order not found' });
    const order = rows[0];
    const role = req.user.role;
    // Access control: student can only see own; vendor sees own canteen approved; admin sees all
    if (role === 'student' && order.student_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    if (role === 'vendor' && order.canteen_id !== req.user.canteen_id) return res.status(403).json({ error: 'Forbidden' });

    const [items] = await db.query(
      `SELECT boi.*, mi.name, mi.price
       FROM bulk_order_items boi JOIN menu_items mi ON boi.item_id = mi.item_id
       WHERE boi.bulk_order_id = ?`,
      [order.bulk_order_id]
    );
    order.items = items;
    res.json(order);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── Admin: List all bulk orders ───────────────────────────────────────────────
exports.adminListBulkOrders = async (req, res) => {
  try {
    const { status, canteen_id, from_date, to_date } = req.query;
    let query = `
      SELECT bo.*, c.name as canteen_name,
             s.name as student_name,
             (bo.status = 'pending' AND bo.event_date <= DATE_ADD(NOW(), INTERVAL 48 HOUR)) as is_urgent
      FROM bulk_orders bo
      JOIN canteens c ON bo.canteen_id = c.canteen_id
      JOIN students s ON bo.student_id = s.student_id
      WHERE 1=1`;
    const params = [];
    if (status)     { query += ' AND bo.status = ?';                params.push(status); }
    if (canteen_id) { query += ' AND bo.canteen_id = ?';            params.push(canteen_id); }
    if (from_date)  { query += ' AND DATE(bo.event_date) >= ?';     params.push(from_date); }
    if (to_date)    { query += ' AND DATE(bo.event_date) <= ?';     params.push(to_date); }
    query += ' ORDER BY is_urgent DESC, bo.submitted_at DESC';
    const [orders] = await db.query(query, params);
    res.json(orders);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── Admin: Approve bulk order ─────────────────────────────────────────────────
exports.approveBulkOrder = async (req, res) => {
  try {
    const { admin_note } = req.body;
    const [[order]] = await db.query('SELECT * FROM bulk_orders WHERE bulk_order_id = ?', [req.params.id]);
    if (!order) return res.status(404).json({ error: 'Bulk order not found' });
    if (order.status !== 'pending') return res.status(400).json({ error: 'Order is not pending' });

    await db.query(
      'UPDATE bulk_orders SET status = "approved", admin_note = ?, reviewed_at = NOW() WHERE bulk_order_id = ?',
      [admin_note || null, req.params.id]
    );

    // Notify student
    await db.query(
      'INSERT INTO notifications (user_id, user_role, type, message) VALUES (?, "student", "bulk_approved", ?)',
      [order.student_id, `✅ Your bulk order ${order.bulk_order_code} for "${order.event_name}" has been approved!`]
    );

    // Notify vendor
    const [vendors] = await db.query('SELECT vendor_id FROM vendors WHERE canteen_id = ?', [order.canteen_id]);
    for (const v of vendors) {
      await db.query(
        'INSERT INTO notifications (user_id, user_role, type, message) VALUES (?, "vendor", "bulk_approved", ?)',
        [v.vendor_id, `📦 New bulk order approved for "${order.event_name}" on ${order.event_date} — ${order.num_participants} participants`]
      );
    }

    res.json({ message: 'Bulk order approved' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── Admin: Reject bulk order ──────────────────────────────────────────────────
exports.rejectBulkOrder = async (req, res) => {
  try {
    const { rejection_reason } = req.body;
    if (!rejection_reason || !rejection_reason.trim()) return res.status(400).json({ error: 'Rejection reason is required' });

    const [[order]] = await db.query('SELECT * FROM bulk_orders WHERE bulk_order_id = ?', [req.params.id]);
    if (!order) return res.status(404).json({ error: 'Bulk order not found' });
    if (order.status !== 'pending') return res.status(400).json({ error: 'Order is not pending' });

    await db.query(
      'UPDATE bulk_orders SET status = "rejected", rejection_reason = ?, reviewed_at = NOW() WHERE bulk_order_id = ?',
      [rejection_reason, req.params.id]
    );
    await db.query(
      'INSERT INTO notifications (user_id, user_role, type, message) VALUES (?, "student", "bulk_rejected", ?)',
      [order.student_id, `❌ Your bulk order ${order.bulk_order_code} for "${order.event_name}" was not approved. Reason: ${rejection_reason}`]
    );

    res.json({ message: 'Bulk order rejected' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── Vendor: List approved bulk orders for their canteen ───────────────────────
exports.vendorListBulkOrders = async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT bo.*, s.name as student_name
       FROM bulk_orders bo JOIN students s ON bo.student_id = s.student_id
       WHERE bo.canteen_id = ? AND bo.status IN ('approved','fulfilled')
       ORDER BY bo.event_date ASC`,
      [req.user.canteen_id]
    );
    for (const o of orders) {
      const [items] = await db.query(
        `SELECT boi.*, mi.name, mi.price
         FROM bulk_order_items boi JOIN menu_items mi ON boi.item_id = mi.item_id
         WHERE boi.bulk_order_id = ?`,
        [o.bulk_order_id]
      );
      o.items = items;
    }
    res.json(orders);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── Vendor: Fulfill bulk order ────────────────────────────────────────────────
exports.fulfillBulkOrder = async (req, res) => {
  try {
    const [[order]] = await db.query(
      'SELECT * FROM bulk_orders WHERE bulk_order_id = ? AND canteen_id = ?',
      [req.params.id, req.user.canteen_id]
    );
    if (!order) return res.status(404).json({ error: 'Bulk order not found' });
    if (order.status !== 'approved') return res.status(400).json({ error: 'Order is not approved' });

    await db.query(
      'UPDATE bulk_orders SET status = "fulfilled", fulfilled_at = NOW() WHERE bulk_order_id = ?',
      [req.params.id]
    );
    await db.query(
      'INSERT INTO notifications (user_id, user_role, type, message) VALUES (?, "student", "bulk_fulfilled", ?)',
      [order.student_id, `🎉 Your bulk order ${order.bulk_order_code} for "${order.event_name}" has been fulfilled!`]
    );

    res.json({ message: 'Bulk order fulfilled' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
