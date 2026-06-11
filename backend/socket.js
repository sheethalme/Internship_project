const { Server } = require('socket.io');
const { getSlots } = require('./utils/slotUtils');

let io = null;

function init(server, options = {}) {
  io = new Server(server, {
    cors: {
      origin: options.origins || ['http://localhost:5173', 'http://localhost:5174'],
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('WebSocket connected:', socket.id);
    socket.on('disconnect', () => console.log('WebSocket disconnected:', socket.id));
  });
}

async function emitSlotUpdate(canteenId, date = new Date()) {
  if (!io) return;
  try {
    const slots = await getSlots(canteenId, new Date(date));
    const dateStr = new Date(date).toISOString().split('T')[0];
    io.emit('slots_update', { canteenId: Number(canteenId), date: dateStr, slots });
  } catch (e) {
    console.error('emitSlotUpdate error:', e.message);
  }
}

module.exports = { init, emitSlotUpdate };
