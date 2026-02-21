const express = require('express');
const router = express.Router();
const pool = require('../db');
const { auth } = require('../middleware/auth');

router.use(auth);

router.get('/user/', async (req, res) => {
  const [rows] = await pool.query(
    `SELECT b.id, b.event_id as event, b.user_id as user, b.quantity, b.selected_seats, b.total_amount,
       b.payment_status, b.is_cancelled, b.booking_date,
       e.title as event_title, e.date as event_date, e.price as event_price, e.category as event_category
     FROM bookings b
     JOIN events e ON b.event_id = e.id
     WHERE b.user_id = ?
     ORDER BY b.booking_date DESC`,
    [req.user.id]
  );
  const list = rows.map((b) => ({
    id: b.id,
    event: b.event,
    user: b.user,
    event_title: b.event_title,
    event_date: b.event_date,
    event_price: b.event_price ? String(b.event_price) : null,
    event_category: b.event_category,
    quantity: b.quantity,
    selected_seats: b.selected_seats ? (typeof b.selected_seats === 'string' ? JSON.parse(b.selected_seats) : b.selected_seats) : [],
    total_amount: b.total_amount ? String(b.total_amount) : null,
    payment_status: b.payment_status,
    is_cancelled: !!b.is_cancelled,
    booking_date: b.booking_date,
  }));
  res.json(list);
});

router.post('/:id/cancel/', async (req, res) => {
  const id = req.params.id;
  const [rows] = await pool.query('SELECT id, user_id FROM bookings WHERE id = ?', [id]);
  if (!rows.length) return res.status(404).json({ detail: 'Booking not found' });
  if (rows[0].user_id !== req.user.id) return res.status(403).json({ detail: 'Not your booking' });
  await pool.query('UPDATE bookings SET is_cancelled = 1 WHERE id = ?', [id]);
  const [updated] = await pool.query(
    `SELECT b.id, b.event_id as event, b.quantity, b.selected_seats, b.payment_status, b.is_cancelled,
       e.title as event_title, e.date as event_date
     FROM bookings b JOIN events e ON b.event_id = e.id WHERE b.id = ?`,
    [id]
  );
  const b = updated[0];
  res.json({
    id: b.id,
    event: b.event,
    event_title: b.event_title,
    event_date: b.event_date,
    quantity: b.quantity,
    selected_seats: b.selected_seats ? JSON.parse(b.selected_seats) : [],
    payment_status: b.payment_status,
    is_cancelled: true,
  });
});

router.post('/:id/complete_payment/', async (req, res) => {
  const id = req.params.id;
  const [rows] = await pool.query('SELECT id, user_id FROM bookings WHERE id = ?', [id]);
  if (!rows.length) return res.status(404).json({ detail: 'Booking not found' });
  if (rows[0].user_id !== req.user.id) return res.status(403).json({ detail: 'Not your booking' });
  await pool.query('UPDATE bookings SET payment_status = ? WHERE id = ?', ['SUCCESS', id]);
  res.json({ id: parseInt(id, 10), payment_status: 'SUCCESS' });
});

module.exports = router;
