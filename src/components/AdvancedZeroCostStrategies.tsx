
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calculator, TrendingUp, Shield, Zap } from 'lucide-react';
import { StrategyComponent } from '../types/StrategyComponent';

interface AdvancedZeroCostStrategiesProps {
  spotPrice: number;
  onStrategyGenerated: (strategy: StrategyComponent[], metadata: StrategyMetadata) => void;
  marketConditions?: {
    volatility: number;
    trend: 'bullish' | 'bearish' | 'neutral';
    timeToExpiry: number;
  };
}

interface StrategyMetadata {
  name: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
  expectedCost: number;
  maxLoss: number;
  maxGain: number;
  breakeven: number[];
  greeks: {
    delta: number;
    gamma: number;
    theta: number;
    vega: number;
  };
}

interface StrategyTemplate {
  id: string;
  name: string;
  description: string;
  complexity: 'simple' | 'intermediate' | 'advanced';
  marketOutlook: ('bullish' | 'bearish' | 'neutral' | 'volatile')[];
  generate: (params: any) => StrategyComponent[];
}

const AdvancedZeroCostStrategies: React.FC<AdvancedZeroCostStrategiesProps> = ({
  spotPrice,
  onStrategyGenerated,
  marketConditions = { volatility: 20, trend: 'neutral', timeToExpiry: 30 }
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('enhanced-collar');
  const [strategyParams, setStrategyParams] = useState({
    protection: 95,
    participation: 105,
    volatility: marketConditions.volatility,
    timeToExpiry: marketConditions.timeToExpiry,
    riskBudget: 10000,
    hedgeRatio: 100,
    leverageRatio: 1,
    useBarriers: false,
    barrierLevel: 110,
    useLeverageOptimization: false,
    dynamicAdjustment: false
  });

  const [calculatedStrategy, setCalculatedStrategy] = useState<StrategyComponent[]>([]);
  const [strategyMetadata, setStrategyMetadata] = useState<StrategyMetadata | null>(null);

  // Stratégies avancées à prime nulle
  const strategyTemplates: StrategyTemplate[] = [
    {
      id: 'enhanced-collar',
      name: 'Collar Amélioré',
      description: 'Collar traditionnel avec optimisation dynamique des strikes',
      complexity: 'simple',
      marketOutlook: ['neutral', 'bearish'],
      generate: (params) => generateEnhancedCollar(params)
    },
    {
      id: 'seagull-plus',
      name: 'Seagull Plus',
      description: 'Seagull avec protection renforcée et participation optimisée',
      complexity: 'intermediate',
      marketOutlook: ['bearish', 'volatile'],
      generate: (params) => generateSeagullPlus(params)
    },
    {
      id: 'barrier-collar',
      name: 'Collar à Barrières',
      description: 'Collar avec options à barrière pour optimiser le coût',
      complexity: 'advanced',
      marketOutlook: ['neutral', 'bullish'],
      generate: (params) => generateBarrierCollar(params)
    },
    {
      id: 'leveraged-collar',
      name: 'Collar avec Effet de Levier',
      description: 'Collar utilisant l\'effet de levier pour maximiser la protection',
      complexity: 'advanced',
      marketOutlook: ['volatile', 'bearish'],
      generate: (params) => generateLeveragedCollar(params)
    },
    {
      id: 'adaptive-seagull',
      name: 'Seagull Adaptatif',
      description: 'Seagull qui s\'adapte aux conditions de marché',
      complexity: 'advanced',
      marketOutlook: ['volatile', 'neutral'],
      generate: (params) => generateAdaptiveSeagull(params)
    },
    {
      id: 'risk-reversal-plus',
      name: 'Risk Reversal Amélioré',
      description: 'Risk reversal avec protection contre les gaps',
      complexity: 'intermediate',
      marketOutlook: ['bearish', 'neutral'],
      generate: (params) => generateRiskReversalPlus(params)
    }
  ];

  // Fonctions de génération des stratégies
  function generateEnhancedCollar(params: any): StrategyComponent[] {
    const putStrike = params.protection;
    const callStrike = calculateBalancedStrike('call', 'put', putStrike, params);

    return [
      {
        type: 'put',
        strike: putStrike,
        strikeType: 'percent',
        volatility: params.volatility,
        quantity: params.hedgeRatio
      },
      {
        type: 'call',
        strike: callStrike,
        strikeType: 'percent',
        volatility: params.volatility,
        quantity: -params.hedgeRatio
      }
    ];
  }

  function generateSeagullPlus(params: any): StrategyComponent[] {
    const longPutStrike = params.protection;
    const shortCallStrike = calculateBalancedStrike('call', 'put', longPutStrike, params);
    const shortPutStrike = longPutStrike - 5; // 5% en dessous

    return [
      {
        type: 'put',
        strike: longPutStrike,
        strikeType: 'percent',
        volatility: params.volatility,
        quantity: params.hedgeRatio
      },
      {
        type: 'call',
        strike: shortCallStrike,
        strikeType: 'percent',
        volatility: params.volatility,
        quantity: -params.hedgeRatio * 0.7
      },
      {
        type: 'put',
        strike: shortPutStrike,
        strikeType: 'percent',
        volatility: params.volatility,
        quantity: -params.hedgeRatio * 0.3
      }
    ];
  }

  function generateBarrierCollar(params: any): StrategyComponent[] {
    if (!params.useBarriers) return generateEnhancedCollar(params);

    const putStrike = params.protection;
    const callStrike = calculateBalancedStrike('call', 'put-knockout', putStrike, params);

    return [
      {
        type: 'put-knockout',
        strike: putStrike,
        strikeType: 'percent',
        volatility: params.volatility,
        quantity: params.hedgeRatio,
        barrier: params.barrierLevel,
        barrierType: 'percent'
      },
      {
        type: 'call',
        strike: callStrike,
        strikeType: 'percent',
        volatility: params.volatility,
        quantity: -params.hedgeRatio
      }
    ];
  }

  function generateLeveragedCollar(params: any): StrategyComponent[] {
    const leverage = params.leverageRatio || 1.5;
    const putStrike = params.protection;
    const callStrike = calculateBalancedStrike('call', 'put', putStrike, { ...params, leverage });

    return [
      {
        type: 'put',
        strike: putStrike,
        strikeType: 'percent',
        volatility: params.volatility,
        quantity: params.hedgeRatio * leverage
      },
      {
        type: 'call',
        strike: callStrike,
        strikeType: 'percent',
        volatility: params.volatility,
        quantity: -params.hedgeRatio * leverage
      }
    ];
  }

  function generateAdaptiveSeagull(params: any): StrategyComponent[] {
    // Adaptation selon les conditions de marché
    const volatilityMultiplier = params.volatility > 25 ? 1.2 : 0.8;
    const adjustedProtection = params.protection * volatilityMultiplier;

    return generateSeagullPlus({ ...params, protection: adjustedProtection });
  }

  function generateRiskReversalPlus(params: any): StrategyComponent[] {
    const putStrike = params.protection;
    const callStrike = calculateBalancedStrike('call', 'put', putStrike, params);

    return [
      {
        type: 'put',
        strike: putStrike,
        strikeType: 'percent',
        volatility: params.volatility,
        quantity: params.hedgeRatio
      },
      {
        type: 'call',
        strike: callStrike,
        strikeType: 'percent',
        volatility: params.volatility,
        quantity: -params.hedgeRatio
      }
    ];
  }

  // Calcul des strikes équilibrés (simplifié)
  function calculateBalancedStrike(optionType: string, baseType: string, baseStrike: number, params: any): number {
    // Formule simplifiée pour l'équilibrage des primes
    const volatilityAdjustment = params.volatility / 20; // Normalisation
    const timeAdjustment = Math.sqrt(params.timeToExpiry / 30); // Normalisation sur 30 jours
    
    if (optionType === 'call') {
      return baseStrike + (10 * volatilityAdjustment * timeAdjustment);
    } else {
      return baseStrike - (10 * volatilityAdjustment * timeAdjustment);
    }
  }

  // Calcul des métriques de la stratégie
  function calculateStrategyMetrics(strategy: StrategyComponent[]): StrategyMetadata {
    // Calculs simplifiés pour les métriques
    const totalPremium = strategy.reduce((sum, option) => {
      const premium = Math.abs(option.quantity) * 0.02; // Prime simplifiée
      return sum + (option.quantity > 0 ? premium : -premium);
    }, 0);

    const maxLoss = strategy.reduce((max, option) => {
      if (option.type === 'put' && option.quantity > 0) {
        const potentialLoss = (spotPrice - (spotPrice * option.strike / 100)) * (option.quantity / 100);
        return Math.min(max, -potentialLoss);
      }
      return max;
    }, 0);

    const maxGain = strategy.reduce((max, option) => {
      if (option.type === 'call' && option.quantity < 0) {
        const potentialGain = ((spotPrice * option.strike / 100) - spotPrice) * (Math.abs(option.quantity) / 100);
        return Math.max(max, potentialGain);
      }
      return max;
    }, 0);

    return {
      name: strategyTemplates.find(t => t.id === selectedTemplate)?.name || 'Stratégie Personnalisée',
      description: strategyTemplates.find(t => t.id === selectedTemplate)?.description || '',
      riskLevel: totalPremium > 1000 ? 'high' : totalPremium > 500 ? 'medium' : 'low',
      expectedCost: totalPremium,
      maxLoss,
      maxGain,
      breakeven: [spotPrice * 0.98, spotPrice * 1.02], // Points morts simplifiés
      greeks: {
        delta: 0.5, // Valeurs simplifiées
        gamma: 0.02,
        theta: -0.1,
        vega: 0.3
      }
    };
  }

  // Génération de la stratégie
  const generateStrategy = () => {
    const template = strategyTemplates.find(t => t.id === selectedTemplate);
    if (!template) return;

    const strategy = template.generate(strategyParams);
    const metadata = calculateStrategyMetrics(strategy);

    setCalculatedStrategy(strategy);
    setStrategyMetadata(metadata);
    onStrategyGenerated(strategy, metadata);
  };

  useEffect(() => {
    if (selectedTemplate) {
      generateStrategy();
    }
  }, [selectedTemplate, strategyParams]);

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Stratégies Avancées à Prime Nulle
        </CardTitle>
        <CardDescription>
          Optimisez vos couvertures avec des stratégies sophistiquées à coût zéro
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="templates" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="templates">Modèles</TabsTrigger>
            <TabsTrigger value="parameters">Paramètres</TabsTrigger>
            <TabsTrigger value="analysis">Analyse</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {strategyTemplates.map(template => (
                <Card 
                  key={template.id}
                  className={`cursor-pointer transition-all ${
                    selectedTemplate === template.id 
                      ? 'ring-2 ring-primary' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{template.name}</h3>
                      <Badge className={getComplexityColor(template.complexity)}>
                        {template.complexity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                    <div className="flex gap-1">
                      {template.marketOutlook.map(outlook => (
                        <Badge key={outlook} variant="outline" className="text-xs">
                          {outlook}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="parameters" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Paramètres de Base</h3>
                
                <div>
                  <Label htmlFor="protection">Niveau de Protection (%)</Label>
                  <Input
                    id="protection"
                    type="number"
                    value={strategyParams.protection}
                    onChange={(e) => setStrategyParams(prev => ({ ...prev, protection: Number(e.target.value) }))}
                  />
                </div>

                <div>
                  <Label htmlFor="participation">Niveau de Participation (%)</Label>
                  <Input
                    id="participation"
                    type="number"
                    value={strategyParams.participation}
                    onChange={(e) => setStrategyParams(prev => ({ ...prev, participation: Number(e.target.value) }))}
                  />
                </div>

                <div>
                  <Label htmlFor="volatility">Volatilité Implicite (%)</Label>
                  <Input
                    id="volatility"
                    type="number"
                    value={strategyParams.volatility}
                    onChange={(e) => setStrategyParams(prev => ({ ...prev, volatility: Number(e.target.value) }))}
                  />
                </div>

                <div>
                  <Label htmlFor="hedgeRatio">Ratio de Couverture (%)</Label>
                  <Input
                    id="hedgeRatio"
                    type="number"
                    value={strategyParams.hedgeRatio}
                    onChange={(e) => setStrategyParams(prev => ({ ...prev, hedgeRatio: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Options Avancées</h3>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="useBarriers"
                    checked={strategyParams.useBarriers}
                    onCheckedChange={(checked) => setStrategyParams(prev => ({ ...prev, useBarriers: checked }))}
                  />
                  <Label htmlFor="useBarriers">Utiliser des options à barrière</Label>
                </div>

                {strategyParams.useBarriers && (
                  <div>
                    <Label htmlFor="barrierLevel">Niveau de Barrière (%)</Label>
                    <Input
                      id="barrierLevel"
                      type="number"
                      value={strategyParams.barrierLevel}
                      onChange={(e) => setStrategyParams(prev => ({ ...prev, barrierLevel: Number(e.target.value) }))}
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Switch
                    id="useLeverageOptimization"
                    checked={strategyParams.useLeverageOptimization}
                    onCheckedChange={(checked) => setStrategyParams(prev => ({ ...prev, useLeverageOptimization: checked }))}
                  />
                  <Label htmlFor="useLeverageOptimization">Optimisation avec effet de levier</Label>
                </div>

                {strategyParams.useLeverageOptimization && (
                  <div>
                    <Label htmlFor="leverageRatio">Ratio d'Effet de Levier</Label>
                    <Input
                      id="leverageRatio"
                      type="number"
                      step="0.1"
                      value={strategyParams.leverageRatio}
                      onChange={(e) => setStrategyParams(prev => ({ ...prev, leverageRatio: Number(e.target.value) }))}
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Switch
                    id="dynamicAdjustment"
                    checked={strategyParams.dynamicAdjustment}
                    onCheckedChange={(checked) => setStrategyParams(prev => ({ ...prev, dynamicAdjustment: checked }))}
                  />
                  <Label htmlFor="dynamicAdjustment">Ajustement dynamique</Label>
                </div>
              </div>
            </div>

            <Button onClick={generateStrategy} className="w-full">
              <Zap className="h-4 w-4 mr-2" />
              Générer Stratégie Optimisée
            </Button>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            {strategyMetadata && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-blue-500" />
                        <div>
                          <div className="text-2xl font-bold">{strategyMetadata.expectedCost.toFixed(0)}</div>
                          <p className="text-xs text-muted-foreground">Coût Estimé</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                        <div>
                          <div className="text-2xl font-bold">{strategyMetadata.maxGain.toFixed(0)}</div>
                          <p className="text-xs text-muted-foreground">Gain Maximum</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-red-500" />
                        <div>
                          <div className="text-2xl font-bold">{Math.abs(strategyMetadata.maxLoss).toFixed(0)}</div>
                          <p className="text-xs text-muted-foreground">Perte Maximum</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Détails de la Stratégie
                      <Badge className={getRiskColor(strategyMetadata.riskLevel)}>
                        Risque {strategyMetadata.riskLevel.toUpperCase()}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label>Delta</Label>
                        <div className="text-lg font-semibold">{strategyMetadata.greeks.delta.toFixed(3)}</div>
                      </div>
                      <div>
                        <Label>Gamma</Label>
                        <div className="text-lg font-semibold">{strategyMetadata.greeks.gamma.toFixed(3)}</div>
                      </div>
                      <div>
                        <Label>Theta</Label>
                        <div className="text-lg font-semibold">{strategyMetadata.greeks.theta.toFixed(3)}</div>
                      </div>
                      <div>
                        <Label>Vega</Label>
                        <div className="text-lg font-semibold">{strategyMetadata.greeks.vega.toFixed(3)}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Structure de la Stratégie</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {calculatedStrategy.map((option, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                          <div>
                            <span className="font-medium">{option.type.toUpperCase()}</span>
                            <span className="ml-2 text-sm text-muted-foreground">
                              Strike: {option.strike}% | Vol: {option.volatility}%
                            </span>
                          </div>
                          <div className={`font-semibold ${option.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {option.quantity > 0 ? '+' : ''}{option.quantity}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AdvancedZeroCostStrategies;
