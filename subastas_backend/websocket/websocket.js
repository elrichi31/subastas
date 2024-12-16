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
    auctionData,
    auctionSelection,
    updateAuction,
    updateAuctionState,
    addBidToAuction,
    getAllAuctions,
    addAuctionToSelection,
    removeAuctionFromSelection,
    getAuctionSelection,
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
        });

        // Usuario sale de una subasta
        socket.on('user_left', (data) => {
            const auctionId = parseInt(data.auctionId);
            const userId = data.userId;
            removeUserFromAuctionRoom(userId, auctionId);
            socket.leave(String(auctionId)); // Salir de la sala de Socket.IO
            io.to(String(auctionId)).emit('room_updated', { users: getUsersInAuctionRoom(auctionId) });
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
            const auction = auctionSelection.find((a) => a.auctionId === auctionId);
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
            const responseState = getAuctionSelection();
            io.emit('state_updated', { success: true, auctions: responseState.auctions});
            io.to(String(auctionId)).emit('auction_started', { success: true, auction: response.auction });
        });

        socket.on('end_auction', (data, callback) => {
            const auctionId = parseInt(data.auctionId);
            const auction = auctionSelection.find((a) => a.auctionId === auctionId);
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

            const responseState = getAuctionSelection();
            io.emit('state_updated', { success: true, auctions: responseState.auctions});
            io.to(String(auctionId)).emit('auction_ended', { success: true, auction: response.auction });
        });

        socket.on('place_bid', (data) => {
            const auctionId = parseInt(data.auctionId);
            const userId = data.userId;
            const nombre = data.nombre;
            const apellido = data.apellido;
            const role = data.role;
            const amountBid = parseFloat(data.amountBid);

            const auction = auctionSelection.find((a) => a.auctionId === auctionId);
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

        // ---------------------------

        socket.on("get_auctions", (data) => {
            const response = getAllAuctions();
            console.log(`Enviando subastas a cliente: ${socket.id}`);
            socket.emit("auctions", { success: true, auctions: response.auctions });
        });

        socket.on('add_auction_selection', (data) => {
            const auctionId = data.auctionId;
            const response = addAuctionToSelection(auctionId);
            console.log(`Subasta seleccionada: ${auctionId}`);
            io.emit('auction_selection', response);
        });

        socket.on('remove_auction_selection', (data) => {
            const auctionId = data.auctionId;
            const response = removeAuctionFromSelection(auctionId);
            console.log(`Subasta deseleccionada: ${auctionId}`);
            io.emit('auction_selection', response);
        });

        socket.on('get_auction_selection', () => {
            const response = getAuctionSelection();
            console.log(`Enviando selección de subasta`);
            socket.emit('auction_selection', response);
        });

        // ---------------------------

        // Manejo de desconexión
        socket.on('disconnect', (reason) => {
            console.log(`Cliente desconectado: ${socket.id}, Razón: ${reason}`);
            const disconnectedUserId = socketUsers.get(socket.id); // Obtén el ID del usuario desconectado
        
            if (disconnectedUserId) {
                // Encuentra todas las salas en las que está el usuario desconectado
                for (const [auctionId, users] of Object.entries(auctionRooms)) {
                    console.log(`Revisando sala de subasta ${auctionId}`);
                    console.log(`Usuarios en sala antes de revisar: ${JSON.stringify(users)}`);
        
                    // Busca el índice del usuario desconectado en esta sala
                    const userIndex = users.findIndex((user) => user.id === disconnectedUserId);
        
                    if (userIndex !== -1) {
                        users.splice(userIndex, 1); // Elimina al usuario desconectado
                        console.log(`Usuario ${disconnectedUserId} eliminado de sala de subasta ${auctionId}`);
        
                        // Emitir evento actualizado de la sala
                        io.to(String(auctionId)).emit('room_updated', { users: getUsersInAuctionRoom(auctionId) });
                    }
                }
        
                // Elimina las referencias al usuario
                userSockets.delete(disconnectedUserId); // Elimina la referencia al socket del usuario
                socketUsers.delete(socket.id); // Elimina el ID del socket
        
                console.log(`Usuario desconectado eliminado: ${disconnectedUserId}`);
            }
        });        
        
    });        
}

module.exports = { setupWebSocketServer };
