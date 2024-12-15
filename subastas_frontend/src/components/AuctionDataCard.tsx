import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Paintbrush, Calendar, DollarSign } from 'lucide-react'

export default function AuctionDataCard({ auction }: any) {
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
                                <Paintbrush className="w-5 h-5 text-muted-foreground" />
                                <span><strong>Artista: </strong>{auction.painter}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Calendar className="w-5 h-5 text-muted-foreground" />
                                <span><strong>Año: </strong>{auction.year}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <DollarSign className="w-5 h-5 text-muted-foreground" />
                                <span><strong>Precio base: </strong> ${auction.base_price.toLocaleString()}</span>
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}
