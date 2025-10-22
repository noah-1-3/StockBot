
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Platform,
  Pressable,
  Linking,
} from 'react-native';
import { Stack } from 'expo-router';
import { checkAPIStatus } from '@/data/mockStockData';
import { getAPIStatus } from '@/utils/stockApiService';

const ProfileScreen = () => {
  const [apiStatus, setApiStatus] = useState<any>(null);

  useEffect(() => {
    loadAPIStatus();
  }, []);

  const loadAPIStatus = async () => {
    const status = await getAPIStatus();
    setApiStatus(status);
  };

  const handleOpenAlphaVantage = () => {
    Linking.openURL('https://www.alphavantage.co/support/#api-key');
  };

  const handleOpenDocs = () => {
    Linking.openURL('https://www.alphavantage.co/documentation/');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Profile',
          headerLargeTitle: true,
        }} 
      />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* App Info */}
        <View style={styles.section}>
          <View style={styles.appHeader}>
            <View style={styles.appIconContainer}>
              <IconSymbol name="chart.line.uptrend.xyaxis" size={40} color={colors.primary} />
            </View>
            <View style={styles.appInfo}>
              <Text style={styles.appName}>StockBot</Text>
              <Text style={styles.appVersion}>Version 1.0.0</Text>
            </View>
          </View>
          <Text style={styles.appDescription}>
            AI-powered stock prediction app using real-time market data from Alpha Vantage API to analyze trends and forecast future stock movements.
          </Text>
        </View>

        {/* API Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Real-Time Data Status</Text>
          {apiStatus && (
            <View style={[
              styles.statusCard,
              apiStatus.isAvailable ? styles.statusSuccess : styles.statusWarning
            ]}>
              <IconSymbol 
                name={apiStatus.isAvailable ? 'checkmark.circle.fill' : 'exclamationmark.triangle.fill'} 
                size={24} 
                color={apiStatus.isAvailable ? colors.success : colors.warning} 
              />
              <View style={styles.statusContent}>
                <Text style={styles.statusTitle}>{apiStatus.message}</Text>
                <Text style={styles.statusText}>{apiStatus.suggestion}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Setup Guide */}
        {apiStatus && !apiStatus.isAvailable && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Setup Real-Time Stock Data</Text>
            <View style={styles.guideCard}>
              <View style={styles.guideStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Get Free API Key</Text>
                  <Text style={styles.stepText}>
                    Alpha Vantage offers free API keys with no credit card required
                  </Text>
                  <Pressable 
                    style={styles.linkButton}
                    onPress={handleOpenAlphaVantage}
                  >
                    <Text style={styles.linkButtonText}>Get API Key</Text>
                    <IconSymbol name="arrow.up.right" size={14} color={colors.primary} />
                  </Pressable>
                </View>
              </View>

              <View style={styles.guideStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Copy Your API Key</Text>
                  <Text style={styles.stepText}>
                    After requesting, you&apos;ll receive your API key via email instantly
                  </Text>
                </View>
              </View>

              <View style={styles.guideStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Update the App</Text>
                  <Text style={styles.stepText}>
                    Replace the API key in utils/stockApiService.ts with your own key
                  </Text>
                  <View style={styles.codeBlock}>
                    <Text style={styles.codeText}>
                      const ALPHA_VANTAGE_API_KEY = &apos;your_api_key_here&apos;;
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.guideStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>4</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Restart the App</Text>
                  <Text style={styles.stepText}>
                    Reload the app to start fetching real-time stock data
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.infoBox}>
              <IconSymbol name="info.circle.fill" size={20} color={colors.primary} />
              <Text style={styles.infoText}>
                The free tier includes 5 API calls per minute and 500 calls per day, which is sufficient for personal use.
              </Text>
            </View>
          </View>
        )}

        {/* Real-Time Data Info */}
        {apiStatus && apiStatus.isAvailable && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Real-Time Data</Text>
            <View style={styles.realTimeInfoCard}>
              <IconSymbol name="bolt.fill" size={24} color={colors.success} />
              <View style={styles.realTimeInfoContent}>
                <Text style={styles.realTimeInfoTitle}>Live Market Data Active</Text>
                <Text style={styles.realTimeInfoText}>
                  All stock prices and data are fetched in real-time from Alpha Vantage API. No simulated or mock data is used.
                </Text>
              </View>
            </View>
            
            <View style={styles.apiInfoCard}>
              <Text style={styles.apiInfoTitle}>Current API Key</Text>
              <Text style={styles.apiInfoText}>TZZX7A3O5X9XLQEP</Text>
              <Text style={styles.apiInfoSubtext}>Alpha Vantage Free Tier</Text>
            </View>
          </View>
        )}

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <IconSymbol name="chart.xyaxis.line" size={20} color={colors.primary} />
              <Text style={styles.featureText}>Real-time stock price tracking</Text>
            </View>
            <View style={styles.featureItem}>
              <IconSymbol name="brain" size={20} color={colors.primary} />
              <Text style={styles.featureText}>AI-powered price predictions</Text>
            </View>
            <View style={styles.featureItem}>
              <IconSymbol name="calendar" size={20} color={colors.primary} />
              <Text style={styles.featureText}>Custom date predictions</Text>
            </View>
            <View style={styles.featureItem}>
              <IconSymbol name="magnifyingglass" size={20} color={colors.primary} />
              <Text style={styles.featureText}>Search thousands of US stocks</Text>
            </View>
            <View style={styles.featureItem}>
              <IconSymbol name="chart.line.uptrend.xyaxis" size={20} color={colors.primary} />
              <Text style={styles.featureText}>Historical data visualization</Text>
            </View>
            <View style={styles.featureItem}>
              <IconSymbol name="info.circle" size={20} color={colors.primary} />
              <Text style={styles.featureText}>Detailed company information</Text>
            </View>
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>
            StockBot uses advanced machine learning algorithms to analyze real-time stock data, 
            market trends, and various financial indicators to generate predictions about future 
            stock prices. The AI model considers factors such as price volatility, historical 
            patterns, and market sentiment to provide accurate forecasts.
          </Text>
          <Text style={styles.aboutText}>
            All stock data is fetched in real-time from Alpha Vantage API, ensuring you always have 
            access to the latest market information. The app does not use any simulated or 
            mock data.
          </Text>
          <Text style={styles.aboutText}>
            Please note that stock predictions are for informational purposes only and should 
            not be considered as financial advice. Always do your own research and consult with 
            a financial advisor before making investment decisions.
          </Text>
        </View>

        {/* Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resources</Text>
          <Pressable 
            style={styles.linkCard}
            onPress={handleOpenDocs}
          >
            <IconSymbol name="book.fill" size={20} color={colors.primary} />
            <Text style={styles.linkCardText}>Alpha Vantage API Documentation</Text>
            <IconSymbol name="chevron.right" size={16} color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimerCard}>
          <IconSymbol name="exclamationmark.triangle.fill" size={20} color={colors.warning} />
          <Text style={styles.disclaimerText}>
            <Text style={styles.disclaimerBold}>Disclaimer:</Text> This app is for educational 
            and informational purposes only. Stock market predictions are inherently uncertain 
            and past performance does not guarantee future results. Never invest money you 
            cannot afford to lose.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  appHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  appIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  appDescription: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
  },
  statusSuccess: {
    backgroundColor: colors.success + '10',
    borderColor: colors.success + '30',
  },
  statusWarning: {
    backgroundColor: colors.warning + '10',
    borderColor: colors.warning + '30',
  },
  statusContent: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  guideCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 20,
    marginBottom: 12,
  },
  guideStep: {
    flexDirection: 'row',
    gap: 12,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  stepText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingVertical: 6,
  },
  linkButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  codeBlock: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  codeText: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: colors.text,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primary + '10',
    padding: 12,
    borderRadius: 8,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.primary + '20',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  realTimeInfoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.success + '10',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.success + '30',
    marginBottom: 12,
  },
  realTimeInfoContent: {
    flex: 1,
  },
  realTimeInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  realTimeInfoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  apiInfoCard: {
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  apiInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  apiInfoText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 4,
  },
  apiInfoSubtext: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  featureList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.cardBackground,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featureText: {
    fontSize: 15,
    color: colors.text,
  },
  aboutText: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 12,
  },
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  linkCardText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  disclaimerCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.warning + '10',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.warning + '30',
  },
  disclaimerText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  disclaimerBold: {
    fontWeight: '700',
    color: colors.text,
  },
});

export default ProfileScreen;
