import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function AuctionAdminCard({ auctionState, handleCreateAuction, handleUpdateAuction }: any) {
    console.log('Auction state in AdminCard:', auctionState);

    if (!auctionState) {
        return (
            <Card className="mt-4">
                <CardHeader>
                    <CardTitle>Controles de Subasta</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Cargando datos...</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="mt-4">
            <CardHeader>
                <CardTitle>Controles de Subasta</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="timer" className="block text-sm font-medium text-gray-700">
                            Configurar Temporizador (minutos)
                        </Label>
                        <Input
                            id="timer"
                            type="number"
                            placeholder="Ingrese minutos"
                            className="mt-1 w-full"
                        />
                    </div>
                    <div>
                        <Label htmlFor="increment" className="block text-sm font-medium text-gray-700">
                            Incremento Mínimo
                        </Label>
                        <Input
                            id="increment"
                            type="number"
                            placeholder="Ingrese el incremento mínimo"
                            className="mt-1 w-full"
                        />
                    </div>
                    {
                        auctionState.message === 'Auction not found' ? (
                            <Button onClick={handleCreateAuction}>
                                Crear Subasta
                            </Button>
                        ) : (
                            <div className="space-x-2">
                                <Button onClick={handleUpdateAuction}>
                                    Actualizar Subasta
                                </Button>
                                <Button>
                                    Iniciar Subasta
                                </Button>
                            </div>
                        )
                    }
                </div>
            </CardContent>
        </Card>
    );
}
