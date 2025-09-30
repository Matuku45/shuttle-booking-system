const express = require('express');
const router = express.Router();
const pool = require('../db'); // your PostgreSQL pool

// --- Ensure shuttle table exists ---
(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS shuttles (
        id SERIAL PRIMARY KEY,
        route TEXT NOT NULL,
        date DATE NOT NULL,
        time TIME NOT NULL,
        duration TEXT NOT NULL,
        pickup TEXT NOT NULL,
        seats INT NOT NULL,
        price NUMERIC NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Shuttle table ready');
  } catch (err) {
    console.error('❌ Error creating shuttle table:', err);
  }
})();

// --- Routes ---

// GET all shuttles
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM shuttles ORDER BY date, time');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST add new shuttle
// POST add new shuttle
router.post('/add', async (req, res) => {
  const { route, date, time, duration, pickup, seats, price } = req.body;
  if (!route || !date || !time || !duration || !pickup || !seats || !price) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO shuttles (route, date, time, duration, pickup, seats, price)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [route, date, time, duration, pickup, seats, price]
    );

    // ✅ Return the new shuttle plus a success message
    res.status(201).json({ shuttle: rows[0], message: `Shuttle for "${route}" on ${date} created successfully!` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// PUT edit shuttle
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { route, date, time, duration, pickup, seats, price } = req.body;

  try {
    const { rows } = await pool.query(
      `UPDATE shuttles
       SET route=$1, date=$2, time=$3, duration=$4, pickup=$5, seats=$6, price=$7, updated_at=NOW()
       WHERE id=$8
       RETURNING *`,
      [route, date, time, duration, pickup, seats, price, id]
    );
    if (!rows[0]) return res.status(404).json({ message: "Shuttle not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE shuttle
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM shuttles WHERE id=$1', [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ message: "Shuttle not found" });
    res.json({ message: "Shuttle deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
