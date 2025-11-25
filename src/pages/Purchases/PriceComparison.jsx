import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import './PriceComparison.css';

const PriceComparison = () => {
    const { products, suppliers, supplierProducts, syncSupplierPrices } = useStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Auto-sync prices when mounting to get latest data
        const syncAll = async () => {
            setIsLoading(true);
            for (const supplier of suppliers) {
                await syncSupplierPrices(supplier.id);
            }
            setIsLoading(false);
        };
        syncAll();
    }, [suppliers.length]); // Re-run if suppliers change

    // Group prices by product
    const productPrices = (Array.isArray(products) ? products : [])
        .filter(product => product && product.name && product.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .map(product => {
            const prices = (Array.isArray(supplierProducts) ? supplierProducts : [])
                .filter(sp => sp.productId === product.id)
                .map(sp => {
                    const supplier = Array.isArray(suppliers) ? suppliers.find(s => s.id === sp.supplierId) : null;
                    return {
                        supplierName: supplier ? supplier.name : 'Desconocido',
                        price: sp.price,
                        lastUpdated: new Date().toLocaleDateString() // Mock date
                    };
                })
                .sort((a, b) => a.price - b.price); // Sort by price ascending

            return {
                ...product,
                prices
            };
        });

    return (
        <div className="price-comparison">
            <div className="comparison-controls">
                <input
                    type="text"
                    placeholder="Buscar producto..."
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {isLoading && <div className="loading-indicator">Actualizando precios...</div>}

            <div className="comparison-grid">
                {productPrices.map(product => (
                    <div key={product.id} className="product-card">
                        <div className="product-header">
                            <h5>{product.name}</h5>
                            <span className="category-tag">{product.category}</span>
                        </div>

                        <div className="prices-list">
                            {product.prices.length > 0 ? (
                                product.prices.map((price, index) => (
                                    <div key={index} className={`price-row ${index === 0 ? 'best-price' : ''}`}>
                                        <div className="supplier-info">
                                            <span className="supplier-name">{price.supplierName}</span>
                                            {index === 0 && <span className="badge-best">Mejor Precio</span>}
                                        </div>
                                        <div className="price-value">
                                            S/ {Number(price.price || 0).toFixed(2)}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-data">No hay precios disponibles</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PriceComparison;
