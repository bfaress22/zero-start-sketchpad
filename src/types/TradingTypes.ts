
export interface OptionImpliedVolatility {
  [key: string]: number;
}

export interface StressTestScenario {
  id: string;
  name: string;
  spotPriceChange: number;
  volatilityChange: number;
  timeDecay: number;
}

export interface Result {
  date: string;
  price: number;
  payoff: number;
  premium: number;
  netResult: number;
}
