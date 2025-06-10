
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Shield, Globe, BarChart3 } from 'lucide-react';
import ZeroCostStrategies from './ZeroCostStrategies';
import AdvancedZeroCostStrategies from './AdvancedZeroCostStrategies';
import MultiCurrencyTreasury from './MultiCurrencyTreasury';
import BacktestingEngine from './BacktestingEngine';
import { toast } from "@/hooks/use-toast";
import { StrategyComponent } from '../types/StrategyComponent';

interface ZeroCostTabProps {
  spotPrice: number;
  setStrategy: (strategy: StrategyComponent[]) => void;
  calculatePayoff: () => void;
  monthsToHedge?: number;
}

const ZeroCostTab: React.FC<ZeroCostTabProps> = ({ 
  spotPrice, 
  setStrategy, 
  calculatePayoff,
  monthsToHedge 
}) => {
  const [currentStrategy, setCurrentStrategy] = React.useState<StrategyComponent[]>([]);

  const handleStrategyApplication = (strategy: StrategyComponent[], name: string, options?: { [key: string]: any }) => {
    setCurrentStrategy(strategy);
    setStrategy(strategy);
    calculatePayoff();
    
    toast({
      title: "Stratégie appliquée",
      description: `${name} ajoutée au simulateur`,
    });

    // Store options in localStorage or another state if needed for the simulator
    if (options) {
      localStorage.setItem('zeroCostOptions', JSON.stringify(options));
    }
  };

  const handleAdvancedStrategy = (strategy: StrategyComponent[], metadata: any) => {
    setCurrentStrategy(strategy);
    setStrategy(strategy);
    calculatePayoff();
    
    toast({
      title: "Stratégie avancée appliquée",
      description: `${metadata.name} - Coût estimé: ${metadata.expectedCost.toFixed(0)}`,
    });
  };

  const handleTreasuryStrategy = (strategy: StrategyComponent[], portfolioData: any) => {
    setCurrentStrategy(strategy);
    setStrategy(strategy);
    calculatePayoff();
    
    toast({
      title: "Stratégie multidevises appliquée",
      description: `Couverture appliquée à ${portfolioData.positions.length} positions`,
    });
  };

  const tabConfig = [
    {
      value: "basic",
      label: "Stratégies de Base",
      icon: <TrendingUp className="w-4 h-4" />,
      badge: "Essentiel"
    },
    {
      value: "advanced", 
      label: "Stratégies Avancées",
      icon: <Shield className="w-4 h-4" />,
      badge: "Pro"
    },
    {
      value: "treasury",
      label: "Trésorerie Multi-devises", 
      icon: <Globe className="w-4 h-4" />,
      badge: "Enterprise"
    },
    {
      value: "backtest",
      label: "Backtesting",
      icon: <BarChart3 className="w-4 h-4" />,
      badge: "Analytics"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header moderne avec gradient */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 p-6 border border-border/50">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            Gestion de Risque de Change
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Solutions complètes de couverture FX et gestion de trésorerie multidevises
          </CardDescription>
          <div className="flex gap-2 mt-4">
            <Badge variant="secondary" className="glass-effect">
              Spot Rate: {spotPrice.toFixed(4)}
            </Badge>
            <Badge variant="outline" className="neon-border">
              {monthsToHedge || 12} mois
            </Badge>
          </div>
        </div>
      </div>

      {/* Tabs avec design futuriste */}
      <Card className="shadow-lg glass-effect">
        <CardContent className="pt-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4 gap-1 p-1 bg-secondary/50 rounded-lg">
              {tabConfig.map((tab) => (
                <TabsTrigger 
                  key={tab.value}
                  value={tab.value}
                  className="relative flex flex-col items-center gap-1 py-3 px-2 rounded-md transition-all duration-300 data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white"
                >
                  <div className="flex items-center gap-2">
                    {tab.icon}
                    <span className="font-medium text-xs">{tab.label}</span>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className="text-xs px-1.5 py-0.5 bg-background/50"
                  >
                    {tab.badge}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="mt-6 space-y-4">
              <TabsContent value="basic" className="space-y-4">
                <div className="glass-effect rounded-lg p-4 border border-border/50">
                  <ZeroCostStrategies 
                    spotPrice={spotPrice}
                    monthsToHedge={monthsToHedge}
                    addStrategyToSimulator={handleStrategyApplication}
                  />
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4">
                <div className="glass-effect rounded-lg p-4 border border-border/50">
                  <AdvancedZeroCostStrategies
                    spotPrice={spotPrice}
                    onStrategyGenerated={handleAdvancedStrategy}
                    marketConditions={{
                      volatility: 20,
                      trend: 'neutral',
                      timeToExpiry: monthsToHedge || 12
                    }}
                  />
                </div>
              </TabsContent>

              <TabsContent value="treasury" className="space-y-4">
                <div className="glass-effect rounded-lg p-4 border border-border/50">
                  <MultiCurrencyTreasury
                    onApplyStrategy={handleTreasuryStrategy}
                  />
                </div>
              </TabsContent>

              <TabsContent value="backtest" className="space-y-4">
                <div className="glass-effect rounded-lg p-4 border border-border/50">
                  <BacktestingEngine
                    strategy={currentStrategy}
                    spotPrice={spotPrice}
                  />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ZeroCostTab;
