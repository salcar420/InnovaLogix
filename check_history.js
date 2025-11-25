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

const checkHistory = async () => {
    try {
        console.log("Checking database stats...");

        const sales = await pool.query("SELECT count(*) FROM sales");
        console.log(`Sales: ${sales.rows[0].count}`);

        const purchases = await pool.query("SELECT count(*) FROM purchases");
        console.log(`Purchases: ${purchases.rows[0].count}`);

        const movements = await pool.query("SELECT count(*) FROM inventory_movements");
        console.log(`Inventory Movements: ${movements.rows[0].count}`);

        const products = await pool.query("SELECT id, name, stock FROM products LIMIT 5");
        console.log("\nSample Products:");
        products.rows.forEach(p => console.log(`- ${p.name}: ${p.stock}`));

        const sampleKardex = await pool.query("SELECT * FROM inventory_movements WHERE productId = $1 ORDER BY id DESC LIMIT 5", [products.rows[0].id]);
        console.log(`\nLast 5 movements for ${products.rows[0].name}:`);
        sampleKardex.rows.forEach(m => console.log(`- ${m.type}: ${m.quantity} (Stock: ${m.previousstock} -> ${m.newstock})`));

        await pool.end();
    } catch (err) {
        console.error("Error:", err);
    }
};

checkHistory();
