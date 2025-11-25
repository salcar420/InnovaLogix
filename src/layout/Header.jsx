import { useStore } from '../context/StoreContext';
import { Bell, Search, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import './Header.css';

const Header = () => {
    const { isOnline, pendingSyncCount, syncPendingSales, clearPendingSales } = useStore();

    return (
        <header className="header">
            <div className="header-search">
                <Search size={20} className="search-icon" />
                <input type="text" placeholder="Buscar..." className="search-input" />
            </div>

            <div className="header-actions">
                {/* Network Status Indicator */}
                <div className={`status-indicator ${isOnline ? 'online' : 'offline'}`} title={isOnline ? "Conectado" : "Sin conexión"}>
                    {isOnline ? <Wifi size={18} /> : <WifiOff size={18} />}
                    <span className="status-text">{isOnline ? 'Online' : 'Offline'}</span>
                </div>

                {/* Sync Indicator */}
                {pendingSyncCount > 0 && (
                    <div className="sync-indicator-container">
                        <div
                            className="sync-indicator"
                            title="Click para reintentar sincronización"
                            onClick={() => syncPendingSales()}
                            style={{ cursor: 'pointer' }}
                        >
                            <RefreshCw size={18} className="spin-icon" />
                            <span className="sync-text">{pendingSyncCount} Pendientes</span>
                        </div>
                        <button
                            className="clear-sync-btn"
                            title="Descartar ventas pendientes (Usar con precaución)"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm("¿Estás seguro de eliminar las ventas pendientes? Se perderán si no se han guardado.")) {
                                    clearPendingSales();
                                }
                            }}
                        >
                            ×
                        </button>
                    </div>
                )}

                <button className="icon-button">
                    <Bell size={20} />
                    <span className="notification-badge">3</span>
                </button>
            </div>
        </header>
    );
};

export default Header;
