const db = require('../config/db');

exports.getMyNotifications = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM notifications WHERE user_id = ? AND user_role = ? ORDER BY created_at DESC LIMIT 50',
      [req.user.id, req.user.role]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.markRead = async (req, res) => {
  try {
    await db.query(
      'UPDATE notifications SET is_read = 1 WHERE notification_id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.markAllRead = async (req, res) => {
  try {
    await db.query(
      'UPDATE notifications SET is_read = 1 WHERE user_id = ? AND user_role = ?',
      [req.user.id, req.user.role]
    );
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.dismiss = async (req, res) => {
  try {
    await db.query(
      'DELETE FROM notifications WHERE notification_id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
