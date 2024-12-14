const auctionData = require('../data/data.json');
const { users, userAuctions, getUsersInAuction, auctionRooms , registerUser} = require('../services/user-service');
const { getAuctionData } = require('../services/auction-service');
function setupRestEndpoints(app) {
    // Serve auctions as an endpoint
    app.get('/api/auctions', (req, res) => {
        res.json(auctionData);
    });

    // Endpoint to get auctions registered by a user
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

    // Endpoint to get user data by userId
    app.get('/api/users', (req, res) => {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const user = users[userId];

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    });

    // Endpoint to get users in a specific auction
    app.get('/api/auction-users', (req, res) => {
        const { auctionId } = req.query;

        if (!auctionId) {
            return res.status(400).json({ error: 'auctionId is required' });
        }

        const { success, message, users: auctionUsers } = getUsersInAuction(auctionId);

        if (!success) {
            return res.status(404).json({ error: message });
        }
        console.log('Auction users:', auctionUsers);

        res.json({ message, users: auctionUsers });
    });

    // Endpoint to get details of a specific auction
    app.get('/api/auction', (req, res) => {
        const { auctionId } = req.query;

        if (!auctionId) {
            return res.status(400).json({ error: 'auctionId is required' });
        }

        const auction = auctionData.find((auction) => auction.id === parseInt(auctionId));
        if (!auction) {
            return res.status(404).json({ error: 'Auction not found' });
        }

        res.json(auction);
    });
    app.get('/api/auction-room-users', (req, res) => {
        const { auctionId } = req.query;

        if (!auctionId) {
            return res.status(400).json({ error: 'auctionId is required' });
        }

        const roomUsers = auctionRooms[auctionId];
        if (!roomUsers || roomUsers.length === 0) {
            return res.status(404).json({ error: 'No users found in this auction room' });
        }

        const usersInRoom = roomUsers.map((userId) => users[userId]);
        res.json({
            success: true,
            message: `Users in auction room ${auctionId}`,
            users: roomUsers,
        });
    });

    // New endpoint: Register an auction
    app.post('/api/register-auction', (req, res) => {
        const { userId, auctionId } = req.body;
    
        if (!userId || auctionId === undefined || auctionId === null) {
            return res.status(400).json({ error: 'userId and auctionId are required' });
        }
    
        if (!users[userId]) {
            return res.status(404).json({ error: 'User not found' });
        }
    
        const auction = auctionData.find((a) => a.id === parseInt(auctionId));
        if (!auction) {
            return res.status(404).json({ error: 'Auction not found' });
        }
    
        if (!userAuctions[userId]) {
            userAuctions[userId] = [];
        }
    
        if (userAuctions[userId].includes(parseInt(auctionId))) {
            return res.status(400).json({ error: 'User is already registered for this auction' });
        }
    
        userAuctions[userId].push(parseInt(auctionId));
        res.json({ success: true, message: 'Auction registered successfully' });
    });    

    // New endpoint: Unregister an auction
    app.delete('/api/unregister-auction', (req, res) => {    
        const { userId, auctionId } = req.body;
    
        // Validaciones iniciales
        if (!userId || auctionId === undefined || auctionId === null) {
            console.error('Datos faltantes en el cuerpo:', req.body); // Debugging
            return res.status(400).json({ error: 'userId and auctionId are required' });
        }
    
        if (!users[userId]) {
            console.error(`Usuario con ID ${userId} no encontrado`);
            return res.status(404).json({ error: 'User not found' });
        }
    
        if (!userAuctions[userId] || !userAuctions[userId].includes(parseInt(auctionId))) {
            console.error(
                `Subasta con ID ${auctionId} no encontrada para el usuario con ID ${userId}`
            );
            return res.status(404).json({ error: 'Auction not found for this user' });
        }
    
        // Remover la subasta del usuario
        userAuctions[userId] = userAuctions[userId].filter(
            (id) => id !== parseInt(auctionId)
        );
    
        console.log(
            `Subasta con ID ${auctionId} eliminada para el usuario con ID ${userId}`
        );
    
        res.json({ success: true, message: 'Auction unregistered successfully' });
    });

    app.post('/api/login-admin', (req, res) => {
        const {userId, username, password } = req.body;
    
        if (username === 'admin' && password === 'admin123') {
            const registerAdmin = registerUser({userId, nombre: 'Manejador', apellido:"", role: 'admin'});
            console.log(`Usuario registrado: ${JSON.stringify(registerAdmin)}`);
            return res.status(200).json({ success: true, user: registerAdmin });
        } else {
            res.status(401).json({ error: 'Invalid credentials'});
        }
    });

    app.get('/api/auction-room-state', (req, res) => {
        const { auctionId } = req.query;

        if (!auctionId) {
            return res.status(400).json({ error: 'auctionId is required' });
        }

        const auction = getAuctionData(auctionId);
        if (!auction.success) {
            return res.json({ success: false, message: auction.message });
        } else {
            res.json({ success: true, auction: auction.auction });
        }
    });
    
       
}

module.exports = {
    setupRestEndpoints,
};
