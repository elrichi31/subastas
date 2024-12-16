'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AuctionCard } from '@/components/AuctionCard';
import { toast } from 'sonner';

interface Auction {
    id: number;
    name: string;
    url: string;
    painter: string;
    year: number;
    base_price: number;
    state: string;
}

export default function MyAuctionsPage() {
    const router = useRouter();
    const [registeredAuctions, setRegisteredAuctions] = useState<Auction[]>([]);
    const searchParams = useSearchParams();
    const userId = searchParams.get('userId'); // Obtener el userId

    useEffect(() => {
        if (userId) {
            fetch(`http://localhost:3001/api/my-auctions?userId=${userId}`)
                .then((response) => response.json())
                .then((data) => setRegisteredAuctions(data))
                .catch((error) => {
                    console.error('Error fetching registered auctions:', error);
                    toast.error('No se pudieron cargar tus subastas registradas.');
                });
        }
    }, [userId]);

    const handleRegister = async (id: number) => {
        const isAlreadyRegistered = registeredAuctions.some((auction) => auction.id === id);

        if (isAlreadyRegistered) {
            // Eliminar subasta
            try {
                const response = await fetch('http://localhost:3001/api/unregister-auction', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, auctionId: id }),
                });

                if (!response.ok) {
                    console.error('Error al quitar la subasta:', response.statusText);
                    throw new Error('No se pudo eliminar la subasta');
                }

                setRegisteredAuctions((prev) => prev.filter((auction) => auction.id !== id));
                toast('Subasta eliminada', {
                    description: `Has quitado la subasta con ID: ${id}`,
                });
            } catch (error) {
                console.error('Error eliminando subasta:', error);
                toast.error('No se pudo eliminar la subasta.');
            }
        } else {
            // Registrar subasta
            try {
                const response = await fetch('http://localhost:3001/api/register-auction', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, auctionId: id }),
                });

                if (!response.ok) {
                    console.error('Error al registrar la subasta:', response.statusText);
                    throw new Error('No se pudo registrar la subasta');
                }

                const auction = await response.json();
                setRegisteredAuctions((prev) => [...prev, auction]);
                toast('Subasta registrada', {
                    description: `Te has registrado en la subasta con ID: ${id}`,
                });
            } catch (error) {
                console.error('Error registrando subasta:', error);
                toast.error('No se pudo registrar la subasta.');
            }
        }
    };

    const enterLobby = (id: number) => {
        router.push(`/auctions/${id}?userId=${userId}`);
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6 text-center">Mis Subastas</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            </div>
        </div>
    );
}
