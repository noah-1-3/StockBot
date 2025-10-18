
import { StockData, WatchlistItem } from '@/types/stock';

// Generate mock historical data for the past 30 days
const generateHistoricalData = (basePrice: number, volatility: number = 0.02) => {
  const data = [];
  let price = basePrice;
  const today = new Date();
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Random walk with slight upward bias
    const change = (Math.random() - 0.48) * volatility * price;
    price = Math.max(price + change, basePrice * 0.7);
    
    data.push({
      date: date.toISOString().split('T')[0],
      price: parseFloat(price.toFixed(2)),
    });
  }
  
  return data;
};

// Generate prediction data for the next 7 days
const generatePredictionData = (lastPrice: number, trend: number = 0.01) => {
  const data = [];
  let price = lastPrice;
  const today = new Date();
  
  for (let i = 1; i <= 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    
    // Trend-based prediction with some randomness
    const change = (trend + (Math.random() - 0.5) * 0.005) * price;
    price = price + change;
    
    data.push({
      date: date.toISOString().split('T')[0],
      price: parseFloat(price.toFixed(2)),
    });
  }
  
  return data;
};

export const mockStocks: StockData[] = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    currentPrice: 178.45,
    previousClose: 175.20,
    change: 3.25,
    changePercent: 1.85,
    predictedPrice: 185.30,
    predictedChange: 6.85,
    predictedChangePercent: 3.84,
    confidence: 87,
    historicalData: generateHistoricalData(175, 0.025),
    predictionData: generatePredictionData(178.45, 0.015),
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    currentPrice: 142.80,
    previousClose: 144.50,
    change: -1.70,
    changePercent: -1.18,
    predictedPrice: 148.20,
    predictedChange: 5.40,
    predictedChangePercent: 3.78,
    confidence: 82,
    historicalData: generateHistoricalData(140, 0.03),
    predictionData: generatePredictionData(142.80, 0.012),
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    currentPrice: 412.35,
    previousClose: 408.90,
    change: 3.45,
    changePercent: 0.84,
    predictedPrice: 425.60,
    predictedChange: 13.25,
    predictedChangePercent: 3.21,
    confidence: 91,
    historicalData: generateHistoricalData(405, 0.02),
    predictionData: generatePredictionData(412.35, 0.01),
  },
  {
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    currentPrice: 248.90,
    previousClose: 252.30,
    change: -3.40,
    changePercent: -1.35,
    predictedPrice: 265.40,
    predictedChange: 16.50,
    predictedChangePercent: 6.63,
    confidence: 75,
    historicalData: generateHistoricalData(245, 0.04),
    predictionData: generatePredictionData(248.90, 0.02),
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com, Inc.',
    currentPrice: 178.25,
    previousClose: 176.80,
    change: 1.45,
    changePercent: 0.82,
    predictedPrice: 186.90,
    predictedChange: 8.65,
    predictedChangePercent: 4.85,
    confidence: 85,
    historicalData: generateHistoricalData(175, 0.028),
    predictionData: generatePredictionData(178.25, 0.016),
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    currentPrice: 875.50,
    previousClose: 862.40,
    change: 13.10,
    changePercent: 1.52,
    predictedPrice: 920.30,
    predictedChange: 44.80,
    predictedChangePercent: 5.12,
    confidence: 79,
    historicalData: generateHistoricalData(850, 0.035),
    predictionData: generatePredictionData(875.50, 0.018),
  },
];

export const getStockBySymbol = (symbol: string): StockData | undefined => {
  return mockStocks.find(stock => stock.symbol === symbol);
};

export const getWatchlist = (): WatchlistItem[] => {
  return mockStocks.map(stock => ({
    symbol: stock.symbol,
    name: stock.name,
    currentPrice: stock.currentPrice,
    change: stock.change,
    changePercent: stock.changePercent,
    predictedChange: stock.predictedChange,
  }));
};
