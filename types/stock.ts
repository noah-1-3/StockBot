
export interface StockData {
  symbol: string;
  name: string;
  currentPrice: number;
  previousClose: number;
  change: number;
  changePercent: number;
  predictedPrice: number;
  predictedChange: number;
  predictedChangePercent: number;
  confidence: number;
  historicalData: HistoricalDataPoint[];
  predictionData: HistoricalDataPoint[];
}

export interface HistoricalDataPoint {
  date: string;
  price: number;
}

export interface WatchlistItem {
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  predictedChange: number;
}
