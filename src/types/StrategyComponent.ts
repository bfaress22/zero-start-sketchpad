
export interface StrategyComponent {
  type: 'call' | 'put' | 'forward' | 'put-knockout' | 'call-knockout';
  strike: number;
  strikeType: 'percent' | 'absolute';
  volatility: number;
  quantity: number;
  barrier?: number;
  barrierType?: 'percent' | 'absolute';
  dynamicStrike?: {
    method: 'equilibrium';
    balanceWith: 'call' | 'put' | 'put-knockout';
    balanceWithIndex: number;
    volatilityAdjustment?: number;
  };
}
