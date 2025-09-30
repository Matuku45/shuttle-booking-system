require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool();

pool.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch(err => console.error(' PostgreSQL connection error', err));

module.exports = pool;
