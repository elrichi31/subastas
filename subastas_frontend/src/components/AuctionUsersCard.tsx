import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface User {
    id: string;
    nombre: string;
    apellido: string;
    role: string;
}

interface AuctionUsersCardProps {
    users: User[];
    userId: string | null;
}

const AuctionUsersCard: React.FC<AuctionUsersCardProps> = ({ users, userId }) => {
    return (
        <Card className='mb-4 max-h-[144px]'>
            <CardHeader>
                <CardTitle className="">Participantes</CardTitle> {/* Título más pequeño */}
            </CardHeader>
            <CardContent>
                <div 
                    className="grid grid-cols-2 gap-2 overflow-y-auto" 
                    style={{ maxHeight: '200px' }} // Limitar la altura y permitir scroll
                >
                    {users.map((user) => (
                        <div key={user.id} className="flex items-center space-x-2 text-sm"> {/* Nombres más pequeños */}
                            <Avatar className="w-6 h-6"> {/* Avatares más pequeños */}
                                <AvatarFallback className="text-md">{`${user.nombre?.charAt(0)}${user.apellido?.charAt(0)}` || '?'}</AvatarFallback>
                            </Avatar>
                            <span>
                                {user.id === userId 
                                    ? `${user.nombre || 'Usuario desconocido'} ${user.apellido || ''} (Yo)`
                                    : `${user.nombre || 'Usuario desconocido'} ${user.apellido || ''}`}
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default AuctionUsersCard;
