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

const generateFullHistory = async () => {
    const client = await pool.connect();
    try {
        console.log("Starting full history generation...");
        await client.query('BEGIN');

        // 1. Cleanup
        console.log("Cleaning up old data...");
        await client.query("TRUNCATE TABLE sales, sale_items, purchases, purchase_items, inventory_movements RESTART IDENTITY CASCADE");

        // Get Products & Suppliers
        const productsRes = await client.query("SELECT * FROM products");
        let products = productsRes.rows;
        const suppliersRes = await client.query("SELECT * FROM suppliers");
        const suppliers = suppliersRes.rows;

        if (products.length === 0 || suppliers.length === 0) {
            throw new Error("Need products and suppliers to generate history.");
        }

        // 2. Initialization (Day -30)
        console.log("Initializing stock...");
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 30);

        // Map to track current stock in memory during simulation
        const stockMap = {};

        for (const p of products) {
            const initialStock = Math.floor(Math.random() * 20) + 10; // 10-30 initial
            stockMap[p.id] = initialStock;

            // Record Initial Movement
            await client.query(
                `INSERT INTO inventory_movements (productId, type, quantity, previousStock, newStock, reference, timestamp)
                 VALUES ($1, 'INITIAL_STOCK', $2, 0, $3, 'Initial Setup', $4)`,
                [p.id, initialStock, initialStock, startDate.toISOString()]
            );
        }

        // 3. Simulation Loop
        console.log("Simulating 30 days of activity...");
        for (let i = 30; i >= 0; i--) {
            const currentDate = new Date(today);
            currentDate.setDate(currentDate.getDate() - i);
            const dateStr = currentDate.toISOString();

            // --- DAILY SALES ---
            // Random number of sales (0-5)
            const numSales = Math.floor(Math.random() * 6);

            for (let s = 0; s < numSales; s++) {
                const numItems = Math.floor(Math.random() * 3) + 1;
                let saleTotal = 0;
                const saleItems = [];

                // Select items
                for (let k = 0; k < numItems; k++) {
                    const p = products[Math.floor(Math.random() * products.length)];
                    if (stockMap[p.id] > 0) {
                        const qty = Math.min(Math.floor(Math.random() * 3) + 1, stockMap[p.id]);
                        saleItems.push({ product: p, qty });
                        saleTotal += p.price * qty;
                        stockMap[p.id] -= qty;
                    }
                }

                if (saleItems.length > 0) {
                    // Create Sale
                    const saleRes = await client.query(
                        `INSERT INTO sales (date, total, items, paymentMethod, receiptType, receiptNumber, clientName) 
                         VALUES ($1, $2, $3, 'Efectivo', 'Boleta', $4, 'Cliente Simulado') RETURNING id`,
                        [dateStr, saleTotal, saleItems.length, `B001-${1000 + i * 10 + s}`]
                    );
                    const saleId = saleRes.rows[0].id;

                    // Create Items & Movements
                    for (const item of saleItems) {
                        await client.query(
                            "INSERT INTO sale_items (saleId, productName, quantity, price) VALUES ($1, $2, $3, $4)",
                            [saleId, item.product.name, item.qty, item.product.price]
                        );

                        const prevStock = stockMap[item.product.id] + item.qty;
                        await client.query(
                            `INSERT INTO inventory_movements (productId, type, quantity, previousStock, newStock, reference, timestamp)
                             VALUES ($1, 'SALE', $2, $3, $4, $5, $6)`,
                            [item.product.id, -item.qty, prevStock, stockMap[item.product.id], `Sale #${saleId}`, dateStr]
                        );
                    }
                }
            }

            // --- REPLENISHMENT CHECK ---
            for (const p of products) {
                if (stockMap[p.id] <= (p.minstock || 5)) {
                    // 50% chance to reorder if low stock
                    if (Math.random() > 0.5) {
                        const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
                        const reorderQty = Math.floor(Math.random() * 20) + 10;
                        const cost = p.cost * reorderQty;

                        // Create Purchase
                        const purchaseRes = await client.query(
                            `INSERT INTO purchases (supplierId, supplierName, total, date, invoiceNumber, status, estimatedDelivery) 
                             VALUES ($1, $2, $3, $4, $5, 'Confirmed', $6) RETURNING id`,
                            [supplier.id, supplier.name, cost, dateStr, `INV-${2000 + i}-${p.id}`, dateStr]
                        );
                        const purchaseId = purchaseRes.rows[0].id;

                        // Purchase Item
                        await client.query(
                            "INSERT INTO purchase_items (purchaseId, productId, productName, quantity, cost) VALUES ($1, $2, $3, $4, $5)",
                            [purchaseId, p.id, p.name, reorderQty, p.cost]
                        );

                        // Update Stock & Movement
                        const prevStock = stockMap[p.id];
                        stockMap[p.id] += reorderQty;

                        await client.query(
                            `INSERT INTO inventory_movements (productId, type, quantity, previousStock, newStock, reference, timestamp)
                             VALUES ($1, 'PURCHASE_CONFIRM', $2, $3, $4, $5, $6)`,
                            [p.id, reorderQty, prevStock, stockMap[p.id], `Purchase #${purchaseId}`, dateStr]
                        );
                    }
                }
            }
        }

        // 4. Finalization: Sync Products Table
        console.log("Syncing final stock to products table...");
        for (const [id, stock] of Object.entries(stockMap)) {
            await client.query("UPDATE products SET stock = $1 WHERE id = $2", [stock, id]);
        }

        await client.query('COMMIT');
        console.log("Full history generated successfully!");

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Error generating history:", err);
    } finally {
        client.release();
        await pool.end();
    }
};

generateFullHistory();
