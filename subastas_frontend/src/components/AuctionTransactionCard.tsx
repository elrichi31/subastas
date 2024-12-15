import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AuctionTransactionCard({ auctionState, onPlaceBid }: any) {
    const [customBid, setCustomBid] = useState("");
    const transactionsEndRef = useRef<HTMLDivElement | null>(null);

    // Desplazar al final cuando cambien las transacciones
    useEffect(() => {
        if (auctionState?.auction?.transactions && transactionsEndRef.current) {
            transactionsEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [auctionState?.auction?.transactions]);

    if (!auctionState) {
        return (
            <Card className="my-4 lg:my-0" style={{ maxHeight: "700px" }}>
                <CardHeader>
                    <CardTitle>Transacciones de la Subasta</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Cargando datos...</p>
                </CardContent>
            </Card>
        );
    }

    if (auctionState.message === 'Auction not found') {
        return (
            <Card className="my-4 lg:my-0" style={{ maxHeight: "700px" }}>
                <CardHeader>
                    <CardTitle>Transacciones de la Subasta</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Subasta no creada</p>
                </CardContent>
            </Card>
        );
    }

    const transactions = auctionState.auction.transactions || [];
    const increment = auctionState.auction.increment || 0;
    const state = auctionState.auction.state !== "in progress";

    const handleBid = (amount: number) => {
        if (onPlaceBid) {
            onPlaceBid(amount); // Llamar a la función pasada como prop
        }
    };

    const handleCustomBid = () => {
        const customAmount = parseFloat(customBid);
        if (!isNaN(customAmount) && customAmount > 0 && onPlaceBid) {
            onPlaceBid(customAmount);
            setCustomBid(""); // Limpiar el input después de enviar
        }
    };

    return (
        <Card className="my-4 lg:my-0" style={{ height: "700px", display: "flex", flexDirection: "column" }}>
            <CardHeader>
                <CardTitle>Transacciones de la Subasta</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
                {/* Mostrar historial de transacciones */}
                <div className="overflow-y-auto" style={{ height: "400px", border: "1px solid #ddd", borderRadius: "4px", padding: "8px" }}>
                    {transactions.length > 0 ? (
                        <ul className="space-y-2">
                            {transactions.map((transaction: any, index: number) => (
                                <li key={index} className="text-sm border p-2 rounded">
                                    <strong>Usuario:</strong> {transaction.nombre || "Desconocido"} {transaction.apellido || ""}<br />
                                    <strong>Monto:</strong> ${transaction.amountBid.toLocaleString()}<br />
                                    <strong>Nuevo Precio:</strong> ${transaction.priceAfterBid.toLocaleString()}
                                </li>
                            ))}
                            {/* Referencia al final */}
                            <div ref={transactionsEndRef}></div>
                        </ul>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <span>Historial de subasta no disponible</span>
                        </div>
                    )}
                </div>

                {/* Controles para pujar */}
                <div className="mt-6">
                    <h3 className="text-md font-semibold">Realizar Pujas</h3>
                    <div className="flex space-x-2 mt-4">
                        <Button onClick={() => handleBid(increment + 1)} disabled={state}>
                            +${(increment + 1).toLocaleString()}
                        </Button>
                        <Button onClick={() => handleBid(increment * 2)} disabled={state}>
                            +${(increment * 2).toLocaleString()}
                        </Button>
                        <Button onClick={() => handleBid(increment * 3)} disabled={state}>
                            +${(increment * 3).toLocaleString()}
                        </Button>
                    </div>
                    <div className="mt-4">
                        <Input
                            type="number"
                            placeholder="Monto personalizado"
                            value={customBid}
                            onChange={(e) => setCustomBid(e.target.value)}
                            className="mb-2"
                        />
                        <Button onClick={handleCustomBid} disabled={state}>
                            Enviar Oferta
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
