
import AsyncStorage from '@react-native-async-storage/async-storage';
import { allUSStocks } from '@/data/mockStockData';

const LAST_UPDATE_KEY = '@stock_last_update';
const STOCK_DATA_KEY = '@stock_data_cache';

export interface StockUpdateInfo {
  lastUpdate: string;
  needsUpdate: boolean;
}

// Check if stock data needs to be updated (once per day)
export const checkIfNeedsUpdate = async (): Promise<StockUpdateInfo> => {
  try {
    const lastUpdateStr = await AsyncStorage.getItem(LAST_UPDATE_KEY);
    
    if (!lastUpdateStr) {
      console.log('No previous update found, needs update');
      return { lastUpdate: '', needsUpdate: true };
    }
    
    const lastUpdate = new Date(lastUpdateStr);
    const now = new Date();
    
    // Check if it's a different day
    const lastUpdateDay = lastUpdate.toDateString();
    const currentDay = now.toDateString();
    
    const needsUpdate = lastUpdateDay !== currentDay;
    
    console.log('Last update:', lastUpdateDay, 'Current:', currentDay, 'Needs update:', needsUpdate);
    
    return {
      lastUpdate: lastUpdate.toISOString(),
      needsUpdate,
    };
  } catch (error) {
    console.error('Error checking update status:', error);
    return { lastUpdate: '', needsUpdate: true };
  }
};

// Mark that stock data has been updated
export const markAsUpdated = async (): Promise<void> => {
  try {
    const now = new Date().toISOString();
    await AsyncStorage.setItem(LAST_UPDATE_KEY, now);
    console.log('Marked stock data as updated at:', now);
  } catch (error) {
    console.error('Error marking as updated:', error);
  }
};

// Get the last update time as a formatted string
export const getLastUpdateTime = async (): Promise<string> => {
  try {
    const lastUpdateStr = await AsyncStorage.getItem(LAST_UPDATE_KEY);
    
    if (!lastUpdateStr) {
      return 'Never';
    }
    
    const lastUpdate = new Date(lastUpdateStr);
    const now = new Date();
    
    // Calculate time difference
    const diffMs = now.getTime() - lastUpdate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours < 1) {
      if (diffMinutes < 1) {
        return 'Just now';
      }
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }
  } catch (error) {
    console.error('Error getting last update time:', error);
    return 'Unknown';
  }
};

// Force a manual refresh of stock data
export const forceRefresh = async (): Promise<void> => {
  try {
    console.log('Forcing stock data refresh...');
    await markAsUpdated();
  } catch (error) {
    console.error('Error forcing refresh:', error);
  }
};

// Clear all cached data (for debugging)
export const clearCache = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(LAST_UPDATE_KEY);
    await AsyncStorage.removeItem(STOCK_DATA_KEY);
    console.log('Cache cleared');
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};

// Get a random variation factor for daily updates
const getDailyVariationSeed = (): number => {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  
  // Create a pseudo-random seed based on the date
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  // Normalize to 0-1 range
  return Math.abs(hash % 1000) / 1000;
};

// Get daily variation multiplier (changes each day)
export const getDailyVariation = (): number => {
  const seed = getDailyVariationSeed();
  // Returns a value between 0.98 and 1.02 (±2% daily variation)
  return 0.98 + (seed * 0.04);
};
