const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io'); // Importar Socket.IO
const { setupRestEndpoints } = require('./routes/endpoints');
const { setupWebSocketServer } = require('./websocket/websocket'); // Configuración WebSocket

function startServer() {
    const app = express();
    app.use(express.json());
    app.use(cors({ origin: '*' })); // Permitir solicitudes desde cualquier origen

    // Configurar endpoints REST
    setupRestEndpoints(app);

    // Crear servidor HTTP
    const server = http.createServer(app);

    // Configurar servidor Socket.IO
    const io = new Server(server, {
        cors: {
            origin: '*', // Permitir CORS para clientes
            methods: ['GET', 'POST'],
        },
    });

    // Configurar WebSocket con lógica
    setupWebSocketServer(io);

    // Iniciar servidor
    const PORT = process.env.PORT || 3001;
    server.listen(PORT, () => {
        console.log(`HTTP and WebSocket server running on port ${PORT}`);
    });
}

startServer();
