// 1. Importar los módulos 'https' para el servidor seguro y 'fs' para leer archivos
const https = require('https');
const fs = require('fs');

// 2. Definir el host y el puerto
const HOST = '127.0.0.1'; // localhost
const PORT = 3000;

// 3. Opciones del certificado SSL
const options = {
    key: fs.readFileSync('key.pem'), // Cargar la clave privada
    cert: fs.readFileSync('cert.pem') // Cargar el certificado público
};

// 4. Crear el servidor usando https y las opciones del certificado
const server = https.createServer(options, (req, res) => {
    // 5. Establecer la cabecera para indicar que la respuesta es JSON
    res.setHeader('Content-Type', 'application/json');
    // 6. Escribir el código de estado HTTP 200 OK
    res.writeHead(200);

    // 7. Los datos que enviaremos. ¡Ahora viajarán de forma segura!
    const responseData = {
        message: "¡Hola! Estos datos ahora SÍ están cifrados.",
        secret: "password123456"
    };

    // 8. Enviar la respuesta como una cadena de texto JSON y finalizar
    res.end(JSON.stringify(responseData));
});

// 9. Poner el servidor a escuchar en el puerto y host especificados
server.listen(PORT, HOST, () => {
    // 10. Mensaje de confirmación actualizado para HTTPS
    console.log(`🚀 Servidor corriendo de forma segura en https://${HOST}:${PORT}`);
});