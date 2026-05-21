import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, ScrollView, TouchableWithoutFeedback, Keyboard, Dimensions, StatusBar, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Text, 
  TextInput, 
  TouchableOpacity,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import LazyImage from '../../components/LazyImage';
import TokenIcon from '../../components/TokenIcon';
import { useRuneCache } from '../../hooks/useFortuneCache';
import { useToken, TOKEN_COSTS } from '../../context/TokenContext';
import { usePremium } from '../../context/PremiumContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNotification } from '../../context/NotificationContext';
import { showInterstitialAd, preloadInterstitialAd } from '../../utils/interstitialAd';
import TokenWarningModal from '../../components/TokenWarningModal';
import FortuneLoadingOverlay from '../../components/FortuneLoadingOverlay';
import FortuneInfoSheet from '../../components/FortuneInfoSheet';
import AdMobBanner from '../../components/AdMobBanner';
import useKeyboardVisibility from '../../hooks/useKeyboardVisibility';
import { fontStyles } from '../../utils/fontStyles';
import FortunePrimaryButton from '../../components/FortunePrimaryButton';

const { width, height } = Dimensions.get('window');

const RuneFormScreen = React.memo(({ navigation }) => {
  const { t } = useTranslation();
  const { showError, showInfo } = useNotification();
  const { balance, fetchBalance } = useToken();
  const { hasPremium, fetchStatus } = usePremium();
  const { getFortune, checkDuplicateRequest, isLoading: fortuneLoading } = useRuneCache();
  const { currentLanguage } = useLanguage();
  const [soru, setSoru] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [showInfoSheet, setShowInfoSheet] = useState(false);
  const isKeyboardVisible = useKeyboardVisibility();

  // Token ve premium durumunu yükle
  useEffect(() => {
    fetchBalance();
    fetchStatus();
    // Interstitial reklamını önceden yükle
    preloadInterstitialAd();
  }, []);

  const handleBackgroundPress = useCallback(() => {
    Keyboard.dismiss();
  }, []);

  const handleSubmit = useCallback(async () => {
    setError('');
    if (!soru.trim()) {
      showError(t('rune.pleaseWriteQuestion'));
      return;
    }
    
    if (soru.length < 10) {
      showError(t('rune.writeDetailedQuestion'));
      return;
    }

    // Token kontrolü (Premium değilse)
    if (!hasPremium && balance < TOKEN_COSTS.RUNE) {
      setShowTokenModal(true);
      return;
    }

    setLoading(true);
    try {
      const fortuneData = {
        soru: soru.trim(),
        language: currentLanguage,
        readingTier: hasPremium ? 'premium' : 'free',
      };
      
      // Aynı bilgilerle fal baktırılıp baktırılmadığını kontrol et
      if (checkDuplicateRequest(fortuneData)) {
        showInfo(t('rune.duplicateRequestInfo'));
        setLoading(false);
        return;
      }
      
      // Fal sonucunu al (cache kontrolü ile)
      const result = await getFortune.mutateAsync(fortuneData);
      
      // Token bakiyesini güncelle
      await fetchBalance();
      
      // Premium değilse önce reklam göster
      if (!hasPremium) {
        try {
          await showInterstitialAd();
        } catch (adError) {
          console.log('Ad could not be shown:', adError);
        }
      }
      
      navigation.navigate('Rune Sonuç', { 
        runes: result.data.runes || [],
        interpretation: result.data.interpretation || result.data.yorum || '',
        question: soru.trim(),
        readingTier: result.data.reading_tier || (hasPremium ? 'premium' : 'free'),
      });
    } catch (err) {
      const errorMessage = err.response?.data?.error || t('rune.generalError');
      
      // Token hatası ise özel mesaj göster
      if (errorMessage.includes('insufficient tokens')) {
        setShowTokenModal(true);
      } else {
        showError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [soru, hasPremium, balance, checkDuplicateRequest, getFortune, fetchBalance, navigation]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0D0B1F" />
        
        <LinearGradient
          colors={['#0D0B1F', '#1B1B2F', '#2A2A3F']}
          style={styles.gradientBg}
        >
        <TouchableWithoutFeedback onPress={handleBackgroundPress}>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header Section */}
            <View style={styles.headerSection}>
              <LazyImage
                source={require('../../assets/backgrounds/rune.jpg')}
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
                <TouchableOpacity
                  onPress={() => setShowInfoSheet(true)}
                  style={styles.infoButtonInCard}
                >
                  <Ionicons name="information-circle-outline" size={22} color="#FFFFFF" />
                </TouchableOpacity>
                
                <Text style={styles.title}>{t('rune.runeFortune')}</Text>
                <Text style={styles.subtitle}>
                  {t('rune.runeSubtitle')}
                </Text>
                
                                {/* Token ve Premium Bilgisi */}

                
                <View style={styles.originInCard}>
                  <Ionicons name="globe" size={16} color="#C5A100" />
                <Text style={styles.originTextInCard}>{t('rune.scandinavia')}</Text>
                </View>
              </LinearGradient>
            </View>

            <View style={styles.content}>

            {/* Soru Card */}
            <View style={styles.soruCard}>
              <Text style={styles.soruTitle}>{t('rune.writeYourQuestion')}</Text>
              <Text style={styles.soruDescription}>
                {t('rune.questionDescription')}
              </Text>
              
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder={t('rune.questionPlaceholder')}
                  placeholderTextColor="#999999"
                  value={soru}
                  onChangeText={setSoru}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
                <Text style={styles.charCount}>{soru.length} / 500</Text>
              </View>
              
              <FortunePrimaryButton
                label={t('rune.sendMyFortune')}
                loadingLabel={t('rune.fortuneBeingInterpreted')}
                loading={loading || fortuneLoading}
                disabled={loading || fortuneLoading}
                onPress={handleSubmit}
                style={styles.submitButton}
              />
            </View>
            </View>

          </ScrollView>
        </TouchableWithoutFeedback>
      </LinearGradient>
      
      {/* Token Warning Modal */}
      <TokenWarningModal
        visible={showTokenModal}
        onClose={() => setShowTokenModal(false)}
        onPurchaseTokens={() => {
          setShowTokenModal(false);
          navigation.navigate('TokenPurchase');
        }}
        onWatchVideo={() => {
          setShowTokenModal(false);
          navigation.navigate('TokenBalance');
        }}
        currentBalance={balance}
        requiredTokens={TOKEN_COSTS.RUNE}
        readingType="rune"
      />
      <FortuneLoadingOverlay visible={loading || fortuneLoading} readingType="rune" />
      <FortuneInfoSheet
        visible={showInfoSheet}
        onClose={() => setShowInfoSheet(false)}
        title={t('rune.runeFortune')}
        subtitle={t('rune.runeSubtitle')}
        sections={[
          {
            title: t('rune.aboutRuneFortune'),
            body: t('rune.runeFortuneDescription'),
            icon: 'shield-outline',
          },
        ]}
        tips={[t('rune.runetip1'), t('rune.runetip2'), t('rune.runetip3')]}
      />
      {!hasPremium && !showInfoSheet && !isKeyboardVisible ? (
        <View style={styles.bannerAdContainer}>
          <AdMobBanner />
        </View>
      ) : null}
    </View>
  </SafeAreaView>
  );
});

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
    paddingBottom: 120,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  header: {
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Added for space between back button and info button
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  bilgiButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerSection: {
    height: 240,
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
    paddingTop: 40,
  },
  backButtonInCard: {
    position: 'absolute',
    top: 40,
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
    shadowColor: Platform.OS === 'ios' ? '#000' : 'transparent',
    shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 2 } : { width: 0, height: 0 },
    shadowOpacity: Platform.OS === 'ios' ? 0.3 : 0,
    shadowRadius: Platform.OS === 'ios' ? 8 : 0,
    elevation: Platform.OS === 'android' ? 5 : 0,
  },
  infoButtonInCard: {
    position: 'absolute',
    top: 40,
    right: 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    borderWidth: 1,
    borderColor: 'rgba(197, 161, 0, 0.3)',
  },
  originInCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    marginTop: 16,
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
    lineHeight: 24,
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    ...fontStyles.body,
    marginBottom: 8,
  },
  soruCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 20,
    borderRadius: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(197,161,0,0.10)',
  },
  soruTitle: {
    fontSize: 20,
    color: '#C5A100',
    marginBottom: 16,
    ...fontStyles.headingBold,
  },
  soruDescription: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 24,
    lineHeight: 24,
    ...fontStyles.body,
  },
  inputContainer: {
    marginBottom: 24,
  },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 18,
    padding: 18,
    fontSize: 16,
    color: '#fff',
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    ...fontStyles.body,
  },
  charCount: {
    fontSize: 14,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
    ...fontStyles.body,
  },
  tipsCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(197,161,0,0.10)',
  },
  tipsTitle: {
    fontSize: 20,
    color: '#C5A100',
    marginBottom: 20,
    ...fontStyles.headingBold,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(197, 161, 0, 0.1)',
  },
  tipText: {
    fontSize: 16,
    color: '#fff',
    flex: 1,
    marginLeft: 12,
    lineHeight: 24,
    ...fontStyles.body,
  },
  tokenInfoContainer: {
    marginTop: 16,
    marginBottom: 12,
  },
  submitButton: {
    marginBottom: 32,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  premiumText: {
    color: '#FFD700',
    fontSize: 14,
    marginLeft: 8,
    ...fontStyles.bodyBold,
  },
  tokenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  tokenText: {
    color: '#FFD700',
    fontSize: 14,
    marginLeft: 8,
    ...fontStyles.bodyBold,
  },
  tokenCost: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.8,
    marginLeft: 12,
    ...fontStyles.body,
  },
  bannerAdContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0D0B1F',
  },
});

export default RuneFormScreen; 
