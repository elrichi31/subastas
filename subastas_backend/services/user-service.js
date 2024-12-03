// In-memory storage for users and user auctions
const users = {}; // Stores users in memory
const userAuctions = {}; // Stores user auctions

function registerUser(userData) {
    const { userId, nombre, apellido } = userData;

    // Register user if not exists
    if (!users[userId]) {
        users[userId] = {
            id: userId,
            nombre,
            apellido,
        };
    }

    // Initialize auction array for user if not exists
    if (!userAuctions[userId]) {
        userAuctions[userId] = [];
    }

    return users[userId];
}

function selectAuction(userId, auctionId) {
    if (!userId) {
        console.error('User not registered. Cannot add auction.');
        return { 
            success: false, 
            message: 'User not registered' 
        };
    }

    // Add auction only if not already in the list
    if (!userAuctions[userId].includes(auctionId)) {
        userAuctions[userId].push(auctionId);
        console.log(`Auction ID ${auctionId} added for user ${userId}`);
    }

    return {
        success: true,
        message: 'Auction added',
        selectedAuctions: userAuctions[userId],
    };
}

function removeAuction(userId, auctionId) {
    if (!userId) {
        console.error('User not registered. Cannot remove auction.');
        return { 
            success: false, 
            message: 'User not registered' 
        };
    }

    const auctionIndex = userAuctions[userId].indexOf(auctionId);
    if (auctionIndex > -1) {
        userAuctions[userId].splice(auctionIndex, 1);
        console.log(`Auction ID ${auctionId} removed for user ${userId}`);
    }

    return {
        success: true,
        message: 'Auction removed',
        selectedAuctions: userAuctions[userId],
    };
}

function getUsersInAuction(auctionId) {
    const usersInAuction = [];
    // Convert auctionId to a string for consistent comparison
    const auctionIdStr = String(auctionId);

    // Iterate over userAuctions to find users in the specified auction
    for (const [userId, auctions] of Object.entries(userAuctions)) {
        // Ensure auctions are compared as strings
        if (auctions.map(String).includes(auctionIdStr)) {
            const user = users[userId]; // Get user details from users
            if (user) {
                usersInAuction.push({
                    id: userId,
                    nombre: user.nombre,
                    apellido: user.apellido,
                });
            }
        }
    }
    return {
        success: true,
        message: `Users in auction ${auctionId} retrieved`,
        users: usersInAuction,
    };
}





module.exports = {
    registerUser,
    selectAuction,
    removeAuction,
    getUsersInAuction,
    users,
    userAuctions,
};
