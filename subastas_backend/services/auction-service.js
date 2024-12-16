// In-memory storage for auctions data
const auctionData = [];
const auctionSelection = [];

function createAuction(auctionId, url, painter, name, year, basePrice, increment, countdownDuration) {
    const newAuction = {
        auctionId,
        url,
        painter,
        name,
        year,
        basePrice,
        currentPrice: basePrice,
        state: "not configured",
        time: countdownDuration, // Countdown duration in milliseconds
        increment,
        winner: "?",
        order: null,
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
    const auction = auctionSelection.find((a) => a.auctionId === parseInt(auctionId));

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
    const auction = auctionSelection.find((a) => a.auctionId === auctionId);

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
    const auction = auctionSelection.find((a) => a.auctionId === auctionId);

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

function getAllAuctions() {
    return {
        success: true,
        message: "Auctions retrieved successfully",
        auctions: auctionData,
    };
}


// Function to add an auction to the selection
function addAuctionToSelection(auctionId) {
    // Check if the auction exists in auctionData
    const auction = auctionData.find((a) => a.auctionId === auctionId);

    if (!auction) {
        return {
            success: false,
            message: "Auction not found in auctionData",
        };
    }

    // Check if the auction is already in the selection
    if (auctionSelection.find((a) => a.auctionId === auctionId)) {
        return {
            success: false,
            message: "Auction is already in the selection",
        };
    }

    // Determine the order based on the current length of the selection
    const order = auctionSelection.length + 1;

    // Add the order to the auction and push it to the selection
    auction.order = order;
    auctionSelection.push(auction);

    console.log(`Auction ${auctionId} added to selection with order ${order}.`);
    return {
        success: true,
        message: "Auction added to selection successfully",
        auctions: auctionSelection,
    };
}


// Function to remove an auction from the selection
function removeAuctionFromSelection(auctionId) {
    const index = auctionSelection.findIndex((a) => a.auctionId === auctionId);

    if (index === -1) {
        console.log(`Auction ${auctionId} not found in selection.`);
        return {
            success: false,
            message: "Auction not found in selection",
        };
    }

    // Remove the auction from the selection
    const removedAuction = auctionSelection.splice(index, 1)[0];
    const auction = auctionData.find((a) => a.auctionId === auctionId);
    auction.order = null; // Reset order
    console.log(`Auction ${auctionId} removed from selection.`);

    // Update the order of the remaining auctions
    for (let i = index; i < auctionSelection.length; i++) {
        auctionSelection[i].order = i + 1; // Reasignar orden
    }

    return {
        success: true,
        message: "Auction removed from selection successfully",
        auctions: auctionSelection,
    };
}

// Function to get all auctions in the selection
function getAuctionSelection() {
    return {
        success: true,
        message: "Auction selection retrieved successfully",
        auctions: auctionSelection,
    };
}

module.exports = {
    createAuction,
    updateAuctionState,
    addBidToAuction,
    getAuctionData,
    auctionData,
    auctionSelection,
    updateAuction,
    getAllAuctions,
    addAuctionToSelection,
    removeAuctionFromSelection,
    getAuctionSelection,
};
