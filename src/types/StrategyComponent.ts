
export interface StrategyComponent {
  type: 'call' | 'put' | 'forward' | 'spot';
  strike?: number;
  premium?: number;
  quantity: number;
  expiry?: string;
  side: 'long' | 'short';
  id: string;
  balancingOptions?: {
    method: 'equilibrium';
    balanceWithIndex: number;
    volatilityAdjustment?: number;
    balanceWith?: string; // Ajout de la propriété manquante
  };
}
