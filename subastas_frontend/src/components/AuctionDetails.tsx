import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AuctionDetails({ auctionState, handleEndAuction }: any) {
    const auction = auctionState.auction;
    const [timeRemaining, setTimeRemaining] = useState<number>(auction?.time || 0); // Tiempo en milisegundos
    const [isCountdownActive, setIsCountdownActive] = useState(false);

    const handleStartCountdown = () => {
        if (timeRemaining > 0) {
            setIsCountdownActive(true);
        }
    };

    // Actualizar el tiempo restante cuando `auctionState` cambie
    useEffect(() => {
        if (auction?.time) {
            setTimeRemaining(auction.time); // Actualizar el tiempo restante con el valor más reciente
            setIsCountdownActive(false); // Detener el temporizador si se reinician los datos
        }

        if (auction?.state === "in progress") {
            handleStartCountdown();
        }

        if (auction?.state === "finished") {
            setIsCountdownActive(false);
        }
    }, [auctionState]); // Escuchar cambios en `auctionState`

    // Efecto para manejar la cuenta regresiva
    useEffect(() => {
        let timer: NodeJS.Timeout | null = null;

        if (isCountdownActive && timeRemaining > 0) {
            timer = setInterval(() => {
                setTimeRemaining((prev) => prev - 1000); // Reducir 1 segundo (1000 ms)
            }, 1000);
        } else if (timeRemaining <= 0 && isCountdownActive) {
            setIsCountdownActive(false);
            handleEndAuction();
            console.log('Auction ended');
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

    // Determinar color del tag basado en el estado
    const getStatusTag = () => {
        switch (auction.state) {
            case "not initiated":
                return <span className="px-2 py-1 text-xs font-bold text-blue-600 bg-blue-100 rounded">No iniciado</span>;
            case "in progress":
                return <span className="px-2 py-1 text-xs font-bold text-yellow-600 bg-yellow-100 rounded">En progreso</span>;
            case "finished":
                return <span className="px-2 py-1 text-xs font-bold text-green-600 bg-green-100 rounded">Terminado</span>;
            default:
                return <span className="px-2 py-1 text-xs font-bold text-gray-600 bg-gray-100 rounded">Desconocido</span>;
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    Detalles de la Subasta
                    {getStatusTag()} {/* Renderizar el tag basado en el estado */}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4">
                    {/* Renderizar el estado */}
                    <div>
                        <span className="text-sm font-bold">Ganador:</span>
                        <p>{auction.winner}</p>
                    </div>

                    {/* Renderizar el precio actual */}
                    <div>
                        <span className="text-sm font-bold">Precio Actual:</span>
                        <p>${auction.currentPrice.toLocaleString() || "0.00"}</p>
                    </div>

                    {/* Renderizar el incremento */}
                    <div>
                        <span className="text-sm font-bold">Incremento:</span>
                        <p>${auction.increment.toLocaleString() || "0.00"}</p>
                    </div>

                    {/* Renderizar el tiempo restante */}
                    <div>
                        <span className="text-sm font-bold">Tiempo Restante:</span>
                        <p>{timeRemaining > 0 ? formatTime(timeRemaining) : "Tiempo agotado"}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
