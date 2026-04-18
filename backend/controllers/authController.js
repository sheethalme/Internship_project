const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'gourmetgo_secret_key';

const signToken = (payload, expiresIn = '7d') => jwt.sign(payload, SECRET, { expiresIn });

// ── STUDENT ───────────────────────────────────────────────────────────────────
exports.registerStudent = async (req, res) => {
  try {
    const { name, email, password, roll_number, department, year_of_study } = req.body;
    if (!name || !email || !password || !roll_number) {
      return res.status(400).json({ error: 'Name, email, password, and roll number are required' });
    }
    const [exists] = await db.query('SELECT student_id FROM students WHERE email = ? OR roll_number = ?', [email, roll_number]);
    if (exists.length) return res.status(409).json({ error: 'Email or roll number already registered' });

    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO students (name, email, password_hash, roll_number, department, year_of_study, loyalty_points) VALUES (?, ?, ?, ?, ?, ?, 50)',
      [name, email, hash, roll_number, department, year_of_study]
    );
    const token = signToken({ id: result.insertId, email, role: 'student' });
    res.status(201).json({ token, student_id: result.insertId, name, email, loyalty_points: 50 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await db.query('SELECT * FROM students WHERE email = ?', [email]);
    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });
    const student = rows[0];
    const valid = await bcrypt.compare(password, student.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = signToken({ id: student.student_id, email, role: 'student' });
    const { password_hash, ...safe } = student;
    res.json({ token, user: safe });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── VENDOR ────────────────────────────────────────────────────────────────────
exports.loginVendor = async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await db.query('SELECT * FROM vendors WHERE email = ?', [email]);
    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });
    const vendor = rows[0];
    const valid = await bcrypt.compare(password, vendor.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = signToken({ id: vendor.vendor_id, email, role: 'vendor', canteen_id: vendor.canteen_id });
    const { password_hash, ...safe } = vendor;
    res.json({ token, user: safe });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── ADMIN ─────────────────────────────────────────────────────────────────────
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@christuniversity.in';
    const adminPass = process.env.ADMIN_PASSWORD || 'admin2024';
    if (email !== adminEmail || password !== adminPass) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }
    const token = signToken({ id: 1, email, role: 'admin' });
    res.json({ token, user: { admin_id: 1, name: 'Dr. Suresh Mathew', email, role: 'admin' } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
