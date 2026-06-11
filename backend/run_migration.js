const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mysql = require('mysql2');
const fs = require('fs');

console.log('DEBUG - Environment variables:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'EMPTY');
console.log('DB_NAME:', process.env.DB_NAME);

async function runMigration() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'gourmetgo_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  const db = pool.promise();
  const conn = await db.getConnection();
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'migration_add_order_item_predictions.sql'), 'utf8');
    await conn.query(sql);
    console.log('✅ Migration completed successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    conn.release();
    pool.end();
    process.exit(0);
  }
}

runMigration();
