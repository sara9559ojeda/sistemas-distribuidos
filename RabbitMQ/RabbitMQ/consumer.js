const amqp = require('amqplib');

const rabbitmqUrl = 'amqp://guest:guest@localhost:5672/';

async function receiveNotifications() {
    try {
        // 1. Conectarse a RabbitMQ
        const connection = await amqp.connect(rabbitmqUrl);
        const channel = await connection.createChannel();

        // 2. Definir el exchange (debe coincidir con el del productor)
        const exchangeName = 'notifications_exchange';
        await channel.assertExchange(exchangeName, 'fanout', { durable: false });

        // 3. Crear una cola temporal y exclusiva
        // El nombre vacío hace que RabbitMQ genere un nombre aleatorio.
        // `exclusive: true` significa que la cola se borrará cuando la conexión se cierre.
        const q = await channel.assertQueue('', { exclusive: true });
        console.log(`[*] Esperando notificaciones en la cola: ${q.queue}. Para salir presiona CTRL+C`);

        // 4. Crear el 'binding' entre la cola y el exchange
        await channel.bindQueue(q.queue, exchangeName, '');

        // 5. Consumir los mensajes de la cola
        channel.consume(q.queue, (msg) => {
            if (msg.content) {
                console.log(`[✔] Notificación recibida: "${msg.content.toString()}"`);
            }
        }, {
            noAck: true // Confirma automáticamente que el mensaje fue recibido
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

receiveNotifications();