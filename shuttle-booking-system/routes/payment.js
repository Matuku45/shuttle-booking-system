const express = require('express');
const router = express.Router();
const pool = require('../db'); // PostgreSQL pool

// Middleware: check if amount is provided
router.use((req, res, next) => {
  if (req.method === 'POST' && (!req.body.amount || !req.body.passenger_name || !req.body.shuttle_id)) {
    return res.status(400).json({ success: false, message: 'Amount, passenger_name, and shuttle_id are required' });
  }
  next();
});

// Create payments table if not exists
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
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM payments ORDER BY id ASC');
    res.json({ success: true, payments: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Database error' });
  } finally {
    client.release();
  }
});

// POST create payment
router.post('/create', async (req, res) => {
  const { passenger_name, shuttle_id, booking_id, amount, status } = req.body;

  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO payments(
        passenger_name, shuttle_id, booking_id, amount, status
      ) VALUES($1,$2,$3,$4,$5) RETURNING *`,
      [passenger_name, shuttle_id, booking_id || null, amount, status || 'Pending']
    );

    res.status(201).json({ success: true, payment: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Database error' });
  } finally {
    client.release();
  }
});

module.exports = router;
