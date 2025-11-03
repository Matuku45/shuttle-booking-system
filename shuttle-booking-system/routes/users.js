const express = require('express');
const router = express.Router();

// In-memory storage for users
let users = [];
let nextUserId = 1;

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: John Doe
 *                       email:
 *                         type: string
 *                         example: john@example.com
 *                       role:
 *                         type: string
 *                         example: user
 *                       created_at:
 *                         type: string
 *                         example: 2025-09-30T18:00:00Z
 */
router.get('/', (req, res) => {
  res.json({ success: true, users });
});

/**
 * @swagger
 * /users/create:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: secret123
 *               role:
 *                 type: string
 *                 example: user
 *     responses:
 *       201:
 *         description: User created successfully
 */
router.post('/create', (req, res) => {
  console.log('Received body:', req.body);
  const { name, email, password, role } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ success: false, message: 'Name, email, and password are required' });

  const existingUser = users.find(u => u.email === email);
  if (existingUser) return res.status(400).json({ success: false, message: 'Email already exists' });

  const user = {
    id: nextUserId++,
    name,
    email,
    password,
    role: role || 'user',
    created_at: new Date().toISOString()
  };
  users.push(user);
  res.status(201).json({ success: true, message: 'User created successfully', user });
});

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update a user by ID
 *     tags: [Users]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: User ID
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 */
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;

  const userIndex = users.findIndex(u => u.id == id);
  if (userIndex === -1) return res.status(404).json({ success: false, message: 'User not found' });
  const user = users[userIndex];
  Object.assign(user, {
    name: name || user.name,
    email: email || user.email,
    role: role || user.role
  });
  res.json({ success: true, message: 'User updated successfully', user });
});

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     tags: [Users]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: User ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User deleted successfully
 */
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const userIndex = users.findIndex(u => u.id == id);
  if (userIndex === -1) return res.status(404).json({ success: false, message: 'User not found' });
  users.splice(userIndex, 1);
  res.json({ success: true, message: 'User deleted successfully' });
});

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Login a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - role
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post('/login', (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) return res.status(400).json({ success: false, message: 'All fields are required' });

  const user = users.find(u => u.email === username);
  if (!user) return res.status(401).json({ success: false, message: 'User not found' });
  if (user.role !== role) return res.status(403).json({ success: false, message: 'Role mismatch' });
  if (user.password !== password) return res.status(401).json({ success: false, message: 'Invalid password' });

  res.json({ success: true, message: 'Login successful', user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

module.exports = router;
