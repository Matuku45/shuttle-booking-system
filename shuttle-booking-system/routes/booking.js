const express = require('express');
const router = express.Router();
const pool = require('../db'); // PostgreSQL pool

// Middleware: check if passenger name is provided
router.use((req, res, next) => {
  if (req.method === 'POST' && !req.body.passenger_name) {
    return res.status(400).json({ success: false, message: 'Passenger name is required' });
  }
  next();
});

// Create bookings table if not exists
(async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        passenger_name VARCHAR(100) NOT NULL,
        shuttle_id INT NOT NULL,
        origin VARCHAR(100),
        destination VARCHAR(100),
        departure_date DATE,
        departure_time TIME,
        duration NUMERIC(3,1),
        pickup_window INT,
        seats_left INT,
        price_per_seat NUMERIC(10,2),
        status VARCHAR(20) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('Bookings table ready');
  } catch (err) {
    console.error('Error creating bookings table:', err);
  } finally {
    client.release();
  }
})();

// GET all bookings
router.get('/', async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM bookings ORDER BY id ASC');
    res.json({ success: true, bookings: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Database error' });
  } finally {
    client.release();
  }
});

// POST create booking
router.post('/create', async (req, res) => {
  const {
    passenger_name,
    shuttle_id,
    origin,
    destination,
    departure_date,
    departure_time,
    duration,
    pickup_window,
    seats_left,
    price_per_seat
  } = req.body;

  const client = await pool.connect();
  try {
    // Check seats
    if (seats_left <= 0) {
      return res.status(400).json({ success: false, message: 'No seats left' });
    }

    // Insert booking
    const result = await client.query(
      `INSERT INTO bookings(
        passenger_name, shuttle_id, origin, destination, departure_date, departure_time,
        duration, pickup_window, seats_left, price_per_seat
      ) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [
        passenger_name, shuttle_id, origin, destination, departure_date, departure_time,
        duration, pickup_window, seats_left - 1, price_per_seat
      ]
    );

    res.status(201).json({ success: true, booking: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Database error' });
  } finally {
    client.release();
  }
});

module.exports = router;
