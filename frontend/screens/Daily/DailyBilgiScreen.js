import React from 'react';
import {  View, StyleSheet, ScrollView, Dimensions, Text, TouchableOpacity, StatusBar , SafeAreaView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import LazyImage from '../../components/LazyImage';
import AdMobBanner from '../../components/AdMobBanner';
import { fontStyles } from '../../utils/fontStyles';
import { usePremium } from '../../context/PremiumContext';

const { width } = Dimensions.get('window');

export default function DailyBilgiScreen({ navigation }) {
  const { t } = useTranslation();
  const { hasPremium } = usePremium();
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="#0D0B1F"
        translucent={false}
        hidden={false}
      />
      
      <LinearGradient
        colors={['#0D0B1F', '#1B1B2F', '#2A2A3F']}
        style={styles.gradientBg}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.headerSection}>
            <LazyImage
              source={require('../../assets/backgrounds/gunluk-fal.jpg')}
              style={styles.headerBackgroundImage}
              resizeMode="cover"
              showPlaceholder={false}
              fadeInDuration={500}
            />
            <LinearGradient
              colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.9)']}
              style={styles.headerGradient}
            >
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButtonInCard}
              >
                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              
              <Text style={styles.title}>{t('daily.dailyZodiacTitle')}</Text>
              <Text style={styles.subtitle}>
                {t('daily.personalAstrologicalGuide')}
              </Text>
              
              <View style={styles.originInCard}>
                <Ionicons name="globe" size={16} color="#C5A100" />
                <Text style={styles.originLabelInCard}>{t('daily.origin')}:</Text>
                <Text style={styles.originTextInCard}>{t('daily.ancientMesopotamia')}</Text>
              </View>
            </LinearGradient>
          </View>

          <View style={styles.content}>
            {/* Açıklama */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('daily.whatIsDailyZodiac')}</Text>
              <Text style={styles.sectionText}>
                {t('daily.dailyZodiacDescription')}
              </Text>
            </View>

            {/* Özellikler */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('daily.keyFeatures')}</Text>
              
              <View style={styles.featureItem}>
                <Ionicons name="calendar" size={20} color="#C5A100" />
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{t('daily.dailyAnalysis')}</Text>
                  <Text style={styles.featureDesc}>{t('daily.specialCommentsDaily')}</Text>
                </View>
              </View>
              
              <View style={styles.featureItem}>
                <Ionicons name="heart" size={20} color="#C5A100" />
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{t('daily.loveRelationships')}</Text>
                  <Text style={styles.featureDesc}>{t('daily.dailyRomanticPredictions')}</Text>
                </View>
              </View>
              
              <View style={styles.featureItem}>
                <Ionicons name="briefcase" size={20} color="#C5A100" />
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{t('daily.careerGuide')}</Text>
                  <Text style={styles.featureDesc}>{t('daily.dailyWorkAdvice')}</Text>
                </View>
              </View>
              
              <View style={styles.featureItem}>
                <Ionicons name="fitness" size={20} color="#C5A100" />
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{t('daily.healthWarnings')}</Text>
                  <Text style={styles.featureDesc}>{t('daily.dailyHealthSuggestions')}</Text>
                </View>
              </View>
              
              <View style={styles.featureItem}>
                <Ionicons name="wallet" size={20} color="#C5A100" />
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{t('daily.financialPredictions')}</Text>
                  <Text style={styles.featureDesc}>{t('daily.dailyMoneyGuidance')}</Text>
                </View>
              </View>
              
              <View style={styles.featureItem}>
                <Ionicons name="star" size={20} color="#C5A100" />
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{t('daily.luckyInfo')}</Text>
                  <Text style={styles.featureDesc}>{t('daily.dailyLuckyColorNumberStone')}</Text>
                </View>
              </View>
            </View>

            {/* Nasıl Çalışır */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('daily.howItWorks')}</Text>
              
              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <View style={styles.stepContent}>
                          <Text style={styles.stepTitle}>{t('daily.dailybirthDate')}</Text>
        <Text style={styles.stepDesc}>{t('daily.birthDateDesc')}</Text>
                </View>
              </View>
              
              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>{t('daily.astrologicalAnalysis')}</Text>
                  <Text style={styles.stepDesc}>{t('daily.astrologicalAnalysisDesc')}</Text>
                </View>
              </View>
              
              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>{t('daily.personalComment')}</Text>
                  <Text style={styles.stepDesc}>{t('daily.personalCommentDesc')}</Text>
                </View>
              </View>
            </View>

            {/* 12 Burç Bilgisi */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('daily.twelveZodiacs')}</Text>
              <Text style={styles.sectionText}>
                {t('daily.twelveZodiacsDesc')}
              </Text>
            </View>

            {/* Uyarı */}
            <View style={styles.warningSection}>
              <Ionicons name="information-circle" size={24} color="#C5A100" />
              <View style={styles.warningContent}>
                <Text style={styles.warningTitle}>{t('daily.importantNote')}</Text>
                <Text style={styles.warningText}>
                  {t('daily.importantNoteDesc')}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
      
      {/* Banner Ad - Premium olmayan kullanıcılar için */}
      {!hasPremium && (
        <View style={styles.bannerAdContainer}>
          <AdMobBanner />
        </View>
      )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0D0B1F',
  },
  container: {
    flex: 1,
    backgroundColor: '#0D0B1F',
  },
  gradientBg: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120, // Banner için extra padding (320x50 banner + margin + safe area)
  },
  headerSection: {
    height: 280,
    overflow: 'hidden',
    marginBottom: 0,
    position: 'relative',
  },
  headerBackgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  headerGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  backButtonInCard: {
    position: 'absolute',
    top: 60,
    left: 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    borderWidth: 1,
    borderColor: 'rgba(197, 161, 0, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 32,
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    ...fontStyles.headingBold,
  },
  subtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 26,
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    ...fontStyles.body,
    marginBottom: 8,
  },
  originInCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(197, 161, 0, 0.3)',
  },
  originLabelInCard: {
    fontSize: 14,
    color: '#C5A100',
    marginLeft: 4,
    ...fontStyles.bodyBold,
  },
  originTextInCard: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 4,
    ...fontStyles.body,
  },
  content: {
    padding: 24,
    paddingTop: 32,
  },
  section: {
    marginBottom: 36,
  },
  sectionTitle: {
    fontSize: 22,
    color: '#C5A100',
    marginBottom: 16,
    ...fontStyles.headingBold,
  },
  sectionText: {
    fontSize: 16,
    color: '#E0E0E0',
    lineHeight: 24,
    textAlign: 'justify',
    ...fontStyles.body,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(197, 161, 0, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  featureContent: {
    flex: 1,
    marginLeft: 12,
  },
  featureTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 4,
    ...fontStyles.bodyBold,
  },
  featureDesc: {
    fontSize: 14,
    color: '#B0B0B0',
    lineHeight: 20,
    ...fontStyles.body,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(197, 161, 0, 0.1)',
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#C5A100',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  stepNumberText: {
    fontSize: 18,
    color: '#000',
    ...fontStyles.bodyBold,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 4,
    ...fontStyles.bodyBold,
  },
  stepDesc: {
    fontSize: 14,
    color: '#B0B0B0',
    lineHeight: 20,
    ...fontStyles.body,
  },
  warningSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(197, 161, 0, 0.08)',
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#C5A100',
    borderWidth: 1,
    borderColor: 'rgba(197, 161, 0, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  warningContent: {
    flex: 1,
    marginLeft: 12,
  },
  warningTitle: {
    fontSize: 16,
    color: '#C5A100',
    marginBottom: 8,
    ...fontStyles.bodyBold,
  },
  warningText: {
    fontSize: 14,
    color: '#E0E0E0',
    lineHeight: 20,
    ...fontStyles.body,
  },
  bannerAdContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0D0B1F',
    paddingBottom: 10, // Safe area için padding
    borderTopWidth: 1,
    borderTopColor: 'rgba(197, 161, 0, 0.3)',
    minHeight: 70, // Banner için minimum yükseklik
  },
});

