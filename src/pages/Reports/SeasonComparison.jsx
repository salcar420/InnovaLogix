import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import './SeasonComparison.css';

const SeasonComparison = () => {
    const { sales } = useStore();
    const [period, setPeriod] = useState('15d'); // 15d, 30d

    const comparisonData = useMemo(() => {
        const today = new Date();
        const currentPeriodStart = new Date(today);
        const prevPeriodStart = new Date(today);
        const prevPeriodEnd = new Date(today);

        const days = period === '15d' ? 15 : 30;

        currentPeriodStart.setDate(today.getDate() - days);
        prevPeriodEnd.setDate(currentPeriodStart.getDate() - 1);
        prevPeriodStart.setDate(prevPeriodEnd.getDate() - days);

        const currentSales = sales.filter(s => {
            const d = new Date(s.date);
            return d >= currentPeriodStart && d <= today;
        });

        const prevSales = sales.filter(s => {
            const d = new Date(s.date);
            return d >= prevPeriodStart && d <= prevPeriodEnd;
        });

        const calcStats = (salesList) => {
            const totalSales = salesList.reduce((sum, s) => sum + s.total, 0);
            const totalOrders = salesList.length;

            // Find top product
            const productCounts = {};
            salesList.forEach(s => {
                // Assuming s.items is a count, we can't get product name from sale summary easily
                // But if we had sale items details we could. 
                // For now, we'll use a placeholder or try to fetch if available.
                // In StoreContext, sales are just the sales table. 
                // We don't have items details here without fetching sale_items.
                // So we will skip top product for now or show "N/A"
            });

            return { sales: totalSales, orders: totalOrders, topProduct: 'N/A' };
        };

        return {
            current: calcStats(currentSales),
            previous: calcStats(prevSales),
            days
        };
    }, [sales, period]);

    const { current, previous } = comparisonData;

    const salesDiff = current.sales - previous.sales;
    const salesGrowth = previous.sales > 0 ? (salesDiff / previous.sales) * 100 : (current.sales > 0 ? 100 : 0);

    return (
        <div className="season-comparison">
            <div className="comparison-controls">
                <div className="control-group">
                    <label>Periodo de Análisis</label>
                    <select value={period} onChange={e => setPeriod(e.target.value)}>
                        <option value="15d">Últimos 15 días</option>
                        <option value="30d">Últimos 30 días</option>
                    </select>
                </div>
            </div>

            <div className="comparison-cards">
                <div className="comp-card">
                    <h4>Ventas Totales</h4>
                    <div className="comp-values">
                        <div className="val-col">
                            <span>Periodo Anterior</span>
                            <strong>S/ {previous.sales.toLocaleString()}</strong>
                        </div>
                        <div className="val-col">
                            <span>Periodo Actual</span>
                            <strong>S/ {current.sales.toLocaleString()}</strong>
                        </div>
                    </div>
                    <div className={`growth-badge ${salesGrowth >= 0 ? 'positive' : 'negative'}`}>
                        {salesGrowth >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                        {Math.abs(salesGrowth).toFixed(1)}%
                    </div>
                </div>

                <div className="comp-card">
                    <h4>Pedidos Totales</h4>
                    <div className="comp-values">
                        <div className="val-col">
                            <span>Periodo Anterior</span>
                            <strong>{previous.orders}</strong>
                        </div>
                        <div className="val-col">
                            <span>Periodo Actual</span>
                            <strong>{current.orders}</strong>
                        </div>
                    </div>
                </div>

                <div className="comp-card">
                    <h4>Producto Top</h4>
                    <div className="comp-values">
                        <div className="val-col">
                            <span>Periodo Anterior</span>
                            <strong>{previous.topProduct}</strong>
                        </div>
                        <div className="val-col">
                            <span>Periodo Actual</span>
                            <strong>{current.topProduct}</strong>
                        </div>
                    </div>
                    <small style={{ display: 'block', marginTop: '5px', color: '#888' }}>* Detalle no disponible en resumen</small>
                </div>
            </div>
        </div>
    );
};

export default SeasonComparison;
