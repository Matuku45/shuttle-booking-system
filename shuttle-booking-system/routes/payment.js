const express = require('express');
const router = express.Router();

// In-memory storage for payments
let payments = [];
let nextPaymentId = 1;

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
router.get('/', (req, res) => {
  res.json({ success: true, payments });
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
router.post('/create', (req, res) => {
  const { passenger_name, shuttle_id, booking_id, amount, status } = req.body;
  const payment = {
    id: nextPaymentId++,
    passenger_name,
    shuttle_id,
    booking_id: booking_id || null,
    amount,
    status: status || 'Pending',
    payment_date: new Date().toISOString()
  };
  payments.push(payment);
  res.status(201).json({ success: true, payment });
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
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { amount, status } = req.body;
  const paymentIndex = payments.findIndex(p => p.id == id);
  if (paymentIndex === -1) return res.status(404).json({ success: false, message: 'Payment not found' });
  const payment = payments[paymentIndex];
  Object.assign(payment, {
    amount: amount || payment.amount,
    status: status || payment.status,
    payment_date: new Date().toISOString()
  });
  res.json({ success: true, payment });
});

module.exports = router;
