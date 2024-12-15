// In-memory storage for auctions data
const auctionData = [];

function createAuction(auctionId, currentPrice, increment, countdownDuration) {
    const newAuction = {
        auctionId,
        currentPrice,
        state: "not initiated",
        time: countdownDuration, // Countdown duration in milliseconds
        increment,
        winner: "?",
        transactions: [],
    };

    auctionData.push(newAuction);
    console.log(`Auction ${auctionId} created.`);
    return {
        success: true,
        message: "Auction created successfully",
        auction: newAuction,
    };
}

function updateAuction(auctionId, currentPrice, increment, countdownDuration) {
    const auction = auctionData.find((a) => a.auctionId === parseInt(auctionId));

    if (!auction) {
        return {
            success: false,
            message: "Auction not found",
        };
    }

    auction.currentPrice = currentPrice;
    auction.increment = increment;
    auction.time = countdownDuration;
    auction.state = "not initiated",
    auction.winner = "?";
    auction.transactions = [];


    console.log(`Auction ${auctionId} updated.`);
    return {
        success: true,
        message: "Auction updated successfully",
        auction,
    };
}

function updateAuctionState(auctionId, newState) {
    const auction = auctionData.find((a) => a.auctionId === auctionId);

    if (!auction) {
        return {
            success: false,
            message: "Auction not found",
        };
    }

    auction.state = newState;
    console.log(`Auction ${auctionId} state updated to ${newState}.`);
    return {
        success: true,
        message: "Auction state updated successfully",
        auction,
    };
}

function addBidToAuction(auctionId, userId, nombre, apellido, role, amountBid) {
    const auction = auctionData.find((a) => a.auctionId === auctionId);

    if (!auction) {
        console.log(`Auction not found: ${auctionId}`);
        return {
            success: false,
            message: "Auction not found",
        };
    }

    if (auction.state !== "in progress") {
        console.log(`Auction cannot accept bids in its current state: ${auction.state}`);
        return {
            success: false,
            message: `Auction cannot accept bids in its current state: ${auction.state}`,
        };
    }

    if (typeof amountBid !== 'number' || amountBid <= 0) {
        console.log(`Invalid bid amount: ${amountBid}`);
        return {
            success: false,
            message: "Invalid bid amount. It must be a positive number.",
        };
    }

    const newPrice = auction.currentPrice + amountBid;

    const transaction = {
        userId,
        nombre,
        apellido,
        role,
        amountBid,
        priceAfterBid: newPrice,
    };

    auction.transactions.push(transaction);
    auction.currentPrice = newPrice;
    auction.winner = `${nombre} ${apellido}`;
    console.log(`Bid added to auction ${auctionId}. New price: ${newPrice}`);

    return {
        success: true,
        message: "Bid added successfully",
        auction,
    };
}

function getAuctionData(auctionId) {
    const auction = auctionData.find((a) => a.auctionId === parseInt(auctionId));
    if (!auction) {
        return {
            success: false,
            message: "Auction not found",
        };
    }

    return {
        success: true,
        message: "Auction data retrieved successfully",
        auction,
    };
}

module.exports = {
    createAuction,
    updateAuctionState,
    addBidToAuction,
    getAuctionData,
    auctionData,
    updateAuction,
};
