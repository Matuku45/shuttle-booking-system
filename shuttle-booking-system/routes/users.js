const express = require('express');
const router = express.Router();
const pool = require('../db'); // your PostgreSQL pool

// GET all users
router.get('/', async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT id, name, email, role, created_at FROM users ORDER BY id ASC'
    );
    res.json({ success: true, users: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Database error' });
  } finally {
    client.release();
  }
});

// POST create new user
router.post('/create', async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
  }

  const userRole = role || 'user';
  const client = await pool.connect();

  try {
    const result = await client.query(
      'INSERT INTO users(name, email, password, role) VALUES($1, $2, $3, $4) RETURNING id, name, email, role, created_at',
      [name, email, password, userRole]
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      res.status(400).json({ success: false, message: 'Email already exists' });
    } else {
      res.status(500).json({ success: false, message: 'Database error' });
    }
  } finally {
    client.release();
  }
});

// POST login user
router.post('/login', async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT id, name, email, password, role FROM users WHERE email = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    const user = result.rows[0];

    if (user.role !== role) {
      return res.status(403).json({ success: false, message: 'Role mismatch' });
    }

    if (user.password !== password) { // TODO: use bcrypt for production
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }

    res.json({
      success: true,
      message: 'Login successful',
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    client.release();
  }
});

module.exports = router;
