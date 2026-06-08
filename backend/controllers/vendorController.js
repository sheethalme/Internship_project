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
    const today = new Date().toISOString().split('T')[0];
    const [orders] = await db.query(
      `SELECT o.*, s.name as student_name
       FROM orders o JOIN students s ON o.student_id = s.student_id
       WHERE o.canteen_id = ? 
       AND (o.status NOT IN ('picked_up','delivered','cancelled') OR (o.status IN ('picked_up','delivered') AND DATE(o.placed_at) = ?))
       ORDER BY o.placed_at ASC`,
      [req.user.canteen_id, today]
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

// ── Review Sentiment (DistilBERT) ────────────────────────────
const STOPWORDS = new Set([
  'the','a','an','and','or','but','is','are','was','were','be','been','being','to','of','in','on',
  'at','for','with','it','its','this','that','these','those','i','we','you','they','he','she','my',
  'our','your','their','as','so','if','then','than','too','very','just','not','no','do','did','does',
  'had','has','have','will','would','can','could','should','about','from','by','out','up','down','here',
  'there','what','when','which','who','how','all','any','some','more','most','also','really','quite',
  'food','order','ordered','place','places','time','got','get','give','given','went','came','one','two',
  'us','me','even','much','like','well','want','need','only','still','back','per','am','pm','rs','am',
  'after','before','again','now','day','today','first','last','also','dont','didnt','im','ive','were','off'
]);

// Count recurring uni/bi-grams across a set of comments → Map<term, count>.
const countTerms = (comments) => {
  const counts = new Map();
  for (const raw of comments) {
    const tokens = String(raw || '')
      .toLowerCase()
      .replace(/[^a-z\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 3 && !STOPWORDS.has(w));
    for (const t of tokens) counts.set(t, (counts.get(t) || 0) + 1);
    for (let i = 0; i < tokens.length - 1; i++) {
      const bg = `${tokens[i]} ${tokens[i + 1]}`;
      counts.set(bg, (counts.get(bg) || 0) + 1);
    }
  }
  return counts;
};

// Keep only terms that are DISTINCTIVE to this mood: recurring (>=2) AND used
// more here than in the opposite mood — so generic words like "good"/"taste"
// don't show up in both columns.
const distinctiveKeywords = (mine, other, topN = 8) =>
  [...mine.entries()]
    .filter(([term, c]) => c >= 2 && c > (other.get(term) || 0))
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([term, count]) => ({ term, count }));

exports.getSentiment = async (req, res) => {
  try {
    const canteenId = req.user.canteen_id;

    // Weekly mood summary (last 7 days)
    const [summaryRows] = await db.query(
      `SELECT sentiment, COUNT(*) as count FROM reviews
       WHERE canteen_id = ? AND sentiment IS NOT NULL
       AND created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
       GROUP BY sentiment`,
      [canteenId]
    );
    const weekly_summary = { positive: 0, neutral: 0, negative: 0, total: 0 };
    for (const r of summaryRows) {
      weekly_summary[r.sentiment] = r.count;
      weekly_summary.total += r.count;
    }

    // Daily trend (last 7 calendar days, zero-filled)
    const [trendRows] = await db.query(
      `SELECT DATE(created_at) as date, sentiment, COUNT(*) as count FROM reviews
       WHERE canteen_id = ? AND sentiment IS NOT NULL
       AND created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
       GROUP BY DATE(created_at), sentiment`,
      [canteenId]
    );
    const byDate = {};
    for (const r of trendRows) {
      const key = new Date(r.date).toISOString().split('T')[0];
      byDate[key] = byDate[key] || { positive: 0, neutral: 0, negative: 0 };
      byDate[key][r.sentiment] = r.count;
    }
    const trend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const day = d.toLocaleDateString('en-IN', { weekday: 'short' });
      trend.push({ day, date: key, ...(byDate[key] || { positive: 0, neutral: 0, negative: 0 }) });
    }

    // Recurring keywords (last 30 days), split by polarity
    const [posComments] = await db.query(
      `SELECT comment FROM reviews WHERE canteen_id = ? AND sentiment = 'positive'
       AND comment IS NOT NULL AND comment <> '' AND created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`,
      [canteenId]
    );
    const [negComments] = await db.query(
      `SELECT comment FROM reviews WHERE canteen_id = ? AND sentiment = 'negative'
       AND comment IS NOT NULL AND comment <> '' AND created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`,
      [canteenId]
    );
    const posMap = countTerms(posComments.map((r) => r.comment));
    const negMap = countTerms(negComments.map((r) => r.comment));
    const keywords = {
      positive: distinctiveKeywords(posMap, negMap),
      negative: distinctiveKeywords(negMap, posMap),
    };

    // Recent reviews (most recent analyzed comments) for the vendor to read.
    const [recent] = await db.query(
      `SELECT r.review_id, r.rating, r.comment, r.sentiment, r.sentiment_score, r.created_at,
              s.name AS student_name
       FROM reviews r JOIN students s ON r.student_id = s.student_id
       WHERE r.canteen_id = ? AND r.sentiment IS NOT NULL AND r.comment IS NOT NULL AND r.comment <> ''
       ORDER BY r.created_at DESC LIMIT 8`,
      [canteenId]
    );

    res.json({ weekly_summary, trend, keywords, recent });
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
