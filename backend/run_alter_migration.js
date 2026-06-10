const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mysql = require('mysql2');
const fs = require('fs');

async function runMigration() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'gourmetgo_db',
  });
  const db = pool.promise();
  const conn = await db.getConnection();
  try {
    // Check if column exists
    const [rows] = await conn.query(
      `SELECT COUNT(*) as cnt FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'order_item_predictions' AND column_name = 'prep_time_mins'`
    );
    const exists = rows[0].cnt > 0;
    if (exists) {
      console.log('ℹ️ Column `prep_time_mins` already exists on order_item_predictions');
    } else {
      console.log('Adding `prep_time_mins` column to order_item_predictions...');
      await conn.query('ALTER TABLE order_item_predictions ADD COLUMN prep_time_mins FLOAT');
      console.log('✅ Alter migration applied successfully');
    }
  } catch (err) {
    console.error('❌ Alter migration failed:', err.message);
    process.exitCode = 1;
  } finally {
    conn.release();
    pool.end();
  }
}

runMigration();
