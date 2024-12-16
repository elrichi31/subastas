import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Paintbrush, Calendar, DollarSign } from 'lucide-react';

interface AuctionCardProps {
    enterLobby: (id: number) => void;
    registerSelection: (id: number) => void;
    deleteSelection?: (id: number) => void;
    user: any;
    auction: any;
    selected: boolean;
    active?: boolean; // Nueva prop para determinar si la subasta está activa
}

export function AuctionCard({ enterLobby, registerSelection, user, auction, selected, deleteSelection, active }: AuctionCardProps) {
    const getStatusTag = () => {
        switch (auction.state) {
            case "not initiated":
                return <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground text-blue-600 bg-blue-100 rounded">No iniciado</Badge>;
            case "in progress":
                return <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground text-yellow-600 bg-yellow-100 rounded">En progreso</Badge>;
            case "finished":
                return <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground text-green-600 bg-green-100 rounded">Terminado</Badge>;
            case "not configured":
                return <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground text-red-600 bg-red-100 rounded">No configurado</Badge>;
            default:
                return <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground text-gray-600 bg-gray-100 rounded">Desconocido</Badge>;
        }
    };

    return (
        <Card key={auction.auctionId} className="overflow-hidden transition-all duration-300 hover:shadow-lg">
            <div className="relative h-48 w-full flex items-center justify-center bg-gray-100">
                <div className="w-full h-full flex items-center justify-center">
                    <img
                        src={auction.url}
                        alt={auction.name}
                        className="max-w-full max-h-full object-contain"
                    />
                </div>
                {selected && getStatusTag()}
                {user.role === 'admin' && (
                    selected && deleteSelection ? (
                        <Button className="absolute top-2 left-2 bg-primary rounded-full" onClick={() => deleteSelection(auction.auctionId)}>-</Button>
                    ) : (
                        <Button className="absolute top-2 left-2 bg-primary rounded-full" onClick={() => registerSelection(auction.auctionId)}>+</Button>
                    )
                )}
            </div>
            <CardHeader>
                <CardTitle className="text-xl font-semibold line-clamp-2">{auction.name}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <Paintbrush className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Artista: {auction.painter}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Año: {auction.year}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-semibold">Precio base: ${auction.basePrice.toLocaleString()}</span>
                    </div>
                    {selected ? (
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">Orden: {auction.order}</span>
                        </div>
                    ) : null}
                </div>
            </CardContent>
            <CardFooter className="space-x-1">
                {
                    selected ? (
                        <Button
                            onClick={() => enterLobby(auction.auctionId)}
                        >
                            Entrar a la sala
                        </Button>
                    ) : null
                }
            </CardFooter>
        </Card>
    );
}
