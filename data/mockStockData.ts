
import { StockData, WatchlistItem } from '@/types/stock';
import { 
  fetchStockQuoteSupabase, 
  fetchHistoricalDataSupabase, 
  fetchCompanyProfileSupabase,
  searchStocksSupabase,
  getStocksFromDB,
  getUserWatchlist,
  checkSupabaseConnection,
  savePrediction,
  getStockPredictions
} from '@/utils/supabaseStockService';

// Default stocks to display
export const mockStocks = [
  { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer Cyclical' },
  { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Automotive' },
  { symbol: 'META', name: 'Meta Platforms Inc.', sector: 'Technology' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Financial Services' },
];

export const allUSStocks = mockStocks;

// Generate prediction data based on historical prices
function generatePredictionData(lastPrice: number, daysAhead: number, trend: number = 0.02): Array<{ date: string; price: number }> {
  const predictions = [];
  let currentPrice = lastPrice;
  const today = new Date();

  for (let i = 1; i <= daysAhead; i++) {
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + i);
    
    const randomFactor = (Math.random() - 0.5) * 0.04;
    const trendFactor = trend * (1 + Math.random() * 0.5);
    currentPrice = currentPrice * (1 + trendFactor + randomFactor);
    
    predictions.push({
      date: futureDate.toISOString().split('T')[0],
      price: parseFloat(currentPrice.toFixed(2)),
    });
  }

  return predictions;
}

// Fetch real stock data from Supabase
async function fetchRealStockData(symbol: string, name: string, sector: string): Promise<StockData | null> {
  try {
    console.log('🔄 Fetching real stock data via Supabase for:', symbol);

    // Fetch quote
    const quoteData = await fetchStockQuoteSupabase(symbol);
    if (!quoteData) {
      console.error('❌ Failed to fetch quote for:', symbol);
      return null;
    }

    // Fetch historical data
    const historicalData = await fetchHistoricalDataSupabase(symbol);
    if (!historicalData || historicalData.s !== 'ok') {
      console.error('❌ Failed to fetch historical data for:', symbol);
      return null;
    }

    // Fetch company profile for name
    const profile = await fetchCompanyProfileSupabase(symbol);
    const companyName = profile?.name || name;

    // Convert historical data to chart format
    const historical = historicalData.t.map((timestamp: number, index: number) => ({
      date: new Date(timestamp * 1000).toISOString().split('T')[0],
      price: historicalData.c[index],
    }));

    // Generate predictions
    const lastPrice = quoteData.c;
    const trend = quoteData.dp > 0 ? 0.02 : -0.01;
    const predictions = generatePredictionData(lastPrice, 7, trend);

    // Save predictions to database
    for (const pred of predictions) {
      await savePrediction(symbol, pred.date, pred.price, 0.75);
    }

    const predictedPrice = predictions[predictions.length - 1].price;
    const predictedChange = predictedPrice - lastPrice;
    const predictedChangePercent = (predictedChange / lastPrice) * 100;

    const stockData: StockData = {
      symbol,
      name: companyName,
      currentPrice: lastPrice,
      previousClose: quoteData.pc,
      change: quoteData.d,
      changePercent: quoteData.dp,
      predictedPrice,
      predictedChange,
      predictedChangePercent,
      confidence: 0.75,
      historicalData: historical,
      predictionData: predictions,
      isRealData: true,
    };

    console.log('✅ Successfully fetched real data via Supabase for:', symbol);
    return stockData;
  } catch (error) {
    console.error('❌ Error fetching real stock data via Supabase for', symbol, ':', error);
    return null;
  }
}

// Generate stock data (tries Supabase first)
export async function generateStockData(
  symbol: string,
  name: string,
  basePrice: number,
  sector: string
): Promise<StockData> {
  // Try to fetch real data via Supabase
  const realData = await fetchRealStockData(symbol, name, sector);
  if (realData) {
    return realData;
  }

  // Fallback to simulated data
  console.log('⚠️ Using simulated data for:', symbol);
  const changePercent = (Math.random() - 0.5) * 10;
  const change = basePrice * (changePercent / 100);
  const currentPrice = basePrice + change;

  const historical = [];
  let price = basePrice * 0.9;
  const today = new Date();

  for (let i = 30; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    price = price * (1 + (Math.random() - 0.48) * 0.05);
    historical.push({
      date: date.toISOString().split('T')[0],
      price: parseFloat(price.toFixed(2)),
    });
  }

  const lastPrice = historical[historical.length - 1].price;
  const trend = changePercent > 0 ? 0.02 : -0.01;
  const predictions = generatePredictionData(lastPrice, 7, trend);

  const predictedPrice = predictions[predictions.length - 1].price;
  const predictedChange = predictedPrice - currentPrice;
  const predictedChangePercent = (predictedChange / currentPrice) * 100;

  return {
    symbol,
    name,
    currentPrice,
    previousClose: basePrice,
    change,
    changePercent,
    predictedPrice,
    predictedChange,
    predictedChangePercent,
    confidence: 0.65,
    historicalData: historical,
    predictionData: predictions,
    isRealData: false,
  };
}

// Generate mock stocks
export async function generateMockStocks(): Promise<StockData[]> {
  console.log('📊 Generating stock data via Supabase...');
  
  const stockPromises = mockStocks.map(stock =>
    generateStockData(stock.symbol, stock.name, 150 + Math.random() * 200, stock.sector)
  );

  const stocks = await Promise.all(stockPromises);
  console.log('✅ Generated', stocks.length, 'stocks');
  return stocks;
}

// Get watchlist
export async function getWatchlist(): Promise<WatchlistItem[]> {
  try {
    console.log('📋 Getting watchlist via Supabase...');
    
    // Get user's watchlist symbols
    const watchlistSymbols = await getUserWatchlist();
    
    if (watchlistSymbols.length === 0) {
      console.log('⚠️ Watchlist is empty, using default stocks');
      // Return default stocks if watchlist is empty
      const stocks = await generateMockStocks();
      return stocks.slice(0, 5).map(stock => ({
        symbol: stock.symbol,
        name: stock.name,
        currentPrice: stock.currentPrice,
        change: stock.change,
        changePercent: stock.changePercent,
        predictedChange: stock.predictedChange,
      }));
    }

    // Fetch data for watchlist stocks
    const stockPromises = watchlistSymbols.map(async (symbol) => {
      const stockInfo = mockStocks.find(s => s.symbol === symbol) || { 
        symbol, 
        name: symbol, 
        sector: 'Unknown' 
      };
      return generateStockData(stockInfo.symbol, stockInfo.name, 150 + Math.random() * 200, stockInfo.sector);
    });

    const stocks = await Promise.all(stockPromises);
    
    return stocks.map(stock => ({
      symbol: stock.symbol,
      name: stock.name,
      currentPrice: stock.currentPrice,
      change: stock.change,
      changePercent: stock.changePercent,
      predictedChange: stock.predictedChange,
    }));
  } catch (error) {
    console.error('❌ Error getting watchlist:', error);
    return [];
  }
}

// Search stocks
export async function searchStocks(query: string): Promise<WatchlistItem[]> {
  try {
    if (!query || query.trim().length === 0) {
      return [];
    }

    console.log('🔍 Searching stocks via Supabase:', query);
    
    // Search via Supabase Edge Function
    const results = await searchStocksSupabase(query);
    
    if (results.length === 0) {
      console.log('⚠️ No results from Supabase, searching local stocks');
      // Fallback to local search
      const filtered = mockStocks.filter(
        stock =>
          stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
          stock.name.toLowerCase().includes(query.toLowerCase())
      );

      const stockPromises = filtered.map(stock =>
        generateStockData(stock.symbol, stock.name, 150 + Math.random() * 200, stock.sector)
      );

      const stocks = await Promise.all(stockPromises);
      
      return stocks.map(stock => ({
        symbol: stock.symbol,
        name: stock.name,
        currentPrice: stock.currentPrice,
        change: stock.change,
        changePercent: stock.changePercent,
        predictedChange: stock.predictedChange,
      }));
    }

    // Fetch data for search results
    const stockPromises = results.slice(0, 10).map(result =>
      generateStockData(result.symbol, result.description, 150 + Math.random() * 200, 'Unknown')
    );

    const stocks = await Promise.all(stockPromises);
    
    return stocks.map(stock => ({
      symbol: stock.symbol,
      name: stock.name,
      currentPrice: stock.currentPrice,
      change: stock.change,
      changePercent: stock.changePercent,
      predictedChange: stock.predictedChange,
    }));
  } catch (error) {
    console.error('❌ Error searching stocks:', error);
    return [];
  }
}

// Get stock by symbol
export async function getStockBySymbol(symbol: string): Promise<StockData | null> {
  try {
    console.log('📊 Getting stock data via Supabase for:', symbol);
    
    const stockInfo = mockStocks.find(s => s.symbol === symbol) || { 
      symbol, 
      name: symbol, 
      sector: 'Unknown' 
    };
    
    return await generateStockData(stockInfo.symbol, stockInfo.name, 150 + Math.random() * 200, stockInfo.sector);
  } catch (error) {
    console.error('❌ Error getting stock by symbol:', error);
    return null;
  }
}

// Generate dynamic prediction
export async function generateDynamicPrediction(
  symbol: string,
  targetDate: Date
): Promise<{ predictedPrice: number; confidence: number; predictionData: Array<{ date: string; price: number }> } | null> {
  try {
    console.log('🔮 Generating dynamic prediction via Supabase for:', symbol);
    
    const stock = await getStockBySymbol(symbol);
    if (!stock) {
      return null;
    }

    const today = new Date();
    const daysAhead = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysAhead <= 0) {
      return null;
    }

    const trend = stock.changePercent > 0 ? 0.02 : -0.01;
    const predictions = generatePredictionData(stock.currentPrice, daysAhead, trend);

    // Save predictions to database
    for (const pred of predictions) {
      await savePrediction(symbol, pred.date, pred.price, 0.75);
    }

    return {
      predictedPrice: predictions[predictions.length - 1].price,
      confidence: 0.75,
      predictionData: predictions,
    };
  } catch (error) {
    console.error('❌ Error generating dynamic prediction:', error);
    return null;
  }
}

// Get company description
export async function getCompanyDescription(symbol: string): Promise<string> {
  try {
    const profile = await fetchCompanyProfileSupabase(symbol);
    if (profile && profile.name) {
      return `${profile.name} is a leading company in the ${profile.finnhubIndustry || 'industry'} sector.`;
    }
    return `${symbol} is a publicly traded company.`;
  } catch (error) {
    console.error('❌ Error getting company description:', error);
    return `${symbol} is a publicly traded company.`;
  }
}

// Initialize stocks
export async function initializeStocks(): Promise<void> {
  console.log('🚀 Initializing stocks via Supabase...');
  await generateMockStocks();
  console.log('✅ Stocks initialized');
}

// Check API status
export async function checkAPIStatus(): Promise<{
  isAvailable: boolean;
  message: string;
  suggestion: string;
}> {
  const isAvailable = await checkSupabaseConnection();
  
  if (isAvailable) {
    return {
      isAvailable: true,
      message: 'Supabase connection is active',
      suggestion: 'Real-time stock data is available via Supabase Edge Functions',
    };
  }
  
  return {
    isAvailable: false,
    message: 'Unable to connect to Supabase',
    suggestion: 'Please check your internet connection and Supabase configuration.',
  };
}
