require('dotenv').config(); // Cargar variables de entorno del archivo .env
const amqplib = require('amqplib');
const nodemailer = require('nodemailer');

async function startEmailWorker() {
    console.log("Iniciando worker de correos...");
    try {
        // --- 1. Configuración del transporter de Nodemailer con Gmail ---
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, // Tu correo desde .env
                pass: process.env.EMAIL_PASS, // Tu contraseña de aplicación desde .env
            },
        });
        console.log("✉️  Worker conectado a Gmail.");

        // --- 2. Conexión a RabbitMQ ---
        const rabbitmqUrl = 'amqp://guest:guest@localhost:5672/';
        const connection = await amqplib.connect(rabbitmqUrl);
        const channel = await connection.createChannel();

        const queueName = 'email_queue';
        await channel.assertQueue(queueName, { durable: true });
        channel.prefetch(1); // Aceptar solo un mensaje a la vez

        console.log(`[*] Esperando tareas en la cola: ${queueName}.`);

        // --- 3. Consumir mensajes y enviar el correo ---
        channel.consume(queueName, async (msg) => {
            if (msg.content) {
                const emailTask = JSON.parse(msg.content.toString());
                console.log(`[✔] Tarea recibida. Enviando correo a: "${emailTask.to}"`);

                try {
                    await transporter.sendMail({
                        from: `"Tu Aplicación" <${process.env.EMAIL_USER}>`,
                        to: emailTask.to,
                        subject: emailTask.subject,
                        text: emailTask.body,
                        html: `<b>${emailTask.body}</b>`
                    });

                    console.log(`[🚀] Correo enviado exitosamente a: "${emailTask.to}"`);
                    channel.ack(msg); // Confirmar que el mensaje fue procesado

                } catch (emailError) {
                    console.error(`[❌] Error al enviar correo a ${emailTask.to}:`, emailError);
                    // Devolver el mensaje a la cola para un posible reintento
                    channel.nack(msg); 
                }
            }
        }, { noAck: false });

    } catch (error) {
        console.error('Error fatal en el worker:', error);
        process.exit(1);
    }
}

startEmailWorker();