
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { RefreshCcw, TrendingUp, TrendingDown } from 'lucide-react';
import { useTradingViewData, ForexPair } from '@/hooks/useTradingViewData';
import { toast } from "@/hooks/use-toast";

interface ForexDataTableProps {
  onSymbolSelect?: (symbol: string, price: number) => void;
}

const ForexDataTable: React.FC<ForexDataTableProps> = ({ onSymbolSelect }) => {
  const { forexData, isLoading, error, refreshData, getSymbolData } = useTradingViewData();

  const handleSymbolClick = (pair: ForexPair) => {
    if (onSymbolSelect) {
      onSymbolSelect(pair.symbol, pair.price);
      toast({
        title: "Paire sélectionnée",
        description: `${pair.symbol}: ${pair.price.toFixed(5)}`,
      });
    }
  };

  const formatChange = (change: number, isPercent: boolean = false) => {
    const value = isPercent ? `${change.toFixed(2)}%` : change.toFixed(5);
    const isPositive = change > 0;
    
    return (
      <div className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
        {isPositive ? '+' : ''}{value}
      </div>
    );
  };

  if (error) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-red-600">Erreur de données</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
          <Button onClick={refreshData} className="mt-2">
            <RefreshCcw className="w-4 h-4 mr-2" />
            Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2 border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold text-primary">
            Données Forex en Temps Réel
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant={isLoading ? "secondary" : "default"}>
              {isLoading ? "Mise à jour..." : `${forexData.length} paires`}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={isLoading}
            >
              <RefreshCcw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4">
        {forexData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <RefreshCcw className="w-8 h-8 mx-auto mb-2 animate-spin" />
            <p>Chargement des données forex...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbole</TableHead>
                  <TableHead className="text-right">Prix</TableHead>
                  <TableHead className="text-right">Variation</TableHead>
                  <TableHead className="text-right">Variation %</TableHead>
                  <TableHead className="text-right">Bid</TableHead>
                  <TableHead className="text-right">Ask</TableHead>
                  <TableHead className="text-right">Haut</TableHead>
                  <TableHead className="text-right">Bas</TableHead>
                  <TableHead className="text-right">Dernière MAJ</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {forexData.map((pair) => (
                  <TableRow key={pair.symbol} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <span className="font-semibold">{pair.symbol}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {pair.price.toFixed(5)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatChange(pair.change)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatChange(pair.changePercent, true)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {pair.bid.toFixed(5)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {pair.ask.toFixed(5)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {pair.high.toFixed(5)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {pair.low.toFixed(5)}
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {pair.lastUpdate.toLocaleTimeString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSymbolClick(pair)}
                      >
                        Utiliser
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        <div className="mt-4 text-sm text-muted-foreground">
          <p>
            <strong>Note:</strong> Les données sont extraites du widget TradingView ou simulées en temps réel.
            Actualisation automatique toutes les 30 secondes.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ForexDataTable;
