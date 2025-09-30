const express = require('express');
const router = express.Router();
const pool = require('../db');

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
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM shuttles ORDER BY date, time');
    res.json({ success: true, shuttles: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @swagger
 * /api/shuttles/add:
 *   post:
 *     summary: Add a new shuttle
 *     tags: [Shuttles]
 */
router.post('/add', async (req, res) => {
  const { route, date, time, duration, pickup, seats, price } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO shuttles(route,date,time,duration,pickup,seats,price)
       VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [route,date,time,duration,pickup,seats,price]
    );
    res.status(201).json({ success: true, shuttle: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @swagger
 * /api/shuttles/{id}:
 *   put:
 *     summary: Update a shuttle
 *     tags: [Shuttles]
 */
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { route,date,time,duration,pickup,seats,price } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE shuttles SET route=$1,date=$2,time=$3,duration=$4,pickup=$5,seats=$6,price=$7,updated_at=NOW()
       WHERE id=$8 RETURNING *`,
      [route,date,time,duration,pickup,seats,price,id]
    );
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Shuttle not found' });
    res.json({ success: true, shuttle: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @swagger
 * /api/shuttles/{id}:
 *   delete:
 *     summary: Delete a shuttle
 *     tags: [Shuttles]
 */
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM shuttles WHERE id=$1', [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ success: false, message: 'Shuttle not found' });
    res.json({ success: true, message: 'Shuttle deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
