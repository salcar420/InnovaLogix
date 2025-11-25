import React, { useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import './TrendsChart.css';

const TrendsChart = () => {
    const { sales } = useStore();

    const data = useMemo(() => {
        const days = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d;
        });

        return last7Days.map(date => {
            const dateStr = date.toISOString().split('T')[0];
            const daySales = sales.filter(s => s.date.startsWith(dateStr));
            const total = daySales.reduce((sum, s) => sum + s.total, 0);
            return {
                label: days[date.getDay()],
                value: total,
                date: dateStr
            };
        });
    }, [sales]);

    const maxValue = Math.max(...data.map(d => d.value), 100); // Min 100 to avoid div by zero

    return (
        <div className="trends-chart">
            <div className="chart-header">
                <h3>Tendencia de Ventas (Últimos 7 Días)</h3>
            </div>

            <div className="bar-chart-container">
                <div className="y-axis">
                    <span>S/ {maxValue.toFixed(0)}</span>
                    <span>S/ {(maxValue / 2).toFixed(0)}</span>
                    <span>0</span>
                </div>
                <div className="bars-area">
                    {data.map((item, index) => (
                        <div key={index} className="bar-group">
                            <div
                                className="bar"
                                style={{ height: `${(item.value / maxValue) * 100}%` }}
                                title={`${item.date}: S/ ${item.value.toFixed(2)}`}
                            ></div>
                            <span className="bar-label">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TrendsChart;
