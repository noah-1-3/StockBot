
import React, { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
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
import { LineChart } from 'react-native-chart-kit';
import { colors } from '@/styles/commonStyles';
import { getStockBySymbol, generateDynamicPrediction } from '@/data/mockStockData';
import DateTimePicker from '@react-native-community/datetimepicker';
import { IconSymbol } from '@/components/IconSymbol';

export default function StockDetailScreen() {
  const params = useLocalSearchParams();
  const routeSymbol = params.symbol as string;
  const customSymbol = params.customSymbol as string;
  const symbol = customSymbol || routeSymbol;
  
  const [stockData, setStockData] = useState(getStockBySymbol(symbol));
  const [predictionDays, setPredictionDays] = useState('7');
  const [targetDate, setTargetDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const stock = getStockBySymbol(symbol);
    if (stock) {
      setStockData(stock);
    }
  }, [symbol]);

  if (!stockData) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Stock Not Found',
            headerBackTitle: 'Back',
          }}
        />
        <View style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle.fill" size={64} color={colors.textSecondary} />
          <Text style={styles.errorText}>Stock not found</Text>
          <Text style={styles.errorSubtext}>The stock symbol &quot;{symbol}&quot; could not be found.</Text>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const handleGeneratePrediction = () => {
    const days = parseInt(predictionDays) || 7;
    const daysFromNow = Math.max(1, Math.min(365, days));
    
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + daysFromNow);
    setTargetDate(newDate);
    
    const baseStock = getStockBySymbol(symbol);
    if (baseStock) {
      const updatedStock = generateDynamicPrediction(baseStock, daysFromNow);
      setStockData(updatedStock);
      console.log('Generated prediction for', daysFromNow, 'days ahead');
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    
    if (selectedDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);
      
      const diffTime = selectedDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 0 && diffDays <= 365) {
        setTargetDate(selectedDate);
        setPredictionDays(diffDays.toString());
        
        const baseStock = getStockBySymbol(symbol);
        if (baseStock) {
          const updatedStock = generateDynamicPrediction(baseStock, diffDays);
          setStockData(updatedStock);
          console.log('Generated prediction for date:', selectedDate.toDateString());
        }
      }
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const chartWidth = Dimensions.get('window').width - 32;
  const allData = [...stockData.historicalData, ...stockData.predictionData];
  const chartData = {
    labels: allData
      .filter((_, index) => index % Math.ceil(allData.length / 6) === 0)
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

  const isPositiveChange = stockData.change >= 0;
  const isPredictionPositive = stockData.predictedChange >= 0;

  return (
    <>
      <Stack.Screen
        options={{
          title: stockData.symbol,
          headerBackTitle: 'Back',
        }}
      />
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.symbolContainer}>
              <View style={styles.symbolIconContainer}>
                <IconSymbol name="chart.line.uptrend.xyaxis" size={24} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.symbol}>{stockData.symbol}</Text>
                <Text style={styles.name}>{stockData.name}</Text>
              </View>
            </View>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>${stockData.currentPrice.toFixed(2)}</Text>
            <View style={[styles.changeContainer, isPositiveChange ? styles.positiveChange : styles.negativeChange]}>
              <IconSymbol 
                name={isPositiveChange ? 'arrow.up' : 'arrow.down'} 
                size={14} 
                color={isPositiveChange ? colors.success : colors.error} 
              />
              <Text style={[styles.changeText, isPositiveChange ? styles.positiveText : styles.negativeText]}>
                ${Math.abs(stockData.change).toFixed(2)} ({Math.abs(stockData.changePercent).toFixed(2)}%)
              </Text>
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
            width={chartWidth}
            height={220}
            chartConfig={{
              backgroundColor: colors.card,
              backgroundGradientFrom: colors.card,
              backgroundGradientTo: colors.card,
              decimalPlaces: 2,
              color: (opacity = 1) => colors.primary,
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
            fromZero={false}
          />
        </View>

        <View style={styles.predictionCard}>
          <View style={styles.predictionHeader}>
            <IconSymbol name="sparkles" size={24} color={colors.highlight} />
            <Text style={styles.predictionTitle}>AI Prediction</Text>
          </View>
          
          <View style={styles.predictionContent}>
            <View style={styles.predictionRow}>
              <Text style={styles.predictionLabel}>Target Date</Text>
              <Text style={styles.predictionValue}>{formatDate(targetDate)}</Text>
            </View>
            
            <View style={styles.predictionRow}>
              <Text style={styles.predictionLabel}>Predicted Price</Text>
              <Text style={[styles.predictionPrice, isPredictionPositive ? styles.positiveText : styles.negativeText]}>
                ${stockData.predictedPrice.toFixed(2)}
              </Text>
            </View>
            
            <View style={styles.predictionRow}>
              <Text style={styles.predictionLabel}>Expected Change</Text>
              <View style={[styles.changeContainer, isPredictionPositive ? styles.positiveChange : styles.negativeChange]}>
                <IconSymbol 
                  name={isPredictionPositive ? 'arrow.up' : 'arrow.down'} 
                  size={14} 
                  color={isPredictionPositive ? colors.success : colors.error} 
                />
                <Text style={[styles.changeText, isPredictionPositive ? styles.positiveText : styles.negativeText]}>
                  ${Math.abs(stockData.predictedChange).toFixed(2)} ({Math.abs(stockData.predictedChangePercent).toFixed(2)}%)
                </Text>
              </View>
            </View>
            
            <View style={styles.confidenceContainer}>
              <View style={styles.confidenceHeader}>
                <Text style={styles.confidenceLabel}>Confidence Score</Text>
                <Text style={styles.confidenceValue}>{stockData.confidence}%</Text>
              </View>
              <View style={styles.confidenceBarContainer}>
                <View 
                  style={[
                    styles.confidenceBar, 
                    { 
                      width: `${stockData.confidence}%`,
                      backgroundColor: stockData.confidence >= 80 ? colors.success : 
                                     stockData.confidence >= 60 ? colors.highlight : colors.error
                    }
                  ]} 
                />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.customPredictionCard}>
          <Text style={styles.customPredictionTitle}>Custom Prediction</Text>
          <Text style={styles.customPredictionSubtitle}>
            Choose a future date to see AI-powered price predictions
          </Text>

          <View style={styles.dateInputContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Days Ahead</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={predictionDays}
                  onChangeText={setPredictionDays}
                  keyboardType="number-pad"
                  placeholder="7"
                  placeholderTextColor={colors.textSecondary}
                />
                <Text style={styles.inputSuffix}>days</Text>
              </View>
            </View>

            <Pressable 
              style={styles.datePickerButton}
              onPress={() => setShowDatePicker(true)}
            >
              <IconSymbol name="calendar" size={20} color={colors.primary} />
              <Text style={styles.datePickerButtonText}>Pick Date</Text>
            </Pressable>
          </View>

          <Pressable 
            style={styles.generateButton}
            onPress={handleGeneratePrediction}
          >
            <IconSymbol name="wand.and.stars" size={20} color="#FFFFFF" />
            <Text style={styles.generateButtonText}>Generate Prediction</Text>
          </Pressable>

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
                    <Pressable onPress={() => setShowDatePicker(false)}>
                      <Text style={styles.datePickerCancel}>Cancel</Text>
                    </Pressable>
                    <Text style={styles.datePickerTitle}>Select Date</Text>
                    <Pressable onPress={() => setShowDatePicker(false)}>
                      <Text style={styles.datePickerDone}>Done</Text>
                    </Pressable>
                  </View>
                  <DateTimePicker
                    value={targetDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                    maximumDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)}
                    textColor={colors.text}
                  />
                </View>
              </Pressable>
            </Modal>
          )}
        </View>

        <View style={styles.disclaimer}>
          <IconSymbol name="info.circle.fill" size={16} color={colors.textSecondary} />
          <Text style={styles.disclaimerText}>
            Predictions are based on historical data and AI analysis. This is not financial advice. 
            Always do your own research before making investment decisions.
          </Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  symbolContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  symbolIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  symbol: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 2,
  },
  name: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  priceContainer: {
    alignItems: 'flex-start',
  },
  currentPrice: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  positiveChange: {
    backgroundColor: colors.success + '20',
  },
  negativeChange: {
    backgroundColor: colors.error + '20',
  },
  changeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  positiveText: {
    color: colors.success,
  },
  negativeText: {
    color: colors.error,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
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
    borderRadius: 16,
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
    gap: 10,
    marginBottom: 20,
  },
  predictionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  predictionContent: {
    gap: 16,
  },
  predictionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  predictionLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  predictionValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  predictionPrice: {
    fontSize: 20,
    fontWeight: '800',
  },
  confidenceContainer: {
    marginTop: 8,
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 12,
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
    fontWeight: '800',
    color: colors.highlight,
  },
  confidenceBarContainer: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  confidenceBar: {
    height: '100%',
    borderRadius: 4,
  },
  customPredictionCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  customPredictionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  customPredictionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
    lineHeight: 20,
  },
  dateInputContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    padding: 0,
  },
  inputSuffix: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
    marginLeft: 8,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary + '20',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    marginTop: 21,
  },
  datePickerButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    gap: 10,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
    elevation: 3,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
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
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  datePickerCancel: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  datePickerDone: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  disclaimer: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.highlight,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 20,
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
