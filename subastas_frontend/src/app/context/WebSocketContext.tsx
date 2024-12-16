'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextValue {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextValue | null>(null);

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!socketRef.current) {
      console.log('Initializing socket...');
      socketRef.current = io('http://localhost:3001', {
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 500,
        reconnectionAttempts: Infinity,
      });
  
      socketRef.current.on('connect', () => {
        console.log('Connected to server:', socketRef.current?.id);
        setConnected(true);
  
        const userId = localStorage.getItem('userId');
        if (userId) {
          console.log(`Registering user ${userId}`);
          socketRef.current?.emit('register_user', { userId });
        }
      });
  
      socketRef.current.on('disconnect', (reason) => {
        console.log('Disconnected from server:', reason);
        setConnected(false);
      });
  
      socketRef.current.on('connect_error', (error) => {
        console.error('Connection error:', error);
      });
    }
  
    return () => {
      console.log('Cleaning up socket connection...');
      socketRef.current?.removeAllListeners();
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);
  

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
