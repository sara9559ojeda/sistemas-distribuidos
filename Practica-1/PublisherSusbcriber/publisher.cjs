// Example:  publisher and a subscriber arquitecture using MQTT broker 
//           Install Mosquitto broker https://mosquitto.org/download/ for windows
//           Install Mosquitto broker for Linux sudo apt-get install mosquitto
// El broker MQTT actúa como intermediario
// El subscriptor se conecta y suscribe al tópico "casa/temperatura"
// El publicador envía mensajes cada 3 segundos al mismo tópico
// El broker redirige los mensajes a todos los subscriptores del tópico



const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://localhost');

let temperatura = 20;

setInterval(() => {
  temperatura += (Math.random() - 0.5); // Variación aleatoria
  const mensaje = JSON.stringify({
    temperatura: temperatura.toFixed(1),
    timestamp: new Date().toISOString()
  });
  
  client.publish('casa/temperatura', mensaje);
  console.log(`Mensaje enviado: ${mensaje}`);
}, 3000);

client.on('error', (err) => {
  console.error('Error:', err);
});