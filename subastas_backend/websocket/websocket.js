const { registerUser, selectAuction, removeAuction, getUsersInAuction, addUserToAuction, users } = require('../services/user-service');

function setupWebSocketServer(wss) {
    const clients = new Map(); // Map to track userId and WebSocket connection

    wss.on('connection', (ws) => {
        let userId = null;
        console.log('Client connected');

        ws.on('message', (message) => {
            const data = JSON.parse(message);

            switch (data.type) {
                case 'register_user':
                    userId = data.userId;
                    const registeredUser = registerUser(data);
                    clients.set(userId, ws);
                    console.log(`User registered: ${JSON.stringify(registeredUser)}`);
                    ws.send(JSON.stringify({ success: true, message: 'User registered', user: registeredUser }));
                    break;

                case 'select_auction':
                    const selectResult = selectAuction(userId, data.auctionId);
                    ws.send(JSON.stringify(selectResult));
                    break;

                case 'remove_auction':
                    const removeResult = removeAuction(userId, data.auctionId);
                    ws.send(JSON.stringify(removeResult));
                    break;

                case 'user_entered':
                    const userAdded = selectAuction(userId, parseInt(data.auctionId));
                    notifyNewUserOnAuction(data.auctionId, 'user_joined', data.userId);
                    ws.send(JSON.stringify(userAdded));
                    break;

                default:
                    console.log('Unrecognized message:', data);
            }
        });

        ws.on('close', () => {
            console.log(`Client disconnected: ${userId}`);
            if (userId) {
                clients.delete(userId);
            }
        });
    });

    /**
     * Notify all users in an auction about a new user joining
     * @param {string} auctionId - ID of the auction
     * @param {string} eventType - Type of the event (e.g., "user_joined")
     * @param {string} userId - ID of the user who joined
     */
    function notifyNewUserOnAuction(auctionId, eventType, userId) {
        // Find the user details
        const user = users[userId];
        if (!user) {
            console.error(`User with ID ${userId} not found`);
            return;
        }

        // Get all users in the auction
        const { users: auctionUsers } = getUsersInAuction(auctionId);

        auctionUsers.forEach((auctionUser) => {
            const client = clients.get(auctionUser.id);
            if (client && client.readyState === 1) {
                client.send(
                    JSON.stringify({
                        type: eventType,
                        data: {
                            id: userId,
                            nombre: user.nombre,
                            apellido: user.apellido,
                        },
                    })
                );
            }
        });
    }
}

module.exports = {
    setupWebSocketServer,
};
