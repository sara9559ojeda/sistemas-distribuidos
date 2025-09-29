// estudiante.js (versión con temporizador)
const amqp = require('amqplib');
const readline = require('readline');

const RABBITMQ_URL = 'amqp://10.162.38.140';
const TIEMPO_LIMITE = 5000; // 5000 milisegundos = 5 segundos

// Creamos una interfaz de readline que pueda ser reiniciada
let rl;
function crearInterfazReadline() {
    if (rl) {
        rl.close();
    }
    rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
}
crearInterfazReadline();

async function iniciarEstudiante() {
    const estudianteId = process.argv[2];
    if (!estudianteId) {
        console.error("Error: Debes proporcionar un ID de estudiante. Ej: node estudiante.js estudiante.leidy");
        process.exit(1);
    }
    console.log(`[${estudianteId}] 🎓 Iniciando microservicio...`);

    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();
        const exchange = 'aula_exchange';
        await channel.assertExchange(exchange, 'direct', { durable: false });

        const q = await channel.assertQueue(estudianteId + '_queue', { durable: true });
        console.log(`[${estudianteId}] Conectado y esperando mensajes. Tienes ${TIEMPO_LIMITE / 1000} segundos para responder.`);
        await channel.bindQueue(q.queue, exchange, estudianteId);

        channel.consume(q.queue, (msg) => {
            if (msg.content) {
                let respondido = false;
                
                // --- LÓGICA DEL TEMPORIZADOR ---
                
                // 1. Iniciar el temporizador de 5 segundos
                const temporizador = setTimeout(() => {
                    if (!respondido) {
                        respondido = true;
                        console.log('\n⌛️ ¡Tiempo agotado!');
                        
                        // Enviar respuesta de tiempo agotado
                        channel.sendToQueue(msg.properties.replyTo,
                            Buffer.from('¡Tiempo agotado!'), {
                                correlationId: msg.properties.correlationId
                            });
                        
                        rl.close(); // Cerrar la interfaz para que no se pueda escribir más
                        crearInterfazReadline(); // Crear una nueva para la siguiente pregunta
                        console.log(`\nEsperando nuevas preguntas...`);
                    }
                }, TIEMPO_LIMITE);

                // 2. Mostrar la pregunta y esperar la entrada del usuario
                const pregunta = msg.content.toString();
                rl.question(`\n[${estudianteId}] 📥 Pregunta: "${pregunta}"\nTu respuesta > `, (respuesta) => {
                    if (!respondido) {
                        respondido = true;
                        clearTimeout(temporizador); // 3. Cancelar el temporizador si responde a tiempo
                        
                        // Enviar la respuesta del estudiante
                        channel.sendToQueue(msg.properties.replyTo,
                            Buffer.from(respuesta), {
                                correlationId: msg.properties.correlationId
                            });
                        console.log(`[${estudianteId}] ✅ ¡Respuesta enviada! Esperando nuevas preguntas.`);
                    }
                });
                
                channel.ack(msg);
            }
        });
    } catch (error) {
        console.error("Error:", error);
    }
}

iniciarEstudiante();