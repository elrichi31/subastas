// In-memory storage for users, user auctions, and auction rooms
const users = {}; // Stores users in memory
const userAuctions = {}; // Stores user auctions
const auctionRooms = {}; // Stores users present in auction rooms
const userSockets = new Map(); // userId -> socketId
const socketUsers = new Map(); // socketId -> userId

function registerUser(userData) {
    const { userId, nombre, apellido, role } = userData;
    // Register user if not exists
    if (!users[userId]) {
        users[userId] = {
            id: userId,
            nombre,
            apellido,
            role
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

function addUserToAuctionRoom(userId, auctionId) {
    if (!users[userId]) {
        console.error('User not registered. Cannot add to auction room.');
        return {
            success: false,
            message: 'User not registered',
        };
    }

    if (!auctionRooms[auctionId]) {
        console.log(`Auction room ${auctionId} not found. Creating new room.`);
        auctionRooms[auctionId] = [];
    }

    const user = users[userId]; // Buscar el usuario por su ID

    if (!auctionRooms[auctionId].some(u => u.id === userId)) {
        auctionRooms[auctionId].push({
            id: userId,
            nombre: user.nombre,
            apellido: user.apellido,
            role: user.role
        });
        console.log(`User ${userId} (${user.nombre} ${user.apellido}) added to auction room ${auctionId}`);
    }

    return {
        success: true,
        message: 'User added to auction room',
        roomUsers: auctionRooms[auctionId],
    };
}


function removeUserFromAuctionRoom(userId, auctionId) {
    const auctionIdStr = String(auctionId); // Convertir auctionId a string
    if (!auctionRooms[auctionIdStr]) {
        console.log(`Auction room ${auctionIdStr} not found`);
        return {
            success: false,
            message: 'Auction room not found',
        };
    }

    // Encontrar el índice del usuario en la sala usando findIndex
    const userIndex = auctionRooms[auctionIdStr].findIndex(user => user.id === userId);
    if (userIndex > -1) {
        auctionRooms[auctionIdStr].splice(userIndex, 1);
        console.log(`User ${userId} removed from auction room ${auctionIdStr}`);
    }

    return {
        success: true,
        message: 'User removed from auction room',
        roomUsers: auctionRooms[auctionIdStr],
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
                    role: user.role
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

function getUsersInAuctionRoom(auctionId) {
    const roomUsers = auctionRooms[auctionId] || [];
    const userDetails = roomUsers.map((userId) => users[userId]).filter(Boolean);
    return {
        success: true,
        message: `Users in auction room ${auctionId} retrieved`,
        users: roomUsers,
    };
}

module.exports = {
    registerUser,
    selectAuction,
    removeAuction,
    addUserToAuctionRoom,
    removeUserFromAuctionRoom,
    getUsersInAuction,
    getUsersInAuctionRoom,
    users,
    userAuctions,
    auctionRooms,
    userSockets,
    socketUsers
};
