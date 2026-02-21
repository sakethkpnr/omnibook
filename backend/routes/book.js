const express = require('express');
const router = express.Router();
const pool = require('../db');
const { auth } = require('../middleware/auth');

router.use(auth);

router.post('/', async (req, res) => {
  const { event_id, quantity, selected_seats } = req.body || {};
  if (!event_id || !quantity || quantity < 1) {
    return res.status(400).json({ detail: 'event_id and quantity required' });
  }

  const [evtRows] = await pool.query('SELECT * FROM events WHERE id = ? AND status = ?', [event_id, 'active']);
  if (!evtRows.length) return res.status(404).json({ detail: 'Event not found or inactive' });
  const event = evtRows[0];
  const seatPlan = event.seat_plan ? (typeof event.seat_plan === 'string' ? JSON.parse(event.seat_plan) : event.seat_plan) : null;

  const seatsToBook = selected_seats && Array.isArray(selected_seats) ? selected_seats : [];
  const qty = seatPlan ? seatsToBook.length : Math.min(parseInt(quantity, 10) || 1, event.available_tickets || 999);

  if (seatPlan && seatsToBook.length === 0) {
    return res.status(400).json({ detail: 'Please select seats' });
  }

  const [bookings] = await pool.query('SELECT selected_seats FROM bookings WHERE event_id = ? AND is_cancelled = 0', [event_id]);
  const booked = new Set();
  for (const b of bookings) {
    const s = b.selected_seats ? (typeof b.selected_seats === 'string' ? JSON.parse(b.selected_seats) : b.selected_seats) : [];
    s.forEach((id) => booked.add(String(id)));
  }
  for (const sid of seatsToBook) {
    if (booked.has(String(sid))) {
      return res.status(400).json({ detail: 'One or more seats are not available' });
    }
  }

  const price = parseFloat(event.price || 0);
  const totalAmount = seatPlan
    ? seatsToBook.reduce((sum, id) => {
        if (seatPlan.sections) {
          for (const sec of seatPlan.sections) {
            const prefix = String(sec.id || '') + '-';
            if (String(id).startsWith(prefix)) return sum + parseFloat(sec.price || 0);
          }
        }
        if (seatPlan.seats) {
          const s = seatPlan.seats.find((se) => String(se.id) === String(id));
          if (s) return sum + parseFloat(s.price || 0);
        }
        return sum + price;
      }, 0)
    : price * qty;

  await pool.query(
    'INSERT INTO bookings (user_id, event_id, quantity, selected_seats, total_amount, payment_status) VALUES (?, ?, ?, ?, ?, ?)',
    [req.user.id, event_id, qty, seatsToBook.length ? JSON.stringify(seatsToBook) : null, totalAmount, 'PENDING']
  );
  const [inserted] = await pool.query('SELECT id FROM bookings ORDER BY id DESC LIMIT 1');
  res.status(201).json({ id: inserted[0].id });
});

module.exports = router;
