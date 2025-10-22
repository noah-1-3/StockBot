
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Platform,
  Pressable,
} from 'react-native';
import { Stack } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';

export default function ProfileScreen() {
  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: 'Profile',
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
        >
          {Platform.OS !== 'ios' && (
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Profile</Text>
            </View>
          )}

          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <IconSymbol name="person.fill" size={48} color={colors.card} />
              </View>
            </View>
            <Text style={styles.userName}>StockBot User</Text>
            <Text style={styles.userEmail}>user@stockbot.com</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About StockBot</Text>
            
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <IconSymbol name="chart.line.uptrend.xyaxis" size={24} color={colors.primary} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>AI-Powered Predictions</Text>
                  <Text style={styles.infoText}>
                    Advanced machine learning algorithms analyze historical data to predict future stock movements.
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <IconSymbol name="clock.fill" size={24} color={colors.accent} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>Real-Time Updates</Text>
                  <Text style={styles.infoText}>
                    Get live stock prices and predictions updated throughout the trading day.
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <IconSymbol name="shield.fill" size={24} color={colors.highlight} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>Data-Driven Insights</Text>
                  <Text style={styles.infoText}>
                    Our models are trained on years of historical market data for accurate predictions.
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App Information</Text>
            
            <View style={styles.appInfoCard}>
              <View style={styles.appInfoRow}>
                <Text style={styles.appInfoLabel}>App Name</Text>
                <Text style={styles.appInfoValue}>StockBot</Text>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.appInfoRow}>
                <Text style={styles.appInfoLabel}>Version</Text>
                <Text style={styles.appInfoValue}>1.0.0</Text>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.appInfoRow}>
                <Text style={styles.appInfoLabel}>Platform</Text>
                <Text style={styles.appInfoValue}>
                  {Platform.OS === 'ios' ? 'iOS' : Platform.OS === 'android' ? 'Android' : 'Web'}
                </Text>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.appInfoRow}>
                <Text style={styles.appInfoLabel}>Framework</Text>
                <Text style={styles.appInfoValue}>React Native + Expo</Text>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.appInfoRowVertical}>
                <Text style={styles.appInfoLabel}>Description</Text>
                <Text style={styles.appInfoDescription}>
                  StockBot is a professional, modern mobile app that predicts future stock data and pricing 
                  by analyzing past historical stock data. Search for any stock in the US market, view predictions, 
                  and track your search history.
                </Text>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.appInfoRowVertical}>
                <Text style={styles.appInfoLabel}>Features</Text>
                <View style={styles.featuresList}>
                  <View style={styles.featureItem}>
                    <Text style={styles.featureBullet}>•</Text>
                    <Text style={styles.featureText}>Predict any US stock with custom date selection</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Text style={styles.featureBullet}>•</Text>
                    <Text style={styles.featureText}>Real-time stock search with instant suggestions</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Text style={styles.featureBullet}>•</Text>
                    <Text style={styles.featureText}>View past search history</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Text style={styles.featureBullet}>•</Text>
                    <Text style={styles.featureText}>Daily automatic stock data updates</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Text style={styles.featureBullet}>•</Text>
                    <Text style={styles.featureText}>Company descriptions for all stocks</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Text style={styles.featureBullet}>•</Text>
                    <Text style={styles.featureText}>Interactive charts and visualizations</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Settings</Text>
            
            <Pressable style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <IconSymbol name="bell.fill" size={20} color={colors.text} />
                <Text style={styles.settingText}>Notifications</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
            </Pressable>

            <Pressable style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <IconSymbol name="moon.fill" size={20} color={colors.text} />
                <Text style={styles.settingText}>Dark Mode</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
            </Pressable>

            <Pressable style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <IconSymbol name="info.circle.fill" size={20} color={colors.text} />
                <Text style={styles.settingText}>About</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
            </Pressable>
          </View>

          <View style={styles.disclaimerCard}>
            <IconSymbol name="exclamationmark.triangle.fill" size={20} color={colors.highlight} />
            <Text style={styles.disclaimerText}>
              StockBot predictions are for informational purposes only and should not be considered financial advice. 
              Always conduct your own research and consult with a financial advisor before making investment decisions.
            </Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>StockBot v1.0.0</Text>
            <Text style={styles.footerText}>© 2025 StockBot. All rights reserved.</Text>
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
  },
  profileCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textSecondary,
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
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.06)',
    elevation: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  appInfoCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.06)',
    elevation: 1,
  },
  appInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  appInfoRowVertical: {
    paddingVertical: 8,
  },
  appInfoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  appInfoValue: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  appInfoDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: colors.textSecondary + '20',
    marginVertical: 4,
  },
  featuresList: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  featureBullet: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '700',
    marginTop: 2,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  settingItem: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.06)',
    elevation: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  disclaimerCard: {
    backgroundColor: colors.highlight + '20',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 24,
    borderLeftWidth: 3,
    borderLeftColor: colors.highlight,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
});
