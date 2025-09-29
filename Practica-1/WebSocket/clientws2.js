const WebSocket = require('ws');

// Ignorar validación de certificado (solo para pruebas locales con self-signed)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const ws = new WebSocket('wss://localhost:8095');

ws.on('open', () => {
  console.log('Conectado al servidor WSS');
});

ws.on('message', (message) => {
  console.log(`Mensaje recibido del servidor: ${message}`);
});

ws.on('close', () => {
  console.log('Conexión cerrada por el servidor');
});

ws.on('error', (error) => {
  console.error('Error en la conexión:', error);
});
