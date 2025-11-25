import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

console.log('Env Keys:', Object.keys(process.env).filter(k => k.startsWith('DB_')));
console.log('DB Config:', {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
    passwordLength: process.env.DB_PASSWORD ? process.env.DB_PASSWORD.length : 'undefined'
});

async function fixNegativeStock() {
    try {
        console.log('Checking for negative stock...');

        // Check for negative stock
        const checkRes = await pool.query('SELECT * FROM products WHERE stock < 0');

        if (checkRes.rows.length === 0) {
            console.log('No products found with negative stock.');
        } else {
            console.log(`Found ${checkRes.rows.length} products with negative stock:`);
            checkRes.rows.forEach(p => {
                console.log(`- ${p.name}: ${p.stock}`);
            });

            // Update to 0
            const updateRes = await pool.query('UPDATE products SET stock = 0 WHERE stock < 0');
            console.log(`Updated ${updateRes.rowCount} products to 0 stock.`);
        }

    } catch (err) {
        console.error('Error fixing stock:', err);
    } finally {
        await pool.end();
    }
}

fixNegativeStock();
