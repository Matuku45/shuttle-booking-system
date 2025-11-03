const express = require('express');
const router = express.Router();

// In-memory storage for shuttles
let shuttles = [
  {
    id: 1,
    route: "Johannesburg to Cape Town",
    date: "2025-10-01",
    time: "08:00",
    duration: "12 hours",
    pickup: "Sandton",
    seats: 50,
    price: 1500,
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    route: "Cape Town to Durban",
    date: "2025-10-02",
    time: "10:00",
    duration: "10 hours",
    pickup: "Cape Town Central",
    seats: 40,
    price: 1200,
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    route: "Durban to Johannesburg",
    date: "2025-10-03",
    time: "14:00",
    duration: "8 hours",
    pickup: "Durban Station",
    seats: 45,
    price: 1000,
    updated_at: new Date().toISOString()
  }
];
let nextShuttleId = 4;

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 shuttles:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       route:
 *                         type: string
 *                         example: "Johannesburg to Cape Town"
 *                       date:
 *                         type: string
 *                         example: "2025-10-01"
 *                       time:
 *                         type: string
 *                         example: "08:00"
 *                       duration:
 *                         type: string
 *                         example: "12 hours"
 *                       pickup:
 *                         type: string
 *                         example: "Sandton"
 *                       seats:
 *                         type: integer
 *                         example: 50
 *                       price:
 *                         type: number
 *                         example: 1500
 *                       updated_at:
 *                         type: string
 *                         example: "2025-09-30T18:00:00Z"
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
