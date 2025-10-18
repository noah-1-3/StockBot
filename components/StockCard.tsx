
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from './IconSymbol';

interface StockCardProps {
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  predictedChange: number;
}

export default function StockCard({
  symbol,
  name,
  currentPrice,
  change,
  changePercent,
  predictedChange,
}: StockCardProps) {
  const router = useRouter();
  const isPositive = change >= 0;
  const isPredictionPositive = predictedChange >= 0;

  const handlePress = () => {
    console.log('Navigating to stock detail:', symbol);
    router.push(`/stock/${symbol}`);
  };

  return (
    <Pressable onPress={handlePress} style={({ pressed }) => [
      styles.card,
      pressed && styles.cardPressed,
    ]}>
      <View style={styles.header}>
        <View style={styles.symbolContainer}>
          <View style={[styles.iconCircle, { backgroundColor: colors.primary + '20' }]}>
            <IconSymbol name="chart.line.uptrend.xyaxis" size={20} color={colors.primary} />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.symbol}>{symbol}</Text>
            <Text style={styles.name} numberOfLines={1}>{name}</Text>
          </View>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>${currentPrice.toFixed(2)}</Text>
          <View style={[styles.changeBadge, { backgroundColor: isPositive ? colors.accent + '20' : colors.error + '20' }]}>
            <Text style={[styles.change, { color: isPositive ? colors.accent : colors.error }]}>
              {isPositive ? '+' : ''}{change.toFixed(2)} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.predictionContainer}>
        <View style={styles.predictionLabel}>
          <IconSymbol name="sparkles" size={14} color={colors.highlight} />
          <Text style={styles.predictionText}>AI Prediction (7d):</Text>
        </View>
        <Text style={[styles.predictionValue, { color: isPredictionPositive ? colors.accent : colors.error }]}>
          {isPredictionPositive ? '+' : ''}{predictedChange.toFixed(2)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  symbolContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  symbol: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  name: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  changeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  change: {
    fontSize: 12,
    fontWeight: '600',
  },
  predictionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  predictionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  predictionText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  predictionValue: {
    fontSize: 16,
    fontWeight: '700',
  },
});
