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

const checkDB = async () => {
    try {
        console.log("Checking supplier_products table...");

        // Check columns
        const cols = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'supplier_products';
        `);
        console.log("Columns:", cols.rows);

        // Check content
        const rows = await pool.query("SELECT * FROM supplier_products");
        console.log("Rows count:", rows.rowCount);
        console.log("First 5 rows:", rows.rows.slice(0, 5));

        await pool.end();
    } catch (err) {
        console.error("Error:", err);
    }
};

checkDB();
