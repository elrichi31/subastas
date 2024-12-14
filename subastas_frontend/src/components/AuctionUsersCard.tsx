import React from 'react'
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
    console.log('Users:', users); 
    return (
        <Card className='mb-4'>
            <CardHeader>
                <CardTitle>Participantes</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {users.map((user) => (
                        <div key={user.id} className="flex items-center space-x-4">
                            <Avatar>
                                <AvatarFallback>{`${user.nombre?.charAt(0)}${user.apellido?.charAt(0)}` || '?'}</AvatarFallback>
                            </Avatar>
                            {user.id === userId ? (
                                <span>{user.nombre || 'Usuario desconocido'} {user.apellido || ''} (Yo)</span>
                            ) : (
                                <span>{user.nombre || 'Usuario desconocido'} {user.apellido || ''}</span>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default AuctionUsersCard;
