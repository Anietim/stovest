export type CurrencyCode = 'USD' | 'NGN' | 'ZAR' | 'KES';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  rateToUSD: number; // e.g. 1 USD = 1500 NGN
  format: (amountInUSD: number) => string;
}

export interface StockHolding {
  ticker: string;
  name: string;
  exchange: 'NASDAQ' | 'NYSE' | 'NGX' | 'JSE' | 'NSE';
  country: string;
  priceUSD: number;
  changePercent: number;
  changeValue: number;
  units: number;
  icon?: string;
  region: 'US' | 'Africa';
}

export interface MarketStock {
  ticker: string;
  name: string;
  exchange: string;
  country: string;
  flag: string;
  priceUSD: number;
  changePercent: number;
  marketCap: string;
  volume: string;
  sparkline: number[];
  category: 'gainers' | 'losers' | 'all';
  sector: string;
  description: string;
}

export interface WatchlistStock {
  ticker: string;
  name: string;
  exchange: string;
  priceUSD: number;
  changePercent: number;
  isPositive: boolean;
  type: 'most_viewed' | 'gainers' | 'losers';
}

export interface ChartDataPoint {
  date: string;
  displayDate: string;
  value: number;
}

export interface MarketNews {
  id: string;
  title: string;
  source: string;
  time: string;
  category: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  impactTag: string;
  url?: string;
}
