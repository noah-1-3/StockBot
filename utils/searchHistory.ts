
import AsyncStorage from '@react-native-async-storage/async-storage';

const SEARCH_HISTORY_KEY = '@stockbot_search_history';
const MAX_HISTORY_ITEMS = 10;

export interface SearchHistoryItem {
  symbol: string;
  name: string;
  timestamp: number;
}

// Get search history from storage
export const getSearchHistory = async (): Promise<SearchHistoryItem[]> => {
  try {
    const historyJson = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
    if (historyJson) {
      const history = JSON.parse(historyJson);
      console.log('Retrieved search history:', history.length, 'items');
      return history;
    }
    return [];
  } catch (error) {
    console.error('Error getting search history:', error);
    return [];
  }
};

// Add a search to history
export const addToSearchHistory = async (symbol: string, name: string): Promise<void> => {
  try {
    const history = await getSearchHistory();
    
    // Remove duplicate if exists
    const filteredHistory = history.filter(item => item.symbol !== symbol);
    
    // Add new item at the beginning
    const newHistory: SearchHistoryItem[] = [
      {
        symbol,
        name,
        timestamp: Date.now(),
      },
      ...filteredHistory,
    ].slice(0, MAX_HISTORY_ITEMS); // Keep only the most recent items
    
    await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
    console.log('Added to search history:', symbol, '- Total items:', newHistory.length);
  } catch (error) {
    console.error('Error adding to search history:', error);
  }
};

// Clear all search history
export const clearSearchHistory = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
    console.log('Search history cleared');
  } catch (error) {
    console.error('Error clearing search history:', error);
  }
};

// Remove a specific item from history
export const removeFromSearchHistory = async (symbol: string): Promise<void> => {
  try {
    const history = await getSearchHistory();
    const filteredHistory = history.filter(item => item.symbol !== symbol);
    await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(filteredHistory));
    console.log('Removed from search history:', symbol);
  } catch (error) {
    console.error('Error removing from search history:', error);
  }
};
