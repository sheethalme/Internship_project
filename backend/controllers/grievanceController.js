const db = require('../config/db');

const genTicket = () => `GRV-${String(Math.floor(1000 + Math.random() * 9000))}`;

exports.create = async (req, res) => {
  try {
    const { order_id, issue_type, description } = req.body;
    const studentId = req.user.id;
    const [[order]] = await db.query('SELECT canteen_id FROM orders WHERE order_id = ? AND student_id = ?', [order_id, studentId]);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    const ticket = genTicket();
    const [result] = await db.query(
      'INSERT INTO grievances (ticket_code, order_id, student_id, canteen_id, issue_type, description) VALUES (?, ?, ?, ?, ?, ?)',
      [ticket, order_id, studentId, order.canteen_id, issue_type, description]
    );
    const [[vendor]] = await db.query('SELECT vendor_id FROM vendors WHERE canteen_id = ?', [order.canteen_id]);
    if (vendor) await db.query('INSERT INTO notifications (user_id, user_role, type, message) VALUES (?, "vendor", "new_grievance", ?)', [vendor.vendor_id, `New grievance ${ticket} raised`]);
    res.status(201).json({ grievance_id: result.insertId, ticket_code: ticket });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getMy = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT g.*, c.name as canteen_name FROM grievances g JOIN canteens c ON g.canteen_id = c.canteen_id WHERE g.student_id = ? ORDER BY g.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status, reply, from = 'vendor' } = req.body;
    const field = from === 'admin' ? 'admin_reply' : 'vendor_reply';
    await db.query(`UPDATE grievances SET status = COALESCE(?, status), ${field} = COALESCE(?, ${field}) WHERE grievance_id = ?`, [status, reply, req.params.id]);
    if (reply) {
      const [[g]] = await db.query('SELECT student_id, ticket_code FROM grievances WHERE grievance_id = ?', [req.params.id]);
      await db.query('INSERT INTO notifications (user_id, user_role, type, message) VALUES (?, "student", "grievance_update", ?)', [g.student_id, `📋 ${from === 'admin' ? 'Admin' : 'Vendor'} replied to ${g.ticket_code}`]);
    }
    res.json({ message: 'Updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.aiReply = async (req, res) => {
  try {
    const { from = 'vendor' } = req.body;
    const [[grievance]] = await db.query(
      `SELECT g.*, s.name as student_name, c.name as canteen_name
       FROM grievances g
       JOIN students s ON g.student_id = s.student_id
       JOIN canteens c ON g.canteen_id = c.canteen_id
       WHERE g.grievance_id = ?`,
      [req.params.id]
    );
    if (!grievance) return res.status(404).json({ error: 'Grievance not found' });

    const issueLabels = {
      wrong_item: 'Wrong Item Delivered',
      quality_issue: 'Food Quality Issue',
      long_wait: 'Long Waiting Time',
      payment_issue: 'Payment Issue',
      other: 'Other'
    };

    const role = from === 'admin' ? 'university canteen admin' : 'canteen vendor';
    const prompt = `You are a helpful ${role} at ${grievance.canteen_name} canteen at Christ University, Bengaluru.
A student named ${grievance.student_name} has raised a grievance with the following details:
- Issue Type: ${issueLabels[grievance.issue_type] || grievance.issue_type}
- Description: ${grievance.description}
- Ticket Code: ${grievance.ticket_code}

Write a professional, empathetic, and helpful reply to this student addressing their concern. 
Keep it concise (2-4 sentences), apologize if needed, and explain what action will be taken or has been taken.
Reply only with the message text, no extra formatting or preamble.`;

    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
    const model = process.env.OLLAMA_MODEL || 'llama3.2:3b';

    const ollamaRes = await fetch(`${ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt, stream: false }),
    });

    if (!ollamaRes.ok) {
      const errText = await ollamaRes.text();
      return res.status(502).json({ error: `Ollama error: ${errText}` });
    }

    const ollamaData = await ollamaRes.json();
    const aiReply = (ollamaData.response || '').trim();
    if (!aiReply) return res.status(502).json({ error: 'Empty response from Ollama' });

    res.json({ reply: aiReply });
  } catch (err) {
    console.error('AI Reply error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.getVendorGrievances = async (req, res) => {
  try {
    const [[vendor]] = await db.query('SELECT canteen_id FROM vendors WHERE vendor_id = ?', [req.user.id]);
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
    const [rows] = await db.query(
      `SELECT g.*, s.name as student_name, c.name as canteen_name
       FROM grievances g
       JOIN students s ON g.student_id = s.student_id
       JOIN canteens c ON g.canteen_id = c.canteen_id
       WHERE g.canteen_id = ?
       ORDER BY g.created_at DESC`,
      [vendor.canteen_id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getAllGrievances = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT g.*, s.name as student_name, c.name as canteen_name
       FROM grievances g
       JOIN students s ON g.student_id = s.student_id
       JOIN canteens c ON g.canteen_id = c.canteen_id
       ORDER BY g.created_at DESC`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};
