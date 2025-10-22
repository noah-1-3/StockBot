
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

export default function StockDetailScreen() {
  const router = useRouter();
  const { symbol } = useLocalSearchParams();
  const [stock, setStock] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [daysAhead, setDaysAhead] = useState(7);

  useEffect(() => {
    loadStockData();
  }, [symbol]);

  const loadStockData = async () => {
    try {
      setIsLoading(true);
      console.log('Loading stock data for:', symbol);
      const stockData = await getStockBySymbol(symbol as string);
      
      if (stockData) {
        setStock(stockData);
        console.log('Stock data loaded:', stockData.symbol);
      } else {
        console.error('Stock not found:', symbol);
      }
    } catch (error) {
      console.error('Error loading stock data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePrediction = () => {
    if (!stock) return;
    
    const today = new Date();
    const diffTime = Math.abs(selectedDate.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    console.log('Generating prediction for', diffDays, 'days ahead');
    setDaysAhead(diffDays);
    
    const updatedStock = generateDynamicPrediction(stock, diffDays);
    setStock(updatedStock);
    setShowDatePicker(false);
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (date > today) {
        setSelectedDate(date);
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

  if (isLoading) {
    return (
      <>
        <Stack.Screen 
          options={{
            title: 'Loading...',
            headerShown: true,
            headerStyle: {
              backgroundColor: colors.background,
            },
            headerTintColor: colors.text,
            headerShadowVisible: false,
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading stock data...</Text>
        </View>
      </>
    );
  }

  if (!stock) {
    return (
      <>
        <Stack.Screen 
          options={{
            title: 'Error',
            headerShown: true,
            headerStyle: {
              backgroundColor: colors.background,
            },
            headerTintColor: colors.text,
            headerShadowVisible: false,
          }}
        />
        <View style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle" size={48} color={colors.error} />
          <Text style={styles.errorText}>Stock not found</Text>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </>
    );
  }

  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 40;

  // Combine historical and prediction data for the chart
  const allData = [...stock.historicalData, ...stock.predictionData];
  const chartData = {
    labels: allData
      .filter((_, index) => index % 5 === 0)
      .map(point => {
        const date = new Date(point.date);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      }),
    datasets: [
      {
        data: allData.map(point => point.price),
        color: (opacity = 1) => colors.primary,
        strokeWidth: 2,
      },
    ],
  };

  const isPositiveChange = stock.change >= 0;
  const isPredictionPositive = stock.predictedChange >= 0;
  const companyDescription = getCompanyDescription(stock.symbol);

  return (
    <>
      <Stack.Screen 
        options={{
          title: stock.symbol,
          headerShown: true,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Stock Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.symbol}>{stock.symbol}</Text>
              <Text style={styles.name}>{stock.name}</Text>
            </View>
          </View>
          
          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>${stock.currentPrice.toFixed(2)}</Text>
            <View style={styles.changeContainer}>
              <IconSymbol 
                name={isPositiveChange ? 'arrow.up' : 'arrow.down'} 
                size={16} 
                color={isPositiveChange ? colors.success : colors.error} 
              />
              <Text style={[
                styles.changeText,
                { color: isPositiveChange ? colors.success : colors.error }
              ]}>
                ${Math.abs(stock.change).toFixed(2)} ({Math.abs(stock.changePercent).toFixed(2)}%)
              </Text>
            </View>
          </View>

          <View style={styles.dataBadge}>
            <IconSymbol name="checkmark.circle.fill" size={14} color={colors.success} />
            <Text style={styles.dataBadgeText}>Real-time data</Text>
          </View>
        </View>

        {/* Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Price History & Prediction</Text>
          <LineChart
            data={chartData}
            width={chartWidth}
            height={220}
            chartConfig={{
              backgroundColor: colors.cardBackground,
              backgroundGradientFrom: colors.cardBackground,
              backgroundGradientTo: colors.cardBackground,
              decimalPlaces: 2,
              color: (opacity = 1) => colors.primary,
              labelColor: (opacity = 1) => colors.textSecondary,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '0',
              },
            }}
            bezier
            style={styles.chart}
            withInnerLines={false}
            withOuterLines={true}
            withVerticalLines={false}
            withHorizontalLines={true}
          />
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
              <Text style={styles.legendText}>Historical</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.primary, opacity: 0.5 }]} />
              <Text style={styles.legendText}>Predicted</Text>
            </View>
          </View>
        </View>

        {/* Prediction Section */}
        <View style={styles.predictionContainer}>
          <View style={styles.predictionHeader}>
            <Text style={styles.predictionTitle}>AI Prediction</Text>
            <View style={styles.confidenceBadge}>
              <Text style={styles.confidenceText}>{stock.confidence}% confidence</Text>
            </View>
          </View>
          
          <View style={styles.predictionCard}>
            <View style={styles.predictionRow}>
              <Text style={styles.predictionLabel}>Predicted Price ({daysAhead} days)</Text>
              <Text style={styles.predictionValue}>${stock.predictedPrice.toFixed(2)}</Text>
            </View>
            <View style={styles.predictionRow}>
              <Text style={styles.predictionLabel}>Expected Change</Text>
              <View style={styles.predictionChangeContainer}>
                <IconSymbol 
                  name={isPredictionPositive ? 'arrow.up' : 'arrow.down'} 
                  size={16} 
                  color={isPredictionPositive ? colors.success : colors.error} 
                />
                <Text style={[
                  styles.predictionChangeText,
                  { color: isPredictionPositive ? colors.success : colors.error }
                ]}>
                  ${Math.abs(stock.predictedChange).toFixed(2)} ({Math.abs(stock.predictedChangePercent).toFixed(2)}%)
                </Text>
              </View>
            </View>
          </View>

          <Pressable 
            style={styles.customPredictionButton}
            onPress={() => setShowDatePicker(true)}
          >
            <IconSymbol name="calendar" size={20} color={colors.primary} />
            <Text style={styles.customPredictionText}>Custom Prediction Date</Text>
          </Pressable>
        </View>

        {/* Company Info */}
        <View style={styles.companyInfoContainer}>
          <Text style={styles.companyInfoTitle}>About {stock.name}</Text>
          <Text style={styles.companyInfoText}>{companyDescription}</Text>
        </View>

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
                themeVariant="dark"
              />
              
              <View style={styles.modalActions}>
                <Pressable 
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
                <Pressable 
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={handleGeneratePrediction}
                >
                  <Text style={styles.confirmButtonText}>Generate Prediction</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: 100,
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
    fontWeight: '600',
    color: colors.text,
  },
  backButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
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
  symbol: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
  },
  name: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  priceContainer: {
    gap: 8,
  },
  currentPrice: {
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.text,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  changeText: {
    fontSize: 18,
    fontWeight: '600',
  },
  dataBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: colors.successBackground,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  dataBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success,
  },
  chartContainer: {
    padding: 20,
    gap: 12,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  chart: {
    borderRadius: 16,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  predictionContainer: {
    padding: 20,
    gap: 16,
  },
  predictionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  predictionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  confidenceBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  predictionCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  predictionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  predictionLabel: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  predictionValue: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  predictionChangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  predictionChangeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  customPredictionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.cardBackground,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  customPredictionText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  companyInfoContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    gap: 12,
  },
  companyInfoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  companyInfoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.cardBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    gap: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.background,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  confirmButton: {
    backgroundColor: colors.primary,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
