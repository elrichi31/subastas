'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWebSocket } from '@/app/context/WebSocketContext';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuctionDataCard from '@/components/AuctionDataCard';
import AuctionTransactionCard from '@/components/AuctionTransactionCard';
import AuctionUsersCard from '@/components/AuctionUsersCard';
import AuctionDetails from '@/components/AuctionDetails';
import AuctionAdminCard from '@/components/AuctionAdminCard';

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
  const [loading, setLoading] = useState(true); // Indicador de carga

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

        console.log("Auction response", auctionRoomResponse);

        setAuction(auctionResponse);
        setUsers(usersResponse.users || []);
        setUser(userResponse);
        setAuctionState(auctionRoomResponse || {});

      } catch (error) {
        console.error('Error fetching auction details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuction();
    return () => {
      socket.current?.emit('user_left', { userId, auctionId: id });
    }

  }, [id]);

  const handleCreateAuction = async () => {
    const timer = document.getElementById('timer') as HTMLInputElement;
    const increment = document.getElementById('increment') as HTMLInputElement;
    const currentPrice = auction?.base_price || 0;
    const timeMillis = parseInt(timer.value) * 60 * 1000;
    console.log(timer.value, increment.value, currentPrice);
    socket.current?.emit('create_auction', {
      auctionId: id,
      countdownDuration: timeMillis,
      increment: increment.value,
      currentPrice: currentPrice
    });
  }

  const handleUpdateAuction = async () => {
    const timer = document.getElementById('timer') as HTMLInputElement;
    const increment = document.getElementById('increment') as HTMLInputElement;
    const currentPrice = auction?.base_price || 0;
    const timeMillis = parseInt(timer.value) * 60 * 1000;
    console.log(timer.value, increment.value, currentPrice);
    socket.current?.emit('update_auction', {
      auctionId: id,
      countdownDuration: timeMillis,
      increment: increment.value,
      currentPrice: currentPrice
    });
  }

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
    });
    socket.current.on('auction_updated', (data: any) => {
      setAuctionState(data);
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <AuctionDataCard auction={auction} />
        </div>
        <div>
          <AuctionTransactionCard />
        </div>
        <div>
          {loading ? (
            <div>Cargando datos...</div>
          ) : (
            <div>
              <AuctionUsersCard users={users} userId={userId} />
              <AuctionDetails auctionState={auctionState} />
              {user?.role === "admin" ? (
                <AuctionAdminCard
                  auctionState={auctionState}
                  handleCreateAuction={handleCreateAuction}
                  handleUpdateAuction={handleUpdateAuction}
                />
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );  
}
