const express = require('express');
const router = express.Router();
const pool = require('../db');

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment management endpoints
 * 
 * components:
 *   schemas:
 *     Payment:
 *       type: object
 *       required:
 *         - passenger_name
 *         - shuttle_id
 *         - amount
 *       properties:
 *         id:
 *           type: integer
 *         passenger_name:
 *           type: string
 *         shuttle_id:
 *           type: integer
 *         booking_id:
 *           type: integer
 *         amount:
 *           type: number
 *         status:
 *           type: string
 *           default: Pending
 *         payment_date:
 *           type: string
 *           format: date-time
 *         created_at:
 *           type: string
 *           format: date-time
 */

// Ensure payments table exists
(async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        passenger_name VARCHAR(100) NOT NULL,
        shuttle_id INT NOT NULL,
        booking_id INT,
        amount NUMERIC(10,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'Pending',
        payment_date TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('Payments table ready');
  } catch (err) {
    console.error('Error creating payments table:', err);
  } finally {
    client.release();
  }
})();

// GET all payments
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM payments ORDER BY id ASC');
    res.json({ success: true, payments: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// CREATE payment
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

// UPDATE payment
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
