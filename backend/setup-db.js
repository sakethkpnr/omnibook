#!/usr/bin/env node
require('dotenv').config();
const pool = require('./db');

const statements = [
  `CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(150) NOT NULL UNIQUE,
    email VARCHAR(254) NOT NULL UNIQUE,
    password VARCHAR(128) NOT NULL,
    role VARCHAR(10) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(20) DEFAULT 'event',
    date DATETIME NOT NULL,
    location VARCHAR(200) DEFAULT '',
    source VARCHAR(200) DEFAULT '',
    destination VARCHAR(200) DEFAULT '',
    image VARCHAR(255) DEFAULT NULL,
    price DECIMAL(10,2) DEFAULT 0,
    available_tickets INT DEFAULT 0,
    seat_plan JSON,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    quantity INT DEFAULT 1,
    selected_seats JSON,
    total_amount DECIMAL(10,2),
    payment_status VARCHAR(20) DEFAULT 'PENDING',
    is_cancelled TINYINT(1) DEFAULT 0,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
  )`,
];

(async () => {
  try {
    for (const stmt of statements) {
      await pool.query(stmt);
    }
    console.log('Schema loaded successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
