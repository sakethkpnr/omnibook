require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const auth = require('./routes/auth');
const events = require('./routes/events');
const book = require('./routes/book');
const bookings = require('./routes/bookings');
const admin = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use('/media', express.static(path.join(__dirname, 'media')));

app.use('/api', auth);
app.use('/api/events', events);
app.use('/api/book', book);
app.use('/api/bookings', bookings);
app.use('/api/admin', admin);

app.listen(PORT, () => console.log(`OmniBook API on http://localhost:${PORT}`));
