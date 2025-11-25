import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import ProductGrid from './ProductGrid';
import CartSection from './CartSection';
import CheckoutModal from './CheckoutModal';
import Input from '../../components/Input';
import Button from '../../components/Button';
import './POS.css';

const POS = () => {
    const { products, loading } = useStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    const categories = ['Todos', ...new Set(products.map(p => p.category))];

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'Todos' || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    if (loading) {
        return (
            <div className="pos-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
                    <div>Cargando productos...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="pos-container">
            <div className="pos-main">
                <div className="pos-header">
                    <div className="pos-search">
                        <Input
                            placeholder="Buscar productos..."
                            icon={Search}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            fullWidth
                        />
                    </div>
                    <div className="pos-filters">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                className={`filter-chip ${selectedCategory === cat ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
                    <ProductGrid products={filteredProducts} />
                </div>
            </div>

            <div className="pos-sidebar">
                <CartSection onCheckout={() => setIsCheckoutOpen(true)} />
            </div>

            <CheckoutModal
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
            />
        </div>
    );
};

export default POS;
