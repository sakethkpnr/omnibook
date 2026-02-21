const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../db');
const { auth, adminOnly } = require('../middleware/auth');

const uploadDir = path.join(__dirname, '..', 'media', 'events');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + (file.originalname || 'img')),
});
const upload = multer({ storage });

const admin = [auth, adminOnly];

router.get('/events/', ...admin, async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM events ORDER BY created_at DESC');
  const [bookings] = await pool.query('SELECT event_id, selected_seats, is_cancelled FROM bookings WHERE is_cancelled = 0');
  const events = rows.map(e => {
    const evt = { ...e, image: e.image ? `${req.protocol}://${req.get('host')}/media/events/${e.image}` : null };
    const bks = bookings.filter(b => b.event_id === e.id);
    evt.available_seats = null;
    if (e.seat_plan) {
      const sp = typeof e.seat_plan === 'string' ? JSON.parse(e.seat_plan) : e.seat_plan;
      const booked = new Set();
      bks.forEach(b => { (b.selected_seats ? JSON.parse(b.selected_seats) : []).forEach(s => booked.add(String(s))); });
      evt.available_seats = [];
      if (sp.sections) for (const sec of sp.sections) for (let i = 1; i <= (sec.capacity || 0); i++) {
        const id = `${sec.id}-${i}`;
        if (!booked.has(id)) evt.available_seats.push({ id, section: sec.id, label: `${sec.name || sec.id} #${i}`, price: parseFloat(sec.price || 0) });
      } else if (sp.seats) for (const s of sp.seats) {
        const id = String(s.id || '');
        if (!booked.has(id)) evt.available_seats.push({ id, section: null, label: s.label || id, price: parseFloat(s.price || 0) });
      }
    }
    evt.seat_count = evt.seat_plan ? (evt.available_seats ? evt.available_seats.length : 0) : e.available_tickets;
    return evt;
  });
  res.json(events);
});

router.post('/events/', ...admin, upload.single('image'), async (req, res) => {
  const body = req.body || {};
  const img = req.file ? req.file.filename : null;
  const { title, description, category, date, location, source, destination, price, available_tickets, seat_plan, status } = body;
  const sp = seat_plan ? (typeof seat_plan === 'string' ? JSON.parse(seat_plan) : seat_plan) : null;
  await pool.query(
    'INSERT INTO events (title, description, category, date, location, source, destination, image, price, available_tickets, seat_plan, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [title || '', description || '', category || 'event', date || new Date(), location || '', source || '', destination || '', img, parseFloat(price || 0), parseInt(available_tickets || 0, 10), sp ? JSON.stringify(sp) : null, status || 'active']
  );
  const [rows] = await pool.query('SELECT * FROM events ORDER BY id DESC LIMIT 1');
  const e = rows[0];
  e.image = e.image ? `${req.protocol}://${req.get('host')}/media/events/${e.image}` : null;
  e.available_seats = null;
  e.seat_count = e.seat_plan ? 0 : e.available_tickets;
  res.status(201).json(e);
});

router.get('/events/:id', ...admin, async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM events WHERE id = ?', [req.params.id]);
  if (!rows.length) return res.status(404).json({ detail: 'Not found' });
  const e = rows[0];
  e.image = e.image ? `${req.protocol}://${req.get('host')}/media/events/${e.image}` : null;
  e.available_seats = null;
  e.seat_count = e.seat_plan ? 0 : e.available_tickets;
  res.json(e);
});

router.put('/events/:id', ...admin, upload.single('image'), async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM events WHERE id = ?', [req.params.id]);
  if (!rows.length) return res.status(404).json({ detail: 'Not found' });
  const body = req.body || {};
  const updates = ['title', 'description', 'category', 'date', 'location', 'source', 'destination', 'price', 'available_tickets', 'seat_plan', 'status'];
  let sql = 'UPDATE events SET ';
  const vals = [];
  for (const k of updates) {
    if (body[k] !== undefined) {
      sql += (vals.length ? ', ' : '') + '`' + k + '` = ?';
      vals.push(k === 'seat_plan' && body[k] ? JSON.stringify(typeof body[k] === 'string' ? JSON.parse(body[k]) : body[k]) : body[k]);
    }
  }
  if (req.file) { sql += (vals.length ? ', ' : '') + ' image = ?'; vals.push(req.file.filename); }
  sql += ' WHERE id = ?';
  vals.push(req.params.id);
  if (vals.length > 1) await pool.query(sql, vals);
  const [r] = await pool.query('SELECT * FROM events WHERE id = ?', [req.params.id]);
  const e = r[0];
  e.image = e.image ? `${req.protocol}://${req.get('host')}/media/events/${e.image}` : null;
  res.json(e);
});

router.delete('/events/:id', ...admin, async (req, res) => {
  const [r] = await pool.query('DELETE FROM events WHERE id = ?', [req.params.id]);
  if (r.affectedRows === 0) return res.status(404).json({ detail: 'Not found' });
  res.status(204).send();
});

router.post('/events/cancel/', ...admin, async (req, res) => {
  const event_id = req.body?.event_id;
  if (event_id == null) return res.status(400).json({ detail: 'event_id required' });
  const [rows] = await pool.query('SELECT * FROM events WHERE id = ?', [event_id]);
  if (!rows.length) return res.status(404).json({ detail: 'Event not found' });
  await pool.query('UPDATE events SET status = ? WHERE id = ?', ['cancelled', event_id]);
  const e = rows[0];
  e.status = 'cancelled';
  e.image = e.image ? `${req.protocol}://${req.get('host')}/media/events/${e.image}` : null;
  res.json(e);
});

router.get('/users/', ...admin, async (req, res) => {
  const [rows] = await pool.query('SELECT id, username, email, role FROM users ORDER BY id');
  res.json(rows);
});

router.get('/bookings/', ...admin, async (req, res) => {
  const [rows] = await pool.query(
    'SELECT b.*, u.username as user_username, u.email as user_email, e.title as event_title, e.date as event_date, e.price as event_price, e.category as event_category FROM bookings b JOIN users u ON b.user_id = u.id JOIN events e ON b.event_id = e.id ORDER BY b.booking_date DESC'
  );
  const list = rows.map(b => ({
    id: b.id, user: b.user_id, user_username: b.user_username, user_email: b.user_email, event: b.event_id,
    event_title: b.event_title, event_date: b.event_date, event_price: String(b.event_price), event_category: b.event_category,
    quantity: b.quantity, selected_seats: b.selected_seats ? JSON.parse(b.selected_seats) : [],
    total_amount: b.total_amount ? String(b.total_amount) : null, payment_status: b.payment_status, is_cancelled: !!b.is_cancelled, booking_date: b.booking_date,
  }));
  res.json(list);
});

router.get('/stats/', ...admin, async (req, res) => {
  const [[{ tu }]] = await pool.query('SELECT COUNT(*) as tu FROM users');
  const [[{ te }]] = await pool.query('SELECT COUNT(*) as te FROM events');
  const [[{ tb }]] = await pool.query('SELECT COUNT(*) as tb FROM bookings');
  const [[{ ps }]] = await pool.query('SELECT COUNT(*) as ps FROM bookings WHERE payment_status = ? AND is_cancelled = 0', ['SUCCESS']);
  const [[{ pp }]] = await pool.query('SELECT COUNT(*) as pp FROM bookings WHERE payment_status = ? AND is_cancelled = 0', ['PENDING']);
  const [[{ cb }]] = await pool.query('SELECT COUNT(*) as cb FROM bookings WHERE is_cancelled = 1');
  const [[r]] = await pool.query(
    'SELECT COALESCE(SUM(b.total_amount), 0) as rev FROM bookings b WHERE b.payment_status = ? AND b.is_cancelled = 0',
    ['SUCCESS']
  );
  res.json({
    total_users: tu, total_events: te, total_bookings: tb,
    payment_success: ps, payment_pending: pp, cancelled_bookings: cb,
    total_revenue: String(r?.rev || '0.00'),
  });
});

module.exports = router;
