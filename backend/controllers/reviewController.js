const db = require('../config/db');

exports.submit = async (req, res) => {
  try {
    const { order_id, canteen_id, rating, comment } = req.body;
    const [[order]] = await db.query('SELECT * FROM orders WHERE order_id = ? AND student_id = ? AND status = "picked_up"', [order_id, req.user.id]);
    if (!order) return res.status(400).json({ error: 'Order not eligible for review' });
    const [result] = await db.query(
      'INSERT INTO reviews (order_id, student_id, canteen_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
      [order_id, req.user.id, canteen_id, rating, comment]
    );
    // Update canteen avg rating
    await db.query('UPDATE canteens SET avg_rating = (SELECT AVG(rating) FROM reviews WHERE canteen_id = ?) WHERE canteen_id = ?', [canteen_id, canteen_id]);
    res.status(201).json({ review_id: result.insertId, message: 'Review submitted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getByCanteen = async (req, res) => {
  try {
    const [reviews] = await db.query(
      `SELECT r.*, s.name as student_name FROM reviews r JOIN students s ON r.student_id = s.student_id WHERE r.canteen_id = ? ORDER BY r.created_at DESC`,
      [req.params.canteen_id]
    );
    res.json(reviews);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.adminGetAll = async (req, res) => {
  try {
    const { canteen_id } = req.query;
    let query = `SELECT r.*, s.name as student_name, c.name as canteen_name
                 FROM reviews r
                 JOIN students s ON r.student_id = s.student_id
                 JOIN canteens c ON r.canteen_id = c.canteen_id`;
    const params = [];
    if (canteen_id) { query += ' WHERE r.canteen_id = ?'; params.push(canteen_id); }
    query += ' ORDER BY r.created_at DESC';
    const [reviews] = await db.query(query, params);
    res.json(reviews);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.adminDelete = async (req, res) => {
  try {
    const [[review]] = await db.query('SELECT canteen_id FROM reviews WHERE review_id = ?', [req.params.id]);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    await db.query('DELETE FROM reviews WHERE review_id = ?', [req.params.id]);
    await db.query(
      'UPDATE canteens SET avg_rating = COALESCE((SELECT AVG(rating) FROM reviews WHERE canteen_id = ?), 0) WHERE canteen_id = ?',
      [review.canteen_id, review.canteen_id]
    );
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
