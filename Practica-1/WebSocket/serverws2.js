// serverws2.js
const fs = require('fs');
const https = require('https');
const WebSocket = require('ws');

// Cargar certificados (generados con OpenSSL)
const server = https.createServer({
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
});

// Crear servidor WebSocket seguro (WSS)
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Cliente conectado (WSS)');

  // Enviar mensaje cada 3 segundos
  const interval = setInterval(() => {
    ws.send(`Hora del servidor: ${new Date().toLocaleTimeString()}`);
  }, 3000);

  // Manejar cierre de conexión
  ws.on('close', () => {
    console.log('Cliente desconectado');
    clearInterval(interval);
  });
});

// El servidor HTTPS escucha en el puerto 8095
server.listen(8095, () => {
  console.log('Servidor WSS corriendo en wss://localhost:8095');
});
