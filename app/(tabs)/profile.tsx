
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { checkAPIStatus } from '@/data/mockStockData';
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
import { getAPIStatus } from '@/utils/stockApiService';
import { Stack } from 'expo-router';

export default function ProfileScreen() {
  const [apiStatus, setApiStatus] = useState<{
    isAvailable: boolean;
    message: string;
    suggestion: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAPIStatus();
  }, []);

  const loadAPIStatus = async () => {
    setLoading(true);
    const status = await getAPIStatus();
    setApiStatus(status);
    setLoading(false);
  };

  const handleOpenFinnhub = () => {
    Linking.openURL('https://finnhub.io/');
  };

  const handleOpenDocs = () => {
    Linking.openURL('https://finnhub.io/docs/api');
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Profile',
          headerShown: true,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          {/* App Info Section */}
          <View style={styles.section}>
            <View style={styles.header}>
              <IconSymbol name="chart.bar.fill" size={32} color={colors.primary} />
              <Text style={styles.appName}>StockBot</Text>
            </View>
            <Text style={styles.appDescription}>
              Professional stock prediction app powered by real-time market data and advanced analytics.
            </Text>
            <Text style={styles.version}>Version 1.0.0</Text>
          </View>

          {/* API Status Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>API Status</Text>
            
            {loading ? (
              <View style={styles.statusCard}>
                <Text style={styles.statusText}>Checking API status...</Text>
              </View>
            ) : (
              <View style={[
                styles.statusCard,
                apiStatus?.isAvailable ? styles.statusCardSuccess : styles.statusCardError
              ]}>
                <View style={styles.statusHeader}>
                  <IconSymbol 
                    name={apiStatus?.isAvailable ? "checkmark.circle.fill" : "xmark.circle.fill"} 
                    size={24} 
                    color={apiStatus?.isAvailable ? colors.success : colors.error} 
                  />
                  <Text style={[
                    styles.statusTitle,
                    apiStatus?.isAvailable ? styles.statusTitleSuccess : styles.statusTitleError
                  ]}>
                    {apiStatus?.isAvailable ? 'Connected' : 'Disconnected'}
                  </Text>
                </View>
                <Text style={styles.statusMessage}>{apiStatus?.message}</Text>
                <Text style={styles.statusSuggestion}>{apiStatus?.suggestion}</Text>
                
                <Pressable 
                  style={styles.refreshButton}
                  onPress={loadAPIStatus}
                >
                  <IconSymbol name="arrow.clockwise" size={16} color={colors.primary} />
                  <Text style={styles.refreshButtonText}>Refresh Status</Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* API Info Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data Provider</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Provider:</Text>
                <Text style={styles.infoValue}>Finnhub</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>API Key:</Text>
                <Text style={styles.infoValue}>ctbvnf9r01qnhvqhqvh0...</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Rate Limit:</Text>
                <Text style={styles.infoValue}>60 calls/minute</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Data Type:</Text>
                <Text style={styles.infoValue}>Real-time market data</Text>
              </View>
            </View>
          </View>

          {/* Links Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resources</Text>
            
            <Pressable 
              style={styles.linkButton}
              onPress={handleOpenFinnhub}
            >
              <IconSymbol name="globe" size={20} color={colors.primary} />
              <Text style={styles.linkButtonText}>Visit Finnhub</Text>
              <IconSymbol name="chevron.right" size={16} color={colors.textSecondary} />
            </Pressable>

            <Pressable 
              style={styles.linkButton}
              onPress={handleOpenDocs}
            >
              <IconSymbol name="doc.text.fill" size={20} color={colors.primary} />
              <Text style={styles.linkButtonText}>API Documentation</Text>
              <IconSymbol name="chevron.right" size={16} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Features Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Features</Text>
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <IconSymbol name="chart.line.uptrend.xyaxis" size={20} color={colors.success} />
                <Text style={styles.featureText}>Real-time stock prices</Text>
              </View>
              <View style={styles.featureItem}>
                <IconSymbol name="clock.fill" size={20} color={colors.primary} />
                <Text style={styles.featureText}>Historical data analysis</Text>
              </View>
              <View style={styles.featureItem}>
                <IconSymbol name="sparkles" size={20} color={colors.warning} />
                <Text style={styles.featureText}>AI-powered predictions</Text>
              </View>
              <View style={styles.featureItem}>
                <IconSymbol name="magnifyingglass" size={20} color={colors.info} />
                <Text style={styles.featureText}>Stock search & discovery</Text>
              </View>
              <View style={styles.featureItem}>
                <IconSymbol name="star.fill" size={20} color={colors.warning} />
                <Text style={styles.featureText}>Personalized watchlist</Text>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Made with ❤️ for stock market enthusiasts
            </Text>
            <Text style={styles.footerSubtext}>
              Data provided by Finnhub Stock API
            </Text>
          </View>
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
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 12,
  },
  appDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: 8,
  },
  version: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  statusCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: colors.border,
  },
  statusCardSuccess: {
    borderColor: colors.success,
    backgroundColor: `${colors.success}10`,
  },
  statusCardError: {
    borderColor: colors.error,
    backgroundColor: `${colors.error}10`,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  statusTitleSuccess: {
    color: colors.success,
  },
  statusTitleError: {
    color: colors.error,
  },
  statusText: {
    fontSize: 16,
    color: colors.text,
  },
  statusMessage: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
    fontWeight: '600',
  },
  statusSuggestion: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  refreshButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 6,
  },
  infoCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '600',
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  linkButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 12,
  },
  featuresList: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  featureText: {
    fontSize: 15,
    color: colors.text,
    marginLeft: 12,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
