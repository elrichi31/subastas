'use client';

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SocketContext = createContext<{ current: Socket | null } | null>(null);

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const socket = useRef<Socket | null>(null);

  useEffect(() => {
    if (!socket.current) {
      socket.current = io('http://localhost:3001', {
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 500,
        reconnectionAttempts: Infinity,
      });

      // Manejo de eventos de conexión y reconexión
      socket.current.on('connect', () => {
        console.log('Connected to server:', socket.current?.id);

        // Registrar al usuario después de reconectar
        const userId = localStorage.getItem('userId'); // Guardar el userId en localStorage
        if (userId) {
          socket.current?.emit('register_user', { userId });
          console.log(`Usuario ${userId} registrado después de reconexión.`);
        }
      });

      socket.current.on('disconnect', (reason) => {
        console.log('Disconnected from server:', reason);
      });

      socket.current.on('connect_error', (error) => {
        console.error('Connection error:', error);
      });
    }

    return () => {
      socket.current?.disconnect();
      socket.current = null;
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const socket = useContext(SocketContext);
  if (!socket) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return socket;
};
