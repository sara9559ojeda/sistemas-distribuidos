// estudiante.js
const amqp = require('amqplib');

// Reemplaza 'localhost' con la IP de la máquina donde corre RabbitMQ
const RABBITMQ_URL = 'amqp://192.168.20.242'; 

async function iniciarEstudiante() {
    // Tomar el ID del estudiante de los argumentos de la línea de comandos
    const estudianteId = process.argv[2];
    if (!estudianteId) {
        console.error("Error: Debes proporcionar un ID de estudiante. Ej: node estudiante.js estudiante.ana.gomez");
        process.exit(1);
    }

    console.log(`[${estudianteId}] 🎓 Iniciando microservicio...`);

    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        const exchange = 'aula_exchange';

        await channel.assertExchange(exchange, 'direct', { durable: false });

        // Crear una cola con el nombre del ID del estudiante
        const q = await channel.assertQueue(estudianteId + '_queue', { durable: true });
        console.log(`[${estudianteId}] Esperando mensajes en la cola ${q.queue}. Para salir, presiona CTRL+C`);

        // Enlazar la cola al exchange con la routing key del estudiante
        await channel.bindQueue(q.queue, exchange, estudianteId);

        channel.consume(q.queue, (msg) => {
            if (msg.content) {
                const pregunta = msg.content.toString();
                console.log(`[${estudianteId}] 📥 Mensaje recibido: "${pregunta}"`);

                // Procesar el mensaje y preparar una respuesta
                const respuesta = "Bogotá"; // Respuesta del estudiante

                // Enviar la respuesta a la cola especificada en 'replyTo'
                channel.sendToQueue(msg.properties.replyTo,
                    Buffer.from(respuesta), {
                        correlationId: msg.properties.correlationId // Incluir el mismo correlationId
                    });

                // Confirmar que el mensaje fue procesado
                channel.ack(msg);
                console.log(`[${estudianteId}] ✅ Respuesta enviada.`);
            }
        });

    } catch (error) {
        console.error("Error:", error);
    }
}

iniciarEstudiante();