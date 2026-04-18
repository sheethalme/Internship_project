const db = require('../config/db');

const genTicket = () => `GRV-${String(Math.floor(1000 + Math.random() * 9000))}`;

exports.create = async (req, res) => {
  try {
    const { order_id, issue_type, description } = req.body;
    const studentId = req.user.id;
    const [[order]] = await db.query('SELECT canteen_id FROM orders WHERE order_id = ? AND student_id = ?', [order_id, studentId]);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    const ticket = genTicket();
    const [result] = await db.query(
      'INSERT INTO grievances (ticket_code, order_id, student_id, canteen_id, issue_type, description) VALUES (?, ?, ?, ?, ?, ?)',
      [ticket, order_id, studentId, order.canteen_id, issue_type, description]
    );
    const [[vendor]] = await db.query('SELECT vendor_id FROM vendors WHERE canteen_id = ?', [order.canteen_id]);
    if (vendor) await db.query('INSERT INTO notifications (user_id, user_role, type, message) VALUES (?, "vendor", "new_grievance", ?)', [vendor.vendor_id, `New grievance ${ticket} raised`]);
    res.status(201).json({ grievance_id: result.insertId, ticket_code: ticket });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getMy = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT g.*, c.name as canteen_name FROM grievances g JOIN canteens c ON g.canteen_id = c.canteen_id WHERE g.student_id = ? ORDER BY g.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status, reply, from = 'vendor' } = req.body;
    const field = from === 'admin' ? 'admin_reply' : 'vendor_reply';
    await db.query(`UPDATE grievances SET status = COALESCE(?, status), ${field} = COALESCE(?, ${field}) WHERE grievance_id = ?`, [status, reply, req.params.id]);
    if (reply) {
      const [[g]] = await db.query('SELECT student_id, ticket_code FROM grievances WHERE grievance_id = ?', [req.params.id]);
      await db.query('INSERT INTO notifications (user_id, user_role, type, message) VALUES (?, "student", "grievance_update", ?)', [g.student_id, `📋 ${from === 'admin' ? 'Admin' : 'Vendor'} replied to ${g.ticket_code}`]);
    }
    res.json({ message: 'Updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
