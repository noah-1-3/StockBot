
import AsyncStorage from '@react-native-async-storage/async-storage';

// Alpha Vantage API configuration
const ALPHA_VANTAGE_API_KEY = 'TZZX7A3O5X9XLQEP';
const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query';

const CACHE_KEY_PREFIX = '@stock_api_cache_';
const CACHE_DURATION = 60000; // 1 minute cache for real-time data

interface CachedData<T> {
  data: T;
  timestamp: number;
}

interface AlphaVantageQuote {
  '01. symbol': string;
  '02. open': string;
  '03. high': string;
  '04. low': string;
  '05. price': string;
  '06. volume': string;
  '07. latest trading day': string;
  '08. previous close': string;
  '09. change': string;
  '10. change percent': string;
}

interface AlphaVantageTimeSeriesDaily {
  'Meta Data': {
    '1. Information': string;
    '2. Symbol': string;
    '3. Last Refreshed': string;
    '4. Output Size': string;
    '5. Time Zone': string;
  };
  'Time Series (Daily)': {
    [date: string]: {
      '1. open': string;
      '2. high': string;
      '3. low': string;
      '4. close': string;
      '5. volume': string;
    };
  };
}

interface AlphaVantageSearchResult {
  'bestMatches': Array<{
    '1. symbol': string;
    '2. name': string;
    '3. type': string;
    '4. region': string;
    '5. marketOpen': string;
    '6. marketClose': string;
    '7. timezone': string;
    '8. currency': string;
    '9. matchScore': string;
  }>;
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

// Fetch stock quote (current price) using Alpha Vantage GLOBAL_QUOTE
export const fetchStockQuote = async (symbol: string): Promise<any | null> => {
  try {
    const cacheKey = `quote_${symbol}`;
    const cached = await getCachedData<any>(cacheKey);
    if (cached) return cached;

    console.log('🔄 Fetching real-time quote for:', symbol);
    const url = `${ALPHA_VANTAGE_BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('❌ Failed to fetch quote:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    
    // Check for API error messages
    if (data['Error Message']) {
      console.error('❌ API Error:', data['Error Message']);
      return null;
    }

    if (data['Note']) {
      console.error('⚠️ API Rate Limit:', data['Note']);
      return null;
    }

    const quote = data['Global Quote'];
    
    // Validate data
    if (!quote || !quote['05. price']) {
      console.error('❌ Invalid response format for:', symbol);
      return null;
    }

    const currentPrice = parseFloat(quote['05. price']);
    const previousClose = parseFloat(quote['08. previous close']);
    
    if (currentPrice <= 0) {
      console.error('❌ Invalid price data for:', symbol, '- Price:', currentPrice);
      return null;
    }

    const result = {
      c: currentPrice,
      pc: previousClose,
      h: parseFloat(quote['03. high']),
      l: parseFloat(quote['04. low']),
      o: parseFloat(quote['02. open']),
      t: Date.now() / 1000,
    };

    console.log('✅ Successfully fetched quote for:', symbol, '- Price: $' + currentPrice.toFixed(2));
    await setCachedData(cacheKey, result);
    return result;
  } catch (error) {
    console.error('❌ Error fetching stock quote for', symbol, ':', error);
    return null;
  }
};

// Fetch company profile (Alpha Vantage doesn't have a direct equivalent, so we'll return basic info)
export const fetchCompanyProfile = async (symbol: string): Promise<any | null> => {
  try {
    const cacheKey = `profile_${symbol}`;
    const cached = await getCachedData<any>(cacheKey);
    if (cached) return cached;

    console.log('🔄 Fetching company profile for:', symbol);
    const url = `${ALPHA_VANTAGE_BASE_URL}?function=OVERVIEW&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('❌ Failed to fetch profile:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    
    // Check for API error messages
    if (data['Error Message']) {
      console.error('❌ API Error:', data['Error Message']);
      return null;
    }

    if (data['Note']) {
      console.error('⚠️ API Rate Limit:', data['Note']);
      return null;
    }

    // Check if data is valid
    if (!data || !data.Name || Object.keys(data).length === 0) {
      console.error('❌ Invalid profile data for:', symbol);
      return null;
    }

    const result = {
      name: data.Name,
      ticker: data.Symbol,
      exchange: data.Exchange,
      finnhubIndustry: data.Sector,
    };

    console.log('✅ Successfully fetched profile for:', symbol);
    await setCachedData(cacheKey, result);
    return result;
  } catch (error) {
    console.error('❌ Error fetching company profile for', symbol, ':', error);
    return null;
  }
};

// Fetch historical candle data using TIME_SERIES_DAILY
export const fetchHistoricalData = async (
  symbol: string,
  resolution: 'D' | 'W' | 'M' = 'D',
  daysBack: number = 30
): Promise<any | null> => {
  try {
    const cacheKey = `candles_${symbol}_${resolution}_${daysBack}`;
    const cached = await getCachedData<any>(cacheKey);
    if (cached) return cached;

    console.log('🔄 Fetching historical data for:', symbol, `(${daysBack} days)`);
    const url = `${ALPHA_VANTAGE_BASE_URL}?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=compact&apikey=${ALPHA_VANTAGE_API_KEY}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('❌ Failed to fetch historical data:', response.status, response.statusText);
      return null;
    }

    const data: AlphaVantageTimeSeriesDaily = await response.json();
    
    // Check for API error messages
    if ((data as any)['Error Message']) {
      console.error('❌ API Error:', (data as any)['Error Message']);
      return null;
    }

    if ((data as any)['Note']) {
      console.error('⚠️ API Rate Limit:', (data as any)['Note']);
      return null;
    }

    const timeSeries = data['Time Series (Daily)'];
    
    // Check if data is valid
    if (!timeSeries || Object.keys(timeSeries).length === 0) {
      console.error('❌ Invalid historical data for:', symbol);
      return null;
    }

    // Convert to our format
    const dates = Object.keys(timeSeries).sort().slice(-daysBack);
    const closePrices: number[] = [];
    const highPrices: number[] = [];
    const lowPrices: number[] = [];
    const openPrices: number[] = [];
    const timestamps: number[] = [];

    dates.forEach(date => {
      const dayData = timeSeries[date];
      closePrices.push(parseFloat(dayData['4. close']));
      highPrices.push(parseFloat(dayData['2. high']));
      lowPrices.push(parseFloat(dayData['3. low']));
      openPrices.push(parseFloat(dayData['1. open']));
      timestamps.push(new Date(date).getTime() / 1000);
    });

    const result = {
      c: closePrices,
      h: highPrices,
      l: lowPrices,
      o: openPrices,
      t: timestamps,
      s: 'ok',
    };

    console.log('✅ Successfully fetched', closePrices.length, 'historical data points for:', symbol);
    await setCachedData(cacheKey, result);
    return result;
  } catch (error) {
    console.error('❌ Error fetching historical data for', symbol, ':', error);
    return null;
  }
};

// Search for stocks using SYMBOL_SEARCH
export const searchStocksAPI = async (query: string): Promise<Array<{ symbol: string; description: string; type: string }>> => {
  try {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const cacheKey = `search_${query.toLowerCase()}`;
    const cached = await getCachedData<Array<{ symbol: string; description: string; type: string }>>(cacheKey);
    if (cached) return cached;

    console.log('🔍 Searching stocks with query:', query);
    const url = `${ALPHA_VANTAGE_BASE_URL}?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(query)}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('❌ Failed to search stocks:', response.status, response.statusText);
      return [];
    }

    const data: AlphaVantageSearchResult = await response.json();
    
    // Check for API error messages
    if ((data as any)['Error Message']) {
      console.error('❌ API Error:', (data as any)['Error Message']);
      return [];
    }

    if ((data as any)['Note']) {
      console.error('⚠️ API Rate Limit:', (data as any)['Note']);
      return [];
    }

    const results = data.bestMatches || [];
    
    // Filter to only US stocks
    const usStocks = results
      .filter((item: any) => 
        item['4. region'] === 'United States' &&
        item['3. type'] === 'Equity'
      )
      .map((item: any) => ({
        symbol: item['1. symbol'],
        description: item['2. name'],
        type: item['3. type'],
      }))
      .slice(0, 10);

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
      `${ALPHA_VANTAGE_BASE_URL}?function=GLOBAL_QUOTE&symbol=AAPL&apikey=${ALPHA_VANTAGE_API_KEY}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      console.error('❌ API not available:', response.status, response.statusText);
      return false;
    }

    const data = await response.json();
    
    // Check for API error messages
    if (data['Error Message'] || data['Note']) {
      console.error('⚠️ API Error or Rate Limit:', data['Error Message'] || data['Note']);
      return false;
    }

    const quote = data['Global Quote'];
    const isValid = quote && quote['05. price'] && parseFloat(quote['05. price']) > 0;
    
    if (isValid) {
      console.log('✅ API is working correctly - AAPL price: $' + parseFloat(quote['05. price']).toFixed(2));
    } else {
      console.error('⚠️ API responded but returned invalid data:', data);
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
      suggestion: 'Real-time stock data is available from Alpha Vantage',
    };
  }
  
  return {
    isAvailable: false,
    message: 'Unable to fetch real stock data',
    suggestion: 'Please check your internet connection and API key. Alpha Vantage free tier has rate limits (5 API calls per minute, 500 per day).',
  };
};
