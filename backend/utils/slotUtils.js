const db = require('../config/db');

const getSlots = async (canteenId, date = new Date()) => {
  const [canteen] = await db.query('SELECT operating_hours FROM canteens WHERE canteen_id = ?', [canteenId]);
  if (!canteen.length) return [];

  const slots = [];
  const startHour = 8, endHour = 19;
  for (let h = startHour; h < endHour; h++) {
    for (let m = 0; m < 60; m += 15) {
      const timeStr = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}`;
      const displayH = h > 12 ? h - 12 : h;
      const period = h >= 12 ? 'PM' : 'AM';
      const display = `${displayH}:${m.toString().padStart(2,'0')} ${period}`;
      slots.push({ time: timeStr, display, order_count: 0, recommended: false });
    }
  }

  // Count existing orders for each slot
  const dateStr = date.toISOString().split('T')[0];
  const [orders] = await db.query(
    `SELECT pickup_slot, COUNT(*) as count FROM orders
     WHERE canteen_id = ? AND DATE(placed_at) = ? AND status NOT IN ('cancelled')
     GROUP BY pickup_slot`,
    [canteenId, dateStr]
  );
  const countMap = {};
  orders.forEach(o => { countMap[o.pickup_slot] = o.count; });

  const processed = slots.map(s => ({ ...s, order_count: countMap[s.display] || 0 }));
  const minCount = Math.min(...processed.map(s => s.order_count));
  return processed.map(s => ({ ...s, recommended: s.order_count === minCount && minCount < 5 }));
};

module.exports = { getSlots };
