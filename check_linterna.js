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

const check = async () => {
    try {
        const pRes = await pool.query("SELECT id, name FROM products WHERE name LIKE '%Linterna%'");
        if (pRes.rows.length === 0) {
            console.log('Product not found');
        } else {
            console.log('Found products:', pRes.rows);
            for (const p of pRes.rows) {
                const mRes = await pool.query('SELECT count(*) FROM inventory_movements WHERE productId = $1', [p.id]);
                console.log(`Movements for ${p.name} (ID ${p.id}):`, mRes.rows[0].count);
            }
        }
        await pool.end();
    } catch (err) {
        console.error(err);
    }
};

check();
