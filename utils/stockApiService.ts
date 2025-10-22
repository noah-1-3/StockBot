
import AsyncStorage from '@react-native-async-storage/async-storage';

// Finnhub API configuration
// Free tier: 60 API calls/minute
const FINNHUB_API_KEY = 'ctbhqj9r01qnhqvvvvs0ctbhqj9r01qnhqvvvvsg'; // Demo API key
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

const CACHE_KEY_PREFIX = '@stock_api_cache_';
const CACHE_DURATION = 60000; // 1 minute cache

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
      console.log('Using cached data for:', key);
      return cachedData.data;
    }

    return null;
  } catch (error) {
    console.error('Error getting cached data:', error);
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
    console.log('Cached data for:', key);
  } catch (error) {
    console.error('Error caching data:', error);
  }
};

// Fetch stock quote (current price)
export const fetchStockQuote = async (symbol: string): Promise<FinnhubQuote | null> => {
  try {
    const cacheKey = `quote_${symbol}`;
    const cached = await getCachedData<FinnhubQuote>(cacheKey);
    if (cached) return cached;

    console.log('Fetching quote for:', symbol);
    const response = await fetch(
      `${FINNHUB_BASE_URL}/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`
    );

    if (!response.ok) {
      console.error('Failed to fetch quote:', response.status);
      return null;
    }

    const data: FinnhubQuote = await response.json();
    
    // Check if data is valid
    if (data.c === 0 && data.pc === 0) {
      console.error('Invalid quote data for:', symbol);
      return null;
    }

    await setCachedData(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Error fetching stock quote:', error);
    return null;
  }
};

// Fetch company profile
export const fetchCompanyProfile = async (symbol: string): Promise<FinnhubProfile | null> => {
  try {
    const cacheKey = `profile_${symbol}`;
    const cached = await getCachedData<FinnhubProfile>(cacheKey);
    if (cached) return cached;

    console.log('Fetching profile for:', symbol);
    const response = await fetch(
      `${FINNHUB_BASE_URL}/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`
    );

    if (!response.ok) {
      console.error('Failed to fetch profile:', response.status);
      return null;
    }

    const data: FinnhubProfile = await response.json();
    
    // Check if data is valid
    if (!data.name) {
      console.error('Invalid profile data for:', symbol);
      return null;
    }

    await setCachedData(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Error fetching company profile:', error);
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

    console.log('Fetching historical data for:', symbol);
    const response = await fetch(
      `${FINNHUB_BASE_URL}/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`
    );

    if (!response.ok) {
      console.error('Failed to fetch historical data:', response.status);
      return null;
    }

    const data: FinnhubCandle = await response.json();
    
    // Check if data is valid
    if (data.s !== 'ok' || !data.c || data.c.length === 0) {
      console.error('Invalid historical data for:', symbol);
      return null;
    }

    await setCachedData(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Error fetching historical data:', error);
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

    console.log('Searching stocks with query:', query);
    const response = await fetch(
      `${FINNHUB_BASE_URL}/search?q=${encodeURIComponent(query)}&token=${FINNHUB_API_KEY}`
    );

    if (!response.ok) {
      console.error('Failed to search stocks:', response.status);
      return [];
    }

    const data = await response.json();
    const results = data.result || [];
    
    // Filter to only US stocks
    const usStocks = results.filter((item: any) => 
      item.type === 'Common Stock' && 
      !item.symbol.includes('.')
    ).slice(0, 10);

    await setCachedData(cacheKey, usStocks);
    return usStocks;
  } catch (error) {
    console.error('Error searching stocks:', error);
    return [];
  }
};

// Check if API is available
export const checkAPIAvailability = async (): Promise<boolean> => {
  try {
    const response = await fetch(
      `${FINNHUB_BASE_URL}/quote?symbol=AAPL&token=${FINNHUB_API_KEY}`
    );
    return response.ok;
  } catch (error) {
    console.error('API availability check failed:', error);
    return false;
  }
};

// Clear all API cache
export const clearAPICache = async (): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_KEY_PREFIX));
    await AsyncStorage.multiRemove(cacheKeys);
    console.log('API cache cleared');
  } catch (error) {
    console.error('Error clearing API cache:', error);
  }
};
