'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useWebSocket } from '@/app/context/WebSocketContext';
import AuctionDataCard from '@/components/AuctionDataCard';
import AuctionTransactionCard from '@/components/AuctionTransactionCard';
import AuctionUsersCard from '@/components/AuctionUsersCard';
import AuctionDetails from '@/components/AuctionDetails';
import AuctionAdminCard from '@/components/AuctionAdminCard';
import { toast } from 'sonner';

interface Auction {
  id: string;
  name: string;
  url: string;
  painter: string;
  year: number;
  base_price: number;
  current_price: number;
  end_time: string;
}

interface User {
  id: string;
  nombre: string;
  apellido: string;
  role: string;
}

export default function AuctionRoom() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const [auction, setAuction] = useState<Auction | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [auctionState, setAuctionState] = useState<any | null>(null);
  const socket = useWebSocket();
  const [loading, setLoading] = useState(true);

  // Fetch auction details
  useEffect(() => {
    if (!id) return;
    const fetchAuction = async () => {
      try {
        const responses = await Promise.all([
          fetch(`http://localhost:3001/api/auction?auctionId=${id}`),
          fetch(`http://localhost:3001/api/auction-room-users?auctionId=${id}`),
          fetch(`http://localhost:3001/api/users?userId=${userId}`),
          fetch(`http://localhost:3001/api/auction-room-state?auctionId=${id}`)
        ]);

        const [auctionResponse, usersResponse, userResponse, auctionRoomResponse] = await Promise.all(
          responses.map((res) => res.json())
        );

        setAuction(auctionResponse);
        setUsers(usersResponse.users || []);
        setUser(userResponse);
        setAuctionState(auctionRoomResponse || {});
      } catch (error) {
        toast.error('Error al cargar los datos.');
        console.error('Error fetching auction details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuction();
    return () => {
      socket.current?.emit('user_left', { userId, auctionId: id });
    };
  }, [id]);

  const handleCreateAuction = async () => {
    try {
      const timer = document.getElementById('timer') as HTMLInputElement;
      const increment = document.getElementById('increment') as HTMLInputElement;
      const currentPrice = auction?.base_price || 0;
      const timeMillis = parseInt(timer.value) * 60 * 1000;

      socket.current?.emit('create_auction', {
        auctionId: id,
        countdownDuration: timeMillis,
        increment: increment.value,
        currentPrice: currentPrice
      });
    } catch (error) {
      toast.error('Error al crear la subasta.');
      console.error('Error creating auction:', error);
    }
  };

  const handleUpdateAuction = async () => {
    try {
      const timer = document.getElementById('timer') as HTMLInputElement;
      const increment = document.getElementById('increment') as HTMLInputElement;
      const currentPrice = auction?.base_price || 0;
      const timeMillis = parseInt(timer.value) * 60 * 1000;

      socket.current?.emit('update_auction', {
        auctionId: id,
        countdownDuration: timeMillis,
        increment: increment.value,
        currentPrice: currentPrice
      });
    } catch (error) {
      toast.error('Error al actualizar la subasta.');
      console.error('Error updating auction:', error);
    }
  };

  const handleStartAuction = async () => {
    try {
      socket.current?.emit('start_auction', { auctionId: id });
    } catch (error) {
      toast.error('Error al iniciar la subasta.');
      console.error('Error starting auction:', error);
    }
  };

  const handleEndAuction = async () => {
    try {
      socket.current?.emit('end_auction', { auctionId: id });
    } catch (error) {
      toast.error('Error al finalizar la subasta.');
      console.error('Error ending auction:', error);
    }
  };

  const handlePlaceBid = async (amountBid: number) => {
    try {
      socket.current?.emit('place_bid', {
        auctionId: id,
        userId,
        nombre: user?.nombre,
        apellido: user?.apellido,
        role: user?.role,
        amountBid
      });

    } catch (error) {
      toast.error('Error al realizar la puja.');
      console.error('Error placing bid:', error);
    }
  };

  // Handle WebSocket events
  useEffect(() => {
    if (!socket?.current || !id || !userId) return;

    const connectAndJoin = () => {
      if (!socket.current?.connected) {
        socket.current?.connect();
      }
      socket.current?.emit('user_entered', { userId, auctionId: id });
    };

    const handleDisconnect = () => {
      socket.current?.emit('user_left', { userId, auctionId: id });
    };

    const handleRoomUpdated = (data: { users: any }) => {
      setUsers(data.users.users);
    };

    connectAndJoin();

    socket.current.on('connect', connectAndJoin);
    socket.current.on('disconnect', handleDisconnect);
    socket.current.on('room_updated', handleRoomUpdated);
    socket.current.on('auction_created', (data: any) => {
      setAuctionState(data);
      toast.success('Subasta creada por el manejador');
    });
    socket.current.on('auction_updated', (data: any) => {
      setAuctionState(data);
      toast.info('Subasta actualizada.');
    });
    socket.current.on('auction_started', (data: any) => {
      setAuctionState(data);
      toast.success('La subasta ha comenzado.');
    });
    socket.current.on('auction_ended', (data: any) => {
      setAuctionState(data);
      toast.success('La subasta ha finalizado.');
    });
    socket.current.on('bid_placed', (data: any) => {
      setAuctionState(data);
      toast.success(`Nueva puja`);
    });

    return () => {
      socket.current?.off('connect', connectAndJoin);
      socket.current?.off('disconnect', handleDisconnect);
      socket.current?.off('room_updated', handleRoomUpdated);
    };
  }, [socket, id, userId]);

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Sala de Subasta</h1>
      <div>
        {loading ? (
          <div>Cargando datos...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1">
              <AuctionDataCard auction={auction} />
            </div>
            <div>
              <AuctionTransactionCard auctionState={auctionState} onPlaceBid={handlePlaceBid} />
            </div>
            <div>
              <AuctionUsersCard users={users} userId={userId} />
              <AuctionDetails auctionState={auctionState} handleEndAuction={handleEndAuction} />
              {user?.role === 'admin' ? (
                <AuctionAdminCard
                  auctionState={auctionState}
                  handleCreateAuction={handleCreateAuction}
                  handleUpdateAuction={handleUpdateAuction}
                  handleStartAuction={handleStartAuction}
                  handleEndAuction={handleEndAuction}
                />
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
