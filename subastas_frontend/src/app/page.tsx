'use client';

import { useEffect, useState } from 'react';

export default function WebSocketClient() {
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3001');

    ws.onopen = () => {
      console.log('Connected to WebSocket');
      ws.send('Hello, server!');
    };

    ws.onmessage = (event) => {
      setMessages((prev) => [...prev, event.data]);
      console.log('Message from server:', event.data);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div>
      <h1>WebSocket Client</h1>
      <ul>
        {messages.map((msg, idx) => (
          <li key={idx}>{msg}</li>
        ))}
      </ul>
    </div>
  );
}
