const express = require('express');
const router = express.Router();

// In-memory storage for shuttles
let shuttles = [];
let nextShuttleId = 1;

/**
 * @swagger
 * tags:
 *   name: Shuttles
 *   description: Shuttle management endpoints
 */

/**
 * @swagger
 * /api/shuttles:
 *   get:
 *     summary: Get all shuttles
 *     tags: [Shuttles]
 *     responses:
 *       200:
 *         description: List of shuttles
 */
router.get('/', (req, res) => {
  shuttles.sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time));
  res.json({ success: true, shuttles });
});

/**
 * @swagger
 * /api/shuttles/add:
 *   post:
 *     summary: Add a new shuttle
 *     tags: [Shuttles]
 */
router.post('/add', (req, res) => {
  const { route, date, time, duration, pickup, seats, price } = req.body;
  const shuttle = {
    id: nextShuttleId++,
    route,
    date,
    time,
    duration,
    pickup,
    seats,
    price,
    updated_at: new Date().toISOString()
  };
  shuttles.push(shuttle);
  res.status(201).json({ success: true, shuttle });
});

/**
 * @swagger
 * /api/shuttles/{id}:
 *   put:
 *     summary: Update a shuttle
 *     tags: [Shuttles]
 */
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { route,date,time,duration,pickup,seats,price } = req.body;
  const shuttleIndex = shuttles.findIndex(s => s.id == id);
  if (shuttleIndex === -1) return res.status(404).json({ success: false, message: 'Shuttle not found' });
  const shuttle = shuttles[shuttleIndex];
  Object.assign(shuttle, {
    route: route || shuttle.route,
    date: date || shuttle.date,
    time: time || shuttle.time,
    duration: duration || shuttle.duration,
    pickup: pickup || shuttle.pickup,
    seats: seats || shuttle.seats,
    price: price || shuttle.price,
    updated_at: new Date().toISOString()
  });
  res.json({ success: true, shuttle });
});

/**
 * @swagger
 * /api/shuttles/{id}:
 *   delete:
 *     summary: Delete a shuttle
 *     tags: [Shuttles]
 */
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const shuttleIndex = shuttles.findIndex(s => s.id == id);
  if (shuttleIndex === -1) return res.status(404).json({ success: false, message: 'Shuttle not found' });
  shuttles.splice(shuttleIndex, 1);
  res.json({ success: true, message: 'Shuttle deleted' });
});

module.exports = router;
