const express = require('express');
const router = express.Router();
const pool = require('../db');

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Booking management endpoints
 */

/**
 * @swagger
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

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: Get all bookings
 *     tags: [Bookings]
 *     responses:
 *       200:
 *         description: List of bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 bookings:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Booking'
 */
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM bookings ORDER BY id ASC');
    res.json({ success: true, bookings: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @swagger
 * /api/bookings/{id}:
 *   get:
 *     summary: Get a booking by ID
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 booking:
 *                   $ref: '#/components/schemas/Booking'
 *       404:
 *         description: Booking not found
 */
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

/**
 * @swagger
 * /api/bookings/create:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Booking'
 *     responses:
 *       201:
 *         description: Booking created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 booking:
 *                   $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Invalid input
 */
router.post('/create', async (req, res) => {
  let { passenger_name, shuttle_id, origin, destination, departure_date,
        departure_time, duration, pickup_window, seats_left, price_per_seat } = req.body;
  try {
    shuttle_id = parseInt(shuttle_id);
    seats_left = parseInt(seats_left);
    pickup_window = parseInt(pickup_window) || 15;
    duration = parseFloat(duration) || null;
    price_per_seat = parseFloat(price_per_seat) || 0;

    if (isNaN(shuttle_id)) return res.status(400).json({ success: false, message: 'Invalid shuttle_id' });
    if (isNaN(seats_left) || seats_left <= 0) return res.status(400).json({ success: false, message: 'No seats left' });

    const { rows } = await pool.query(
      `INSERT INTO bookings(
        passenger_name, shuttle_id, origin, destination, departure_date, departure_time,
        duration, pickup_window, seats_left, price_per_seat
      ) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [passenger_name, shuttle_id, origin, destination, departure_date, departure_time,
       duration, pickup_window, seats_left - 1, price_per_seat]
    );
    res.status(201).json({ success: true, booking: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @swagger
 * /api/bookings/{id}:
 *   put:
 *     summary: Update an existing booking
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Booking ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Booking'
 *     responses:
 *       200:
 *         description: Booking updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 booking:
 *                   $ref: '#/components/schemas/Booking'
 *       404:
 *         description: Booking not found
 */
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { passenger_name, shuttle_id, origin, destination, departure_date,
          departure_time, duration, pickup_window, seats_left, price_per_seat, status } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE bookings SET
        passenger_name=$1, shuttle_id=$2, origin=$3, destination=$4,
        departure_date=$5, departure_time=$6, duration=$7, pickup_window=$8,
        seats_left=$9, price_per_seat=$10, status=$11
       WHERE id=$12 RETURNING *`,
      [passenger_name, shuttle_id, origin, destination, departure_date,
       departure_time, duration, pickup_window, seats_left, price_per_seat, status, id]
    );
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, booking: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @swagger
 * /api/bookings/{id}:
 *   delete:
 *     summary: Delete a booking
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Booking not found
 */
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
