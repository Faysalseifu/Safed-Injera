const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool();
pool.query('SELECT * FROM stocks').then(res => { console.log(res.rows); process.exit(); });
