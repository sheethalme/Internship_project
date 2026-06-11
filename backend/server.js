// At the top of server.js — just a helpful startup log
console.log('💡 Make sure Ollama is running: open a terminal and type: ollama serve');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

// Ensure uploads dir exists
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

// Middleware
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'], credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api', require('./routes/menu'));           // /api/canteens, /api/menu/items
app.use('/api/vendor', require('./routes/vendor'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/grievances', require('./routes/grievances'));
app.use('/api/refunds', require('./routes/refunds'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/bulk-orders', require('./routes/bulkOrders'));
app.use('/api/notifications', require('./routes/notifications'));

// Slot recommendation endpoint
const { getSlots } = require('./utils/slotUtils');
app.get('/api/canteens/:id/slots', async (req, res) => {
  try {
    const slots = await getSlots(req.params.id);
    res.json(slots);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const db = require('./config/db');

const PORT = process.env.PORT || 5000;
db.query('SELECT 1')
  .then(() => {
    console.log('✅ MySQL Database connected successfully.');
    app.listen(PORT, () => {
      console.log(`🚀 GourmetGo API running on http://localhost:${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((err) => {
    console.error('❌ Database connection failed! Please check your MySQL service and credentials.');
    console.error('Error Details:', err.message);
    process.exit(1);
  });

module.exports = app;
