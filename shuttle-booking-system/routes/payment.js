const express = require('express');
const router = express.Router();
const pool = require('../db');

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment management endpoints
 */

/**
 * @swagger
 * /api/payments:
 *   get:
 *     summary: Get all payments
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: List of payments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 payments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Payment'
 */
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM payments ORDER BY id ASC');
    res.json({ success: true, payments: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @swagger
 * /api/payments/create:
 *   post:
 *     summary: Create a new payment
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Payment'
 *     responses:
 *       201:
 *         description: Payment created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 payment:
 *                   $ref: '#/components/schemas/Payment'
 */
router.post('/create', async (req, res) => {
  const { passenger_name, shuttle_id, booking_id, amount, status } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO payments(passenger_name, shuttle_id, booking_id, amount, status)
       VALUES($1,$2,$3,$4,$5) RETURNING *`,
      [passenger_name, shuttle_id, booking_id || null, amount, status || 'Pending']
    );
    res.status(201).json({ success: true, payment: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @swagger
 * /api/payments/{id}:
 *   put:
 *     summary: Update a payment
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Payment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 payment:
 *                   $ref: '#/components/schemas/Payment'
 */
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { amount, status } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE payments SET amount=$1, status=$2, payment_date=NOW() WHERE id=$3 RETURNING *`,
      [amount, status, id]
    );
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Payment not found' });
    res.json({ success: true, payment: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
