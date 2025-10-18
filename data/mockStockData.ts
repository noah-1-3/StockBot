
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

// Generate prediction data for the next N days
const generatePredictionData = (lastPrice: number, daysAhead: number = 7, trend: number = 0.01) => {
  const data = [];
  let price = lastPrice;
  const today = new Date();
  
  for (let i = 1; i <= daysAhead; i++) {
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

// Generate dynamic prediction for any stock and date
export const generateDynamicPrediction = (baseStock: StockData, daysAhead: number): StockData => {
  console.log('Generating dynamic prediction for', baseStock.symbol, 'days ahead:', daysAhead);
  
  // Calculate trend based on recent historical data
  const recentData = baseStock.historicalData.slice(-10);
  const avgChange = recentData.reduce((sum, point, idx) => {
    if (idx === 0) return 0;
    return sum + (point.price - recentData[idx - 1].price);
  }, 0) / (recentData.length - 1);
  
  const trend = avgChange / baseStock.currentPrice;
  
  // Generate new prediction data
  const predictionData = generatePredictionData(baseStock.currentPrice, daysAhead, trend);
  const predictedPrice = predictionData[predictionData.length - 1].price;
  const predictedChange = predictedPrice - baseStock.currentPrice;
  const predictedChangePercent = (predictedChange / baseStock.currentPrice) * 100;
  
  // Calculate confidence based on days ahead (decreases with longer predictions)
  const baseConfidence = baseStock.confidence || 85;
  const confidenceDecay = Math.min(30, daysAhead * 0.5);
  const confidence = Math.max(50, Math.round(baseConfidence - confidenceDecay));
  
  return {
    ...baseStock,
    predictionData,
    predictedPrice,
    predictedChange,
    predictedChangePercent,
    confidence,
  };
};

// Comprehensive list of US stocks
export const allUSStocks = [
  // Tech Giants
  { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology', basePrice: 178.45 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology', basePrice: 142.80 },
  { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology', basePrice: 412.35 },
  { symbol: 'AMZN', name: 'Amazon.com, Inc.', sector: 'Consumer Cyclical', basePrice: 178.25 },
  { symbol: 'META', name: 'Meta Platforms, Inc.', sector: 'Technology', basePrice: 485.20 },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology', basePrice: 875.50 },
  { symbol: 'TSLA', name: 'Tesla, Inc.', sector: 'Automotive', basePrice: 248.90 },
  
  // Financial Services
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Financial Services', basePrice: 185.40 },
  { symbol: 'BAC', name: 'Bank of America Corporation', sector: 'Financial Services', basePrice: 34.50 },
  { symbol: 'WFC', name: 'Wells Fargo & Company', sector: 'Financial Services', basePrice: 52.30 },
  { symbol: 'GS', name: 'The Goldman Sachs Group, Inc.', sector: 'Financial Services', basePrice: 425.60 },
  { symbol: 'MS', name: 'Morgan Stanley', sector: 'Financial Services', basePrice: 98.75 },
  { symbol: 'V', name: 'Visa Inc.', sector: 'Financial Services', basePrice: 275.80 },
  { symbol: 'MA', name: 'Mastercard Incorporated', sector: 'Financial Services', basePrice: 445.90 },
  { symbol: 'AXP', name: 'American Express Company', sector: 'Financial Services', basePrice: 215.30 },
  
  // Healthcare
  { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare', basePrice: 158.90 },
  { symbol: 'UNH', name: 'UnitedHealth Group Incorporated', sector: 'Healthcare', basePrice: 512.40 },
  { symbol: 'PFE', name: 'Pfizer Inc.', sector: 'Healthcare', basePrice: 28.65 },
  { symbol: 'ABBV', name: 'AbbVie Inc.', sector: 'Healthcare', basePrice: 168.75 },
  { symbol: 'TMO', name: 'Thermo Fisher Scientific Inc.', sector: 'Healthcare', basePrice: 545.20 },
  { symbol: 'ABT', name: 'Abbott Laboratories', sector: 'Healthcare', basePrice: 112.80 },
  { symbol: 'MRK', name: 'Merck & Co., Inc.', sector: 'Healthcare', basePrice: 125.40 },
  { symbol: 'LLY', name: 'Eli Lilly and Company', sector: 'Healthcare', basePrice: 785.30 },
  
  // Consumer Goods
  { symbol: 'KO', name: 'The Coca-Cola Company', sector: 'Consumer Defensive', basePrice: 62.45 },
  { symbol: 'PEP', name: 'PepsiCo, Inc.', sector: 'Consumer Defensive', basePrice: 168.90 },
  { symbol: 'WMT', name: 'Walmart Inc.', sector: 'Consumer Defensive', basePrice: 72.35 },
  { symbol: 'PG', name: 'The Procter & Gamble Company', sector: 'Consumer Defensive', basePrice: 165.80 },
  { symbol: 'COST', name: 'Costco Wholesale Corporation', sector: 'Consumer Defensive', basePrice: 785.60 },
  { symbol: 'NKE', name: 'NIKE, Inc.', sector: 'Consumer Cyclical', basePrice: 78.90 },
  { symbol: 'MCD', name: "McDonald's Corporation", sector: 'Consumer Cyclical', basePrice: 295.40 },
  { symbol: 'SBUX', name: 'Starbucks Corporation', sector: 'Consumer Cyclical', basePrice: 98.75 },
  
  // Energy
  { symbol: 'XOM', name: 'Exxon Mobil Corporation', sector: 'Energy', basePrice: 112.50 },
  { symbol: 'CVX', name: 'Chevron Corporation', sector: 'Energy', basePrice: 158.30 },
  { symbol: 'COP', name: 'ConocoPhillips', sector: 'Energy', basePrice: 118.45 },
  { symbol: 'SLB', name: 'Schlumberger Limited', sector: 'Energy', basePrice: 48.90 },
  
  // Telecommunications
  { symbol: 'T', name: 'AT&T Inc.', sector: 'Communication Services', basePrice: 21.85 },
  { symbol: 'VZ', name: 'Verizon Communications Inc.', sector: 'Communication Services', basePrice: 42.30 },
  { symbol: 'TMUS', name: 'T-Mobile US, Inc.', sector: 'Communication Services', basePrice: 185.60 },
  
  // Entertainment & Media
  { symbol: 'DIS', name: 'The Walt Disney Company', sector: 'Communication Services', basePrice: 112.80 },
  { symbol: 'NFLX', name: 'Netflix, Inc.', sector: 'Communication Services', basePrice: 625.40 },
  { symbol: 'CMCSA', name: 'Comcast Corporation', sector: 'Communication Services', basePrice: 42.15 },
  
  // Semiconductors
  { symbol: 'INTC', name: 'Intel Corporation', sector: 'Technology', basePrice: 42.85 },
  { symbol: 'AMD', name: 'Advanced Micro Devices, Inc.', sector: 'Technology', basePrice: 168.90 },
  { symbol: 'QCOM', name: 'QUALCOMM Incorporated', sector: 'Technology', basePrice: 175.30 },
  { symbol: 'TXN', name: 'Texas Instruments Incorporated', sector: 'Technology', basePrice: 185.60 },
  { symbol: 'AVGO', name: 'Broadcom Inc.', sector: 'Technology', basePrice: 1425.80 },
  
  // Retail
  { symbol: 'HD', name: 'The Home Depot, Inc.', sector: 'Consumer Cyclical', basePrice: 385.40 },
  { symbol: 'LOW', name: "Lowe's Companies, Inc.", sector: 'Consumer Cyclical', basePrice: 245.90 },
  { symbol: 'TGT', name: 'Target Corporation', sector: 'Consumer Cyclical', basePrice: 148.75 },
  
  // Industrial
  { symbol: 'BA', name: 'The Boeing Company', sector: 'Industrials', basePrice: 185.30 },
  { symbol: 'CAT', name: 'Caterpillar Inc.', sector: 'Industrials', basePrice: 345.60 },
  { symbol: 'GE', name: 'General Electric Company', sector: 'Industrials', basePrice: 168.90 },
  { symbol: 'UPS', name: 'United Parcel Service, Inc.', sector: 'Industrials', basePrice: 145.80 },
  
  // Software & Cloud
  { symbol: 'CRM', name: 'Salesforce, Inc.', sector: 'Technology', basePrice: 285.40 },
  { symbol: 'ORCL', name: 'Oracle Corporation', sector: 'Technology', basePrice: 125.60 },
  { symbol: 'ADBE', name: 'Adobe Inc.', sector: 'Technology', basePrice: 565.80 },
  { symbol: 'NOW', name: 'ServiceNow, Inc.', sector: 'Technology', basePrice: 785.30 },
  { symbol: 'SNOW', name: 'Snowflake Inc.', sector: 'Technology', basePrice: 168.45 },
  
  // E-commerce & Payments
  { symbol: 'PYPL', name: 'PayPal Holdings, Inc.', sector: 'Financial Services', basePrice: 62.85 },
  { symbol: 'SQ', name: 'Block, Inc.', sector: 'Financial Services', basePrice: 78.90 },
  { symbol: 'SHOP', name: 'Shopify Inc.', sector: 'Technology', basePrice: 85.40 },
  
  // Automotive
  { symbol: 'F', name: 'Ford Motor Company', sector: 'Automotive', basePrice: 12.45 },
  { symbol: 'GM', name: 'General Motors Company', sector: 'Automotive', basePrice: 38.90 },
  { symbol: 'RIVN', name: 'Rivian Automotive, Inc.', sector: 'Automotive', basePrice: 18.75 },
  
  // Aerospace & Defense
  { symbol: 'LMT', name: 'Lockheed Martin Corporation', sector: 'Industrials', basePrice: 485.60 },
  { symbol: 'RTX', name: 'RTX Corporation', sector: 'Industrials', basePrice: 112.30 },
  { symbol: 'NOC', name: 'Northrop Grumman Corporation', sector: 'Industrials', basePrice: 485.90 },
  
  // Biotech
  { symbol: 'GILD', name: 'Gilead Sciences, Inc.', sector: 'Healthcare', basePrice: 85.40 },
  { symbol: 'AMGN', name: 'Amgen Inc.', sector: 'Healthcare', basePrice: 285.60 },
  { symbol: 'BIIB', name: 'Biogen Inc.', sector: 'Healthcare', basePrice: 225.80 },
  { symbol: 'MRNA', name: 'Moderna, Inc.', sector: 'Healthcare', basePrice: 68.90 },
  
  // Real Estate
  { symbol: 'AMT', name: 'American Tower Corporation', sector: 'Real Estate', basePrice: 215.40 },
  { symbol: 'PLD', name: 'Prologis, Inc.', sector: 'Real Estate', basePrice: 125.80 },
  { symbol: 'SPG', name: 'Simon Property Group, Inc.', sector: 'Real Estate', basePrice: 168.90 },
];

// Generate stock data dynamically
const generateStockData = (symbol: string, name: string, basePrice: number): StockData => {
  const volatility = 0.02 + Math.random() * 0.02;
  const historicalData = generateHistoricalData(basePrice, volatility);
  const currentPrice = historicalData[historicalData.length - 1].price;
  const previousClose = historicalData[historicalData.length - 2].price;
  const change = currentPrice - previousClose;
  const changePercent = (change / previousClose) * 100;
  
  const trend = 0.005 + Math.random() * 0.015;
  const predictionData = generatePredictionData(currentPrice, 7, trend);
  const predictedPrice = predictionData[predictionData.length - 1].price;
  const predictedChange = predictedPrice - currentPrice;
  const predictedChangePercent = (predictedChange / currentPrice) * 100;
  
  const confidence = Math.round(75 + Math.random() * 20);
  
  return {
    symbol,
    name,
    currentPrice: parseFloat(currentPrice.toFixed(2)),
    previousClose: parseFloat(previousClose.toFixed(2)),
    change: parseFloat(change.toFixed(2)),
    changePercent: parseFloat(changePercent.toFixed(2)),
    predictedPrice: parseFloat(predictedPrice.toFixed(2)),
    predictedChange: parseFloat(predictedChange.toFixed(2)),
    predictedChangePercent: parseFloat(predictedChangePercent.toFixed(2)),
    confidence,
    historicalData,
    predictionData,
  };
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
    predictionData: generatePredictionData(178.45, 7, 0.015),
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
    predictionData: generatePredictionData(142.80, 7, 0.012),
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
    predictionData: generatePredictionData(412.35, 7, 0.01),
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
    predictionData: generatePredictionData(248.90, 7, 0.02),
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
    predictionData: generatePredictionData(178.25, 7, 0.016),
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
    predictionData: generatePredictionData(875.50, 7, 0.018),
  },
];

export const getStockBySymbol = (symbol: string): StockData | undefined => {
  console.log('Getting stock by symbol:', symbol);
  
  // First check if it's in the mock stocks
  const mockStock = mockStocks.find(stock => stock.symbol === symbol);
  if (mockStock) {
    return mockStock;
  }
  
  // Otherwise, generate it dynamically from the all stocks list
  const stockInfo = allUSStocks.find(stock => stock.symbol === symbol);
  if (stockInfo) {
    return generateStockData(stockInfo.symbol, stockInfo.name, stockInfo.basePrice);
  }
  
  return undefined;
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

// Search stocks by symbol or name
export const searchStocks = (query: string, limit: number = 10): Array<{ symbol: string; name: string; sector: string }> => {
  if (!query || query.trim().length === 0) {
    return [];
  }
  
  const searchTerm = query.toLowerCase().trim();
  console.log('Searching stocks with query:', searchTerm);
  
  const results = allUSStocks.filter(stock => 
    stock.symbol.toLowerCase().includes(searchTerm) ||
    stock.name.toLowerCase().includes(searchTerm)
  );
  
  // Sort by relevance: exact matches first, then starts with, then contains
  results.sort((a, b) => {
    const aSymbol = a.symbol.toLowerCase();
    const bSymbol = b.symbol.toLowerCase();
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();
    
    // Exact symbol match
    if (aSymbol === searchTerm) return -1;
    if (bSymbol === searchTerm) return 1;
    
    // Symbol starts with
    if (aSymbol.startsWith(searchTerm) && !bSymbol.startsWith(searchTerm)) return -1;
    if (bSymbol.startsWith(searchTerm) && !aSymbol.startsWith(searchTerm)) return 1;
    
    // Name starts with
    if (aName.startsWith(searchTerm) && !bName.startsWith(searchTerm)) return -1;
    if (bName.startsWith(searchTerm) && !aName.startsWith(searchTerm)) return 1;
    
    // Alphabetical
    return aSymbol.localeCompare(bSymbol);
  });
  
  return results.slice(0, limit);
};
