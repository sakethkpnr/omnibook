const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

function tokens(user) {
  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '7d' }
  );
  return { access: token, user: { id: user.id, username: user.username, email: user.email, role: user.role } };
}

router.post('/register/', async (req, res) => {
  const { username, email, password } = req.body || {};
  if (!username || !email || !password) {
    return res.status(400).json({ detail: 'username, email and password required' });
  }
  const [ex] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
  if (ex.length) return res.status(400).json({ username: ['This username is already taken.'] });
  const [ey] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
  if (ey.length) return res.status(400).json({ email: ['This email is already registered.'] });
  const hash = await bcrypt.hash(password, 10);
  const [r] = await pool.query(
    'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
    [username, email, hash, 'user']
  );
  const [users] = await pool.query('SELECT id, username, email, role FROM users WHERE id = ?', [r.insertId]);
  res.status(201).json(tokens(users[0]));
});

router.post('/login/', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ detail: 'username and password required' });
  const [rows] = await pool.query('SELECT id, username, email, role, password FROM users WHERE username = ?', [username]);
  if (!rows.length) return res.status(401).json({ detail: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, rows[0].password);
  if (!ok) return res.status(401).json({ detail: 'Invalid credentials' });
  const user = { id: rows[0].id, username: rows[0].username, email: rows[0].email, role: rows[0].role };
  res.json(tokens(user));
});

module.exports = router;
