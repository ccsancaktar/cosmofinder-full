import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, SafeAreaView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import LazyImage from '../../components/LazyImage';
import AdMobBanner from '../../components/AdMobBanner';
import { usePremium } from '../../context/PremiumContext';
import { fontStyles } from '../../utils/fontStyles';

const TarotBilgiScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { hasPremium } = usePremium();

  return (
    <SafeAreaView style={styles.safeArea}>
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
              source={require('../../assets/backgrounds/tarot.jpg')}
              style={styles.headerBackgroundImage}
              resizeMode="cover"
              showPlaceholder={false}
              fadeInDuration={600}
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
              
              <Text style={styles.title}>{t('tarot.tarotFortune')}</Text>
              <Text style={styles.subtitle}>
                {t('tarot.tarotSubtitle')}
              </Text>
              
              <View style={styles.originInCard}>
                <Ionicons name="globe" size={16} color="#C5A100" />
                <Text style={styles.originLabelInCard}>{t('tarot.origin')}:</Text>
                <Text style={styles.originTextInCard}>{t('tarot.italy')}</Text>
              </View>
            </LinearGradient>
          </View>

          <View style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('tarot.tarotCards')}</Text>
              <Text style={styles.sectionText}>
                {t('tarot.tarotDeckDescription')}
              </Text>
              
              <View style={styles.subSection}>
                <Text style={styles.subTitle}>{t('tarot.majorArcana')}</Text>
                <Text style={styles.subText}>
                  {t('tarot.majorArcanaDescription')}
                </Text>
              </View>
              
              <View style={styles.subSection}>
                <Text style={styles.subTitle}>{t('tarot.minorArcana')}</Text>
                <Text style={styles.subText}>
                  {t('tarot.minorArcanaDescription')}
                </Text>
                <View style={styles.listItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#C5A100" />
                  <Text style={styles.listText}>{t('tarot.cups')}</Text>
                </View>
                <View style={styles.listItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#C5A100" />
                  <Text style={styles.listText}>{t('tarot.swords')}</Text>
                </View>
                <View style={styles.listItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#C5A100" />
                  <Text style={styles.listText}>{t('tarot.wands')}</Text>
                </View>
                <View style={styles.listItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#C5A100" />
                  <Text style={styles.listText}>{t('tarot.pentacles')}</Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('tarot.cardPositions')}</Text>
              <Text style={styles.sectionText}>
                {t('tarot.cardPositionsDescription')}
              </Text>
              
              <View style={styles.subSection}>
                <Text style={styles.subTitle}>{t('tarot.uprightCard')}</Text>
                <Text style={styles.subText}>
                  {t('tarot.uprightCardDescription')}
                </Text>
              </View>
              
              <View style={styles.subSection}>
                <Text style={styles.subTitle}>{t('tarot.reversedCard')}</Text>
                <Text style={styles.subText}>
                  {t('tarot.reversedCardDescription')}
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('tarot.howItWorks')}</Text>
              <Text style={styles.sectionText}>
                {t('tarot.howItWorksDescription')}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('tarot.importantNotes')}</Text>
              <View style={styles.noteItem}>
                <Ionicons name="information-circle" size={16} color="#C5A100" />
                <Text style={styles.noteText}>{t('tarot.note1')}</Text>
              </View>
              <View style={styles.noteItem}>
                <Ionicons name="information-circle" size={16} color="#C5A100" />
                <Text style={styles.noteText}>{t('tarot.note2')}</Text>
              </View>
              <View style={styles.noteItem}>
                <Ionicons name="information-circle" size={16} color="#C5A100" />
                <Text style={styles.noteText}>{t('tarot.note3')}</Text>
              </View>
              <View style={styles.noteItem}>
                <Ionicons name="information-circle" size={16} color="#C5A100" />
                <Text style={styles.noteText}>{t('tarot.note4')}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.startButton}
              onPress={() => navigation.navigate('TarotForm')}
            >
              <Ionicons name="play" size={24} color="#FFFFFF" />
              <Text style={styles.startButtonText}>{t('tarot.startTarotFortune')}</Text>
            </TouchableOpacity>
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
  },
  scrollContent: {
    paddingBottom: 120, // Banner için extra padding (320x50 banner + margin + safe area)
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
  },
  content: {
    paddingHorizontal: 0,
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
    marginBottom: 16,
    fontFamily: 'Inter-Regular',
  },
  subSection: {
    marginBottom: 16,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#C5A100',
    marginBottom: 8,
    ...fontStyles.headingBold,
  },
  subText: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
    marginBottom: 12,
    fontFamily: 'Inter-Regular',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  listText: {
    fontSize: 16,
    color: '#fff',
    flex: 1,
    marginLeft: 8,
    lineHeight: 22,
    fontFamily: 'Inter-Regular',
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteText: {
    fontSize: 16,
    color: '#fff',
    flex: 1,
    marginLeft: 8,
    lineHeight: 22,
  },
  startButton: {
    backgroundColor: '#8A4FFF',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    elevation: 6,
    shadowColor: '#8A4FFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
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

export default TarotBilgiScreen; 