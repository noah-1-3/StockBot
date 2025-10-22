
import AsyncStorage from '@react-native-async-storage/async-storage';

// Finnhub API configuration
// IMPORTANT: Get your own free API key from https://finnhub.io/
// The demo key has severe limitations and may not work properly
const FINNHUB_API_KEY = 'ctbhqj9r01qnhqvvvvs0ctbhqj9r01qnhqvvvvsg'; // Replace with your own key!
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

const CACHE_KEY_PREFIX = '@stock_api_cache_';
const CACHE_DURATION = 300000; // 5 minutes cache (increased from 1 minute to reduce API calls)

interface CachedData<T> {
  data: T;
  timestamp: number;
}

interface FinnhubQuote {
  c: number; // Current price
  h: number; // High price of the day
  l: number; // Low price of the day
  o: number; // Open price of the day
  pc: number; // Previous close price
  t: number; // Timestamp
}

interface FinnhubProfile {
  name: string;
  ticker: string;
  exchange: string;
  ipo: string;
  marketCapitalization: number;
  shareOutstanding: number;
  logo: string;
  phone: string;
  weburl: string;
  finnhubIndustry: string;
}

interface FinnhubCandle {
  c: number[]; // Close prices
  h: number[]; // High prices
  l: number[]; // Low prices
  o: number[]; // Open prices
  s: string; // Status
  t: number[]; // Timestamps
  v: number[]; // Volumes
}

// Get cached data if available and not expired
const getCachedData = async <T>(key: string): Promise<T | null> => {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEY_PREFIX + key);
    if (!cached) return null;

    const cachedData: CachedData<T> = JSON.parse(cached);
    const now = Date.now();

    if (now - cachedData.timestamp < CACHE_DURATION) {
      console.log('✅ Using cached data for:', key);
      return cachedData.data;
    }

    console.log('⏰ Cache expired for:', key);
    return null;
  } catch (error) {
    console.error('❌ Error getting cached data:', error);
    return null;
  }
};

// Cache data
const setCachedData = async <T>(key: string, data: T): Promise<void> => {
  try {
    const cachedData: CachedData<T> = {
      data,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(CACHE_KEY_PREFIX + key, JSON.stringify(cachedData));
    console.log('💾 Cached data for:', key);
  } catch (error) {
    console.error('❌ Error caching data:', error);
  }
};

// Fetch stock quote (current price)
export const fetchStockQuote = async (symbol: string): Promise<FinnhubQuote | null> => {
  try {
    const cacheKey = `quote_${symbol}`;
    const cached = await getCachedData<FinnhubQuote>(cacheKey);
    if (cached) return cached;

    console.log('🔄 Fetching real-time quote for:', symbol);
    const url = `${FINNHUB_BASE_URL}/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error('❌ Failed to fetch quote:', response.status, response.statusText);
      if (response.status === 429) {
        console.error('⚠️ API rate limit exceeded! Consider upgrading your Finnhub plan or reducing API calls.');
      } else if (response.status === 401) {
        console.error('⚠️ Invalid API key! Get a free key from https://finnhub.io/');
      }
      return null;
    }

    const data: FinnhubQuote = await response.json();
    
    // Check if data is valid (Finnhub returns 0 for invalid symbols or when market is closed)
    if (data.c === 0 && data.pc === 0) {
      console.error('❌ Invalid or unavailable quote data for:', symbol);
      console.log('💡 This could mean: 1) Invalid symbol, 2) Market is closed, 3) API key issue');
      return null;
    }

    // Additional validation
    if (!data.c || data.c <= 0) {
      console.error('❌ Invalid price data received for:', symbol);
      return null;
    }

    console.log('✅ Successfully fetched quote for:', symbol, '- Price:', data.c);
    await setCachedData(cacheKey, data);
    return data;
  } catch (error) {
    console.error('❌ Error fetching stock quote:', error);
    return null;
  }
};

// Fetch company profile
export const fetchCompanyProfile = async (symbol: string): Promise<FinnhubProfile | null> => {
  try {
    const cacheKey = `profile_${symbol}`;
    const cached = await getCachedData<FinnhubProfile>(cacheKey);
    if (cached) return cached;

    console.log('🔄 Fetching company profile for:', symbol);
    const url = `${FINNHUB_BASE_URL}/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error('❌ Failed to fetch profile:', response.status, response.statusText);
      return null;
    }

    const data: FinnhubProfile = await response.json();
    
    // Check if data is valid
    if (!data.name || Object.keys(data).length === 0) {
      console.error('❌ Invalid profile data for:', symbol);
      return null;
    }

    console.log('✅ Successfully fetched profile for:', symbol);
    await setCachedData(cacheKey, data);
    return data;
  } catch (error) {
    console.error('❌ Error fetching company profile:', error);
    return null;
  }
};

// Fetch historical candle data
export const fetchHistoricalData = async (
  symbol: string,
  resolution: 'D' | 'W' | 'M' = 'D',
  daysBack: number = 30
): Promise<FinnhubCandle | null> => {
  try {
    const cacheKey = `candles_${symbol}_${resolution}_${daysBack}`;
    const cached = await getCachedData<FinnhubCandle>(cacheKey);
    if (cached) return cached;

    const to = Math.floor(Date.now() / 1000);
    const from = to - (daysBack * 24 * 60 * 60);

    console.log('🔄 Fetching historical data for:', symbol, `(${daysBack} days)`);
    const url = `${FINNHUB_BASE_URL}/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error('❌ Failed to fetch historical data:', response.status, response.statusText);
      return null;
    }

    const data: FinnhubCandle = await response.json();
    
    // Check if data is valid
    if (data.s !== 'ok' || !data.c || data.c.length === 0) {
      console.error('❌ Invalid historical data for:', symbol, '- Status:', data.s);
      return null;
    }

    console.log('✅ Successfully fetched', data.c.length, 'historical data points for:', symbol);
    await setCachedData(cacheKey, data);
    return data;
  } catch (error) {
    console.error('❌ Error fetching historical data:', error);
    return null;
  }
};

// Search for stocks
export const searchStocksAPI = async (query: string): Promise<Array<{ symbol: string; description: string; type: string }>> => {
  try {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const cacheKey = `search_${query.toLowerCase()}`;
    const cached = await getCachedData<Array<{ symbol: string; description: string; type: string }>>(cacheKey);
    if (cached) return cached;

    console.log('🔍 Searching stocks with query:', query);
    const url = `${FINNHUB_BASE_URL}/search?q=${encodeURIComponent(query)}&token=${FINNHUB_API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error('❌ Failed to search stocks:', response.status, response.statusText);
      return [];
    }

    const data = await response.json();
    const results = data.result || [];
    
    // Filter to only US stocks (no foreign exchanges)
    const usStocks = results.filter((item: any) => 
      item.type === 'Common Stock' && 
      !item.symbol.includes('.') &&
      item.symbol.length <= 5 // Most US tickers are 1-5 characters
    ).slice(0, 10);

    console.log('✅ Found', usStocks.length, 'US stocks matching:', query);
    await setCachedData(cacheKey, usStocks);
    return usStocks;
  } catch (error) {
    console.error('❌ Error searching stocks:', error);
    return [];
  }
};

// Check if API is available and working
export const checkAPIAvailability = async (): Promise<boolean> => {
  try {
    console.log('🔍 Checking API availability...');
    const response = await fetch(
      `${FINNHUB_BASE_URL}/quote?symbol=AAPL&token=${FINNHUB_API_KEY}`
    );
    
    if (!response.ok) {
      console.error('❌ API not available:', response.status);
      return false;
    }

    const data = await response.json();
    const isValid = data.c > 0;
    
    if (isValid) {
      console.log('✅ API is working correctly');
    } else {
      console.error('⚠️ API responded but returned invalid data');
    }
    
    return isValid;
  } catch (error) {
    console.error('❌ API availability check failed:', error);
    return false;
  }
};

// Clear all API cache
export const clearAPICache = async (): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_KEY_PREFIX));
    await AsyncStorage.multiRemove(cacheKeys);
    console.log('🗑️ API cache cleared -', cacheKeys.length, 'items removed');
  } catch (error) {
    console.error('❌ Error clearing API cache:', error);
  }
};

// Get API status and diagnostics
export const getAPIStatus = async (): Promise<{
  isAvailable: boolean;
  message: string;
  suggestion: string;
}> => {
  const isAvailable = await checkAPIAvailability();
  
  if (isAvailable) {
    return {
      isAvailable: true,
      message: 'API is working correctly',
      suggestion: 'Real-time stock data is available',
    };
  }
  
  return {
    isAvailable: false,
    message: 'Unable to fetch real stock data',
    suggestion: 'Please check your internet connection and API key. Get a free API key from https://finnhub.io/',
  };
};
