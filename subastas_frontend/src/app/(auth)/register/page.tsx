'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWebSocket } from '@/app/context/WebSocketContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { v4 as uuidv4 } from 'uuid'; // Para generar UUIDs

export default function RegisterPage() {
  const [role, setRole] = useState<'postor' | 'manejador' | ''>('');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const ws = useWebSocket();
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      if (role === 'postor') {
        const userId = uuidv4(); // Generar un ID único para el usuario

        // Enviar todos los datos en un solo mensaje
        ws.current.send(
          JSON.stringify({
            type: 'register_user',
            userId,
            nombre: formData.nombre,
            apellido: formData.apellido,
          })
        );

        ws.current.onmessage = (event) => {
          const response = JSON.parse(event.data);
          if (response.success) {
            setMessage('Usuario registrado exitosamente.');
            router.push(`/auctions?userId=${userId}`);
          } else {
            setMessage('Error al registrar usuario.');
          }
        };
      } else if (role === 'manejador') {
        ws.current.send(
          JSON.stringify({
            type: 'login_manejador',
            usuario: formData.usuario,
            contrasena: formData.contrasena,
          })
        );

        ws.current.onmessage = (event) => {
          const response = JSON.parse(event.data);
          setMessage(response.message);

          if (response.success) {
            router.push('/manage-auctions');
          }
        };
      }
    } else {
      console.error('WebSocket is not connected');
      setMessage('Error: No se pudo conectar al servidor.');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Registro</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <Label htmlFor="role">Seleccione su rol</Label>
              <RadioGroup
                id="role"
                className="flex gap-4 mt-2"
                onValueChange={(value) => setRole(value as 'postor' | 'manejador')}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="postor" id="postor" />
                  <Label htmlFor="postor">Postor</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="manejador" id="manejador" />
                  <Label htmlFor="manejador">Manejador(a)</Label>
                </div>
              </RadioGroup>
            </div>

            {role === 'postor' && (
              <>
                <div className="mb-4">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input id="nombre" name="nombre" onChange={handleInputChange} />
                </div>
                <div className="mb-4">
                  <Label htmlFor="apellido">Apellido</Label>
                  <Input id="apellido" name="apellido" onChange={handleInputChange} />
                </div>
              </>
            )}

            <Button type="submit" disabled={!role}>
              Registrarse
            </Button>
          </form>

          {message && (
            <div className="mt-4 p-2 bg-gray-100 border border-gray-300 rounded">
              {message}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
