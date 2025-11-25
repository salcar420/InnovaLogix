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

const initKardex = async () => {
    try {
        console.log("Initializing inventory_movements table...");
        await pool.query(`CREATE TABLE IF NOT EXISTS inventory_movements (
            id SERIAL PRIMARY KEY,
            productId INTEGER REFERENCES products(id),
            type TEXT,
            quantity INTEGER,
            previousStock INTEGER,
            newStock INTEGER,
            reference TEXT,
            timestamp TEXT
        )`);
        console.log("Table created or already exists.");
        await pool.end();
    } catch (err) {
        console.error("Error:", err);
    }
};

initKardex();
