import { io } from 'socket.io-client';

class SocketService {
    constructor() {
        this.socket = null;
        this.listeners = new Map();
    }

    connect(url = 'http://localhost:3001') {
        if (!this.socket) {
            this.socket = io(url, {
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionAttempts: 5
            });

            this.socket.on('connect', () => {
                console.log('✅ WebSocket conectado:', this.socket.id);
            });

            this.socket.on('disconnect', (reason) => {
                console.log('❌ WebSocket desconectado:', reason);
            });

            this.socket.on('connect_error', (error) => {
                console.error('❌ Error de conexión WebSocket:', error);
            });
        }
        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.listeners.clear();
        }
    }

    // Subscribe to stock updates
    onStockUpdate(callback) {
        if (!this.socket) {
            console.warn('Socket no conectado. Conectando...');
            this.connect();
        }

        const wrappedCallback = (data) => {
            console.log('📦 Actualización de stock recibida:', data);
            callback(data);
        };

        this.socket.on('stockUpdate', wrappedCallback);
        
        // Store reference for cleanup
        const listenerId = `stockUpdate_${Date.now()}`;
        this.listeners.set(listenerId, { event: 'stockUpdate', callback: wrappedCallback });
        
        return listenerId;
    }

    // Unsubscribe from stock updates
    offStockUpdate(listenerId) {
        const listener = this.listeners.get(listenerId);
        if (listener && this.socket) {
            this.socket.off(listener.event, listener.callback);
            this.listeners.delete(listenerId);
        }
    }

    // Remove all listeners for an event
    removeAllListeners(event) {
        if (this.socket) {
            this.socket.removeAllListeners(event);
        }
        // Clean up internal tracking
        for (const [key, value] of this.listeners.entries()) {
            if (value.event === event) {
                this.listeners.delete(key);
            }
        }
    }

    isConnected() {
        return this.socket && this.socket.connected;
    }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;
