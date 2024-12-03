const WebSocket = require('ws');
const express = require('express');
const http = require('http');
const cors = require('cors');
const auctionData = require('./data.json');

const app = express();
app.use(cors({ origin: '*' }));

// Almacenamiento de usuarios y subastas
const users = {}; // Almacena los usuarios en memoria
const userAuctions = {}; // Almacena las subastas de los usuarios

function registerUser(userData) {
    const { userId, nombre, apellido } = userData;

    // Registrar usuario si no existe
    if (!users[userId]) {
        users[userId] = {
            id: userId,
            nombre,
            apellido,
        };
    }

    // Inicializar arreglo de subastas para el usuario si no existe
    if (!userAuctions[userId]) {
        userAuctions[userId] = [];
    }

    return users[userId];
}


function selectAuction(userId, auctionId) {
    if (!userId) {
        console.error('Usuario no registrado. No se puede agregar la subasta.');
        return { 
            success: false, 
            message: 'Usuario no registrado' 
        };
    }

    // Añadir subasta solo si no está ya en la lista
    if (!userAuctions[userId].includes(auctionId)) {
        userAuctions[userId].push(auctionId);
        console.log(`Subasta ID ${auctionId} añadida para el usuario ${userId}`);
    }

    return {
        success: true,
        message: 'Subasta añadida',
        selectedAuctions: userAuctions[userId],
    };
}


function removeAuction(userId, auctionId) {
    if (!userId) {
        console.error('Usuario no registrado. No se puede eliminar la subasta.');
        return { 
            success: false, 
            message: 'Usuario no registrado' 
        };
    }

    const auctionIndex = userAuctions[userId].indexOf(auctionId);
    if (auctionIndex > -1) {
        userAuctions[userId].splice(auctionIndex, 1);
        console.log(`Subasta ID ${auctionId} eliminada para el usuario ${userId}`);
    }

    return {
        success: true,
        message: 'Subasta eliminada',
        selectedAuctions: userAuctions[userId],
    };
}

function setupRestEndpoints(app) {
    // Servir las subastas como un endpoint
    app.get('/api/auctions', (req, res) => {
        res.json(auctionData);
    });

    // Endpoint para obtener las subastas registradas por un usuario
    app.get('/api/my-auctions', (req, res) => {
        const { userId } = req.query;
        if (!userId || !userAuctions[userId]) {
            return res.json([]);
        }

        const auctions = userAuctions[userId].map((auctionId) =>
            auctionData.find((auction) => auction.id === auctionId)
        );

        res.json(auctions);
    });

    // Endpoint para obtener los datos de un usuario por userId
    app.get('/api/users', (req, res) => {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: 'userId es requerido' });
        }

        const user = users[userId];

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json(user);
    });
}


function setupWebSocketServer(wss) {
    wss.on('connection', (ws) => {
        let userId = null;
        console.log('Cliente conectado');

        ws.on('message', (message) => {
            const data = JSON.parse(message);

            switch (data.type) {
                case 'register_user':
                    userId = data.userId;
                    const registeredUser = registerUser(data);
                    console.log(`Usuario registrado: ${JSON.stringify(registeredUser)}`);
                    ws.send(JSON.stringify({ success: true, message: 'Usuario registrado' }));
                    break;

                case 'select_auction':
                    const selectResult = selectAuction(userId, data.auctionId);
                    ws.send(JSON.stringify(selectResult));
                    break;

                case 'remove_auction':
                    const removeResult = removeAuction(userId, data.auctionId);
                    ws.send(JSON.stringify(removeResult));
                    break;

                default:
                    console.log('Mensaje no reconocido:', data);
            }
        });

        ws.on('close', () => {
            console.log(`Cliente desconectado: ${userId}`);
        });
    });
}

/**
 * Inicializa y arranca el servidor
 */
function startServer() {
    // Configurar endpoints REST
    setupRestEndpoints(app);

    // Crear servidor HTTP y WebSocket
    const server = http.createServer(app);
    const wss = new WebSocket.Server({ server });

    // Configurar WebSocket
    setupWebSocketServer(wss);

    // Iniciar el servidor
    const PORT = 3001;
    server.listen(PORT, () => {
        console.log(`Servidor HTTP y WebSocket en puerto ${PORT}`);
    });
}

// Iniciar la aplicación
startServer();

module.exports = {
    registerUser,
    selectAuction,
    removeAuction,
    users,
    userAuctions
};