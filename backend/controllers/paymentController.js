const db = require('../config/db');

exports.initiate = async (req, res) => {
  try {
    const { order_id, method, amount } = req.body;
    const [result] = await db.query(
      'INSERT INTO payments (order_id, method, amount, status) VALUES (?, ?, ?, "pending")',
      [order_id, method, amount]
    );
    res.status(201).json({ payment_id: result.insertId, status: 'pending' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.confirm = async (req, res) => {
  try {
    const { payment_id } = req.body;
    const [[payment]] = await db.query('SELECT * FROM payments WHERE payment_id = ?', [payment_id]);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    // Simulate payment success
    await db.query('UPDATE payments SET status = "completed", paid_at = NOW() WHERE payment_id = ?', [payment_id]);
    await db.query('UPDATE orders SET status = "placed" WHERE order_id = ?', [payment.order_id]);
    res.json({ message: 'Payment confirmed', status: 'completed' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getStatus = async (req, res) => {
  try {
    const [[payment]] = await db.query('SELECT * FROM payments WHERE order_id = ?', [req.params.order_id]);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    res.json(payment);
  } catch (err) { res.status(500).json({ error: err.message }); }
};
