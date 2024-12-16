const fs = require("fs");
const path = require("path");
const { createAuction, auctionData } = require("./services/auction-service");

// Función para crear todas las subastas
function createAllAuctions(jsonFilePath) {
    try {
        // Leer y parsear el archivo JSON
        const jsonData = fs.readFileSync(path.resolve(__dirname, jsonFilePath), "utf-8");
        const auctions = JSON.parse(jsonData);

        auctions.forEach((auction) => {
            const { id, url, painter, name, year, base_price } = auction;
            const countdownDuration = 1 * 60 * 1000; // Ejemplo: 5 minutos en milisegundos
            const increment = 1000; // Ejemplo: incremento fijo

            const result = createAuction(id, url, painter, name, year, base_price, increment, countdownDuration);
            if (result.success) {
                console.log(`Subasta creada: ${auction.name}`);
            } else {
                console.error(`Error creando subasta: ${auction.name}`);
            }
        });

        console.log(`Total de subastas creadas: ${auctionData.length}`);
    } catch (error) {
        console.error("Error al crear subastas:", error.message);
    }
}

module.exports = {createAllAuctions};
