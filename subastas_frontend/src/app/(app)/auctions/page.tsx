'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { AuctionCard } from '@/components/AuctionCard';
import { useWebSocket } from '@/app/context/WebSocketContext';
import { useSearchParams } from 'next/navigation';
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
  const ws = useWebSocket();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  
  const hasRegisteredRef = useRef(false);

      const fetchRegisteredAuctions = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetch(`http://localhost:3001/api/my-auctions?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch registered auctions');
      }
      const data = await response.json();
      const registeredAuctionIds = data.map((auction: Auction) => auction.id);
      setRegisteredAuctions(registeredAuctionIds);
    } catch (error) {
      console.error('Error fetching registered auctions:', error);
      toast.error("No se pudieron cargar las subastas registradas");
    }
  }, [userId]);

  // Robust registration function
  const registerUser = useCallback(() => {
    // Ensure we only register once
    if (hasRegisteredRef.current) return;

    const attemptRegistration = () => {
      // Check if WebSocket is available and user ID exists
      if (ws.current && userId) {
        // Always attempt to send registration, regardless of connection state
        try {
          // If connection is open, send directly
          if (ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(
              JSON.stringify({
                type: 'register_user',
                userId,
              })
            );
            hasRegisteredRef.current = true;
            console.log(`Usuario registrado con userId: ${userId}`);
            return true;
          }
          
          // If not open, set up an onopen handler
          ws.current.onopen = () => {
            if (!hasRegisteredRef.current) {
              ws.current?.send(
                JSON.stringify({
                  type: 'register_user',
                  userId,
                })
              );
              hasRegisteredRef.current = true;
              console.log(`Usuario registrado en onopen con userId: ${userId}`);
            }
          };

          // Fallback: force registration after a short delay
          setTimeout(() => {
            if (!hasRegisteredRef.current && ws.current && userId) {
              try {
                ws.current.send(
                  JSON.stringify({
                    type: 'register_user',
                    userId,
                  })
                );
                hasRegisteredRef.current = true;
                console.log(`Usuario registrado por timeout con userId: ${userId}`);
              } catch (error) {
                console.error('Error sending registration:', error);
              }
            }
          }, 500); // 1 second delay to ensure connection

          return false;
        } catch (error) {
          console.error('Registration error:', error);
          return false;
        }
      }
      return false;
    };

    // Initial attempt
    if (!attemptRegistration()) {
      // If first attempt fails, set up periodic checks
      const registrationInterval = setInterval(() => {
        if (attemptRegistration()) {
          clearInterval(registrationInterval);
        }
      }, 2000); // Check every 2 seconds

      // Ensure we don't keep checking indefinitely
      setTimeout(() => {
        clearInterval(registrationInterval);
      }, 30000); // Stop after 30 seconds
    }
  }, [ws, userId]);

  // Fetch auctions and registered auctions on component mount
  useEffect(() => {
    // Fetch all auctions
    fetch('http://localhost:3001/api/auctions')
      .then((response) => response.json())
      .then((data) => setAuctionData(data))
      .catch((error) => console.error('Error fetching auctions:', error));

    // Fetch user's registered auctions
    fetchRegisteredAuctions();
  }, [fetchRegisteredAuctions]);

  // WebSocket registration and message handling
  useEffect(() => {
    // Attempt to register user
    registerUser();

    // Handle incoming messages
    if (ws.current) {
      ws.current.onmessage = (event) => {
        const response = JSON.parse(event.data);
        if (response.success && response.selectedAuctions) {
          // Update registered auctions state
          const updatedRegisteredAuctions = response.selectedAuctions;
          setRegisteredAuctions(updatedRegisteredAuctions);
        }
      };
    }
  }, [ws, userId, registerUser]);

  const handleRegister = (id: number) => {
    const isAlreadyRegistered = registeredAuctions.includes(id);
    let updatedRegisteredAuctions: number[];

    if (isAlreadyRegistered) {
      // Remove auction
      updatedRegisteredAuctions = registeredAuctions.filter((auctionId) => auctionId !== id);
      setRegisteredAuctions(updatedRegisteredAuctions);

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
      // Register auction
      updatedRegisteredAuctions = [...registeredAuctions, id];
      setRegisteredAuctions(updatedRegisteredAuctions);

      if (ws?.current && ws.current.readyState === WebSocket.OPEN && userId) {
        ws.current.send(
          JSON.stringify({
            type: 'select_auction',
            userId,
            auctionId: id,
          })
        );
      }
      toast("Subasta registrada", {
        description: `Te has registrado en la subasta con ID: ${id}`,
      });
    }
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
          />
        ))}
      </div>
    </div>
  );
}