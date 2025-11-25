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
        const res = await pool.query("SELECT * FROM products");
        const products = res.rows;

        const sales = await pool.query(`
            SELECT si.productName, SUM(si.quantity) as totalSold
            FROM sale_items si
            JOIN sales s ON si.saleId = s.id
            WHERE s.date::timestamp >= NOW() - INTERVAL '30 days'
            GROUP BY si.productName
        `);
        const salesMap = {};
        sales.rows.forEach(s => salesMap[s.productname] = parseInt(s.totalsold));

        console.log("--- ALERT ANALYSIS ---");
        products.forEach(p => {
            const totalSold = salesMap[p.name] || 0;
            const avgDaily = totalSold / 30;
            const dynamicMin = Math.ceil(avgDaily * 7);
            const effectiveMin = Math.max(dynamicMin, p.minstock || 0);

            const isRestockAlert = p.stock <= (p.minstock || 10); // Logic in RestockAlerts.jsx
            const isDynamicAlert = p.stock <= effectiveMin; // Logic in Inventory.jsx

            if (isRestockAlert || isDynamicAlert) {
                console.log(`[ALERT] ${p.name}: Stock=${p.stock}, Min=${p.minstock}, DynMin=${dynamicMin}, EffMin=${effectiveMin}`);
                console.log(`   -> RestockAlert: ${isRestockAlert}, DynamicAlert: ${isDynamicAlert}`);
            }
        });

        await pool.end();
    } catch (err) {
        console.error(err);
    }
};

check();
