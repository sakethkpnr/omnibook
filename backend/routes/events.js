const express = require('express');
const router = express.Router();
const pool = require('../db');
const path = require('path');

function getAvailableSeats(seatPlan, eventId, bookings) {
  if (!seatPlan) return null;
  const booked = new Set();
  for (const b of bookings) {
    const seats = b.selected_seats ? (typeof b.selected_seats === 'string' ? JSON.parse(b.selected_seats) : b.selected_seats) : [];
    seats.forEach(s => booked.add(String(s)));
  }
  const seats = [];
  if (seatPlan.sections) {
    for (const sec of seatPlan.sections) {
      const cap = parseInt(sec.capacity || 0, 10);
      const sid = String(sec.id || '');
      for (let i = 1; i <= cap; i++) {
        const seatId = `${sid}-${i}`;
        if (!booked.has(seatId)) seats.push({ id: seatId, section: sid, label: `${sec.name || sid} #${i}`, price: parseFloat(sec.price || 0) });
      }
    }
  } else if (seatPlan.seats) {
    for (const s of seatPlan.seats) {
      const seatId = String(s.id || '');
      if (!booked.has(seatId)) seats.push({ id: seatId, section: null, label: s.label || seatId, price: parseFloat(s.price || 0) });
    }
  }
  return seats;
}

function getSeatCount(seatPlan, availableTickets) {
  if (!seatPlan) return availableTickets;
  if (seatPlan.sections) return seatPlan.sections.reduce((n, s) => n + parseInt(s.capacity || 0, 10), 0);
  if (seatPlan.seats) return seatPlan.seats.length;
  return availableTickets;
}

router.get('/', async (req, res) => {
  let sql = 'SELECT * FROM events WHERE 1=1';
  const params = [];
  if (req.query.source) { sql += ' AND source LIKE ?'; params.push(`%${req.query.source}%`); }
  if (req.query.destination) { sql += ' AND destination LIKE ?'; params.push(`%${req.query.destination}%`); }
  if (req.query.date) { sql += ' AND DATE(date) = ?'; params.push(req.query.date); }
  sql += ' ORDER BY date ASC';
  const [rows] = await pool.query(sql, params);
  const [bookings] = await pool.query('SELECT event_id, selected_seats, is_cancelled FROM bookings WHERE is_cancelled = 0');
  const events = rows.map(e => {
    const evt = { ...e, image: e.image ? `${req.protocol}://${req.get('host')}/media/events/${e.image}` : null };
    evt.available_seats = getAvailableSeats(e.seat_plan ? (typeof e.seat_plan === 'string' ? JSON.parse(e.seat_plan) : e.seat_plan) : null, e.id, bookings.filter(b => b.event_id === e.id));
    evt.seat_count = getSeatCount(e.seat_plan ? (typeof e.seat_plan === 'string' ? JSON.parse(e.seat_plan) : e.seat_plan) : null, e.available_tickets);
    return evt;
  });
  res.json(events);
});

router.get('/:id', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM events WHERE id = ?', [req.params.id]);
  if (!rows.length) return res.status(404).json({ detail: 'Not found' });
  const e = rows[0];
  const [bookings] = await pool.query('SELECT event_id, selected_seats FROM bookings WHERE event_id = ? AND is_cancelled = 0', [e.id]);
  const evt = { ...e, image: e.image ? `${req.protocol}://${req.get('host')}/media/events/${e.image}` : null };
  evt.available_seats = getAvailableSeats(e.seat_plan ? (typeof e.seat_plan === 'string' ? JSON.parse(e.seat_plan) : e.seat_plan) : null, e.id, bookings);
  evt.seat_count = getSeatCount(e.seat_plan ? (typeof e.seat_plan === 'string' ? JSON.parse(e.seat_plan) : e.seat_plan) : null, e.available_tickets);
  res.json(evt);
});

module.exports = router;
