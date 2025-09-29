const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://localhost');

client.on('connect', () => {
  console.log('Conectado al broker MQTT');
  client.subscribe('casa/temperatura');
});

client.on('message', (topic, message) => {
  console.log(`Mensaje recibido en ${topic}: ${message.toString()}`);
});

client.on('error', (err) => {
  console.error('Error:', err);
});