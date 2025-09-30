const pool = require('../db');

// Create Users table if it doesn't exist
const createUsersTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(100) NOT NULL,
      role VARCHAR(50) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(query);
    console.log('✅ Users table is ready');
  } catch (err) {
    console.error('❌ Error creating users table', err);
  }
};

// Insert a new user
const createUser = async ({ name, email, password, role }) => {
  const result = await pool.query(
    'INSERT INTO users(name, email, password, role) VALUES($1, $2, $3, $4) RETURNING id, name, email, role, created_at',
    [name, email, password, role]
  );
  return result.rows[0];
};

// Get all users
const getAllUsers = async () => {
  const result = await pool.query('SELECT id, name, email, role, created_at FROM users ORDER BY id ASC');
  return result.rows;
};

module.exports = {
  createUsersTable,
  createUser,
  getAllUsers,
};
