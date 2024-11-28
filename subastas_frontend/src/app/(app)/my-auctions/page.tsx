'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AuctionCard } from '@/components/AuctionCard';
import { toast } from 'sonner';
import { useWebSocket } from '@/app/context/WebSocketContext';

interface Auction {
    id: number;
    name: string;
    url: string;
    painter: string;
    year: number;
    base_price: number;
}

export default function MyAuctionsPage() {
    const [registeredAuctions, setRegisteredAuctions] = useState<Auction[]>([]);
    const searchParams = useSearchParams();
    const ws = useWebSocket();
    const userId = searchParams.get('userId'); // Obtener el userId

    useEffect(() => {
        if (userId) {
            fetch(`http://localhost:3001/api/my-auctions?userId=${userId}`)
                .then((response) => response.json())
                .then((data) => setRegisteredAuctions(data))
                .catch((error) => console.error('Error fetching registered auctions:', error));
        }
    }, [userId]);

    const handleRegister = (id: number) => {
        const isAlreadyRegistered = registeredAuctions.some((auction) => auction.id === id);

        if (isAlreadyRegistered) {
            // Quitar subasta
            setRegisteredAuctions((prev) => prev.filter((auction) => auction.id !== id));
            if (ws?.current && ws.current.readyState === WebSocket.OPEN && userId) {
                ws.current.send(
                    JSON.stringify({
                        type: 'remove_auction',
                        userId,
                        auctionId: id,
                    })
                );
            }
            toast("Subasta eliminada", {
                description: `Has quitado la subasta con ID: ${id}`,
            });
        } else {
            // Registrar subasta
            setRegisteredAuctions((prev) => [
                ...prev,
                {
                    id,
                    name: 'Nombre de la subasta',
                    url: 'URL de la subasta',
                    painter: 'Nombre del pintor',
                    year: 2021,
                    base_price: 1000,
                },
            ]); // Simular registro localmente
            toast("Subasta registrada", {
                description: `Te has registrado en la subasta con ID: ${id}`,
            });
        }
    };


    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6 text-center">Mis Subastas</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {registeredAuctions.map((auction) => (
                    <AuctionCard
                        key={auction.id}
                        id={auction.id}
                        url={auction.url}
                        name={auction.name}
                        painter={auction.painter}
                        year={auction.year}
                        base_price={auction.base_price}
                        onRegister={handleRegister} // Pasar el manejador de registro
                        isRegistered={true} // Siempre estará registrado en "Mis Subastas"
                    />
                ))}
            </div>
        </div>
    );
}
