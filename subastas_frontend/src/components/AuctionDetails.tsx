import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AuctionDetails({ auctionState, handleEndAuction }: any) {
    const auction = auctionState.auction;
    const initialTime = auction?.time || 0; // Tiempo inicial en milisegundos
    const [timeRemaining, setTimeRemaining] = useState<number>(initialTime); // Tiempo restante
    const [isCountdownActive, setIsCountdownActive] = useState(false);
    const [hasTimerStarted, setHasTimerStarted] = useState(false); // Nueva bandera para evitar reinicios

    // Función para iniciar la cuenta regresiva
    const handleStartCountdown = () => {
        if (timeRemaining > 0 && !hasTimerStarted) {
            setIsCountdownActive(true);
            setHasTimerStarted(true); // Marca el temporizador como iniciado
        }
    };

    // Actualizar el tiempo restante solo si la subasta comienza
    useEffect(() => {
        if (auction?.state === "in progress" && !hasTimerStarted) {
            setTimeRemaining(auction.time); // Establece el tiempo inicial
            handleStartCountdown(); // Inicia el temporizador
        }

        if (auction?.state === "finished") {
            setIsCountdownActive(false);
            setTimeRemaining(initialTime); // Reinicia el tiempo restante al valor inicial
            setHasTimerStarted(false); // Permitir que el temporizador pueda iniciarse nuevamente
        }
    }, [auction?.state]); // Escucha solo cambios en el estado de la subasta

    // Efecto para manejar la cuenta regresiva
    useEffect(() => {
        let timer: NodeJS.Timeout | null = null;

        if (isCountdownActive && timeRemaining > 0) {
            timer = setInterval(() => {
                setTimeRemaining((prev) => prev - 1000); // Reducir 1 segundo (1000 ms)
            }, 1000);
        } else if (timeRemaining <= 0 && isCountdownActive) {
            setIsCountdownActive(false);
            handleEndAuction(); // Llama a la función para finalizar la subasta
            setTimeRemaining(initialTime); // Reinicia el tiempo restante al valor inicial
            setHasTimerStarted(false); // Permitir que el temporizador pueda iniciarse nuevamente
        }

        return () => {
            if (timer) {
                clearInterval(timer); // Limpia el temporizador al desmontar
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
            case "not configured":
                return <span className="px-2 py-1 text-xs font-bold text-red-600 bg-red-100 rounded">No configurado</span>;
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
                    {/* Renderizar el ganador */}
                    <div>
                        <span className="text-sm font-bold">Ganador:</span>
                        <p>{auction.winner || "Sin ganador"}</p>
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
