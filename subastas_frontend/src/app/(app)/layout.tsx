"use client";
import { Navbar } from '@/components/Navbar';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface User {
  id: string;
  nombre: string;
  apellido: string;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId') || '';

  const [user, setUser] = useState<User>({
    id: '',
    nombre: 'Guest',
    apellido: '',
  });

  useEffect(() => {
    if (userId) {
      // Llamar al servidor para obtener los datos del usuario
      fetch(`http://localhost:3001/api/users?userId=${userId}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Error al obtener datos del usuario');
          }
          return response.json();
        })
        .then((data) => {
          if (data.id) {
            console.log('User data:', data);
            setUser({
              id: data.id,
              nombre: data.nombre,
              apellido: data.apellido,
            });
          }
        })
        .catch((error) => console.error('Error fetching user data:', error));
    }
  }, [userId]);

  return (
    <div>
      <Navbar
        userName={user.nombre}
        userLastName={user.apellido}
        userId={user.id}
      >
        {children}
      </Navbar>
    </div>
  );
}
