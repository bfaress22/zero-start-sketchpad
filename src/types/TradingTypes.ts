
export interface OptionImpliedVolatility {
  [key: string]: number;
}

export interface StressTestScenario {
  id: string;
  name: string;
  spotPriceChange: number;
  volatilityChange: number;
  timeDecay: number;
  volatility: number;
  drift: number;
  priceShock: number;
  forwardBasis?: number;
  realBasis?: number;
}

export interface OptionPrice {
  type: string;
  price: number;
  label?: string;
}

export interface Result {
  date: string;
  price: number;
  payoff: number;
  premium: number;
  netResult: number;
  timeToMaturity: number;
  forward: number;
  realPrice: number;
  strategyPrice: number;
  totalPayoff: number;
  hedgedCost: number;
  unhedgedCost: number;
  deltaPnL: number;
  monthlyVolume: number;
  optionPrices?: OptionPrice[];
}
