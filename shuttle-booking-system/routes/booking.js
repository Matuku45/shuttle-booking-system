const express = require('express');
const router = express.Router();
const pool = require('../db');

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Booking management endpoints
 * 
 * components:
 *   schemas:
 *     Booking:
 *       type: object
 *       required:
 *         - passenger_name
 *         - shuttle_id
 *       properties:
 *         id:
 *           type: integer
 *         passenger_name:
 *           type: string
 *         shuttle_id:
 *           type: integer
 *         origin:
 *           type: string
 *         destination:
 *           type: string
 *         departure_date:
 *           type: string
 *           format: date
 *         departure_time:
 *           type: string
 *           format: time
 *         duration:
 *           type: number
 *         pickup_window:
 *           type: integer
 *         seats_left:
 *           type: integer
 *         price_per_seat:
 *           type: number
 *         status:
 *           type: string
 *           default: Pending
 *         created_at:
 *           type: string
 *           format: date-time
 */

// Ensure bookings table exists
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
  try {
    const { rows } = await pool.query('SELECT * FROM bookings ORDER BY id ASC');
    res.json({ success: true, bookings: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET booking by id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM bookings WHERE id=$1', [id]);
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, booking: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// CREATE booking
router.post('/create', async (req, res) => {
  const {
    passenger_name, shuttle_id, origin, destination, departure_date,
    departure_time, duration, pickup_window, seats_left, price_per_seat
  } = req.body;

  try {
    if (seats_left <= 0) return res.status(400).json({ success: false, message: 'No seats left' });

    const { rows } = await pool.query(
      `INSERT INTO bookings(
        passenger_name, shuttle_id, origin, destination, departure_date, departure_time,
        duration, pickup_window, seats_left, price_per_seat
      ) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [
        passenger_name, shuttle_id, origin, destination, departure_date,
        departure_time, duration, pickup_window, seats_left - 1, price_per_seat
      ]
    );
    res.status(201).json({ success: true, booking: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// UPDATE booking
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    passenger_name, shuttle_id, origin, destination, departure_date,
    departure_time, duration, pickup_window, seats_left, price_per_seat, status
  } = req.body;

  try {
    const { rows } = await pool.query(
      `UPDATE bookings SET
        passenger_name=$1, shuttle_id=$2, origin=$3, destination=$4,
        departure_date=$5, departure_time=$6, duration=$7, pickup_window=$8,
        seats_left=$9, price_per_seat=$10, status=$11
       WHERE id=$12 RETURNING *`,
      [
        passenger_name, shuttle_id, origin, destination, departure_date,
        departure_time, duration, pickup_window, seats_left, price_per_seat, status, id
      ]
    );
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, booking: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE booking
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM bookings WHERE id=$1', [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, message: 'Booking deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
