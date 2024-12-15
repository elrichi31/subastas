const {
    registerUser,
    addUserToAuctionRoom,
    removeUserFromAuctionRoom,
    getUsersInAuctionRoom,
    auctionRooms,
    userSockets,
    socketUsers,
} = require('../services/user-service');

const {
    createAuction,
    auctionData,
    updateAuction,
    updateAuctionState,
    addBidToAuction,
} = require('../services/auction-service');

function setupWebSocketServer(io) {


    io.on('connection', (socket) => {
        console.log('Cliente conectado:', socket.id);
        // Registro de usuarios
        socket.on('register_user', (data) => {
            const userId = data.userId;
            userSockets.set(userId, socket.id); // Asociar userId con socket.id
            socketUsers.set(socket.id, userId); // Asociar socket.id con userId
            const registeredUser = registerUser(data);
            console.log(`Usuario registrado: ${JSON.stringify(registeredUser)}`);
            socket.emit('user_registered', { success: true, user: registeredUser });
        });

        // Usuario entra en una subasta
        socket.on('user_entered', (data) => {
            const auctionId = parseInt(data.auctionId);
            const userId = data.userId;
            userSockets.set(userId, socket.id); // Asociar userId con socket.id
            socketUsers.set(socket.id, userId); // Asociar socket.id con userId

            const userAddedToRoom = addUserToAuctionRoom(userId, auctionId);
            socket.join(String(auctionId)); // Unir al usuario a la sala de la subasta
            io.to(String(auctionId)).emit('room_updated', { users: getUsersInAuctionRoom(auctionId) });
            socket.emit('user_entered_ack', { success: true, room: userAddedToRoom });
        });

        // Usuario sale de una subasta
        socket.on('user_left', (data) => {
            const auctionId = parseInt(data.auctionId);
            const userId = data.userId;
            removeUserFromAuctionRoom(userId, auctionId);
            socket.leave(String(auctionId)); // Salir de la sala de Socket.IO
            io.to(String(auctionId)).emit('room_updated', { users: getUsersInAuctionRoom(auctionId) });
            socket.emit('user_left_ack', { success: true });
        });

        socket.on('create_auction', (data, callback) => {
            const auctionId = parseInt(data.auctionId);
            const currentPrice = parseFloat(data.currentPrice);
            const increment = parseFloat(data.increment);
            const countdownDuration = parseInt(data.countdownDuration);

            const auction = auctionData.find((a) => a.auctionId === auctionId);
            if (auction) {
                return callback({ success: false, message: 'Auction already exists' });
            }

            const newAuction = createAuction(auctionId, currentPrice, increment, countdownDuration);
            if (!newAuction.success) {
                return callback({ success: false, message: newAuction.message });
            } else {
                console.log(`Auction ${auctionId} created.`);
                io.emit('auction_created', { success: true, auction: newAuction.auction });
            }
        });

        socket.on('update_auction', (data, callback) => {
            const auctionId = parseInt(data.auctionId);
            const currentPrice = parseFloat(data.currentPrice);
            const increment = parseFloat(data.increment);
            const countdownDuration = parseInt(data.countdownDuration);

            const response = updateAuction(auctionId, currentPrice, increment, countdownDuration);
            if (!response.success) {
                return callback({ success: false, message: response.message });
            } else {
                io.emit('auction_updated', { success: true, auction: response.auction });
            }
        });

        socket.on('start_auction', (data, callback) => {
            const auctionId = parseInt(data.auctionId);
            const auction = auctionData.find((a) => a.auctionId === auctionId);
            if (!auction) {
                return { success: false, message: 'Auction not found' };
            }

            if (auction.state !== 'not initiated' && auction.state !== 'finished') {
                console.log(`Auction state: ${auction.state}`);
                return { success: false, message: 'Auction already initiated' };
            }

            const response = updateAuctionState(auctionId, 'in progress');
            if (!response.success) {
                return callback({ success: false, message: response.message });
            }
            console.log(`Auction ${auctionId} initiated.`);

            io.to(String(auctionId)).emit('auction_started', { success: true, auction: response.auction });
        });

        socket.on('end_auction', (data, callback) => {
            const auctionId = parseInt(data.auctionId);
            const auction = auctionData.find((a) => a.auctionId === auctionId);
            if (!auction) {
                return callback({ success: false, message: 'Auction not found' });
            }

            if (auction.state !== 'in progress') {
                return { success: false, message: 'Auction not in progress' };
            }

            const response = updateAuctionState(auctionId, 'finished');
            if (!response.success) {
                return callback({ success: false, message: response.message });
            }
            console.log(`Auction ${auctionId} finished.`);

            io.to(String(auctionId)).emit('auction_ended', { success: true, auction: response.auction });
        });

        socket.on('place_bid', (data) => {
            const auctionId = parseInt(data.auctionId);
            const userId = data.userId;
            const nombre = data.nombre;
            const apellido = data.apellido;
            const role = data.role;
            const amountBid = parseFloat(data.amountBid);

            const auction = auctionData.find((a) => a.auctionId === auctionId);
            if (!auction) {
                console.log(`Auction not found: ${auctionId}`);
                return { success: false, message: 'Auction not found' };
            }

            if (auction.state !== 'in progress') {
                console.log(`Auction not in progress: ${auction.state}`);
                return { success: false, message: 'Auction not in progress' };
            }

            if (amountBid <= auction.increment) {
                console.log(`Bid amount must be greater than current increment: ${amountBid}`);
                return { success: false, message: 'Bid amount must be greater than current increment' };
            }
            const response = addBidToAuction(auctionId, userId, nombre, apellido, role, amountBid);
            if (!response.success) {
                return { success: false, message: response.message };
            }
            io.to(String(auctionId)).emit('bid_placed', { success: true, message:"Bid placed", auction});

        });

        // Manejo de desconexión
        socket.on('disconnect', (reason) => {
            console.log(`Cliente desconectado: ${socket.id}, Razón: ${reason}`);
            const disconnectedUserId = socketUsers.get(socket.id);
        
            if (disconnectedUserId) {
                for (const [auctionId, users] of Object.entries(auctionRooms)) {
                    console.log(`Revisando sala de subasta ${auctionId}`);
                    console.log(`Usuarios en sala antes de revisar: ${JSON.stringify(users)}`);
        
                    // Encontrar el índice del usuario donde user.id coincida con disconnectedUserId
                    const userIndex = users.findIndex(user => user.id === disconnectedUserId);
        
                    if (userIndex !== -1) {
                        users.splice(userIndex, 1); // Remover usuario por índice
                        console.log(`Usuario ${disconnectedUserId} eliminado de sala de subasta ${auctionId}`);
                        
                        // Emitir evento actualizado de la sala
                        io.to(String(auctionId)).emit('room_updated', { users: getUsersInAuctionRoom(auctionId) });
                    } else {
                        console.log(`Usuario ${disconnectedUserId} no encontrado en sala de subasta ${auctionId}`);
                    }
                }
        
                // Eliminar referencias al usuario
                userSockets.delete(disconnectedUserId);
                socketUsers.delete(socket.id);
                console.log(`Usuario desconectado eliminado: ${disconnectedUserId}`);
            }
        });
        
    });        
}

module.exports = { setupWebSocketServer };
