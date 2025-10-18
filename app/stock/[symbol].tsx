
import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { LineChart } from 'react-native-chart-kit';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { getStockBySymbol, generateDynamicPrediction } from '@/data/mockStockData';

const screenWidth = Dimensions.get('window').width;

export default function StockDetailScreen() {
  const { symbol: routeSymbol } = useLocalSearchParams<{ symbol: string }>();
  const router = useRouter();
  
  const [customSymbol, setCustomSymbol] = useState(routeSymbol || '');
  const [predictionDate, setPredictionDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [stock, setStock] = useState(getStockBySymbol(routeSymbol || ''));
  const [isCustomPrediction, setIsCustomPrediction] = useState(false);

  useEffect(() => {
    if (customSymbol && customSymbol !== routeSymbol) {
      const foundStock = getStockBySymbol(customSymbol.toUpperCase());
      setStock(foundStock);
      setIsCustomPrediction(false);
    }
  }, [customSymbol, routeSymbol]);

  const handleGeneratePrediction = () => {
    console.log('Generating prediction for:', customSymbol, 'Date:', predictionDate);
    const baseStock = getStockBySymbol(customSymbol.toUpperCase()) || getStockBySymbol('AAPL');
    if (baseStock) {
      const daysAhead = Math.ceil((predictionDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      const customStock = generateDynamicPrediction(baseStock, daysAhead);
      setStock(customStock);
      setIsCustomPrediction(true);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setPredictionDate(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const minDate = new Date();
  const maxDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

  if (!stock) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Stock Prediction',
            headerBackTitle: 'Back',
          }}
        />
        <View style={styles.container}>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.inputCard}>
              <Text style={styles.inputCardTitle}>Predict Any Stock</Text>
              <Text style={styles.inputCardSubtitle}>
                Enter a stock symbol to generate AI-powered predictions
              </Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Stock Symbol</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., AAPL, GOOGL, MSFT"
                  placeholderTextColor={colors.textSecondary}
                  value={customSymbol}
                  onChangeText={setCustomSymbol}
                  autoCapitalize="characters"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Prediction Date</Text>
                <Pressable 
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <IconSymbol name="calendar" size={20} color={colors.primary} />
                  <Text style={styles.dateButtonText}>{formatDate(predictionDate)}</Text>
                  <IconSymbol name="chevron.down" size={16} color={colors.textSecondary} />
                </Pressable>
              </View>

              <Pressable 
                style={[styles.predictButton, !customSymbol && styles.predictButtonDisabled]}
                onPress={handleGeneratePrediction}
                disabled={!customSymbol}
              >
                <IconSymbol name="sparkles" size={20} color={colors.card} />
                <Text style={styles.predictButtonText}>Generate Prediction</Text>
              </Pressable>
            </View>

            <View style={styles.errorContainer}>
              <IconSymbol name="chart.line.uptrend.xyaxis" size={64} color={colors.textSecondary} />
              <Text style={styles.errorText}>No stock data available</Text>
              <Text style={styles.errorSubtext}>
                Enter a stock symbol above to get started
              </Text>
            </View>

            <View style={styles.availableStocksCard}>
              <Text style={styles.availableStocksTitle}>Available Stocks</Text>
              <View style={styles.stockChips}>
                {['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'NVDA'].map((sym) => (
                  <Pressable
                    key={sym}
                    style={styles.stockChip}
                    onPress={() => setCustomSymbol(sym)}
                  >
                    <Text style={styles.stockChipText}>{sym}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </ScrollView>

          {showDatePicker && (
            <Modal
              transparent={true}
              animationType="slide"
              visible={showDatePicker}
              onRequestClose={() => setShowDatePicker(false)}
            >
              <Pressable 
                style={styles.modalOverlay}
                onPress={() => setShowDatePicker(false)}
              >
                <View style={styles.datePickerContainer}>
                  <View style={styles.datePickerHeader}>
                    <Text style={styles.datePickerTitle}>Select Prediction Date</Text>
                    <Pressable onPress={() => setShowDatePicker(false)}>
                      <Text style={styles.datePickerDone}>Done</Text>
                    </Pressable>
                  </View>
                  <DateTimePicker
                    value={predictionDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                    minimumDate={minDate}
                    maximumDate={maxDate}
                    textColor={colors.text}
                  />
                </View>
              </Pressable>
            </Modal>
          )}
        </View>
      </>
    );
  }

  const isPositive = stock.change >= 0;
  const isPredictionPositive = stock.predictedChange >= 0;

  const allData = [...stock.historicalData, ...stock.predictionData];
  const chartData = {
    labels: allData
      .filter((_, index) => index % Math.max(1, Math.floor(allData.length / 6)) === 0)
      .map(d => {
        const date = new Date(d.date);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      }),
    datasets: [
      {
        data: allData.map(d => d.price),
        color: (opacity = 1) => colors.primary,
        strokeWidth: 2,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: colors.card,
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
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
  };

  const daysAhead = Math.ceil((predictionDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <>
      <Stack.Screen
        options={{
          title: stock.symbol,
          headerBackTitle: 'Back',
        }}
      />
      <View style={styles.container}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.inputCard}>
            <Text style={styles.inputCardTitle}>Custom Prediction</Text>
            
            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Stock Symbol</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., AAPL"
                  placeholderTextColor={colors.textSecondary}
                  value={customSymbol}
                  onChangeText={setCustomSymbol}
                  autoCapitalize="characters"
                  autoCorrect={false}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Prediction Date</Text>
                <Pressable 
                  style={styles.dateButtonCompact}
                  onPress={() => setShowDatePicker(true)}
                >
                  <IconSymbol name="calendar" size={16} color={colors.primary} />
                  <Text style={styles.dateButtonTextCompact}>
                    {predictionDate.getMonth() + 1}/{predictionDate.getDate()}
                  </Text>
                </Pressable>
              </View>
            </View>

            <Pressable 
              style={[styles.predictButton, !customSymbol && styles.predictButtonDisabled]}
              onPress={handleGeneratePrediction}
              disabled={!customSymbol}
            >
              <IconSymbol name="sparkles" size={20} color={colors.card} />
              <Text style={styles.predictButtonText}>Generate Prediction</Text>
            </Pressable>

            {isCustomPrediction && (
              <View style={styles.customBadge}>
                <IconSymbol name="wand.and.stars" size={14} color={colors.highlight} />
                <Text style={styles.customBadgeText}>
                  Custom prediction for {daysAhead} days ahead
                </Text>
              </View>
            )}
          </View>

          <View style={styles.headerCard}>
            <View style={styles.stockHeader}>
              <View>
                <Text style={styles.symbol}>{stock.symbol}</Text>
                <Text style={styles.name}>{stock.name}</Text>
              </View>
              <View style={styles.priceContainer}>
                <Text style={styles.price}>${stock.currentPrice.toFixed(2)}</Text>
                <View style={[styles.changeBadge, { backgroundColor: isPositive ? colors.accent + '20' : colors.error + '20' }]}>
                  <Text style={[styles.change, { color: isPositive ? colors.accent : colors.error }]}>
                    {isPositive ? '+' : ''}{stock.change.toFixed(2)} ({isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Price History & Prediction</Text>
              <View style={styles.chartLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
                  <Text style={styles.legendText}>Historical</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.highlight }]} />
                  <Text style={styles.legendText}>Predicted</Text>
                </View>
              </View>
            </View>
            <LineChart
              data={chartData}
              width={screenWidth - 48}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withInnerLines={true}
              withOuterLines={true}
              withVerticalLines={false}
              withHorizontalLines={true}
              withDots={false}
              withShadow={false}
            />
            <Text style={styles.chartNote}>
              Last 30 days + {daysAhead} day prediction
            </Text>
          </View>

          <View style={styles.predictionCard}>
            <View style={styles.predictionHeader}>
              <IconSymbol name="sparkles" size={24} color={colors.highlight} />
              <Text style={styles.predictionTitle}>AI Prediction</Text>
            </View>
            
            <View style={styles.predictionStats}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Predicted Price ({daysAhead}d)</Text>
                <Text style={styles.statValue}>${stock.predictedPrice.toFixed(2)}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Expected Change</Text>
                <Text style={[styles.statValue, { color: isPredictionPositive ? colors.accent : colors.error }]}>
                  {isPredictionPositive ? '+' : ''}{stock.predictedChange.toFixed(2)} ({isPredictionPositive ? '+' : ''}{stock.predictedChangePercent.toFixed(2)}%)
                </Text>
              </View>
            </View>

            <View style={styles.confidenceContainer}>
              <View style={styles.confidenceHeader}>
                <Text style={styles.confidenceLabel}>Confidence Score</Text>
                <Text style={styles.confidenceValue}>{stock.confidence}%</Text>
              </View>
              <View style={styles.confidenceBar}>
                <View 
                  style={[
                    styles.confidenceFill, 
                    { 
                      width: `${stock.confidence}%`,
                      backgroundColor: stock.confidence >= 80 ? colors.accent : stock.confidence >= 60 ? colors.highlight : colors.secondary,
                    }
                  ]} 
                />
              </View>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <IconSymbol name="info.circle" size={20} color={colors.primary} />
              <Text style={styles.infoTitle}>How It Works</Text>
            </View>
            <Text style={styles.infoText}>
              Our AI model analyzes historical price patterns, trading volumes, market trends, and technical indicators to predict future stock movements. The confidence score indicates the model&apos;s certainty in its prediction.
            </Text>
            <View style={styles.warningBox}>
              <IconSymbol name="exclamationmark.triangle.fill" size={16} color={colors.highlight} />
              <Text style={styles.warningText}>
                This is not financial advice. Always do your own research before investing.
              </Text>
            </View>
          </View>

          <View style={styles.metricsCard}>
            <Text style={styles.metricsTitle}>Key Metrics</Text>
            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Current Price</Text>
                <Text style={styles.metricValue}>${stock.currentPrice.toFixed(2)}</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Previous Close</Text>
                <Text style={styles.metricValue}>${stock.previousClose.toFixed(2)}</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Day Change</Text>
                <Text style={[styles.metricValue, { color: isPositive ? colors.accent : colors.error }]}>
                  {isPositive ? '+' : ''}{stock.change.toFixed(2)}
                </Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Day Change %</Text>
                <Text style={[styles.metricValue, { color: isPositive ? colors.accent : colors.error }]}>
                  {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {showDatePicker && (
          <Modal
            transparent={true}
            animationType="slide"
            visible={showDatePicker}
            onRequestClose={() => setShowDatePicker(false)}
          >
            <Pressable 
              style={styles.modalOverlay}
              onPress={() => setShowDatePicker(false)}
            >
              <View style={styles.datePickerContainer}>
                <View style={styles.datePickerHeader}>
                  <Text style={styles.datePickerTitle}>Select Prediction Date</Text>
                  <Pressable onPress={() => setShowDatePicker(false)}>
                    <Text style={styles.datePickerDone}>Done</Text>
                  </Pressable>
                </View>
                <DateTimePicker
                  value={predictionDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                  minimumDate={minDate}
                  maximumDate={maxDate}
                  textColor={colors.text}
                />
              </View>
            </Pressable>
          </Modal>
        )}
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
    padding: 16,
    paddingBottom: 32,
  },
  inputCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  inputCardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  inputCardSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateButtonCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateButtonText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  dateButtonTextCompact: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  predictButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  predictButtonDisabled: {
    backgroundColor: colors.secondary,
    opacity: 0.5,
  },
  predictButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.card,
  },
  customBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.highlight + '20',
    borderRadius: 8,
  },
  customBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  headerCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  stockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  symbol: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  changeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  change: {
    fontSize: 14,
    fontWeight: '700',
  },
  chartCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  chartHeader: {
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  chartLegend: {
    flexDirection: 'row',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 12,
  },
  chartNote: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  predictionCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  predictionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  predictionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  predictionStats: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: 16,
  },
  statLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 6,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  confidenceContainer: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  confidenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  confidenceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  confidenceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  confidenceBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 4,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: colors.highlight + '20',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.highlight,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
    fontWeight: '500',
  },
  metricsCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  metricsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  metricItem: {
    width: '47%',
  },
  metricLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 6,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    backgroundColor: colors.card,
    borderRadius: 16,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  availableStocksCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  availableStocksTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  stockChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  stockChip: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  stockChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  datePickerContainer: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  datePickerDone: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
});
