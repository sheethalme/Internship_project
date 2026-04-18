const db = require('../config/db');

exports.getCanteens = async (req, res) => {
  try {
    const [canteens] = await db.query('SELECT * FROM canteens WHERE status != "closed"');
    for (const c of canteens) {
      const [[{ active_orders }]] = await db.query(
        'SELECT COUNT(*) as active_orders FROM orders WHERE canteen_id = ? AND status NOT IN ("picked_up","cancelled")', [c.canteen_id]
      );
      c.active_orders = active_orders;
      c.capacity_pct = Math.round((active_orders / c.max_capacity) * 100);
      c.capacity_color = c.capacity_pct <= 40 ? 'green' : c.capacity_pct <= 70 ? 'yellow' : 'red';
    }
    res.json(canteens);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getCanteen = async (req, res) => {
  try {
    const [[canteen]] = await db.query('SELECT * FROM canteens WHERE canteen_id = ?', [req.params.id]);
    if (!canteen) return res.status(404).json({ error: 'Canteen not found' });
    const [[{ avg_rating }]] = await db.query('SELECT AVG(rating) as avg_rating FROM reviews WHERE canteen_id = ?', [req.params.id]);
    canteen.avg_rating = parseFloat(avg_rating || 0).toFixed(1);
    res.json(canteen);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getMenu = async (req, res) => {
  try {
    const { category, veg } = req.query;
    let query = 'SELECT * FROM menu_items WHERE canteen_id = ?';
    const params = [req.params.id];
    if (category) { query += ' AND category = ?'; params.push(category); }
    if (veg !== undefined) { query += ' AND is_veg = ?'; params.push(veg === 'true' ? 1 : 0); }
    query += ' ORDER BY category, name';
    const [items] = await db.query(query, params);
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.addItem = async (req, res) => {
  try {
    const { name, price, category, is_veg, prep_time_mins, daily_stock_limit, image_url } = req.body;
    const canteenId = req.user.canteen_id;
    const [result] = await db.query(
      'INSERT INTO menu_items (canteen_id, name, price, category, is_veg, prep_time_mins, daily_stock_limit, stock_remaining, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [canteenId, name, price, category, is_veg, prep_time_mins, daily_stock_limit, daily_stock_limit, image_url || null]
    );
    res.status(201).json({ item_id: result.insertId, message: 'Item added' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateItem = async (req, res) => {
  try {
    const { price, prep_time_mins, daily_stock_limit, image_url, name, category } = req.body;
    await db.query(
      'UPDATE menu_items SET price=COALESCE(?,price), prep_time_mins=COALESCE(?,prep_time_mins), daily_stock_limit=COALESCE(?,daily_stock_limit), image_url=COALESCE(?,image_url), name=COALESCE(?,name), category=COALESCE(?,category) WHERE item_id = ? AND canteen_id = ?',
      [price, prep_time_mins, daily_stock_limit, image_url, name, category, req.params.id, req.user.canteen_id]
    );
    res.json({ message: 'Item updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.toggleItem = async (req, res) => {
  try {
    const [[item]] = await db.query('SELECT is_available FROM menu_items WHERE item_id = ? AND canteen_id = ?', [req.params.id, req.user.canteen_id]);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    await db.query('UPDATE menu_items SET is_available = ? WHERE item_id = ?', [!item.is_available, req.params.id]);
    res.json({ is_available: !item.is_available });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.restockItem = async (req, res) => {
  try {
    await db.query('UPDATE menu_items SET stock_remaining = daily_stock_limit, is_available = TRUE WHERE item_id = ? AND canteen_id = ?', [req.params.id, req.user.canteen_id]);
    res.json({ message: 'Item restocked' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteItem = async (req, res) => {
  try {
    await db.query('DELETE FROM menu_items WHERE item_id = ? AND canteen_id = ?', [req.params.id, req.user.canteen_id]);
    res.json({ message: 'Item deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
