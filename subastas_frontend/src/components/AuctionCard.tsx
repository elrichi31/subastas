import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Paintbrush, Calendar, DollarSign } from 'lucide-react';

interface AuctionCardProps {
  id: number;
  url: string;
  name: string;
  painter: string;
  year: number;
  base_price: number;
  onRegister: (id: number) => void;
  isRegistered: boolean; // Indicar si la subasta está registrada
}

export function AuctionCard({ id, url, name, painter, year, base_price, onRegister, isRegistered }: AuctionCardProps) {
  return (
    <Card key={id} className="overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="relative h-48 w-full flex items-center justify-center bg-gray-100">
        <div className="w-full h-full flex items-center justify-center">
          <img
            src={url}
            alt={name}
            className="max-w-full max-h-full object-contain"
          />
        </div>
        <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">
          Subasta Activa
        </Badge>
      </div>
      <CardHeader>
        <CardTitle className="text-xl font-semibold line-clamp-2">{name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Paintbrush className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Artista: {painter}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Año: {year}</span>
          </div>
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-green-500" />
            <span className="text-sm font-semibold">Precio base: ${base_price.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className={`w-full ${isRegistered ? 'bg-red-500' : 'bg-primary'}`}
          onClick={() => onRegister(id)}
        >
          {isRegistered ? 'Quitar Subasta' : 'Registrarse para la Subasta'}
        </Button>
      </CardFooter>
    </Card>
  );
}