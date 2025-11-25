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

const populateData = async () => {
    try {
        console.log("Populating more products...");

        const products = [
            { name: 'Mochila Hidratación', price: 150.00, cost: 90.00, stock: 15, minStock: 5, category: 'Trekking', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80' },
            { name: 'Bastones Trekking Carbono', price: 220.00, cost: 150.00, stock: 20, minStock: 5, category: 'Trekking', image: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=500&q=80' },
            { name: 'Zapatillas Trail Running', price: 380.00, cost: 250.00, stock: 12, minStock: 4, category: 'Calzado', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80' },
            { name: 'Pantalón Trekking Desmontable', price: 180.00, cost: 110.00, stock: 25, minStock: 8, category: 'Ropa', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&q=80' },
            { name: 'Gorro Lana Merino', price: 60.00, cost: 35.00, stock: 30, minStock: 10, category: 'Ropa', image: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=500&q=80' },
            { name: 'Guantes Térmicos', price: 85.00, cost: 50.00, stock: 20, minStock: 5, category: 'Ropa', image: 'https://images.unsplash.com/photo-1582142325167-206b43d56d2e?w=500&q=80' },
            { name: 'Termo Acero 1L', price: 90.00, cost: 55.00, stock: 40, minStock: 10, category: 'Accesorios', image: 'https://images.unsplash.com/photo-1602143407151-01114192003f?w=500&q=80' },
            { name: 'Navaja Multiusos', price: 120.00, cost: 75.00, stock: 15, minStock: 5, category: 'Accesorios', image: 'https://images.unsplash.com/photo-1583692331507-fc0349253331?w=500&q=80' },
            { name: 'Brújula Profesional', price: 150.00, cost: 90.00, stock: 10, minStock: 3, category: 'Accesorios', image: 'https://images.unsplash.com/photo-1589820296156-2454bb8a4d50?w=500&q=80' },
            { name: 'Colchoneta Autoinflable', price: 200.00, cost: 130.00, stock: 18, minStock: 5, category: 'Camping', image: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=500&q=80' },
            { name: 'Cocinilla Gas Portátil', price: 110.00, cost: 70.00, stock: 22, minStock: 6, category: 'Camping', image: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=500&q=80' },
            { name: 'Set Ollas Camping', price: 160.00, cost: 100.00, stock: 15, minStock: 5, category: 'Camping', image: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=500&q=80' },
            { name: 'Lámpara Gas', price: 95.00, cost: 60.00, stock: 20, minStock: 5, category: 'Camping', image: 'https://images.unsplash.com/photo-1504805572947-34fad45aed93?w=500&q=80' },
            { name: 'Cuerda Escalada 60m', price: 650.00, cost: 450.00, stock: 5, minStock: 2, category: 'Escalada', image: 'https://images.unsplash.com/photo-1526401485004-46910ecc8e51?w=500&q=80' },
            { name: 'Arnés Escalada', price: 280.00, cost: 180.00, stock: 8, minStock: 3, category: 'Escalada', image: 'https://images.unsplash.com/photo-1526401485004-46910ecc8e51?w=500&q=80' },
            { name: 'Casco Escalada', price: 220.00, cost: 140.00, stock: 10, minStock: 3, category: 'Escalada', image: 'https://images.unsplash.com/photo-1526401485004-46910ecc8e51?w=500&q=80' },
            { name: 'Mosquetones Set x5', price: 100.00, cost: 60.00, stock: 25, minStock: 8, category: 'Escalada', image: 'https://images.unsplash.com/photo-1526401485004-46910ecc8e51?w=500&q=80' },
            { name: 'Piolet Travesía', price: 350.00, cost: 230.00, stock: 6, minStock: 2, category: 'Montañismo', image: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=500&q=80' },
            { name: 'Crampones', price: 400.00, cost: 260.00, stock: 5, minStock: 2, category: 'Montañismo', image: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=500&q=80' },
            { name: 'Gafas Glaciar', price: 250.00, cost: 160.00, stock: 12, minStock: 4, category: 'Montañismo', image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&q=80' }
        ];

        for (const p of products) {
            // Insert product if not exists
            const res = await pool.query("INSERT INTO products (name, price, cost, stock, minStock, category, image) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT DO NOTHING RETURNING id",
                [p.name, p.price, p.cost, p.stock, p.minStock, p.category, p.image]
            );

            let productId;
            if (res.rows.length > 0) {
                productId = res.rows[0].id;
            } else {
                const existing = await pool.query("SELECT id FROM products WHERE name = $1", [p.name]);
                productId = existing.rows[0].id;
            }

            // Link to random suppliers (1 to 3 suppliers per product)
            const numSuppliers = Math.floor(Math.random() * 3) + 1;
            const suppliers = [1, 2, 3].sort(() => 0.5 - Math.random()).slice(0, numSuppliers);

            for (const supplierId of suppliers) {
                const supplierPrice = parseFloat((p.cost * (0.9 + Math.random() * 0.3)).toFixed(2)); // Cost +/- 15%
                const supplierStock = Math.floor(Math.random() * 50) + 10;

                await pool.query(
                    "INSERT INTO supplier_products (supplierId, productId, price, stock) VALUES ($1, $2, $3, $4)",
                    [supplierId, productId, supplierPrice, supplierStock]
                );
            }
        }

        console.log("Data populated successfully.");
        await pool.end();
    } catch (err) {
        console.error("Error:", err);
    }
};

populateData();
