// npm install ws  # Instalar la librería "ws"

const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8090 });

wss.on('connection', (ws) => {
  console.log('Cliente conectado');

  // Escuchar mensajes del cliente
  ws.on('message', (message) => {
    console.log('Mensaje recibido:', message.toString());
    
    // Enviar respuesta al cliente
    ws.send(`Servidor: ¡Recibí tu mensaje! (${message})`);
  });

  // Enviar saludo al cliente al conectarse
  ws.send('¡Bienvenido al servidor WebSocket!');
});

console.log('Servidor WebSocket corriendo en ws://localhost:8080');