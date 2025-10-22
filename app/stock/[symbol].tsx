
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { LineChart } from 'react-native-chart-kit';
import React, { useState, useEffect } from 'react';
import { getStockBySymbol, generateDynamicPrediction, getCompanyDescription } from '@/data/mockStockData';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable,
  Dimensions,
  Platform,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';

const StockDetailScreen = () => {
  const router = useRouter();
  const { symbol } = useLocalSearchParams<{ symbol: string }>();
  const [stock, setStock] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (symbol) {
      loadStockData();
    }
  }, [symbol]);

  const loadStockData = async () => {
    try {
      setLoading(true);
      const stockData = await getStockBySymbol(symbol);
      if (stockData) {
        setStock(stockData);
      }
    } catch (error) {
      console.error('Error loading stock data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePrediction = async () => {
    if (!stock) return;

    try {
      setGenerating(true);
      const today = new Date();
      const daysAhead = Math.ceil((selectedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysAhead <= 0) {
        alert('Please select a future date');
        return;
      }

      const updatedStock = generateDynamicPrediction(stock, daysAhead);
      setStock(updatedStock);
      setShowDatePicker(false);
    } catch (error) {
      console.error('Error generating prediction:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (date) {
      setSelectedDate(date);
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen options={{ title: symbol }} />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading stock details...</Text>
      </View>
    );
  }

  if (!stock) {
    return (
      <View style={styles.errorContainer}>
        <Stack.Screen options={{ title: 'Error' }} />
        <IconSymbol name="exclamationmark.triangle" size={48} color={colors.error} />
        <Text style={styles.errorText}>Stock not found</Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const isPositive = stock.change >= 0;
  const isPredictedPositive = stock.predictedChange >= 0;
  const screenWidth = Dimensions.get('window').width;

  // Combine historical and prediction data for chart
  const chartData = [
    ...stock.historicalData.map((d: any) => d.price),
    ...stock.predictionData.map((d: any) => d.price),
  ];

  const chartLabels = [
    ...stock.historicalData.map((d: any) => d.date.split('-')[2]),
    ...stock.predictionData.map((d: any) => d.date.split('-')[2]),
  ];

  const companyDescription = getCompanyDescription(symbol);

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: symbol,
          headerBackTitle: 'Back',
        }} 
      />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.titleContainer}>
              <Text style={styles.symbol}>{stock.symbol}</Text>
              {!stock.isRealData && (
                <View style={styles.simulatedBadge}>
                  <Text style={styles.simulatedText}>SIMULATED</Text>
                </View>
              )}
            </View>
            <Text style={styles.name}>{stock.name}</Text>
          </View>
          
          <View style={styles.priceContainer}>
            <Text style={styles.price}>${stock.currentPrice.toFixed(2)}</Text>
            <View style={[styles.changeContainer, isPositive ? styles.positive : styles.negative]}>
              <IconSymbol
                name={isPositive ? 'arrow.up' : 'arrow.down'}
                size={16}
                color={isPositive ? colors.success : colors.error}
              />
              <Text style={[styles.change, isPositive ? styles.positiveText : styles.negativeText]}>
                ${Math.abs(stock.change).toFixed(2)} ({Math.abs(stock.changePercent).toFixed(2)}%)
              </Text>
            </View>
          </View>
        </View>

        {/* Data Source Info */}
        {stock.isRealData ? (
          <View style={styles.dataSourceCard}>
            <IconSymbol name="checkmark.circle.fill" size={20} color={colors.success} />
            <Text style={styles.dataSourceText}>Real-time market data</Text>
          </View>
        ) : (
          <View style={[styles.dataSourceCard, styles.dataSourceWarning]}>
            <IconSymbol name="exclamationmark.triangle.fill" size={20} color={colors.warning} />
            <View style={styles.dataSourceTextContainer}>
              <Text style={styles.dataSourceText}>Simulated data for demonstration</Text>
              <Text style={styles.dataSourceSubtext}>
                Get a free API key from finnhub.io for real-time data
              </Text>
            </View>
          </View>
        )}

        {/* Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.sectionTitle}>Price History & Prediction</Text>
          <LineChart
            data={{
              labels: chartLabels.filter((_, i) => i % 5 === 0),
              datasets: [{
                data: chartData,
              }],
            }}
            width={screenWidth - 32}
            height={220}
            chartConfig={{
              backgroundColor: colors.cardBackground,
              backgroundGradientFrom: colors.cardBackground,
              backgroundGradientTo: colors.cardBackground,
              decimalPlaces: 2,
              color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
              labelColor: (opacity = 1) => colors.textSecondary,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '0',
              },
              propsForBackgroundLines: {
                strokeDasharray: '',
                stroke: colors.border,
                strokeWidth: 1,
              },
            }}
            bezier
            style={styles.chart}
            withInnerLines={true}
            withOuterLines={true}
            withVerticalLines={false}
            withHorizontalLines={true}
            withVerticalLabels={true}
            withHorizontalLabels={true}
          />
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
              <Text style={styles.legendText}>Historical Data</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.primary, opacity: 0.5 }]} />
              <Text style={styles.legendText}>AI Prediction</Text>
            </View>
          </View>
        </View>

        {/* Prediction Card */}
        <View style={styles.predictionCard}>
          <View style={styles.predictionHeader}>
            <IconSymbol name="brain" size={24} color={colors.primary} />
            <Text style={styles.sectionTitle}>AI Prediction</Text>
          </View>
          
          <View style={styles.predictionContent}>
            <View style={styles.predictionRow}>
              <Text style={styles.predictionLabel}>Predicted Price (7 days)</Text>
              <Text style={styles.predictionValue}>${stock.predictedPrice.toFixed(2)}</Text>
            </View>
            
            <View style={styles.predictionRow}>
              <Text style={styles.predictionLabel}>Expected Change</Text>
              <View style={[styles.predictionBadge, isPredictedPositive ? styles.predictionPositive : styles.predictionNegative]}>
                <IconSymbol
                  name={isPredictedPositive ? 'arrow.up.right' : 'arrow.down.right'}
                  size={14}
                  color={isPredictedPositive ? colors.success : colors.error}
                />
                <Text style={[styles.predictionBadgeText, isPredictedPositive ? styles.positiveText : styles.negativeText]}>
                  {isPredictedPositive ? '+' : ''}{stock.predictedChange.toFixed(2)}%
                </Text>
              </View>
            </View>
            
            <View style={styles.predictionRow}>
              <Text style={styles.predictionLabel}>Confidence</Text>
              <View style={styles.confidenceContainer}>
                <View style={styles.confidenceBar}>
                  <View style={[styles.confidenceFill, { width: `${stock.confidence}%` }]} />
                </View>
                <Text style={styles.confidenceText}>{stock.confidence}%</Text>
              </View>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.customPredictionButton,
              pressed && styles.customPredictionButtonPressed,
            ]}
            onPress={() => setShowDatePicker(true)}
          >
            <IconSymbol name="calendar" size={18} color={colors.primary} />
            <Text style={styles.customPredictionButtonText}>Custom Date Prediction</Text>
          </Pressable>
        </View>

        {/* Company Info */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>About {stock.name}</Text>
          <Text style={styles.infoText}>{companyDescription}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsCard}>
          <Text style={styles.sectionTitle}>Key Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Open</Text>
              <Text style={styles.statValue}>${stock.previousClose.toFixed(2)}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Current</Text>
              <Text style={styles.statValue}>${stock.currentPrice.toFixed(2)}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Day Change</Text>
              <Text style={[styles.statValue, isPositive ? styles.positiveText : styles.negativeText]}>
                {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>7-Day Forecast</Text>
              <Text style={[styles.statValue, isPredictedPositive ? styles.positiveText : styles.negativeText]}>
                {isPredictedPositive ? '+' : ''}{stock.predictedChangePercent.toFixed(2)}%
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Prediction Date</Text>
              <Pressable onPress={() => setShowDatePicker(false)}>
                <IconSymbol name="xmark.circle.fill" size={24} color={colors.textSecondary} />
              </Pressable>
            </View>
            
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              minimumDate={new Date()}
              maximumDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)}
              textColor={colors.text}
            />
            
            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleGeneratePrediction}
                disabled={generating}
              >
                {generating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalButtonTextConfirm}>Generate Prediction</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 20,
    gap: 16,
  },
  errorText: {
    fontSize: 18,
    color: colors.text,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 16,
  },
  headerTop: {
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  symbol: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
  },
  simulatedBadge: {
    backgroundColor: colors.warning + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  simulatedText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.warning,
  },
  name: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
  },
  price: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.text,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  positive: {
    backgroundColor: colors.success + '15',
  },
  negative: {
    backgroundColor: colors.error + '15',
  },
  change: {
    fontSize: 15,
    fontWeight: '600',
  },
  positiveText: {
    color: colors.success,
  },
  negativeText: {
    color: colors.error,
  },
  dataSourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success + '10',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.success + '30',
  },
  dataSourceWarning: {
    backgroundColor: colors.warning + '10',
    borderColor: colors.warning + '30',
  },
  dataSourceTextContainer: {
    flex: 1,
  },
  dataSourceText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  dataSourceSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  chartContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  predictionCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  predictionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  predictionContent: {
    gap: 16,
    marginBottom: 16,
  },
  predictionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  predictionLabel: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  predictionValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  predictionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  predictionPositive: {
    backgroundColor: colors.success + '10',
    borderColor: colors.success + '40',
  },
  predictionNegative: {
    backgroundColor: colors.error + '10',
    borderColor: colors.error + '40',
  },
  predictionBadgeText: {
    fontSize: 15,
    fontWeight: '700',
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  confidenceBar: {
    width: 100,
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  confidenceText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  customPredictionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary + '15',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  customPredictionButtonPressed: {
    opacity: 0.7,
  },
  customPredictionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
  infoCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoText: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  statsCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 10,
  },
  statLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.cardBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: colors.border,
  },
  modalButtonConfirm: {
    backgroundColor: colors.primary,
  },
  modalButtonTextCancel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  modalButtonTextConfirm: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default StockDetailScreen;
