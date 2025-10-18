
import React, { useState, useEffect } from 'react';
import { Stack } from 'expo-router';
import { 
  ScrollView, 
  StyleSheet, 
  View, 
  Text, 
  Platform,
  TextInput,
  Pressable,
  FlatList,
  Keyboard,
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import StockCard from '@/components/StockCard';
import { getWatchlist, searchStocks } from '@/data/mockStockData';
import { useRouter } from 'expo-router';
import { getSearchHistory, addToSearchHistory, clearSearchHistory, SearchHistoryItem } from '@/utils/searchHistory';

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ symbol: string; name: string; sector: string }>>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const router = useRouter();
  const watchlist = getWatchlist();

  // Load search history on mount
  useEffect(() => {
    loadSearchHistory();
  }, []);

  const loadSearchHistory = async () => {
    const history = await getSearchHistory();
    setSearchHistory(history);
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    if (text.trim().length > 0) {
      const results = searchStocks(text, 8);
      setSearchResults(results);
      console.log('Search results:', results.length);
    } else {
      setSearchResults([]);
    }
  };

  const handleStockSelect = async (symbol: string, name: string) => {
    console.log('Stock selected:', symbol);
    
    // Add to search history
    await addToSearchHistory(symbol, name);
    await loadSearchHistory(); // Reload history to update UI
    
    setSearchQuery('');
    setSearchResults([]);
    setIsSearchFocused(false);
    Keyboard.dismiss();
    router.push(`/stock/${symbol}`);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleClearHistory = async () => {
    await clearSearchHistory();
    await loadSearchHistory();
  };

  const filteredWatchlist = watchlist.filter(stock => 
    stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const showSearchResults = isSearchFocused && searchQuery.trim().length > 0 && searchResults.length > 0;
  const showSearchHistory = isSearchFocused && searchQuery.trim().length === 0 && searchHistory.length > 0;

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: 'StockBot',
            headerLargeTitle: true,
          }}
        />
      )}
      <View style={styles.container}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={[
            styles.contentContainer,
            Platform.OS !== 'ios' && styles.contentContainerWithTabBar
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {Platform.OS !== 'ios' && (
            <View style={styles.header}>
              <Text style={styles.headerTitle}>StockBot</Text>
              <Text style={styles.headerSubtitle}>AI-Powered Stock Predictions</Text>
            </View>
          )}

          <View style={styles.welcomeCard}>
            <View style={styles.welcomeIconContainer}>
              <IconSymbol name="chart.bar.fill" size={32} color={colors.primary} />
            </View>
            <Text style={styles.welcomeTitle}>Welcome to StockBot</Text>
            <Text style={styles.welcomeText}>
              Get AI-powered predictions for your favorite stocks using advanced machine learning algorithms trained on historical market data.
            </Text>
          </View>

          <View style={styles.searchSection}>
            <View style={[styles.searchContainer, isSearchFocused && styles.searchContainerFocused]}>
              <IconSymbol name="magnifyingglass" size={20} color={colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search any US stock..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={handleSearchChange}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                autoCapitalize="characters"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={handleClearSearch}>
                  <IconSymbol name="xmark.circle.fill" size={20} color={colors.textSecondary} />
                </Pressable>
              )}
            </View>

            {showSearchResults && (
              <View style={styles.searchResultsContainer}>
                <Text style={styles.searchResultsHeader}>Search Results</Text>
                {searchResults.map((stock) => (
                  <Pressable
                    key={stock.symbol}
                    style={({ pressed }) => [
                      styles.searchResultItem,
                      pressed && styles.searchResultItemPressed,
                    ]}
                    onPress={() => handleStockSelect(stock.symbol, stock.name)}
                  >
                    <View style={styles.searchResultIconContainer}>
                      <IconSymbol name="chart.line.uptrend.xyaxis" size={20} color={colors.primary} />
                    </View>
                    <View style={styles.searchResultInfo}>
                      <Text style={styles.searchResultSymbol}>{stock.symbol}</Text>
                      <Text style={styles.searchResultName} numberOfLines={1}>{stock.name}</Text>
                    </View>
                    <View style={styles.searchResultSectorBadge}>
                      <Text style={styles.searchResultSector} numberOfLines={1}>{stock.sector}</Text>
                    </View>
                    <IconSymbol name="chevron.right" size={16} color={colors.textSecondary} />
                  </Pressable>
                ))}
              </View>
            )}

            {showSearchHistory && (
              <View style={styles.searchResultsContainer}>
                <View style={styles.historyHeader}>
                  <Text style={styles.searchResultsHeader}>Recent Searches</Text>
                  <Pressable onPress={handleClearHistory}>
                    <Text style={styles.clearHistoryText}>Clear</Text>
                  </Pressable>
                </View>
                {searchHistory.map((item) => (
                  <Pressable
                    key={item.symbol}
                    style={({ pressed }) => [
                      styles.searchResultItem,
                      pressed && styles.searchResultItemPressed,
                    ]}
                    onPress={() => handleStockSelect(item.symbol, item.name)}
                  >
                    <View style={styles.historyIconContainer}>
                      <IconSymbol name="clock.fill" size={18} color={colors.textSecondary} />
                    </View>
                    <View style={styles.searchResultInfo}>
                      <Text style={styles.searchResultSymbol}>{item.symbol}</Text>
                      <Text style={styles.searchResultName} numberOfLines={1}>{item.name}</Text>
                    </View>
                    <IconSymbol name="chevron.right" size={16} color={colors.textSecondary} />
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Top Predictions</Text>
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>Live</Text>
              </View>
            </View>

            {filteredWatchlist.length > 0 ? (
              filteredWatchlist.map((stock) => (
                <StockCard
                  key={stock.symbol}
                  symbol={stock.symbol}
                  name={stock.name}
                  currentPrice={stock.currentPrice}
                  change={stock.change}
                  changePercent={stock.changePercent}
                  predictedChange={stock.predictedChange}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <IconSymbol name="magnifyingglass" size={48} color={colors.textSecondary} />
                <Text style={styles.emptyStateText}>No stocks found</Text>
                <Text style={styles.emptyStateSubtext}>Try a different search term</Text>
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Predictions are based on historical data and AI analysis. Not financial advice.
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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  contentContainerWithTabBar: {
    paddingBottom: 100,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  welcomeCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  welcomeIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  searchSection: {
    marginBottom: 24,
    position: 'relative',
    zIndex: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.06)',
    elevation: 1,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  searchContainerFocused: {
    borderColor: colors.primary,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.12)',
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    padding: 0,
  },
  searchResultsContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginTop: 8,
    boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.12)',
    elevation: 4,
    overflow: 'hidden',
  },
  searchResultsHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  clearHistoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  searchResultItemPressed: {
    backgroundColor: colors.primary + '10',
  },
  searchResultIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.textSecondary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultSymbol: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  searchResultName: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  searchResultSectorBadge: {
    backgroundColor: colors.highlight + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    maxWidth: 100,
  },
  searchResultSector: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.highlight,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  liveText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accent,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  footer: {
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  footerText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
