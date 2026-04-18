const db = require('../config/db');

exports.request = async (req, res) => {
  try {
    const { order_id, amount, reason, grievance_id } = req.body;
    const [result] = await db.query(
      'INSERT INTO refunds (order_id, student_id, grievance_id, amount, reason) VALUES (?, ?, ?, ?, ?)',
      [order_id, req.user.id, grievance_id || null, amount, reason]
    );
    res.status(201).json({ refund_id: result.insertId, message: 'Refund requested' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getMy = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT r.*, o.order_code FROM refunds r JOIN orders o ON r.order_id = o.order_id WHERE r.student_id = ? ORDER BY r.requested_at DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};
