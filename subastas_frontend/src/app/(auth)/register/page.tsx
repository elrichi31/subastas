'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWebSocket } from '@/app/context/WebSocketContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { v4 as uuidv4 } from 'uuid';

export default function RegisterPage() {
  const [role, setRole] = useState<'postor' | 'manejador' | ''>('');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const ws = useWebSocket();
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      setMessage('Por favor seleccione un rol antes de continuar.');
      return;
    }

    const socket = ws.current;
    if (socket && socket.connected) {
      setLoading(true);

      if (role === 'postor') {
        const userId = uuidv4();
        localStorage.setItem('userId', userId); // Guardar userId en localStorage

        socket.emit('register_user', {
          userId,
          nombre: formData.nombre,
          apellido: formData.apellido,
          role: 'postor',
        });


        // Escuchar respuesta del servidor
        socket.on('user_registered', (response: any) => {
          setLoading(false);
          if (response.success) {
            setMessage('Usuario registrado exitosamente.');
            router.push(`/auctions?userId=${userId}`);
          } else {
            setMessage(response.message || 'Error al procesar la solicitud.');
          }
        });
      } else if (role === 'manejador') {
        const userId = uuidv4();
        localStorage.setItem('userId', userId); // Guardar userId en localStorage
        const res = await fetch('http://localhost:3001/api/login-admin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(
            {
              userId,
              username: formData.usuario,
              password: formData.contrasena,
            }
          ),
        });
        const data = await res.json();
        if (data.success) {
          setMessage('Usuario registrado exitosamente.');
          router.push(`/auctions?userId=${userId}`);
        } else {
          setMessage(data.message || 'Error al procesar la solicitud.');
        }

      }
    } else {
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
                  <Input id="nombre" name="nombre" onChange={handleInputChange} required />
                </div>
                <div className="mb-4">
                  <Label htmlFor="apellido">Apellido</Label>
                  <Input id="apellido" name="apellido" onChange={handleInputChange} required />
                </div>
              </>
            )}

            {role === 'manejador' && (
              <>
                <div className="mb-4">
                  <Label htmlFor="usuario">Usuario</Label>
                  <Input id="usuario" name="usuario" onChange={handleInputChange} required />
                </div>
                <div className="mb-4">
                  <Label htmlFor="contrasena">Contraseña</Label>
                  <Input
                    id="contrasena"
                    name="contrasena"
                    type="password"
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </>
            )}

            <Button type="submit" disabled={!role || loading}>
              {loading ? 'Procesando...' : 'Registrarse'}
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
