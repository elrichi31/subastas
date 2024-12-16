'use client';

import React, { useEffect, useState } from 'react';
import { useWebSocket } from '@/app/context/WebSocketContext';
import { AuctionCard } from '@/components/AuctionCard';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Auction {
  auctionId: number;
  name: string;
  url: string;
  painter: string;
  year: number;
  basePrice: number;
  state: string;
}

export default function AuctionsPage() {
  const { socket, connected } = useWebSocket();
  const [auctionData, setAuctionData] = useState<Auction[]>([]);
  const [user, setUser] = useState({});
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const router = useRouter();
  const [auctionSelection, setAuctionSelection] = useState<any>([]);

  // Entrar a la sala de subasta
  const enterLobby = (id: number) => {
    router.push(`/auctions/${id}?userId=${userId}`);
  };

  useEffect(() => {
    fetch(`http://localhost:3001/api/users?userId=${userId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error fetching user data');
        }
        return response.json();
      })
      .then((data) => {
        setUser(data);
      });

    if (connected) {
      socket?.emit('get_auctions');
      socket?.emit('get_auction_selection');

      socket?.on('auctions', (auctions) => {
        setAuctionData(auctions.auctions);
      });

      socket?.on('auction_selection', (data) => {
        if (!data.success) {
          toast(`${data.message}`);
        } else {
          setAuctionSelection(data.auctions);
        }
      });

      socket?.on('state_updated', (data) => {
        setAuctionSelection(data.auctions);
      });
    }

    return () => {
      socket?.off('auctions');
      socket?.off('auction_selection');
      socket?.off('state_updated');
    };
  }, [socket, connected]);



  const handleSelection = (id: number) => {
    socket?.emit('add_auction_selection', { auctionId: id });
  };

  const handleDeleteSelection = (id: number) => {
    socket?.emit('remove_auction_selection', { auctionId: id });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Subastas de Arte</h1>
      <h1 className="text-xl font-bold mb-6">Orden de las subastas</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {auctionSelection.length === 0 ? (
          <div>No hay subastas seleccionadas, espera a que el administrador las agregue</div>
        ) : (
          auctionSelection.map((auction: any) => (
            <AuctionCard
              key={auction.auctionId}
              user={user}
              auction={auction}
              registerSelection={handleSelection}
              enterLobby={enterLobby}
              selected={true}
              deleteSelection={handleDeleteSelection}
            />
          ))
        )}
      </div>
      <h1 className="text-xl font-bold mb-6">Todas las subastas</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {auctionData.map((auction, e) => (
          <AuctionCard
            key={auction.auctionId}
            user={user}
            auction={auction}
            registerSelection={handleSelection}
            enterLobby={enterLobby}
            selected={false}
          />
        ))}
      </div>
    </div>
  );
}
