const { Pool } = require('pg');
require('dotenv').config({ path: 'Safed-Injera-Backend/.env' });
const pool = new Pool();
pool.query('SELECT * FROM stocks').then(res => {
  console.log(res.rows);
  process.exit();
}).catch(err => {
  console.error(err);
  process.exit(1);
});
