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

const checkData = async () => {
    try {
        console.log("Checking Products...");
        const products = await pool.query("SELECT id, name FROM products");
        console.log("Products:", products.rows);

        console.log("\nChecking Supplier Products...");
        const sp = await pool.query("SELECT * FROM supplier_products");
        console.log("Supplier Products:", sp.rows);

        await pool.end();
    } catch (err) {
        console.error("Error:", err);
    }
};

checkData();
