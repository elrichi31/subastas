import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AuctionDetails({ auctionState }: any) {
    const auction = auctionState.auction;
    const [timeRemaining, setTimeRemaining] = useState<number>(auction?.time || 0); // Tiempo en milisegundos
    const [isCountdownActive, setIsCountdownActive] = useState(false);

    // Actualizar el tiempo restante cuando `auctionState` cambie
    useEffect(() => {
        if (auction?.time) {
            setTimeRemaining(auction.time); // Actualizar el tiempo restante con el valor más reciente
            setIsCountdownActive(false); // Detener el temporizador si se reinician los datos
        }
    }, [auctionState]); // Escuchar cambios en `auctionState`

    // Función para iniciar el contador
    const handleStartCountdown = () => {
        if (timeRemaining > 0) {
            setIsCountdownActive(true);
        }
    };

    // Efecto para manejar la cuenta regresiva
    useEffect(() => {
        let timer: NodeJS.Timeout | null = null;

        if (isCountdownActive && timeRemaining > 0) {
            timer = setInterval(() => {
                setTimeRemaining((prev) => prev - 1000); // Reducir 1 segundo (1000 ms)
            }, 1000);
        } else if (timeRemaining <= 0 && timer) {
            clearInterval(timer); // Detener el temporizador cuando llegue a 0
            setIsCountdownActive(false);
        }

        return () => {
            if (timer) {
                clearInterval(timer); // Limpiar el temporizador al desmontar
            }
        };
    }, [isCountdownActive, timeRemaining]);

    // Convertir milisegundos a minutos y segundos
    const formatTime = (milliseconds: number) => {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    if (auctionState.success === false) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Detalles de la Subasta</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>No se encontraron datos de la subasta.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Detalles de la Subasta</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4">
                    {/* Renderizar el estado */}
                    <div>
                        <span className="text-sm font-bold">Estado:</span>
                        <p>{auction.state === "not initiated" ? "No iniciado" : auction.state || "Sin datos"}</p>
                    </div>

                    {/* Renderizar el precio actual */}
                    <div>
                        <span className="text-sm font-bold">Precio Actual:</span>
                        <p>${auction.currentPrice || "0.00"}</p>
                    </div>

                    {/* Renderizar el incremento */}
                    <div>
                        <span className="text-sm font-bold">Incremento:</span>
                        <p>${auction.increment || "0.00"}</p>
                    </div>

                    {/* Renderizar el tiempo restante */}
                    <div>
                        <span className="text-sm font-bold">Tiempo Restante:</span>
                        <p>{timeRemaining > 0 ? formatTime(timeRemaining) : "Tiempo agotado"}</p>
                        {!isCountdownActive && timeRemaining > 0 && (
                            <Button className="mt-2" onClick={handleStartCountdown}>
                                Iniciar cuenta regresiva
                            </Button>
                        )}
                    </div>

                    {/* Renderizar las transacciones (si existen) */}
                    <div className="col-span-2">
                        <span className="text-sm font-bold">Transacciones:</span>
                        {auction.transactions && auction.transactions.length > 0 ? (
                            <ul className="mt-2 space-y-2">
                                {auction.transactions.map((transaction: any, index: number) => (
                                    <li key={index} className="text-sm">
                                        <strong>Usuario:</strong> {transaction.nombre} {transaction.apellido} <br />
                                        <strong>Rol:</strong> {transaction.role} <br />
                                        <strong>Monto Ofrecido:</strong> ${transaction.amountBid} <br />
                                        <strong>Precio Después de la Oferta:</strong> ${transaction.priceAfterBid}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>Sin transacciones registradas</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
