import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AuctionDataCard({auction}: any) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{auction ? auction.name : 'Cargando...'}</CardTitle>
            </CardHeader>
            <CardContent>
                {auction && (
                    <>
                        <div className="flex mb-4 justify-center">
                            <img
                                src={auction.url}
                                alt={auction.name}
                                className="object-cover rounded-lg w-[400px] h-auto max-h-full"
                            />
                        </div>
                        <div className="grid gap-4">
                            <div className="flex items-center space-x-2">
                                <span>Artista: {auction.painter}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span>Año: {auction.year}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span>Precio base: ${auction.base_price.toLocaleString()}</span>
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}
