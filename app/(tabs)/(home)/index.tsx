
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import React, { useState, useEffect } from 'react';
import { getWatchlist, searchStocks } from '@/data/mockStockData';
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
import { useRouter } from 'expo-router';
import StockCard from '@/components/StockCard';
import { Stack } from 'expo-router';
import { checkIfNeedsUpdate, markAsUpdated, getLastUpdateTime, forceRefresh } from '@/utils/stockUpdateService';

export default function HomeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ symbol: string; name: string; sector: string }>>([]);
  const [watchlist, setWatchlist] = useState(getWatchlist());
  const [lastUpdate, setLastUpdate] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Check for updates on mount
  useEffect(() => {
    checkForUpdates();
  }, []);

  const checkForUpdates = async () => {
    console.log('Checking for stock data updates...');
    const updateInfo = await checkIfNeedsUpdate();
    
    if (updateInfo.needsUpdate) {
      console.log('Stock data needs update, refreshing...');
      await markAsUpdated();
      // Reload watchlist with new data
      setWatchlist(getWatchlist());
    }
    
    const lastUpdateStr = await getLastUpdateTime();
    setLastUpdate(lastUpdateStr);
    console.log('Last update:', lastUpdateStr);
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    console.log('Manual refresh triggered');
    
    await forceRefresh();
    
    // Reload the page to get fresh data
    setWatchlist(getWatchlist());
    
    const lastUpdateStr = await getLastUpdateTime();
    setLastUpdate(lastUpdateStr);
    
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    
    if (text.trim().length > 0) {
      const results = searchStocks(text);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleStockSelect = (symbol: string) => {
    console.log('Selected stock:', symbol);
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
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Stock Predictions</Text>
          <Text style={styles.subtitle}>AI-powered market insights</Text>
          
          <View style={styles.updateContainer}>
            <View style={styles.updateInfo}>
              <IconSymbol name="clock" size={14} color={colors.textSecondary} style={styles.clockIcon} />
              <Text style={styles.updateText}>Updated {lastUpdate}</Text>
            </View>
            <Pressable 
              onPress={handleManualRefresh}
              style={styles.refreshButton}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <IconSymbol name="arrow.clockwise" size={18} color={colors.primary} />
              )}
            </Pressable>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <IconSymbol name="magnifyingglass" size={20} color={colors.textSecondary} style={styles.searchIcon} />
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

          {searchResults.length > 0 && (
            <View style={styles.searchResults}>
              {searchResults.map((result) => (
                <Pressable
                  key={result.symbol}
                  style={styles.searchResultItem}
                  onPress={() => handleStockSelect(result.symbol)}
                >
                  <View style={styles.searchResultLeft}>
                    <Text style={styles.searchResultSymbol}>{result.symbol}</Text>
                    <Text style={styles.searchResultName} numberOfLines={1}>
                      {result.name}
                    </Text>
                  </View>
                  <View style={styles.searchResultRight}>
                    <Text style={styles.searchResultSector}>{result.sector}</Text>
                    <IconSymbol name="chevron.right" size={16} color={colors.textSecondary} />
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <View style={styles.watchlistSection}>
          <Text style={styles.sectionTitle}>Trending Stocks</Text>
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

        <View style={styles.infoBox}>
          <IconSymbol name="info.circle" size={20} color={colors.primary} style={styles.infoIcon} />
          <Text style={styles.infoText}>
            Stock data updates automatically every day. Tap the refresh button to manually update.
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  updateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  updateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clockIcon: {
    marginRight: 6,
  },
  updateText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.cardBackground,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: 8,
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
  searchResults: {
    marginTop: 8,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchResultLeft: {
    flex: 1,
    marginRight: 12,
  },
  searchResultSymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  searchResultName: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  searchResultRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchResultSector: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  watchlistSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
