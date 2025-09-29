// npm install express body-parser
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware para parsear JSON
app.use(bodyParser.json());

// Habilitar CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Ruta para manejar POST requests
app.post('/data', (req, res) => {
  console.log('Datos recibidos:', req.body);
  
  // Responder al cliente
  res.json({
    status: 'Datos recibidos!',
    receivedData: req.body
  });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});