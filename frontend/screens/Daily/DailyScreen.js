import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, Modal, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import LazyImage from '../../components/LazyImage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useDailyCache } from '../../hooks/useFortuneCache';
import { useToken, TOKEN_COSTS } from '../../context/TokenContext';
import { usePremium } from '../../context/PremiumContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { showInterstitialAd, preloadInterstitialAd } from '../../utils/interstitialAd';
import TokenWarningModal from '../../components/TokenWarningModal';
import FortuneLoadingOverlay from '../../components/FortuneLoadingOverlay';
import ReadingModeCard from '../../components/ReadingModeCard';
import FortuneInfoSheet from '../../components/FortuneInfoSheet';
import AdMobBanner from '../../components/AdMobBanner';
import useKeyboardVisibility from '../../hooks/useKeyboardVisibility';
import { fontStyles } from '../../utils/fontStyles';
import FortunePrimaryButton from '../../components/FortunePrimaryButton';

const DailyScreen = () => {
  const { t } = useTranslation();
  const { showError, showInfo, showConfirm } = useNotification();
  const navigation = useNavigation();
  const { balance, fetchBalance } = useToken();
  const { hasPremium, fetchStatus } = usePremium();
  const { getFortune, checkDuplicateRequest, isLoading: fortuneLoading } = useDailyCache();
  const { currentLanguage } = useLanguage();
  const { user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [readingMode, setReadingMode] = useState('self');
  const [showInfoSheet, setShowInfoSheet] = useState(false);
  const isKeyboardVisible = useKeyboardVisibility();
  
  // Tarih seçici state'leri
  const [dogumTarihi, setDogumTarihi] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const profileBirthDate = user?.birth_date || '';
  const hasProfileBirthDate = Boolean(profileBirthDate);

  const formatToDDMMYYYY = (value) => {
    if (!value) return '';
    if (typeof value === 'string' && value.includes('-')) {
      const [yyyy, mm, dd] = value.split('-');
      if (yyyy && mm && dd) return `${dd.padStart(2,'0')}-${mm.padStart(2,'0')}-${yyyy}`;
    }
    const dateObj = new Date(value);
    if (!isNaN(dateObj)) {
      const dd = String(dateObj.getDate()).padStart(2,'0');
      const mm = String(dateObj.getMonth() + 1).padStart(2,'0');
      const yyyy = dateObj.getFullYear();
      return `${dd}-${mm}-${yyyy}`;
    }
    return String(value);
  };

  // Token ve premium durumunu yükle
  useEffect(() => {
    fetchBalance();
    fetchStatus();
    // Interstitial reklamını önceden yükle
    preloadInterstitialAd();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (readingMode === 'self') {
        refreshProfile().catch(() => {});
      }
    }, [readingMode, refreshProfile])
  );

  // Tarih değişikliği handler'ı
  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (selectedDate) {
      setSelectedDate(selectedDate);
      // Timezone sorununu çözmek için yerel tarih formatı kullan
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      setDogumTarihi(formattedDate);
    }
  };

  const handleDateConfirm = () => {
    setShowDatePicker(false);
  };

  const handleDailyFortune = async () => {
    const effectiveBirthDate = readingMode === 'self' ? profileBirthDate : dogumTarihi;

    // Doğum tarihi kontrolü
    if (!effectiveBirthDate) {
      if (readingMode === 'self') {
        showConfirm(
          t('common.info'),
          t('common.profileInfoMissing'),
          () => navigation.navigate('EditProfile'),
          null,
          'warning'
        );
      } else {
        showError(t('daily.selectBirthDate'));
      }
      return;
    }

    // Token kontrolü (Premium değilse)
    if (!hasPremium && balance < TOKEN_COSTS.DAILY) {
      setShowTokenModal(true);
      return;
    }

    setLoading(true);

    try {
      const fortuneData = {
        dogumTarihi: effectiveBirthDate,
        language: currentLanguage,
        reading_for: readingMode,
      };
      
      // Aynı bilgilerle fal baktırılıp baktırılmadığını kontrol et
      if (checkDuplicateRequest(fortuneData)) {
        showInfo(t('daily.duplicateRequestInfo'));
        setLoading(false);
        return;
      }
      
      // Fal sonucunu al (cache kontrolü ile)
      const result = await getFortune.mutateAsync(fortuneData);
      
      // Token bakiyesini güncelle
      await fetchBalance();
      
      if (result.data.success) {
        // Premium değilse önce reklam göster
        if (!hasPremium) {
          try {
            await showInterstitialAd();
                  } catch (adError) {
          console.log('Ad could not be shown:', adError);
          // Reklam hatası olsa da devam et
        }
        }
        
        navigation.navigate('Daily Sonuç', {
          zodiac_sign: result.data.zodiac_sign,
          date: result.data.date,
          yorum: result.data.yorum
        });
      } else {
        showError(result.data.error || t('errors.general'));
      }
    } catch (error) {
      console.error('Error:', error);
      
      const errorMessage = error.response?.data?.error || error.message || t('errors.general');
      
      // Token hatası ise özel mesaj göster
      if (errorMessage.includes('insufficient tokens')) {
        setShowTokenModal(true);
      } else if (error.response?.data?.error?.includes('Doğum tarihiniz bulunamadı')) {
        showConfirm(
          'Doğum Tarihi Gerekli',
          'Günlük burç yorumu için doğum tarihiniz gereklidir. Lütfen profil bilgilerinizi tamamlayın.',
          () => navigation.navigate('EditProfile'),
          null,
          'warning'
        );
      } else if (error.response?.data?.error?.includes('Burç bilginiz bulunamadı')) {
        showConfirm(
          'Burç Bilgisi Gerekli',
          'Günlük fal için burç bilginiz gereklidir. Lütfen profil bilgilerinizi güncelleyin.',
          () => navigation.navigate('EditProfile'),
          null,
          'warning'
        );
      } else if (error.name === 'AbortError') {
        showError(t('errors.timeout'));
      } else {
        showError(t('daily.unexpectedError'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0D0B1F" />
        
        <LinearGradient
          colors={['#0D0B1F', '#1B1B2F', '#2A2A3F']}
          style={styles.gradientBg}
        >
        {/* Main Content */}
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
              <TouchableOpacity
                onPress={() => setShowInfoSheet(true)}
                style={styles.infoButtonInCard}
              >
                <Ionicons name="information-circle-outline" size={22} color="#FFFFFF" />
              </TouchableOpacity>
              
              <Text style={styles.title}>{t('daily.dailyZodiacTitle')}</Text>
              <Text style={styles.subtitle}>
                {t('daily.dailyZodiacSubtitle')}
              </Text>
              
                              {/* Token ve Premium Bilgisi */}

              
              <View style={styles.originInCard}>
                <Ionicons name="globe" size={16} color="#C5A100" />
                <Text style={styles.originTextInCard}>{t('daily.ancientMesopotamia')}</Text>
              </View>
            </LinearGradient>
          </View>

          <ReadingModeCard
            title={t('common.whoIsThisReadingFor')}
            subtitle={t('common.readingModeHint')}
            mode={readingMode}
            onChangeMode={setReadingMode}
            selfLabel={t('common.forMe')}
            otherLabel={t('common.forSomeoneElse')}
            badgeLabel={t('common.profileSummary')}
            summaryTitle={t('common.profileInfoWillBeUsed')}
            summaryDescription={t('common.profileInfoWillBeUsed')}
            canUseProfile={hasProfileBirthDate}
            missingMessage={t('common.profileInfoMissing')}
            onPrimaryAction={() => navigation.navigate('EditProfile')}
            primaryActionLabel={hasProfileBirthDate ? t('common.editProfileInfo') : t('common.completeProfile')}
            summaryItems={
              hasProfileBirthDate
                ? [
                    {
                      icon: 'calendar-outline',
                      label: t('daily.dailybirthDate'),
                      value: formatToDDMMYYYY(profileBirthDate),
                    },
                  ]
                : []
            }
          />

          {readingMode === 'other' ? (
            <View style={styles.dateCard}>
              <Text style={styles.cardTitle}>{t('daily.dailybirthDate')}</Text>
              
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateButtonText}>
                  {dogumTarihi ? formatToDDMMYYYY(dogumTarihi) : t('daily.selectBirthDate')}
                </Text>
                <Ionicons name="calendar" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Submit Button */}
          <FortunePrimaryButton
            label={t('daily.getDailyZodiac')}
            loadingLabel={t('daily.fortuneBeingPrepared')}
            loading={loading || fortuneLoading}
            disabled={loading || fortuneLoading}
            onPress={handleDailyFortune}
            style={styles.submitButton}
          />
        </ScrollView>
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
        requiredTokens={TOKEN_COSTS.DAILY}
        readingType="daily"
      />
      <FortuneLoadingOverlay visible={loading || fortuneLoading} readingType="daily" />
      <FortuneInfoSheet
        visible={showInfoSheet}
        onClose={() => setShowInfoSheet(false)}
        title={t('daily.dailyZodiacTitle')}
        subtitle={t('daily.dailyZodiacSubtitle')}
        sections={[
          {
            title: t('daily.aboutDailyZodiac'),
            body: t('daily.infoDescription'),
            icon: 'sunny-outline',
          },
        ]}
        tips={[
          t('daily.loveRelationships'),
          t('daily.careerWork'),
          t('daily.health'),
          t('daily.finance'),
        ]}
      />

      {/* Date Picker - Platform Specific */}
      {Platform.OS === 'ios' ? (
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.modalButton}>{t('common.cancel')}</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>{t('daily.selectBirthDate')}</Text>
                <TouchableOpacity onPress={handleDateConfirm}>
                  <Text style={styles.modalButton}>{t('common.ok')}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.pickerContainer}>
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  minimumDate={new Date('1945-01-01')}
                  maximumDate={new Date('2010-12-31')}
                  textColor="#FFFFFF"
                  themeVariant="dark"
                />
              </View>
            </View>
          </View>
        </Modal>
      ) : (
        showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date('1945-01-01')}
            maximumDate={new Date('2010-12-31')}
            textColor="#FFFFFF"
            themeVariant="dark"
          />
        )
      )}
      {!hasPremium && !showInfoSheet && !isKeyboardVisible ? (
        <View style={styles.bannerAdContainer}>
          <AdMobBanner />
        </View>
      ) : null}
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
    paddingHorizontal: 0,
    paddingBottom: 120,
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
  dateCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 20,
    borderRadius: 24,
    marginHorizontal: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(197,161,0,0.10)',
  },
  cardTitle: {
    fontSize: 20,
    color: '#C5A100',
    marginBottom: 20,
    ...fontStyles.headingBold,
  },
  dateButton: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 18,
    minHeight: 56,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  dateButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    ...fontStyles.body,
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    marginHorizontal: 0,
    borderWidth: 1,
    borderColor: 'rgba(197, 161, 0, 0.1)',
    shadowColor: Platform.OS === 'ios' ? '#000' : 'transparent',
    shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 2 } : { width: 0, height: 0 },
    shadowOpacity: Platform.OS === 'ios' ? 0.1 : 0,
    shadowRadius: Platform.OS === 'ios' ? 8 : 0,
    elevation: Platform.OS === 'android' ? 3 : 0,
    width: '100%',
  },
  infoTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: 16,
    ...fontStyles.headingBold,
  },
  infoText: {
    fontSize: 16,
    color: '#CCCCCC',
    lineHeight: 26,
    marginBottom: 24,
    ...fontStyles.body,
  },
  featuresList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(197, 161, 0, 0.1)',
  },
  featureText: {
    fontSize: 16,
    color: '#FFFFFF',
    ...fontStyles.body,
  },
  tokenInfoContainer: {
    marginTop: 16,
    marginBottom: 12,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0D0B1F',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    color: '#C5A100',
    ...fontStyles.headingBold,
  },
  modalButton: {
    fontSize: 16,
    color: '#C5A100',
    ...fontStyles.bodyBold,
  },
  submitButton: {
    marginHorizontal: 18,
    marginBottom: 32,
  },
  pickerContainer: {
    backgroundColor: '#0D0B1F',
    alignItems: 'center',
    paddingVertical: 10,
  },
  bannerAdContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0D0B1F',
  },
});

export default DailyScreen; 
