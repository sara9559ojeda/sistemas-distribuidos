// 1. Importar los módulos 'https' para la conexión segura y 'fs' para leer archivos
const https = require('https');
const fs = require('fs');

// 2. Opciones de la petición, ahora con la configuración para SSL
const options = {
    hostname: 'localhost', // O 'localhost'
    port: 3000,
    path: '/',
    method: 'GET',
    // 3. ¡Esta es la clave! Habilita la confianza en el certificado del servidor
    ca: fs.readFileSync('cert.pem')
};

// --- Alternativa INSEGURA (solo para desarrollo) ---
// const optionsInsecure = {
//     ...options, // Copia las opciones de arriba
//     rejectUnauthorized: false // Esto ignora la validación del certificado. ¡No usar en producción!
// };

// 4. Crear la petición usando 'https.request'
const req = https.request(options, (res) => {
    let data = '';

    console.log(`Código de estado: ${res.statusCode}`);

    // 5. Un trozo de datos ha sido recibido (chunk)
    res.on('data', (chunk) => {
        data += chunk;
    });

    // 6. La respuesta completa ha sido recibida
    res.on('end', () => {
        console.log('Datos cifrados recibidos del servidor:');
        // Imprimir el objeto JSON parseado
        console.log(JSON.parse(data));
    });
});

// 7. Manejo de errores
req.on('error', (error) => {
    // Un error común aquí es 'self-signed certificate' si el paso 3 no se hace bien
    console.error(`Error en la petición: ${error.message}`);
});

// 8. Finalizar y enviar la petición
req.end();