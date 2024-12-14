import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car } from 'lucide-react';

export default function AuctionTransactionCard() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Historial de Subasta</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center space-x-2">
                    <Car className="w-6 h-6 text-muted-foreground" />
                    <span>Historial de subasta no disponible</span>
                </div>
            </CardContent>
        </Card>
    )
}
