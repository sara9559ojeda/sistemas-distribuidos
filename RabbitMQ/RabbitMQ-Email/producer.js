const amqplib = require('amqplib');

const rabbitmqUrl = 'amqp://guest:guest@localhost:5672/';

async function publishEmails() {
    try {
        const connection = await amqplib.connect(rabbitmqUrl);
        const channel = await connection.createChannel();

        const queueName = 'email_queue';
        await channel.assertQueue(queueName, { durable: true });

        const emails = [
            
            'acde100@gmail.com',
            'acdeplus@hotmail.com'
        ];

        console.log("Encolando tareas de correo...");
        emails.forEach(email => {
            const message = {
                to: email,
                subject: '¡Mensaje enviado usando RabbitMQ!',
                body: 'Estimados estudiantes de sistemas distribuidos.'
            };
            
            channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), { persistent: true });
            console.log(`[x] Tarea encolada para: '${email}'`);
        });

        setTimeout(() => {
            connection.close();
            process.exit(0);
        }, 500);

    } catch (error) {
        console.error('Error en el productor:', error);
    }
}

publishEmails();