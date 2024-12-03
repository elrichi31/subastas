'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Paintbrush, Calendar, DollarSign, Users } from 'lucide-react';
import { useWebSocket } from '@/app/context/WebSocketContext';

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
}

export default function AuctionRoom() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const [auction, setAuction] = useState<Auction | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [bidAmount, setBidAmount] = useState('');
  const [registered, setRegistered] = useState(false);
  const ws = useWebSocket(); // Use existing WebSocket context

  // Fetch auction details and participants
  useEffect(() => {
    fetch(`http://localhost:3001/api/auction?auctionId=${id}`)
      .then((response) => response.json())
      .then((data) => {
        setAuction(data);
      })
      .catch((error) => console.error('Error fetching auction details:', error));

    fetch(`http://localhost:3001/api/auction-users?auctionId=${id}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.users) {
          setUsers(data.users);
        }
      })
      .catch((error) => console.error('Error fetching participants:', error));
  }, []);

  // WebSocket message handling
  useEffect(() => {
    const socket = ws.current;
    console.log("userID" + userId, "auctionID" + id);

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: 'user_entered',
          userId,
          auctionId: id,
        })
      );

      const handleMessage = (event: MessageEvent) => {
        const message = JSON.parse(event.data);

        if (message.type === 'user_joined') {
          const { id: userId, nombre, apellido } = message.data;

          setUsers((prevUsers) => {
            // Evitar duplicados
            const isUserExists = prevUsers.some((user) => user.id === userId);
            if (isUserExists) {
              return prevUsers;
            }

            return [...prevUsers, { id: userId, nombre, apellido }];
          });
        }

        if (message.type === 'user_left') {
          setUsers((prevUsers) =>
            prevUsers.filter((user) => user.id !== message.data.id)
          );
        }
      };

      socket.addEventListener('message', handleMessage);

      return () => {
        socket.removeEventListener('message', handleMessage);
      };
    }
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Sala de Subasta</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{auction ? auction.name : 'Cargando...'}</CardTitle>
            </CardHeader>
            <CardContent>
              {auction && (
                <>
                  <div className="aspect-w-16 aspect-h-9 mb-4">
                    <img src={auction.url} alt={auction.name} className="object-cover rounded-lg" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Paintbrush className="w-4 h-4 text-muted-foreground" />
                      <span>Artista: {auction.painter}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>Año: {auction.year}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      <span>Precio base: ${auction.base_price.toLocaleString()}</span>
                    </div>
                  </div>
                </>
              )}
              <div className="mt-6 flex space-x-4">
                <Input
                  type="number"
                  placeholder="Monto de la puja"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="flex-grow"
                />
                <Button>Hacer Puja</Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Participantes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarFallback>{user.nombre?.charAt(0) || '?'}</AvatarFallback>
                    </Avatar>
                    <span>{user.nombre || 'Usuario desconocido'} {user.apellido || ''}</span>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4">
                {registered ? 'Ya unido' : 'Unirse a la Subasta'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
