import React from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import LazyImage from '../../components/LazyImage';
import AdMobBanner from '../../components/AdMobBanner';
import { useAuth } from '../../context/AuthContext';
import { usePremium } from '../../context/PremiumContext';

export default function AngelNumbersBilgiScreen({ navigation }) {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { hasPremium } = usePremium();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0D0B1F" translucent={false} />
        <LinearGradient colors={['#0D0B1F', '#1B1B2F', '#2A2A3F']} style={styles.gradientBg}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.headerSection}>
              <LazyImage source={require('../../assets/backgrounds/777.png')} style={styles.headerBackgroundImage} resizeMode="cover" showPlaceholder={false} fadeInDuration={450} />
              <LinearGradient colors={['rgba(0,0,0,0.60)', 'rgba(0,0,0,0.92)']} style={styles.headerGradient}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonInCard}>
                  <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.title}>{t('angelNumbers.title')}</Text>
                <Text style={styles.subtitle}>{t('angelNumbers.subtitle')}</Text>
              </LinearGradient>
            </View>

            <View style={styles.content}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('angelNumbers.whatIs')}</Text>
                <Text style={styles.sectionText}>{t('angelNumbers.description')}</Text>
              </View>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('angelNumbers.dailySignalTitle')}</Text>
                <Text style={styles.sectionText}>{t('angelNumbers.dailySignalBody')}</Text>
              </View>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('angelNumbers.examplesTitle')}</Text>
                <Text style={styles.sectionText}>111 • 222 • 333 • 444 • 555 • 777 • 888 • 999 • 1111</Text>
              </View>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('angelNumbers.shareFeatureTitle')}</Text>
                <Text style={styles.sectionText}>{t('angelNumbers.shareFeatureBody')}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.startButton} onPress={() => navigation.navigate(isAuthenticated ? 'Angel Numbers' : 'Login')}>
              <Ionicons name="sparkles" size={22} color="#FFFFFF" />
              <Text style={styles.startButtonText}>{t('angelNumbers.startButton')}</Text>
            </TouchableOpacity>
          </ScrollView>
        </LinearGradient>
        {!hasPremium ? (
          <View style={styles.bannerAdContainer}>
            <AdMobBanner />
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0D0B1F' },
  container: { flex: 1, backgroundColor: '#0D0B1F' },
  gradientBg: { flex: 1 },
  scrollContent: { paddingBottom: 120 },
  headerSection: { height: 210, position: 'relative' },
  headerBackgroundImage: { position: 'absolute', width: '100%', height: '100%' },
  headerGradient: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, paddingTop: 20 },
  backButtonInCard: { position: 'absolute', top: 20, left: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.66)', justifyContent: 'center', alignItems: 'center' },
  title: { color: '#FFFFFF', fontSize: 34, fontWeight: '700', textAlign: 'center', marginBottom: 10 },
  subtitle: { color: 'rgba(255,255,255,0.82)', fontSize: 16, lineHeight: 24, textAlign: 'center', maxWidth: 300 },
  content: { paddingHorizontal: 20, paddingTop: 18 },
  section: { marginBottom: 22 },
  sectionTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '700', marginBottom: 12 },
  sectionText: { color: 'rgba(255,255,255,0.76)', lineHeight: 24, fontSize: 15 },
  startButton: { marginHorizontal: 20, height: 56, borderRadius: 18, backgroundColor: '#C5A100', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', marginTop: 4 },
  startButtonText: { color: '#0D0B1F', fontWeight: '800', fontSize: 16, marginLeft: 10 },
  bannerAdContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#0D0B1F' },
});
