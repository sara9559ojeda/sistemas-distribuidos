const amqp = require('amqplib');

// La URL de conexión a tu instancia de RabbitMQ
const rabbitmqUrl = 'amqp://guest:guest@localhost:5672/';

async function sendNotification() {
    try {
        // 1. Conectarse a RabbitMQ
        const connection = await amqp.connect(rabbitmqUrl);
        // creamos un canal, que es donde reside la mayor parte de la API para realizar las operaciones:
        const channel = await connection.createChannel();

        // 2. Definir el exchange (si no existe, se creará)
        const exchangeName = 'notifications_exchange';
        await channel.assertExchange(exchangeName, 'fanout', { durable: false });

        // 3. El mensaje que se va a enviar
        const message = process.argv[2] || "¡Notificación a todos los consumer!";
        
        // 4. Publicar el mensaje en el exchange
        // La routing key se deja vacía ('') porque el exchange 'fanout' ignora este valor
        channel.publish(exchangeName, '', Buffer.from(message));
        
        console.log(`[x] Notificación enviada: '${message}'`);

        // 5. Cerrar la conexión
        setTimeout(() => {
            connection.close();
            process.exit(0);
        }, 500);

    } catch (error) {
        console.error('Error:', error);
    }
}

sendNotification();