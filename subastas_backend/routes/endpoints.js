const { parse } = require('uuid');
const auctionData = require('../data/data.json');
const { users, userAuctions, getUsersInAuction } = require('../services/user-service');

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

    // New endpoint: Get users in a specific auction
    app.get('/api/auction-users', (req, res) => {
        const { auctionId } = req.query;

        if (!auctionId) {
            return res.status(400).json({ error: 'auctionId is required' });
        }

        const { success, message, users: auctionUsers } = getUsersInAuction(auctionId);

        if (!success) {
            return res.status(404).json({ error: message });
        }

        res.json({ message, users: auctionUsers });
    });

    // New endpoint: Get details of a specific auction
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
}

module.exports = {
    setupRestEndpoints,
};
