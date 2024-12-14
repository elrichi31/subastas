'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { AuctionCard } from '@/components/AuctionCard';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
interface Auction {
  id: number;
  name: string;
  url: string;
  painter: string;
  year: number;
  base_price: number;
}

export default function AuctionsPage() {
  const [auctionData, setAuctionData] = useState<Auction[]>([]);
  const [registeredAuctions, setRegisteredAuctions] = useState<number[]>([]);
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const router = useRouter();

  // Fetch registered auctions for the user
  const fetchRegisteredAuctions = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetch(`http://localhost:3001/api/my-auctions?userId=${userId}`);
      if (!response.ok) {
        console.error('Error fetching registered auctions:', response.statusText);
        throw new Error('Failed to fetch registered auctions');
      }
      const data = await response.json();
      const registeredAuctionIds = data.map((auction: Auction) => auction.id);
      setRegisteredAuctions(registeredAuctionIds);
    } catch (error) {
      console.error('Error fetching registered auctions:', error);
      toast.error('No se pudieron cargar las subastas registradas');
    }
  }, [userId]);
  // Fetch all auctions
  useEffect(() => {
    fetch('http://localhost:3001/api/auctions')
      .then((response) => response.json())
      .then((data) => setAuctionData(data))
      .catch((error) => {
        console.error('Error fetching auctions:', error);
        toast.error('No se pudieron cargar las subastas');
      });

    fetchRegisteredAuctions();
  }, [fetchRegisteredAuctions]);

  // Handle register or unregister auction
  const handleRegister = async (id: number) => {
    const isAlreadyRegistered = registeredAuctions.includes(id);

    if (isAlreadyRegistered) {
      // Unregister auction using DELETE
      try {
        const response = await fetch(`http://localhost:3001/api/unregister-auction`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, auctionId: id }),
        });

        if (!response.ok) {
          console.error('Error unregistering auction:', response.statusText);
          throw new Error('Failed to unregister auction');
        }

        setRegisteredAuctions((prev) => prev.filter((auctionId) => auctionId !== id));
        toast('Subasta eliminada', {
          description: `Has quitado la subasta con ID: ${id}`,
        });
      } catch (error) {
        console.error('Error unregistering auction:', error);
        toast.error('No se pudo eliminar la subasta');
      }
    } else {
      // Register auction using POST
      try {
        const response = await fetch(`http://localhost:3001/api/register-auction`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, auctionId: id }),
        });

        if (!response.ok) {
          console.error('Error registering auction:', response.statusText);
          throw new Error('Failed to register auction');
        }

        setRegisteredAuctions((prev) => [...prev, id]);
        toast('Subasta registrada', {
          description: `Te has registrado en la subasta con ID: ${id}`,
        });
      } catch (error) {
        console.error('Error registering auction:', error);
        toast.error('No se pudo registrar la subasta');
      }
    }
  };

  // Enter auction lobby
  const enterLobby = (id: number) => {
    router.push(`/auctions/${id}?userId=${userId}`);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Subastas de Arte</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {auctionData.map((auction) => (
          <AuctionCard
            key={auction.id}
            id={auction.id}
            url={auction.url}
            name={auction.name}
            painter={auction.painter}
            year={auction.year}
            base_price={auction.base_price}
            onRegister={handleRegister}
            isRegistered={registeredAuctions.includes(auction.id)}
            enterLobby={enterLobby}
          />
        ))}
      </div>
    </div>
  );
}
