import React from 'react';
import {  View, StyleSheet, ScrollView, Dimensions, StatusBar, TouchableOpacity, Text , Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import LazyImage from '../../components/LazyImage';
import { fontStyles } from '../../utils/fontStyles';

const { width } = Dimensions.get('window');

export default function YildiznameBilgiScreen({ navigation }) {
  const { t } = useTranslation();
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="#0D0B1F" 
        translucent={false}
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
              source={require('../../assets/backgrounds/yildizname.jpg')}
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
              
              <Text style={styles.title}>{t('yildizname.yildiznameFortune')}</Text>
              <Text style={styles.subtitle}>
                {t('yildizname.turkishAstrologySystem')}
              </Text>
              
              <View style={styles.originInCard}>
                <Ionicons name="globe" size={16} color="#C5A100" />
                <Text style={styles.originLabelInCard}>{t('yildizname.origin')}:</Text>
                <Text style={styles.originTextInCard}>{t('yildizname.turkey')}</Text>
              </View>
            </LinearGradient>
          </View>

          <View style={styles.content}>
            {/* Açıklama */}
            <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('yildizname.whatIsYildizname')}</Text>
            <Text style={styles.sectionText}>
              {t('yildizname.yildiznameDescription')}
            </Text>
          </View>

          {/* Özellikler */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('yildizname.keyFeatures')}</Text>
            
            <View style={styles.featureItem}>
              <Ionicons name="calendar" size={20} color="#C5A100" />
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{t('yildizname.birthInfoAnalysis')}</Text>
                <Text style={styles.featureDesc}>{t('yildizname.dateTimeLocationUsed')}</Text>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <Ionicons name="heart" size={20} color="#C5A100" />
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{t('yildizname.characterInterpretation')}</Text>
                <Text style={styles.featureDesc}>{t('yildizname.personalityTraits')}</Text>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <Ionicons name="star" size={20} color="#C5A100" />
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{t('yildizname.futurePredictions')}</Text>
                <Text style={styles.featureDesc}>{t('yildizname.nearFarFuture')}</Text>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <Ionicons name="compass" size={20} color="#C5A100" />
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{t('yildizname.lifePathGuidance')}</Text>
                <Text style={styles.featureDesc}>{t('yildizname.careerLifeChoices')}</Text>
              </View>
            </View>
          </View>

          {/* Nasıl Bakılır */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('yildizname.howToRead')}</Text>
            <Text style={styles.sectionText}>
              {t('yildizname.howToReadDescription')}
            </Text>
          </View>

          {/* İpuçları */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('yildizname.yildiznametips')}</Text>
            
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#C5A100" />
              <Text style={styles.tipText}>{t('yildizname.yildiznametip1')}</Text>
            </View>
            
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#C5A100" />
              <Text style={styles.tipText}>{t('yildizname.yildiznametip2')}</Text>
            </View>
            
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#C5A100" />
              <Text style={styles.tipText}>{t('yildizname.yildiznametip3')}</Text>
            </View>
            
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#C5A100" />
              <Text style={styles.tipText}>{t('yildizname.yildiznametip4')}</Text>
            </View>
          </View>
          </View>

          {/* Başla Butonu */}
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => navigation.navigate('Yıldızname')}
          >
            <Ionicons name="star" size={24} color="#FFFFFF" />
            <Text style={styles.startButtonText}>{t('yildizname.startYildiznameFortune')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
      
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
    paddingHorizontal: 0,
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
  section: {
    backgroundColor: '#1B1B2F',
    padding: 24,
    borderRadius: 20,
    marginBottom: 24,
    elevation: Platform.OS === 'android' ? 4 : 0,
    shadowColor: Platform.OS === 'ios' ? '#000' : 'transparent',
    shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 4 } : { width: 0, height: 0 },
    shadowOpacity: Platform.OS === 'ios' ? 0.3 : 0,
    shadowRadius: Platform.OS === 'ios' ? 8 : 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#C5A100',
    marginBottom: 16,
    ...fontStyles.headingBold,
  },
  sectionText: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 22,
    fontFamily: 'Inter-Regular',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureContent: {
    flex: 1,
    marginLeft: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
    ...fontStyles.headingBold,
  },
  featureDesc: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
    fontFamily: 'Inter-Regular',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 16,
    color: '#fff',
    flex: 1,
    marginLeft: 8,
    lineHeight: 22,
    fontFamily: 'Inter-Regular',
  },
  startButton: {
    backgroundColor: '#8A4FFF',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: 24,
    marginTop: 16,
    elevation: Platform.OS === 'android' ? 6 : 0,
    shadowColor: Platform.OS === 'ios' ? '#8A4FFF' : 'transparent',
    shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 4 } : { width: 0, height: 0 },
    shadowOpacity: Platform.OS === 'ios' ? 0.3 : 0,
    shadowRadius: Platform.OS === 'ios' ? 8 : 0,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
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
