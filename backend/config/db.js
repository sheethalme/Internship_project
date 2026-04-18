const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  socketPath: '/tmp/mysql.sock',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'gourmetgo_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const db = pool.promise();

module.exports = db;
