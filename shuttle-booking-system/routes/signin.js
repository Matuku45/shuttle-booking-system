const express = require('express');
const router = express.Router();

// In-memory storage for users (shared with users.js)
let users = [];

// POST /users/login
router.post('/', (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  const user = users.find(u => u.email === username);
  if (!user) {
    return res.status(401).json({ success: false, message: 'User not found' });
  }

  if (user.role !== role) {
    return res.status(403).json({ success: false, message: 'Role mismatch' });
  }

  if (user.password !== password) { // TODO: use bcrypt in production
    return res.status(401).json({ success: false, message: 'Invalid password' });
  }

  res.json({
    success: true,
    message: 'Login successful',
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

module.exports = router;
