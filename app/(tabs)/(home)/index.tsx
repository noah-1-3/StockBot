
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
import { getWatchlist, searchStocks, initializeStocks } from '@/data/mockStockData';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import StockCard from '@/components/StockCard';
import { Stack } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [lastUpdate, setLastUpdate] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkForUpdates();
  }, []);

  const checkForUpdates = async () => {
    try {
      setIsLoading(true);
      console.log('Checking for stock updates...');
      
      // Initialize stocks with real data
      await initializeStocks();
      
      const updateInfo = await checkIfNeedsUpdate();
      console.log('Update info:', updateInfo);
      
      if (updateInfo.needsUpdate) {
        console.log('Stock data needs update, marking as updated');
        await markAsUpdated();
      }
      
      const lastUpdateTime = await getLastUpdateTime();
      setLastUpdate(lastUpdateTime);
      console.log('Last update time:', lastUpdateTime);
      
      // Load watchlist
      const list = await getWatchlist();
      setWatchlist(list);
      console.log('Loaded watchlist with', list.length, 'stocks');
    } catch (error) {
      console.error('Error checking for updates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualRefresh = async () => {
    try {
      setIsRefreshing(true);
      console.log('Manual refresh triggered');
      await forceRefresh();
      await checkForUpdates();
    } catch (error) {
      console.error('Error during manual refresh:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSearchChange = async (text: string) => {
    setSearchQuery(text);
    
    if (text.trim().length === 0) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    
    setIsSearching(true);
    
    try {
      const results = await searchStocks(text, 10);
      console.log('Search results:', results);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching stocks:', error);
      setSearchResults([]);
    }
  };

  const handleStockSelect = (symbol: string) => {
    console.log('Stock selected:', symbol);
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
    Keyboard.dismiss();
    router.push(`/stock/${symbol}`);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
    Keyboard.dismiss();
  };

  const marketStatus = isMarketHours() ? 'Market Open' : 'Market Closed';
  const marketStatusColor = isMarketHours() ? colors.success : colors.textSecondary;

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'StockBot',
          headerShown: true,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />
      <View style={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <IconSymbol name="magnifyingglass" size={20} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search stocks..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={handleSearchChange}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={handleClearSearch}>
                <IconSymbol name="xmark.circle.fill" size={20} color={colors.textSecondary} />
              </Pressable>
            )}
          </View>
        </View>

        {/* Search Results Overlay */}
        {isSearching && searchResults.length > 0 && (
          <View style={styles.searchResultsContainer}>
            <ScrollView style={styles.searchResults} keyboardShouldPersistTaps="handled">
              {searchResults.map((result) => (
                <Pressable
                  key={result.symbol}
                  style={styles.searchResultItem}
                  onPress={() => handleStockSelect(result.symbol)}
                >
                  <View>
                    <Text style={styles.searchResultSymbol}>{result.symbol}</Text>
                    <Text style={styles.searchResultName}>{result.name}</Text>
                  </View>
                  <IconSymbol name="chevron.right" size={16} color={colors.textSecondary} />
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Main Content */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.title}>Stock Predictions</Text>
                <Text style={styles.subtitle}>AI-powered market insights</Text>
              </View>
              <Pressable 
                style={styles.refreshButton}
                onPress={handleManualRefresh}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <IconSymbol name="arrow.clockwise" size={24} color={colors.primary} />
                )}
              </Pressable>
            </View>
            
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <IconSymbol name="clock" size={16} color={colors.textSecondary} />
                <Text style={styles.infoText}>Updated {lastUpdate}</Text>
              </View>
              <View style={styles.infoItem}>
                <View style={[styles.statusDot, { backgroundColor: marketStatusColor }]} />
                <Text style={[styles.infoText, { color: marketStatusColor }]}>{marketStatus}</Text>
              </View>
            </View>

            <View style={styles.dataSourceBanner}>
              <IconSymbol name="checkmark.circle.fill" size={16} color={colors.success} />
              <Text style={styles.dataSourceText}>
                Real-time data from Finnhub API
              </Text>
            </View>
          </View>

          {/* Loading State */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Loading real-time stock data...</Text>
            </View>
          )}

          {/* Watchlist */}
          {!isLoading && watchlist.length > 0 && (
            <View style={styles.watchlistSection}>
              <Text style={styles.sectionTitle}>Your Watchlist</Text>
              {watchlist.map((stock) => (
                <StockCard
                  key={stock.symbol}
                  symbol={stock.symbol}
                  name={stock.name}
                  currentPrice={stock.currentPrice}
                  change={stock.change}
                  changePercent={stock.changePercent}
                  predictedChange={stock.predictedChange}
                />
              ))}
            </View>
          )}

          {/* Info Section */}
          <View style={styles.infoSection}>
            <Text style={styles.infoSectionTitle}>About Real-Time Data</Text>
            <Text style={styles.infoSectionText}>
              StockBot now uses real-time stock market data from Finnhub API, providing accurate and up-to-date pricing information for all major US stocks.
            </Text>
            <Text style={styles.infoSectionText}>
              • Live stock prices updated every minute{'\n'}
              • Historical data for the past 30 days{'\n'}
              • AI-powered predictions based on real market trends{'\n'}
              • Market hours awareness (9:30 AM - 4:00 PM ET)
            </Text>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    padding: 0,
  },
  searchResultsContainer: {
    position: 'absolute',
    top: 80,
    left: 20,
    right: 20,
    maxHeight: 300,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    zIndex: 1000,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  searchResults: {
    maxHeight: 300,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchResultSymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  searchResultName: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    padding: 20,
    gap: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    gap: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dataSourceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.successBackground,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  dataSourceText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.success,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  watchlistSection: {
    paddingHorizontal: 20,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  infoSection: {
    margin: 20,
    padding: 20,
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    gap: 12,
  },
  infoSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  infoSectionText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
