const jwt = require('jsonwebtoken');
const pool = require('../db');

async function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ detail: 'Authentication required' });
  }
  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const [rows] = await pool.query('SELECT id, username, email, role FROM users WHERE id = ?', [decoded.userId]);
    if (!rows.length) return res.status(401).json({ detail: 'User not found' });
    req.user = rows[0];
    next();
  } catch {
    return res.status(401).json({ detail: 'Invalid token' });
  }
}

function adminOnly(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ detail: 'Admin required' });
  next();
}

module.exports = { auth, adminOnly };
