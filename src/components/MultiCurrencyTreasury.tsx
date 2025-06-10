
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, Trash2, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface CurrencyPosition {
  id: string;
  currency: string;
  amount: number;
  spotRate: number;
  baseAmount: number; // Amount in base currency
  hedgeRatio: number;
  maturityDate: string;
  riskLevel: 'low' | 'medium' | 'high';
}

interface TreasuryPortfolio {
  baseCurrency: string;
  totalExposure: number;
  hedgedAmount: number;
  unhedgedAmount: number;
  positions: CurrencyPosition[];
}

interface MultiCurrencyTreasuryProps {
  onApplyStrategy: (strategy: any[], portfolioData: TreasuryPortfolio) => void;
}

const MAJOR_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
  { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵' },
  { code: 'CHF', name: 'Swiss Franc', flag: '🇨🇭' },
  { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦' },
  { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺' },
  { code: 'CNY', name: 'Chinese Yuan', flag: '🇨🇳' },
  { code: 'SEK', name: 'Swedish Krona', flag: '🇸🇪' },
  { code: 'NOK', name: 'Norwegian Krone', flag: '🇳🇴' }
];

const MultiCurrencyTreasury: React.FC<MultiCurrencyTreasuryProps> = ({ onApplyStrategy }) => {
  const [portfolio, setPortfolio] = useState<TreasuryPortfolio>({
    baseCurrency: 'USD',
    totalExposure: 0,
    hedgedAmount: 0,
    unhedgedAmount: 0,
    positions: []
  });

  const [newPosition, setNewPosition] = useState({
    currency: '',
    amount: 0,
    maturityDate: '',
    spotRate: 1.0
  });

  const [hedgingStrategy, setHedgingStrategy] = useState('collar');
  const [riskTolerance, setRiskTolerance] = useState('medium');

  // Calculate portfolio metrics
  useEffect(() => {
    const totalExposure = portfolio.positions.reduce((sum, pos) => sum + pos.baseAmount, 0);
    const hedgedAmount = portfolio.positions.reduce((sum, pos) => sum + (pos.baseAmount * pos.hedgeRatio / 100), 0);
    
    setPortfolio(prev => ({
      ...prev,
      totalExposure,
      hedgedAmount,
      unhedgedAmount: totalExposure - hedgedAmount
    }));
  }, [portfolio.positions]);

  const addPosition = () => {
    if (!newPosition.currency || newPosition.amount <= 0) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs requis",
        variant: "destructive"
      });
      return;
    }

    const baseAmount = newPosition.amount * newPosition.spotRate;
    const riskLevel = getRiskLevel(newPosition.currency, newPosition.amount);

    const position: CurrencyPosition = {
      id: Date.now().toString(),
      currency: newPosition.currency,
      amount: newPosition.amount,
      spotRate: newPosition.spotRate,
      baseAmount,
      hedgeRatio: 0,
      maturityDate: newPosition.maturityDate,
      riskLevel
    };

    setPortfolio(prev => ({
      ...prev,
      positions: [...prev.positions, position]
    }));

    setNewPosition({ currency: '', amount: 0, maturityDate: '', spotRate: 1.0 });
    
    toast({
      title: "Position ajoutée",
      description: `Position ${newPosition.currency} de ${newPosition.amount.toLocaleString()} ajoutée`
    });
  };

  const removePosition = (id: string) => {
    setPortfolio(prev => ({
      ...prev,
      positions: prev.positions.filter(pos => pos.id !== id)
    }));
  };

  const updateHedgeRatio = (id: string, ratio: number) => {
    setPortfolio(prev => ({
      ...prev,
      positions: prev.positions.map(pos => 
        pos.id === id ? { ...pos, hedgeRatio: ratio } : pos
      )
    }));
  };

  const getRiskLevel = (currency: string, amount: number): 'low' | 'medium' | 'high' => {
    const majorCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CHF'];
    const isMarjorCurrency = majorCurrencies.includes(currency);
    
    if (!isMarjorCurrency) return 'high';
    if (amount > 1000000) return 'high';
    if (amount > 500000) return 'medium';
    return 'low';
  };

  const generateOptimalHedgingStrategy = () => {
    const strategies = [];
    
    portfolio.positions.forEach(position => {
      if (position.hedgeRatio > 0) {
        // Générer une stratégie de couverture selon le type choisi
        switch (hedgingStrategy) {
          case 'collar':
            strategies.push({
              type: 'put',
              strike: 95,
              strikeType: 'percent',
              volatility: 15,
              quantity: position.hedgeRatio,
              currency: position.currency
            });
            strategies.push({
              type: 'call',
              strike: 105,
              strikeType: 'percent',
              volatility: 15,
              quantity: -position.hedgeRatio,
              currency: position.currency
            });
            break;
          
          case 'forward':
            strategies.push({
              type: 'forward',
              strike: position.spotRate,
              strikeType: 'absolute',
              volatility: 0,
              quantity: position.hedgeRatio,
              currency: position.currency
            });
            break;
          
          case 'options':
            strategies.push({
              type: position.amount > 0 ? 'put' : 'call',
              strike: position.amount > 0 ? 95 : 105,
              strikeType: 'percent',
              volatility: 15,
              quantity: position.hedgeRatio,
              currency: position.currency
            });
            break;
        }
      }
    });

    onApplyStrategy(strategies, portfolio);
    
    toast({
      title: "Stratégie appliquée",
      description: `Stratégie de couverture ${hedgingStrategy} appliquée à ${strategies.length} positions`
    });
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const hedgeRatioProgress = portfolio.totalExposure > 0 ? (portfolio.hedgedAmount / portfolio.totalExposure) * 100 : 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Gestion de Trésorerie Multidevises
        </CardTitle>
        <CardDescription>
          Gérez vos expositions de change et optimisez vos stratégies de couverture
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="portfolio" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="portfolio">Portefeuille</TabsTrigger>
            <TabsTrigger value="hedging">Stratégies de Couverture</TabsTrigger>
            <TabsTrigger value="analytics">Analyses</TabsTrigger>
          </TabsList>

          <TabsContent value="portfolio" className="space-y-4">
            {/* Portfolio Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{portfolio.totalExposure.toLocaleString()} {portfolio.baseCurrency}</div>
                  <p className="text-xs text-muted-foreground">Exposition Totale</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-green-600">{portfolio.hedgedAmount.toLocaleString()} {portfolio.baseCurrency}</div>
                  <p className="text-xs text-muted-foreground">Montant Couvert</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-red-600">{portfolio.unhedgedAmount.toLocaleString()} {portfolio.baseCurrency}</div>
                  <p className="text-xs text-muted-foreground">Exposition Non Couverte</p>
                </CardContent>
              </Card>
            </div>

            {/* Hedge Ratio Progress */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-2">
                  <Label>Ratio de Couverture Global</Label>
                  <span className="text-sm font-medium">{hedgeRatioProgress.toFixed(1)}%</span>
                </div>
                <Progress value={hedgeRatioProgress} className="w-full" />
              </CardContent>
            </Card>

            {/* Add New Position */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ajouter une Position</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="currency">Devise</Label>
                    <Select value={newPosition.currency} onValueChange={(value) => setNewPosition(prev => ({ ...prev, currency: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        {MAJOR_CURRENCIES.map(curr => (
                          <SelectItem key={curr.code} value={curr.code}>
                            {curr.flag} {curr.code} - {curr.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="amount">Montant</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={newPosition.amount}
                      onChange={(e) => setNewPosition(prev => ({ ...prev, amount: Number(e.target.value) }))}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="spotRate">Taux Spot</Label>
                    <Input
                      id="spotRate"
                      type="number"
                      step="0.0001"
                      value={newPosition.spotRate}
                      onChange={(e) => setNewPosition(prev => ({ ...prev, spotRate: Number(e.target.value) }))}
                      placeholder="1.0000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maturityDate">Date d'Échéance</Label>
                    <Input
                      id="maturityDate"
                      type="date"
                      value={newPosition.maturityDate}
                      onChange={(e) => setNewPosition(prev => ({ ...prev, maturityDate: e.target.value }))}
                    />
                  </div>
                </div>
                <Button onClick={addPosition} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter Position
                </Button>
              </CardContent>
            </Card>

            {/* Positions List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Positions Actuelles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {portfolio.positions.map(position => (
                    <div key={position.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="font-medium">{position.currency}</div>
                          <div className="text-sm text-muted-foreground">
                            {position.amount.toLocaleString()} @ {position.spotRate.toFixed(4)}
                          </div>
                        </div>
                        <Badge className={getRiskBadgeColor(position.riskLevel)}>
                          {position.riskLevel.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-medium">{position.baseAmount.toLocaleString()} {portfolio.baseCurrency}</div>
                          <div className="text-sm text-muted-foreground">Couverture: {position.hedgeRatio}%</div>
                        </div>
                        <div className="w-32">
                          <Input
                            type="range"
                            min="0"
                            max="100"
                            value={position.hedgeRatio}
                            onChange={(e) => updateHedgeRatio(position.id, Number(e.target.value))}
                            className="w-full"
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removePosition(position.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {portfolio.positions.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      Aucune position ajoutée. Commencez par ajouter vos expositions de change.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hedging" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Configuration de la Stratégie</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hedgingStrategy">Type de Stratégie</Label>
                    <Select value={hedgingStrategy} onValueChange={setHedgingStrategy}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="collar">Collar à Prime Nulle</SelectItem>
                        <SelectItem value="forward">Forward de Couverture</SelectItem>
                        <SelectItem value="options">Options Vanilles</SelectItem>
                        <SelectItem value="seagull">Seagull</SelectItem>
                        <SelectItem value="participating">Participating Forward</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="riskTolerance">Tolérance au Risque</Label>
                    <Select value={riskTolerance} onValueChange={setRiskTolerance}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conservative">Conservateur</SelectItem>
                        <SelectItem value="medium">Modéré</SelectItem>
                        <SelectItem value="aggressive">Agressif</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Button onClick={generateOptimalHedgingStrategy} className="w-full">
                  Générer Stratégie Optimale
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Répartition par Devise</CardTitle>
                </CardHeader>
                <CardContent>
                  {portfolio.positions.map(position => {
                    const percentage = portfolio.totalExposure > 0 ? (position.baseAmount / portfolio.totalExposure) * 100 : 0;
                    return (
                      <div key={position.id} className="flex justify-between items-center mb-2">
                        <span>{position.currency}</span>
                        <span>{percentage.toFixed(1)}%</span>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Analyse de Risque</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>VaR à 95% (estimation)</span>
                      <span className="text-red-600">-{(portfolio.unhedgedAmount * 0.05).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Exposition maximale</span>
                      <span>{Math.max(...portfolio.positions.map(p => p.baseAmount), 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Diversification</span>
                      <span>{portfolio.positions.length} devises</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default MultiCurrencyTreasury;
