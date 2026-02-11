
import { pool } from '../config/db';

async function listStocks() {
    try {
        const { rows } = await pool.query('SELECT id, product_name, quantity FROM stocks');
        console.log('Current Stocks:', JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

listStocks();
