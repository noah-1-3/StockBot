
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { 
  ScrollView, 
  StyleSheet, 
  View, 
  Text, 
  Platform,
  TextInput,
  Pressable,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { checkIfNeedsUpdate, markAsUpdated, getLastUpdateTime, forceRefresh, isMarketHours } from '@/utils/stockUpdateService';
import { getWatchlist, searchStocks, initializeStocks, checkAPIStatus, mockStocks } from '@/data/mockStockData';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import StockCard from '@/components/StockCard';
import { Stack } from 'expo-router';

const HomeScreen = () => {
  const router = useRouter();
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [apiAvailable, setApiAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Check API status
      const isApiAvailable = await checkAPIStatus();
      setApiAvailable(isApiAvailable);
      
      // Initialize stocks
      await initializeStocks();
      
      // Check if we need to update
      await checkForUpdates();
      
      // Load watchlist
      const stocks = await getWatchlist();
      setWatchlist(stocks);
      
      // Get last update time
      const updateTime = await getLastUpdateTime();
      setLastUpdate(updateTime);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkForUpdates = async () => {
    const updateInfo = await checkIfNeedsUpdate();
    if (updateInfo.needsUpdate) {
      console.log('Stock data needs update, refreshing...');
      await markAsUpdated();
    }
  };

  const handleManualRefresh = async () => {
    try {
      setRefreshing(true);
      await forceRefresh();
      await loadData();
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSearchChange = async (text: string) => {
    setSearchQuery(text);
    
    if (text.trim().length === 0) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    
    if (text.trim().length < 1) {
      return;
    }
    
    try {
      setSearching(true);
      const results = await searchStocks(text);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching stocks:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleStockSelect = (symbol: string) => {
    setSearchQuery('');
    setSearchResults([]);
    Keyboard.dismiss();
    router.push(`/stock/${symbol}`);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    Keyboard.dismiss();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen options={{ title: 'StockBot' }} />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading stock data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'StockBot',
          headerLargeTitle: true,
        }} 
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* API Status Banner */}
        {apiAvailable === false && (
          <View style={styles.apiWarningBanner}>
            <IconSymbol name="exclamationmark.triangle.fill" size={20} color={colors.warning} />
            <View style={styles.apiWarningTextContainer}>
              <Text style={styles.apiWarningTitle}>Using Simulated Data</Text>
              <Text style={styles.apiWarningText}>
                Real-time data unavailable. Get a free API key from finnhub.io
              </Text>
            </View>
          </View>
        )}

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <IconSymbol name="magnifyingglass" size={20} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search stocks (e.g., AAPL, Tesla)"
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={handleSearchChange}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={handleClearSearch} style={styles.clearButton}>
                <IconSymbol name="xmark.circle.fill" size={20} color={colors.textSecondary} />
              </Pressable>
            )}
          </View>
          
          {searching && (
            <ActivityIndicator size="small" color={colors.primary} style={styles.searchLoader} />
          )}
        </View>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <View style={styles.searchResults}>
            <Text style={styles.searchResultsTitle}>Search Results</Text>
            {searchResults.map((result) => (
              <Pressable
                key={result.symbol}
                style={({ pressed }) => [
                  styles.searchResultItem,
                  pressed && styles.searchResultItemPressed,
                ]}
                onPress={() => handleStockSelect(result.symbol)}
              >
                <View style={styles.searchResultContent}>
                  <Text style={styles.searchResultSymbol}>{result.symbol}</Text>
                  <Text style={styles.searchResultName} numberOfLines={1}>
                    {result.name}
                  </Text>
                </View>
                <IconSymbol name="chevron.right" size={16} color={colors.textSecondary} />
              </Pressable>
            ))}
          </View>
        )}

        {/* Header */}
        {searchResults.length === 0 && (
          <>
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Watchlist</Text>
                <View style={styles.updateInfo}>
                  <IconSymbol 
                    name={isMarketHours() ? 'chart.line.uptrend.xyaxis' : 'moon.fill'} 
                    size={14} 
                    color={colors.textSecondary} 
                  />
                  <Text style={styles.updateText}>
                    {isMarketHours() ? 'Market Open' : 'Market Closed'} • Updated {lastUpdate}
                  </Text>
                </View>
              </View>
              <Pressable
                style={({ pressed }) => [
                  styles.refreshButton,
                  pressed && styles.refreshButtonPressed,
                  refreshing && styles.refreshButtonDisabled,
                ]}
                onPress={handleManualRefresh}
                disabled={refreshing}
              >
                {refreshing ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <IconSymbol name="arrow.clockwise" size={20} color={colors.primary} />
                )}
              </Pressable>
            </View>

            {/* Stock Cards */}
            <View style={styles.stockList}>
              {watchlist.map((stock) => {
                // Find the full stock data to get isRealData flag
                const fullStock = mockStocks.find(s => s.symbol === stock.symbol);
                return (
                  <StockCard
                    key={stock.symbol}
                    symbol={stock.symbol}
                    name={stock.name}
                    currentPrice={stock.currentPrice}
                    change={stock.change}
                    changePercent={stock.changePercent}
                    predictedChange={stock.predictedChange}
                    isRealData={fullStock?.isRealData}
                  />
                );
              })}
            </View>

            {/* Info Card */}
            <View style={styles.infoCard}>
              <IconSymbol name="lightbulb.fill" size={24} color={colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>AI-Powered Predictions</Text>
                <Text style={styles.infoText}>
                  Our advanced AI analyzes historical data and market trends to predict future stock movements.
                  {apiAvailable === false && ' Currently using simulated data for demonstration.'}
                </Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  apiWarningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '15',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.warning + '40',
    gap: 12,
  },
  apiWarningTextContainer: {
    flex: 1,
  },
  apiWarningTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.warning,
    marginBottom: 2,
  },
  apiWarningText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    padding: 0,
  },
  clearButton: {
    padding: 4,
  },
  searchLoader: {
    marginTop: 8,
  },
  searchResults: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchResultsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  searchResultItemPressed: {
    backgroundColor: colors.border,
  },
  searchResultContent: {
    flex: 1,
  },
  searchResultSymbol: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  searchResultName: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  updateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  updateText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  refreshButtonDisabled: {
    opacity: 0.5,
  },
  stockList: {
    marginBottom: 20,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.primary + '10',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.primary + '20',
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});

export default HomeScreen;
