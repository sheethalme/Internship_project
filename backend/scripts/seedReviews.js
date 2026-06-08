// ============================================================
//  GourmetGo — Seed historical reviews (with sentiment)
//  Run: node scripts/seedReviews.js
//
//  Reads ml/data/seed_reviews.json (produced by
//  ml/score_dataset.py), creates a backing picked_up order for
//  each review (the reviews table FKs to orders/students/
//  canteens), and inserts the review with its model sentiment.
//  created_at is spread across the last 7 days so the vendor
//  Sentiment Trend chart is populated.
//
//  Idempotent: clears any previously seeded rows first
//  (orders whose order_code starts with 'SEED-').
// ============================================================
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('../config/db');

const SEED_PATH = path.join(__dirname, '../ml/data/seed_reviews.json');
const CANTEEN_IDS = [1, 2, 3, 4];
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Strip scraped HTML artifacts (<br/>, &amp;, …) from review text.
const cleanText = (s) =>
  String(s || '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

// A datetime within the last `days` days (so the 7-day trend fills in).
function recentDate(days = 7) {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * days));
  d.setHours(8 + Math.floor(Math.random() * 11), Math.floor(Math.random() * 60), 0, 0);
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

// The dataset's own star ratings don't match the text, so derive a star
// rating from the model's sentiment (with a little variation for realism).
function sentimentToRating(sentiment) {
  if (sentiment === 'positive') return rand([4, 5, 5]);
  if (sentiment === 'negative') return rand([1, 2, 2]);
  return 3;
}

async function seed() {
  if (!fs.existsSync(SEED_PATH)) {
    console.error(`❌ ${SEED_PATH} not found. Run: python3 ml/score_dataset.py`);
    process.exit(1);
  }
  const reviews = JSON.parse(fs.readFileSync(SEED_PATH, 'utf8'));
  console.log(`🌱 Seeding ${reviews.length} reviews...`);

  // ── Clear previous seed ─────────────────────────────────
  await db.query(`DELETE r FROM reviews r JOIN orders o ON r.order_id = o.order_id WHERE o.order_code LIKE 'SEED-%'`);
  await db.query(`DELETE FROM orders WHERE order_code LIKE 'SEED-%'`);

  const [students] = await db.query('SELECT student_id FROM students');
  if (!students.length) { console.error('❌ No students found — run the base seed first.'); process.exit(1); }
  const studentIds = students.map((s) => s.student_id);

  // Compact, unique order_code (column is VARCHAR(20)): 'SEED-' + run id + index.
  const RUN = Date.now().toString(36);
  let inserted = 0;
  for (let i = 0; i < reviews.length; i++) {
    const rv = reviews[i];
    const canteen_id = rand(CANTEEN_IDS);
    const student_id = rand(studentIds);
    const when = recentDate(7);
    const rating = sentimentToRating(rv.sentiment);
    const orderCode = `SEED-${RUN}${String(i).padStart(3, '0')}`;

    try {
      const [order] = await db.query(
        `INSERT INTO orders (order_code, student_id, canteen_id, total_amount, status, placed_at, picked_at)
         VALUES (?, ?, ?, ?, 'picked_up', ?, ?)`,
        [orderCode, student_id, canteen_id, (50 + Math.floor(Math.random() * 350)).toFixed(2), when, when]
      );
      await db.query(
        `INSERT INTO reviews (order_id, student_id, canteen_id, rating, comment, sentiment, sentiment_score, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [order.insertId, student_id, canteen_id, rating, cleanText(rv.text), rv.sentiment, rv.score, when]
      );
      inserted++;
    } catch (err) {
      console.warn(`  skipped row ${i}: ${err.message}`);
    }
  }

  // Recompute canteen average ratings.
  for (const cid of CANTEEN_IDS) {
    await db.query(
      'UPDATE canteens SET avg_rating = COALESCE((SELECT AVG(rating) FROM reviews WHERE canteen_id = ?), 0) WHERE canteen_id = ?',
      [cid, cid]
    );
  }

  console.log(`✅ Inserted ${inserted} reviews with sentiment across ${CANTEEN_IDS.length} canteens.`);
  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });
