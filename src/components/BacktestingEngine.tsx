
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Play, BarChart3, TrendingUp, AlertTriangle } from 'lucide-react';
import { StrategyComponent } from '../types/StrategyComponent';

interface BacktestingEngineProps {
  strategy: StrategyComponent[];
  spotPrice: number;
}

interface BacktestResult {
  date: string;
  spotRate: number;
  unhedgedPnL: number;
  hedgedPnL: number;
  totalReturn: number;
  drawdown: number;
  volatility: number;
}

interface PerformanceMetrics {
  totalReturn: number;
  annualizedReturn: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  profitFactor: number;
  var95: number;
  calmarRatio: number;
}

const BacktestingEngine: React.FC<BacktestingEngineProps> = ({ strategy, spotPrice }) => {
  const [backtestParams, setBacktestParams] = useState({
    startDate: '2020-01-01',
    endDate: '2024-12-31',
    frequency: 'daily',
    initialCapital: 1000000,
    volatilityModel: 'historical',
    monteCarloRuns: 1000,
    confidence: 95
  });

  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<BacktestResult[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('1Y');

  // Simulation des données historiques
  const generateHistoricalData = (startDate: string, endDate: string, frequency: string): BacktestResult[] => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const data: BacktestResult[] = [];
    
    let currentDate = new Date(start);
    let currentSpot = spotPrice;
    let cumulativeUnhedged = 0;
    let cumulativeHedged = 0;
    let peak = 0;
    
    while (currentDate <= end) {
      // Simulation simple des mouvements de prix (random walk)
      const dailyReturn = (Math.random() - 0.5) * 0.02; // +/- 1% par jour max
      currentSpot *= (1 + dailyReturn);
      
      // Calcul P&L non couvert
      const unhedgedPnL = (currentSpot / spotPrice - 1) * backtestParams.initialCapital;
      cumulativeUnhedged += dailyReturn * backtestParams.initialCapital;
      
      // Calcul P&L couvert (simulation simplifiée)
      const hedgedPnL = calculateHedgedPnL(currentSpot, strategy, spotPrice) * backtestParams.initialCapital;
      cumulativeHedged = hedgedPnL;
      
      // Calcul du drawdown
      peak = Math.max(peak, cumulativeHedged);
      const drawdown = peak > 0 ? (peak - cumulativeHedged) / peak * 100 : 0;
      
      data.push({
        date: currentDate.toISOString().split('T')[0],
        spotRate: currentSpot,
        unhedgedPnL: cumulativeUnhedged,
        hedgedPnL: cumulativeHedged,
        totalReturn: cumulativeHedged / backtestParams.initialCapital * 100,
        drawdown,
        volatility: calculateRollingVolatility(data.slice(-30)) // 30 jours
      });
      
      // Prochaine date
      if (frequency === 'daily') {
        currentDate.setDate(currentDate.getDate() + 1);
      } else if (frequency === 'weekly') {
        currentDate.setDate(currentDate.getDate() + 7);
      } else if (frequency === 'monthly') {
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    }
    
    return data;
  };

  // Calcul du P&L couvert (simplifié)
  const calculateHedgedPnL = (currentSpot: number, strategy: StrategyComponent[], initialSpot: number): number => {
    let totalPnL = 0;
    
    strategy.forEach(option => {
      const strike = option.strikeType === 'percent' 
        ? initialSpot * (option.strike / 100) 
        : option.strike;
      
      const quantity = option.quantity / 100; // Normalisation
      
      if (option.type === 'put') {
        if (currentSpot < strike) {
          totalPnL += (strike - currentSpot) * quantity * (quantity > 0 ? 1 : -1);
        }
      } else if (option.type === 'call') {
        if (currentSpot > strike) {
          totalPnL += (currentSpot - strike) * quantity * (quantity > 0 ? 1 : -1);
        }
      } else if (option.type === 'forward') {
        totalPnL += (strike - currentSpot) * quantity;
      }
    });
    
    return totalPnL / initialSpot; // Normalisation
  };

  // Calcul de la volatilité glissante
  const calculateRollingVolatility = (data: BacktestResult[]): number => {
    if (data.length < 2) return 0;
    
    const returns = data.slice(1).map((item, index) => {
      const prevItem = data[index];
      return Math.log(item.spotRate / prevItem.spotRate);
    });
    
    const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
    
    return Math.sqrt(variance * 252) * 100; // Annualisée en %
  };

  // Calcul des métriques de performance
  const calculateMetrics = (data: BacktestResult[]): PerformanceMetrics => {
    if (data.length === 0) {
      return {
        totalReturn: 0,
        annualizedReturn: 0,
        volatility: 0,
        sharpeRatio: 0,
        maxDrawdown: 0,
        winRate: 0,
        profitFactor: 0,
        var95: 0,
        calmarRatio: 0
      };
    }

    const finalReturn = data[data.length - 1].totalReturn;
    const years = data.length / 252; // Approximation jours de trading
    const annualizedReturn = Math.pow(1 + finalReturn / 100, 1 / years) - 1;
    
    const returns = data.slice(1).map((item, index) => item.totalReturn - data[index].totalReturn);
    const volatility = Math.sqrt(returns.reduce((sum, ret) => sum + ret * ret, 0) / returns.length) * Math.sqrt(252);
    
    const sharpeRatio = volatility > 0 ? (annualizedReturn * 100 - 2) / volatility : 0; // Risk-free rate = 2%
    
    const maxDrawdown = Math.max(...data.map(item => item.drawdown));
    
    const winningReturns = returns.filter(ret => ret > 0);
    const winRate = winningReturns.length / returns.length * 100;
    
    const gains = winningReturns.reduce((sum, ret) => sum + ret, 0);
    const losses = returns.filter(ret => ret < 0).reduce((sum, ret) => sum + Math.abs(ret), 0);
    const profitFactor = losses > 0 ? gains / losses : 0;
    
    const sortedReturns = returns.sort((a, b) => a - b);
    const var95Index = Math.floor(sortedReturns.length * 0.05);
    const var95 = sortedReturns[var95Index] || 0;
    
    const calmarRatio = maxDrawdown > 0 ? (annualizedReturn * 100) / maxDrawdown : 0;

    return {
      totalReturn: finalReturn,
      annualizedReturn: annualizedReturn * 100,
      volatility,
      sharpeRatio,
      maxDrawdown,
      winRate,
      profitFactor,
      var95,
      calmarRatio
    };
  };

  // Lancement du backtest
  const runBacktest = async () => {
    setIsRunning(true);
    setProgress(0);
    
    // Simulation du temps de calcul
    for (let i = 0; i <= 100; i += 10) {
      setProgress(i);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    const backtestData = generateHistoricalData(
      backtestParams.startDate,
      backtestParams.endDate,
      backtestParams.frequency
    );
    
    setResults(backtestData);
    setMetrics(calculateMetrics(backtestData));
    setIsRunning(false);
    setProgress(100);
  };

  // Filtrage des données selon la période sélectionnée
  const getFilteredData = () => {
    if (results.length === 0) return [];
    
    const endDate = new Date(results[results.length - 1].date);
    let startDate = new Date(endDate);
    
    switch (selectedPeriod) {
      case '1M':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case '3M':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case '6M':
        startDate.setMonth(endDate.getMonth() - 6);
        break;
      case '1Y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      case '3Y':
        startDate.setFullYear(endDate.getFullYear() - 3);
        break;
      case 'ALL':
        return results;
    }
    
    return results.filter(item => new Date(item.date) >= startDate);
  };

  const filteredData = getFilteredData();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Moteur de Backtesting
        </CardTitle>
        <CardDescription>
          Analysez les performances historiques de vos stratégies de couverture
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="setup" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="setup">Configuration</TabsTrigger>
            <TabsTrigger value="results">Résultats</TabsTrigger>
            <TabsTrigger value="metrics">Métriques</TabsTrigger>
            <TabsTrigger value="analysis">Analyse</TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Paramètres de Base</h3>
                
                <div>
                  <Label htmlFor="startDate">Date de Début</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={backtestParams.startDate}
                    onChange={(e) => setBacktestParams(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="endDate">Date de Fin</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={backtestParams.endDate}
                    onChange={(e) => setBacktestParams(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="frequency">Fréquence</Label>
                  <Select 
                    value={backtestParams.frequency} 
                    onValueChange={(value) => setBacktestParams(prev => ({ ...prev, frequency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Quotidienne</SelectItem>
                      <SelectItem value="weekly">Hebdomadaire</SelectItem>
                      <SelectItem value="monthly">Mensuelle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="initialCapital">Capital Initial</Label>
                  <Input
                    id="initialCapital"
                    type="number"
                    value={backtestParams.initialCapital}
                    onChange={(e) => setBacktestParams(prev => ({ ...prev, initialCapital: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Paramètres Avancés</h3>
                
                <div>
                  <Label htmlFor="volatilityModel">Modèle de Volatilité</Label>
                  <Select 
                    value={backtestParams.volatilityModel} 
                    onValueChange={(value) => setBacktestParams(prev => ({ ...prev, volatilityModel: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="historical">Historique</SelectItem>
                      <SelectItem value="garch">GARCH</SelectItem>
                      <SelectItem value="ewma">EWMA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="monteCarloRuns">Simulations Monte Carlo</Label>
                  <Input
                    id="monteCarloRuns"
                    type="number"
                    value={backtestParams.monteCarloRuns}
                    onChange={(e) => setBacktestParams(prev => ({ ...prev, monteCarloRuns: Number(e.target.value) }))}
                  />
                </div>

                <div>
                  <Label htmlFor="confidence">Niveau de Confiance (%)</Label>
                  <Input
                    id="confidence"
                    type="number"
                    min="90"
                    max="99"
                    value={backtestParams.confidence}
                    onChange={(e) => setBacktestParams(prev => ({ ...prev, confidence: Number(e.target.value) }))}
                  />
                </div>
              </div>
            </div>

            {isRunning && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progression du backtest...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}

            <Button onClick={runBacktest} disabled={isRunning} className="w-full">
              <Play className="h-4 w-4 mr-2" />
              {isRunning ? 'Exécution en cours...' : 'Lancer le Backtest'}
            </Button>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            {results.length > 0 && (
              <>
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Performance de la Stratégie</h3>
                  <div className="flex gap-2">
                    {['1M', '3M', '6M', '1Y', '3Y', 'ALL'].map(period => (
                      <Button
                        key={period}
                        variant={selectedPeriod === period ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedPeriod(period)}
                      >
                        {period}
                      </Button>
                    ))}
                  </div>
                </div>

                <Card>
                  <CardContent className="pt-6">
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={filteredData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="unhedgedPnL"
                          stroke="#ef4444"
                          strokeWidth={2}
                          name="P&L Non Couvert"
                          dot={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="hedgedPnL"
                          stroke="#22c55e"
                          strokeWidth={2}
                          name="P&L Couvert"
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Drawdown Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={filteredData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="drawdown"
                          stroke="#f59e0b"
                          strokeWidth={2}
                          name="Drawdown (%)"
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="metrics" className="space-y-4">
            {metrics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      <div>
                        <div className="text-2xl font-bold">{metrics.totalReturn.toFixed(2)}%</div>
                        <p className="text-xs text-muted-foreground">Rendement Total</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-blue-500" />
                      <div>
                        <div className="text-2xl font-bold">{metrics.annualizedReturn.toFixed(2)}%</div>
                        <p className="text-xs text-muted-foreground">Rendement Annualisé</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      <div>
                        <div className="text-2xl font-bold">{metrics.volatility.toFixed(2)}%</div>
                        <p className="text-xs text-muted-foreground">Volatilité</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div>
                      <div className="text-2xl font-bold">{metrics.sharpeRatio.toFixed(2)}</div>
                      <p className="text-xs text-muted-foreground">Ratio de Sharpe</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div>
                      <div className="text-2xl font-bold text-red-600">{metrics.maxDrawdown.toFixed(2)}%</div>
                      <p className="text-xs text-muted-foreground">Drawdown Maximum</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div>
                      <div className="text-2xl font-bold">{metrics.winRate.toFixed(1)}%</div>
                      <p className="text-xs text-muted-foreground">Taux de Réussite</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div>
                      <div className="text-2xl font-bold">{metrics.profitFactor.toFixed(2)}</div>
                      <p className="text-xs text-muted-foreground">Facteur de Profit</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div>
                      <div className="text-2xl font-bold">{metrics.var95.toFixed(2)}%</div>
                      <p className="text-xs text-muted-foreground">VaR 95%</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div>
                      <div className="text-2xl font-bold">{metrics.calmarRatio.toFixed(2)}</div>
                      <p className="text-xs text-muted-foreground">Ratio de Calmar</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            {results.length > 0 && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Distribution des Rendements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={generateReturnDistribution()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="range" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="frequency" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Analyse des Risques</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>VaR 95% (1 jour)</span>
                          <span className="font-semibold">{metrics?.var95.toFixed(2)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>VaR 99% (estimé)</span>
                          <span className="font-semibold">{((metrics?.var95 || 0) * 1.3).toFixed(2)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Stress Test (-20%)</span>
                          <span className="font-semibold text-red-600">
                            {calculateStressTest(-0.2).toFixed(0)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Recommandations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {generateRecommendations().map((rec, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <Badge variant={rec.type === 'warning' ? 'destructive' : 'default'}>
                              {rec.type === 'warning' ? '⚠️' : '💡'}
                            </Badge>
                            <span className="text-sm">{rec.message}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );

  function generateReturnDistribution() {
    if (results.length === 0) return [];
    
    const returns = results.slice(1).map((item, index) => 
      item.totalReturn - results[index].totalReturn
    );
    
    const ranges = ['-5+', '-4 to -5', '-3 to -4', '-2 to -3', '-1 to -2', '0 to -1', '0 to 1', '1 to 2', '2 to 3', '3 to 4', '4 to 5', '5+'];
    
    return ranges.map(range => ({
      range,
      frequency: returns.filter(ret => {
        if (range === '-5+') return ret < -5;
        if (range === '5+') return ret > 5;
        const [min, max] = range.split(' to ').map(Number);
        return ret >= min && ret < max;
      }).length
    }));
  }

  function calculateStressTest(scenario: number): number {
    if (strategy.length === 0) return scenario * backtestParams.initialCapital;
    
    // Calcul simplifié du P&L en cas de stress
    const stressSpot = spotPrice * (1 + scenario);
    const hedgedPnL = calculateHedgedPnL(stressSpot, strategy, spotPrice);
    
    return hedgedPnL * backtestParams.initialCapital;
  }

  function generateRecommendations(): Array<{type: 'info' | 'warning', message: string}> {
    const recs = [];
    
    if (metrics) {
      if (metrics.sharpeRatio < 0.5) {
        recs.push({
          type: 'warning' as const,
          message: 'Ratio de Sharpe faible - Considérez une stratégie plus efficiente'
        });
      }
      
      if (metrics.maxDrawdown > 20) {
        recs.push({
          type: 'warning' as const,
          message: 'Drawdown élevé - Évaluez les mécanismes de stop-loss'
        });
      }
      
      if (metrics.winRate < 50) {
        recs.push({
          type: 'info' as const,
          message: 'Taux de réussite modéré - Vérifiez la calibration des strikes'
        });
      }
      
      if (metrics.volatility > 25) {
        recs.push({
          type: 'warning' as const,
          message: 'Volatilité élevée - Considérez des stratégies moins risquées'
        });
      }
    }
    
    return recs;
  }
};

export default BacktestingEngine;
