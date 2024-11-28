'use client';

import React, { createContext, useContext, useEffect, useRef } from 'react';

const WebSocketContext = createContext<{ current: WebSocket | null } | null>(null);

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!ws.current) {
      ws.current = new WebSocket('ws://localhost:3001');
      ws.current.onopen = () => console.log('Connected to WebSocket server from WebSocketProvider');
      ws.current.onclose = () => console.log('WebSocket disconnected');
      ws.current.onerror = (error) => console.error('WebSocket error:', error);
    }

    return () => {
      ws.current?.close();
      ws.current = null;
    };
  }, []);

  return (
    <WebSocketContext.Provider value={ws}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const ws = useContext(WebSocketContext);
  if (!ws) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return ws;
};
