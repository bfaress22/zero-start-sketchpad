
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2 border-b">
        <CardTitle className="text-xl font-bold text-primary">Gestion de Risque de Change</CardTitle>
        <CardDescription>
          Solutions complètes de couverture FX et gestion de trésorerie multidevises
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Stratégies de Base</TabsTrigger>
            <TabsTrigger value="advanced">Stratégies Avancées</TabsTrigger>
            <TabsTrigger value="treasury">Trésorerie Multi-devises</TabsTrigger>
            <TabsTrigger value="backtest">Backtesting</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="mt-4">
            <ZeroCostStrategies 
              spotPrice={spotPrice}
              monthsToHedge={monthsToHedge}
              addStrategyToSimulator={handleStrategyApplication}
            />
          </TabsContent>

          <TabsContent value="advanced" className="mt-4">
            <AdvancedZeroCostStrategies
              spotPrice={spotPrice}
              onStrategyGenerated={handleAdvancedStrategy}
              marketConditions={{
                volatility: 20,
                trend: 'neutral',
                timeToExpiry: monthsToHedge || 12
              }}
            />
          </TabsContent>

          <TabsContent value="treasury" className="mt-4">
            <MultiCurrencyTreasury
              onApplyStrategy={handleTreasuryStrategy}
            />
          </TabsContent>

          <TabsContent value="backtest" className="mt-4">
            <BacktestingEngine
              strategy={currentStrategy}
              spotPrice={spotPrice}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ZeroCostTab;
