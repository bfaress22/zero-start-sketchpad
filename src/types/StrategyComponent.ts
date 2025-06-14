
export interface StrategyComponent {
  type: string;
  strike: number;
  strikeType: 'percent' | 'absolute';
  volatility: number;
  quantity: number;
  barrier?: number;
  barrierType?: 'percent' | 'absolute';
  dynamicStrike?: {
    method: string;
    balanceWith?: string;
    balanceWithIndex: number;
    volatilityAdjustment?: number;
  };
}
