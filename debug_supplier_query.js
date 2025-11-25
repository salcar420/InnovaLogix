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

const debugQuery = async () => {
    try {
        console.log("Testing API Query for Supplier 1...");
        const res1 = await pool.query(`
            SELECT sp.*, p.name as productName, p.category 
            FROM supplier_products sp 
            JOIN products p ON sp.productId = p.id 
            WHERE sp.supplierId = 1
        `);
        console.log("Supplier 1 Rows:", res1.rows);

        console.log("\nTesting API Query for Supplier 2...");
        const res2 = await pool.query(`
            SELECT sp.*, p.name as productName, p.category 
            FROM supplier_products sp 
            JOIN products p ON sp.productId = p.id 
            WHERE sp.supplierId = 2
        `);
        console.log("Supplier 2 Rows:", res2.rows);

        await pool.end();
    } catch (err) {
        console.error("Error:", err);
    }
};

debugQuery();
