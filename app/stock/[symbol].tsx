
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { LineChart } from 'react-native-chart-kit';
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
import DateTimePicker from '@react-native-community/datetimepicker';
import { getStockBySymbol, generateDynamicPrediction, getCompanyDescription } from '@/data/mockStockData';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';

export default function StockDetailScreen() {
  const router = useRouter();
  const { symbol } = useLocalSearchParams();
  const [stock, setStock] = useState(getStockBySymbol(symbol as string));
  const [predictionDate, setPredictionDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [companyDescription, setCompanyDescription] = useState('');

  useEffect(() => {
    if (symbol) {
      const stockData = getStockBySymbol(symbol as string);
      setStock(stockData);
      
      // Get company description
      const description = getCompanyDescription(symbol as string);
      setCompanyDescription(description);
    }
  }, [symbol]);

  if (!stock) {
    return (
      <View style={styles.container}>
        <Stack.Screen 
          options={{
            title: 'Stock Not Found',
            headerShown: true,
            headerStyle: {
              backgroundColor: colors.background,
            },
            headerTintColor: colors.text,
          }}
        />
        <View style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle" size={48} color={colors.textSecondary} />
          <Text style={styles.errorText}>Stock not found</Text>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const handleGeneratePrediction = () => {
    console.log('Generating prediction for date:', predictionDate);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(predictionDate);
    targetDate.setHours(0, 0, 0, 0);
    
    const daysAhead = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysAhead < 1) {
      console.log('Cannot predict for past dates');
      return;
    }
    
    const baseStock = getStockBySymbol(symbol as string);
    if (baseStock) {
      const updatedStock = generateDynamicPrediction(baseStock, daysAhead);
      setStock(updatedStock);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setPredictionDate(selectedDate);
      
      // Auto-generate prediction when date changes
      setTimeout(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const targetDate = new Date(selectedDate);
        targetDate.setHours(0, 0, 0, 0);
        
        const daysAhead = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysAhead >= 1) {
          const baseStock = getStockBySymbol(symbol as string);
          if (baseStock) {
            const updatedStock = generateDynamicPrediction(baseStock, daysAhead);
            setStock(updatedStock);
          }
        }
      }, 100);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const chartData = {
    labels: stock.historicalData
      .filter((_, index) => index % 5 === 0)
      .map(d => {
        const date = new Date(d.date);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      }),
    datasets: [
      {
        data: stock.historicalData
          .filter((_, index) => index % 5 === 0)
          .map(d => d.price),
        color: (opacity = 1) => colors.primary,
        strokeWidth: 2,
      },
    ],
  };

  const screenWidth = Dimensions.get('window').width;

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
          headerBackTitle: 'Back',
        }}
      />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.symbol}>{stock.symbol}</Text>
              <Text style={styles.name}>{stock.name}</Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>${stock.currentPrice.toFixed(2)}</Text>
              <View style={[
                styles.changeBadge,
                { backgroundColor: stock.change >= 0 ? colors.success + '20' : colors.error + '20' }
              ]}>
                <IconSymbol 
                  name={stock.change >= 0 ? 'arrow.up' : 'arrow.down'} 
                  size={12} 
                  color={stock.change >= 0 ? colors.success : colors.error}
                  style={styles.changeIcon}
                />
                <Text style={[
                  styles.changeText,
                  { color: stock.change >= 0 ? colors.success : colors.error }
                ]}>
                  {Math.abs(stock.changePercent).toFixed(2)}%
                </Text>
              </View>
            </View>
          </View>

          {companyDescription && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionTitle}>About</Text>
              <Text style={styles.descriptionText}>{companyDescription}</Text>
            </View>
          )}
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.sectionTitle}>30-Day Historical Data</Text>
          <LineChart
            data={chartData}
            width={screenWidth - 40}
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
          />
        </View>

        <View style={styles.predictionSection}>
          <Text style={styles.sectionTitle}>Price Prediction</Text>
          
          <View style={styles.datePickerContainer}>
            <Text style={styles.dateLabel}>Prediction Date:</Text>
            <Pressable 
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <IconSymbol name="calendar" size={18} color={colors.primary} style={styles.calendarIcon} />
              <Text style={styles.dateButtonText}>{formatDate(predictionDate)}</Text>
            </Pressable>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={predictionDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              minimumDate={new Date(Date.now() + 24 * 60 * 60 * 1000)}
              maximumDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)}
            />
          )}

          <View style={styles.predictionCard}>
            <View style={styles.predictionRow}>
              <Text style={styles.predictionLabel}>Predicted Price</Text>
              <Text style={styles.predictionValue}>
                ${stock.predictedPrice.toFixed(2)}
              </Text>
            </View>
            
            <View style={styles.predictionRow}>
              <Text style={styles.predictionLabel}>Expected Change</Text>
              <View style={styles.predictionChangeContainer}>
                <Text style={[
                  styles.predictionChange,
                  { color: stock.predictedChange >= 0 ? colors.success : colors.error }
                ]}>
                  {stock.predictedChange >= 0 ? '+' : ''}${stock.predictedChange.toFixed(2)}
                </Text>
                <Text style={[
                  styles.predictionChangePercent,
                  { color: stock.predictedChange >= 0 ? colors.success : colors.error }
                ]}>
                  ({stock.predictedChange >= 0 ? '+' : ''}{stock.predictedChangePercent.toFixed(2)}%)
                </Text>
              </View>
            </View>

            <View style={styles.confidenceContainer}>
              <Text style={styles.confidenceLabel}>Confidence Level</Text>
              <View style={styles.confidenceBar}>
                <View 
                  style={[
                    styles.confidenceFill,
                    { 
                      width: `${stock.confidence}%`,
                      backgroundColor: stock.confidence >= 80 ? colors.success : 
                                     stock.confidence >= 60 ? colors.warning : colors.error
                    }
                  ]}
                />
              </View>
              <Text style={styles.confidenceText}>{stock.confidence}%</Text>
            </View>
          </View>

          <View style={styles.disclaimerBox}>
            <IconSymbol name="exclamationmark.triangle" size={16} color={colors.warning} style={styles.disclaimerIcon} />
            <Text style={styles.disclaimerText}>
              Predictions are based on historical data and AI analysis. Not financial advice.
            </Text>
          </View>
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
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  symbol: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  changeIcon: {
    marginRight: 4,
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  descriptionContainer: {
    marginTop: 8,
  },
  descriptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  chartContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
  },
  predictionSection: {
    padding: 20,
  },
  datePickerContainer: {
    marginBottom: 20,
  },
  dateLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  calendarIcon: {
    marginRight: 12,
  },
  dateButtonText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  predictionCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  predictionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  predictionLabel: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  predictionValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  predictionChangeContainer: {
    alignItems: 'flex-end',
  },
  predictionChange: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  predictionChangePercent: {
    fontSize: 14,
    fontWeight: '500',
  },
  confidenceContainer: {
    marginTop: 8,
  },
  confidenceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  confidenceBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 4,
  },
  confidenceText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'right',
  },
  disclaimerBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.warning + '15',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: colors.warning + '30',
  },
  disclaimerIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    color: colors.textSecondary,
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
