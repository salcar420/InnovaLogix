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

const updateDB = async () => {
    try {
        console.log("Updating supplier_products table...");

        // Add stock column if not exists
        await pool.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'supplier_products' AND column_name = 'stock') THEN 
                    ALTER TABLE supplier_products ADD COLUMN stock INTEGER DEFAULT 0; 
                END IF; 
            END $$;
        `);
        console.log("Column 'stock' ensured.");

        // Populate stock with random values between 10 and 60
        await pool.query(`
            UPDATE supplier_products 
            SET stock = floor(random() * (60 - 10 + 1) + 10)::int
            WHERE stock IS NULL OR stock = 0;
        `);
        console.log("Stock populated.");

        // Verify
        const res = await pool.query("SELECT * FROM supplier_products");
        console.log("Updated rows:", res.rows);

        await pool.end();
    } catch (err) {
        console.error("Error:", err);
    }
};

updateDB();
