
export interface CurrencyPair {
  symbol: string;
  name: string;
  defaultSpotRate: number;
}

export const CURRENCY_PAIRS: CurrencyPair[] = [
  { symbol: "EUR/USD", name: "Euro / US Dollar", defaultSpotRate: 1.0850 },
  { symbol: "GBP/USD", name: "British Pound / US Dollar", defaultSpotRate: 1.2650 },
  { symbol: "USD/JPY", name: "US Dollar / Japanese Yen", defaultSpotRate: 149.50 },
  { symbol: "USD/CHF", name: "US Dollar / Swiss Franc", defaultSpotRate: 0.8920 },
  { symbol: "AUD/USD", name: "Australian Dollar / US Dollar", defaultSpotRate: 0.6650 },
  { symbol: "USD/CAD", name: "US Dollar / Canadian Dollar", defaultSpotRate: 1.3580 },
  { symbol: "NZD/USD", name: "New Zealand Dollar / US Dollar", defaultSpotRate: 0.6150 },
  { symbol: "EUR/GBP", name: "Euro / British Pound", defaultSpotRate: 0.8620 },
  { symbol: "EUR/JPY", name: "Euro / Japanese Yen", defaultSpotRate: 162.10 },
  { symbol: "GBP/JPY", name: "British Pound / Japanese Yen", defaultSpotRate: 188.95 }
];
