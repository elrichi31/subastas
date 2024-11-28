const WebSocket = require('ws');
const express = require('express');
const http = require('http');
const cors = require('cors');
const auctionData = require('./data.json');

const app = express();
app.use(cors({ origin: '*' }));

const users = {}; // Almacena los usuarios en memoria
const userAuctions = {}; // Almacena las subastas de los usuarios

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

// Crear servidor HTTP y WebSocket
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    let userId = null;
    console.log('Cliente conectado');

    ws.on('message', (message) => {
        const data = JSON.parse(message);

        if (data.type === 'register_user') {
            userId = data.userId;

            if (!users[userId]) {
                users[userId] = {
                    id: userId,
                    nombre: data.nombre,
                    apellido: data.apellido,
                };
            }

            if (!userAuctions[userId]) {
                userAuctions[userId] = [];
            }

            console.log(`Usuario registrado: ${JSON.stringify(users[userId])}`);
            ws.send(JSON.stringify({ success: true, message: 'Usuario registrado' }));
        }
        else if (data.type === 'select_auction') {
            if (userId) {
                if (!userAuctions[userId].includes(data.auctionId)) {
                    userAuctions[userId].push(data.auctionId);
                    console.log(`Subasta ID ${data.auctionId} añadida para el usuario ${userId}`);
                }
                ws.send(
                    JSON.stringify({
                        success: true,
                        message: 'Subasta añadida',
                        selectedAuctions: userAuctions[userId],
                    })
                );
            } else {
                console.error('Usuario no registrado. No se puede agregar la subasta.');
                ws.send(JSON.stringify({ success: false, message: 'Usuario no registrado' }));
            }
        } else if (data.type === 'remove_auction') {
            if (userId) {
                const auctionIndex = userAuctions[userId].indexOf(data.auctionId);
                if (auctionIndex > -1) {
                    userAuctions[userId].splice(auctionIndex, 1);
                    console.log(`Subasta ID ${data.auctionId} eliminada para el usuario ${userId}`);
                }
                ws.send(
                    JSON.stringify({
                        success: true,
                        message: 'Subasta eliminada',
                        selectedAuctions: userAuctions[userId],
                    })
                );
            } else {
                console.error('Usuario no registrado. No se puede eliminar la subasta.');
                ws.send(JSON.stringify({ success: false, message: 'Usuario no registrado' }));
            }
        }
    });

    ws.on('close', () => {
        console.log(`Cliente desconectado: ${userId}`);
    });
    console.log('Estado actual de users:', users);
    console.log('Estado actual de userAuctions:', userAuctions);
});


// Iniciar el servidor
server.listen(3001, () => {
    console.log('Servidor HTTP y WebSocket en puerto 3001');
});
