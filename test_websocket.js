#!/usr/bin/env node

/**
 * Script de prueba para verificar la funcionalidad de WebSocket
 * Simula actualizaciones de stock y verifica que los eventos se emitan correctamente
 */

import { io } from 'socket.io-client';

console.log('🧪 Iniciando prueba de WebSocket...\n');

// Conectar al servidor
const socket = io('http://localhost:3001', {
    transports: ['websocket', 'polling']
});

let updateCount = 0;
const startTime = Date.now();

socket.on('connect', () => {
    console.log('✅ Conectado al servidor WebSocket');
    console.log(`   ID de Socket: ${socket.id}\n`);

    // Escuchar actualizaciones de stock
    socket.on('stockUpdate', (data) => {
        updateCount++;
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
        
        console.log(`📦 Actualización #${updateCount} recibida (${elapsed}s):`);
        console.log(`   Producto: ${data.productName || 'ID: ' + data.productId}`);
        console.log(`   Stock: ${data.stock}`);
        console.log(`   Acción: ${data.action}`);
        
        if (data.quantitySold) {
            console.log(`   Cantidad vendida: ${data.quantitySold}`);
        }
        if (data.quantityAdded) {
            console.log(`   Cantidad agregada: ${data.quantityAdded}`);
        }
        console.log('');
    });

    console.log('👂 Escuchando actualizaciones de stock...');
    console.log('💡 Realiza una venta en el POS o edita un producto en Inventario\n');
    console.log('⏹️  Presiona Ctrl+C para detener\n');
});

socket.on('connect_error', (error) => {
    console.error('❌ Error de conexión:', error.message);
    console.error('💡 Asegúrate de que el servidor esté corriendo en puerto 3001\n');
});

socket.on('disconnect', (reason) => {
    console.log(`\n❌ Desconectado del servidor: ${reason}`);
    
    if (updateCount > 0) {
        console.log(`\n📊 Resumen de la prueba:`);
        console.log(`   Total de actualizaciones recibidas: ${updateCount}`);
        console.log(`   Tiempo de prueba: ${((Date.now() - startTime) / 1000).toFixed(2)}s`);
        console.log(`   ✅ La funcionalidad de WebSocket está operativa\n`);
    }
    
    process.exit(0);
});

// Manejo de cierre limpio
process.on('SIGINT', () => {
    console.log('\n\n🛑 Deteniendo prueba...');
    socket.disconnect();
});

// Timeout de 60 segundos
setTimeout(() => {
    console.log('\n⏱️  Tiempo de prueba agotado');
    socket.disconnect();
}, 60000);
