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

const generateHistory = async () => {
    const client = await pool.connect();
    try {
        console.log("Generating historical data...");
        await client.query('BEGIN');

        // Get products
        const productsRes = await client.query("SELECT * FROM products");
        const products = productsRes.rows;

        if (products.length === 0) {
            console.log("No products found.");
            return;
        }

        // Generate sales for the last 30 days
        const today = new Date();

        for (let i = 30; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString();

            // Random number of sales per day (0 to 3)
            const numSales = Math.floor(Math.random() * 4);

            for (let s = 0; s < numSales; s++) {
                // Random items per sale (1 to 3)
                const numItems = Math.floor(Math.random() * 3) + 1;
                let saleTotal = 0;
                const saleItems = [];

                for (let itemIdx = 0; itemIdx < numItems; itemIdx++) {
                    const product = products[Math.floor(Math.random() * products.length)];
                    const qty = Math.floor(Math.random() * 3) + 1; // 1-3 units
                    saleItems.push({ product, qty });
                    saleTotal += product.price * qty;
                }

                // Insert Sale
                const saleRes = await client.query(
                    `INSERT INTO sales (date, total, items, paymentMethod, receiptType, receiptNumber, clientName) 
                     VALUES ($1, $2, $3, 'Efectivo', 'Boleta', 'B001-HIST', 'Cliente Generado') RETURNING id`,
                    [dateStr, saleTotal, numItems]
                );
                const saleId = saleRes.rows[0].id;

                // Insert Items and Movements
                for (const item of saleItems) {
                    await client.query(
                        "INSERT INTO sale_items (saleId, productName, quantity, price) VALUES ($1, $2, $3, $4)",
                        [saleId, item.product.name, item.qty, item.product.price]
                    );

                    // We won't update current stock to avoid messing up the fixed values, 
                    // but we will record the movement so it shows in history.
                    // For the sake of the Kardex looking real, we'll assume stock was higher back then.
                    // We'll just log the movement.

                    await client.query(
                        `INSERT INTO inventory_movements (productId, type, quantity, previousStock, newStock, reference, timestamp)
                         VALUES ($1, 'SALE', $2, 0, 0, $3, $4)`,
                        [item.product.id, -item.qty, `Sale #${saleId}`, dateStr]
                    );
                }
            }
        }

        console.log("Historical data generated successfully.");
        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Error generating history:", err);
    } finally {
        client.release();
        await pool.end();
    }
};

generateHistory();
