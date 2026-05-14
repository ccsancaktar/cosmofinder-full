import React from 'react';
import {  View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar , Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import LazyImage from '../../components/LazyImage';
import { fontStyles } from '../../utils/fontStyles';

const KabalaBilgiScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
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
              source={require('../../assets/backgrounds/kabala.jpg')}
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
              
              <Text style={styles.title}>{t('kabala.kabalaFortune')}</Text>
              <Text style={styles.subtitle}>{t('kabala.hebrewMysticalTradition')}</Text>
              
              <View style={styles.originInCard}>
                <Ionicons name="globe" size={16} color="#C5A100" />
                <Text style={styles.originLabelInCard}>{t('kabala.origin')}:</Text>
                <Text style={styles.originTextInCard}>{t('kabala.israel')}</Text>
              </View>
            </LinearGradient>
          </View>

          <View style={styles.content}>
            {/* Info Cards */}
            <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>{t('kabala.whatIsKabala')}</Text>
            <Text style={styles.cardText}>
              {t('kabala.kabalaDescription')}
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>{t('kabala.hebrewNumerology')}</Text>
            <Text style={styles.cardText}>
              {t('kabala.hebrewNumerologyDescription')}
            </Text>
            <View style={styles.exampleContainer}>
              <Text style={styles.exampleTitle}>{t('kabala.example')}:</Text>
              <Text style={styles.hebrewExample}>א ב ג ד ה</Text>
              <Text style={styles.numerologyExample}>1+2+3+4+5 = 15 = 6</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>{t('kabala.sefirot')}</Text>
            <Text style={styles.cardText}>
              {t('kabala.sefirotDescription')}
            </Text>
            <View style={styles.sefirotList}>
              <View style={styles.sefirahItem}>
                <Text style={styles.hebrewLetter}>א</Text>
                <Text style={styles.sefirahName}>{t('kabala.keter')}</Text>
                <Text style={styles.sefirahDesc}>{t('kabala.keterDesc')}</Text>
              </View>
              <View style={styles.sefirahItem}>
                <Text style={styles.hebrewLetter}>ב</Text>
                <Text style={styles.sefirahName}>{t('kabala.hokmah')}</Text>
                <Text style={styles.sefirahDesc}>{t('kabala.hokmahDesc')}</Text>
              </View>
              <View style={styles.sefirahItem}>
                <Text style={styles.hebrewLetter}>ג</Text>
                <Text style={styles.sefirahName}>{t('kabala.binah')}</Text>
                <Text style={styles.sefirahDesc}>{t('kabala.binahDesc')}</Text>
              </View>
              <View style={styles.sefirahItem}>
                <Text style={styles.hebrewLetter}>ד</Text>
                <Text style={styles.sefirahName}>{t('kabala.hesed')}</Text>
                <Text style={styles.sefirahDesc}>{t('kabala.hesedDesc')}</Text>
              </View>
              <View style={styles.sefirahItem}>
                <Text style={styles.hebrewLetter}>ה</Text>
                <Text style={styles.sefirahName}>{t('kabala.gevurah')}</Text>
                <Text style={styles.sefirahDesc}>{t('kabala.gevurahDesc')}</Text>
              </View>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>{t('kabala.treeOfLife')}</Text>
            <Text style={styles.cardText}>
              {t('kabala.treeOfLifeDescription')}
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>{t('kabala.kabalaFortuneFeatures')}</Text>
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Ionicons name="star" size={20} color="#FFD700" />
                <Text style={styles.featureText}>{t('kabala.nameNumerologyAnalysis')}</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="heart" size={20} color="#FFD700" />
                <Text style={styles.featureText}>{t('kabala.spiritualPathDestinyAnalysis')}</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="eye" size={20} color="#FFD700" />
                <Text style={styles.featureText}>{t('kabala.sefirotEnergies')}</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="sparkles" size={20} color="#FFD700" />
                <Text style={styles.featureText}>{t('kabala.mysticalSpiritualInterpretation')}</Text>
              </View>
            </View>
          </View>
          </View>

          {/* Start Button */}
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => navigation.navigate('Kabala')}
          >
            <Ionicons name="play" size={24} color="#6A4C93" />
            <Text style={styles.startButtonText}>{t('kabala.startKabalaFortune')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
      
      </View>
    </SafeAreaView>
  );
};

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
    paddingHorizontal: 0,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  content: {
    paddingHorizontal: 0,
  },
  headerSection: {
    height: 200,
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
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  backButtonInCard: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  originInCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
  },
  originLabelInCard: {
    fontSize: 14,
    fontWeight: '600',
    color: '#C5A100',
    marginLeft: 4,
  },
  originTextInCard: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 4,
  },
  title: {
    fontSize: 28,
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    ...fontStyles.headingBold,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    fontFamily: 'Inter-Regular',
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#C5A100',
    marginBottom: 16,
    ...fontStyles.headingBold,
  },
  cardText: {
    fontSize: 16,
    color: '#E0E0E0',
    lineHeight: 24,
    marginBottom: 16,
    fontFamily: 'Inter-Regular',
  },
  exampleContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  exampleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 8,
    ...fontStyles.headingBold,
  },
  hebrewExample: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 4,
    ...fontStyles.headingBold,
  },
  numerologyExample: {
    fontSize: 14,
    color: '#E0E0E0',
    fontFamily: 'Inter-Regular',
  },
  sefirotList: {
    marginTop: 16,
  },
  sefirahItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 12,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 8,
  },
  hebrewLetter: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginRight: 12,
    ...fontStyles.headingBold,
  },
  sefirahName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    ...fontStyles.headingBold,
  },
  sefirahDesc: {
    fontSize: 12,
    color: '#E0E0E0',
    flex: 2,
    fontFamily: 'Inter-Regular',
  },
  featuresList: {
    marginTop: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#E0E0E0',
    marginLeft: 12,
    fontFamily: 'Inter-Regular',
  },
  startButton: {
    backgroundColor: '#FFD700',
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6A4C93',
    marginLeft: 12,
    fontFamily: 'Inter-Bold',
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

export default KabalaBilgiScreen; 
