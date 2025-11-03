const express = require('express');
const router = express.Router();

// In-memory storage for bookings
let bookings = [];
let nextId = 1;

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
router.get('/', (req, res) => {
  res.json({ success: true, bookings });
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
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const booking = bookings.find(b => b.id == id);
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
  res.json({ success: true, booking });
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
router.post('/create', (req, res) => {
  let { passenger_name, shuttle_id, origin, destination, departure_date,
        departure_time, duration, pickup_window, seats_left, price_per_seat } = req.body;

  shuttle_id = parseInt(shuttle_id);
  seats_left = parseInt(seats_left);
  pickup_window = parseInt(pickup_window) || 15;
  duration = parseFloat(duration) || null;
  price_per_seat = parseFloat(price_per_seat) || 0;

  if (isNaN(shuttle_id)) return res.status(400).json({ success: false, message: 'Invalid shuttle_id' });
  if (isNaN(seats_left) || seats_left <= 0) return res.status(400).json({ success: false, message: 'No seats left' });

  const booking = {
    id: nextId++,
    passenger_name,
    shuttle_id,
    origin,
    destination,
    departure_date,
    departure_time,
    duration,
    pickup_window,
    seats_left: seats_left - 1,
    price_per_seat,
    status: 'Pending',
    created_at: new Date().toISOString()
  };
  bookings.push(booking);
  res.status(201).json({ success: true, booking });
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
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { passenger_name, shuttle_id, origin, destination, departure_date,
          departure_time, duration, pickup_window, seats_left, price_per_seat, status } = req.body;
  const bookingIndex = bookings.findIndex(b => b.id == id);
  if (bookingIndex === -1) return res.status(404).json({ success: false, message: 'Booking not found' });
  const booking = bookings[bookingIndex];
  Object.assign(booking, {
    passenger_name: passenger_name || booking.passenger_name,
    shuttle_id: shuttle_id || booking.shuttle_id,
    origin: origin || booking.origin,
    destination: destination || booking.destination,
    departure_date: departure_date || booking.departure_date,
    departure_time: departure_time || booking.departure_time,
    duration: duration || booking.duration,
    pickup_window: pickup_window || booking.pickup_window,
    seats_left: seats_left || booking.seats_left,
    price_per_seat: price_per_seat || booking.price_per_seat,
    status: status || booking.status
  });
  res.json({ success: true, booking });
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
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const bookingIndex = bookings.findIndex(b => b.id == id);
  if (bookingIndex === -1) return res.status(404).json({ success: false, message: 'Booking not found' });
  bookings.splice(bookingIndex, 1);
  res.json({ success: true, message: 'Booking deleted' });
});

module.exports = router;
