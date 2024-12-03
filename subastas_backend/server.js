const express = require('express');
const http = require('http');
const cors = require('cors');
const WebSocket = require('ws');

const { setupRestEndpoints } = require('./routes/endpoints');
const { setupWebSocketServer } = require('./websocket/websocket');

function startServer() {
    const app = express();
    app.use(cors({ origin: '*' }));

    // Setup REST endpoints
    setupRestEndpoints(app);

    // Create HTTP and WebSocket server
    const server = http.createServer(app);
    const wss = new WebSocket.Server({ server });

    // Setup WebSocket
    setupWebSocketServer(wss);

    // Start server
    const PORT = process.env.PORT || 3001;
    server.listen(PORT, () => {
        console.log(`HTTP and WebSocket server running on port ${PORT}`);
    });
}

// Initialize the application
startServer();