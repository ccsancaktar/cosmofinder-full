import React, { useState, useEffect, useCallback } from 'react';
import { View, Platform, ScrollView, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, StatusBar, TouchableOpacity, Text, StyleSheet, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import LazyImage from '../../components/LazyImage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useChineseCache } from '../../hooks/useFortuneCache';
import { useToken, TOKEN_COSTS } from '../../context/TokenContext';
import { usePremium } from '../../context/PremiumContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { showInterstitialAd, preloadInterstitialAd } from '../../utils/interstitialAd';
import TokenWarningModal from '../../components/TokenWarningModal';
import TimePickerField from '../../components/TimePickerField';
import FortuneLoadingOverlay from '../../components/FortuneLoadingOverlay';
import ReadingModeCard from '../../components/ReadingModeCard';
import FortuneInfoSheet from '../../components/FortuneInfoSheet';
import AdMobBanner from '../../components/AdMobBanner';
import useKeyboardVisibility from '../../hooks/useKeyboardVisibility';
import { fontStyles } from '../../utils/fontStyles';
import FortunePrimaryButton from '../../components/FortunePrimaryButton';

const ChineseFormScreen = React.memo(({ navigation }) => {
  const { t } = useTranslation();
  const { showError, showWarning, showInfo } = useNotification();
  const { balance, fetchBalance } = useToken();
  const { hasPremium, fetchStatus } = usePremium();
  const { getFortune, checkDuplicateRequest, isLoading: fortuneLoading } = useChineseCache();
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
  const pickerLocale = currentLanguage === 'de' ? 'de_DE' : currentLanguage === 'en' ? 'en_US' : 'tr_TR';
  
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
  
  const [dogumSaati, setDogumSaati] = useState('');
  const profileBirthDate = user?.birth_date || '';
  const profileBirthTime = user?.birth_time || '';
  const hasProfileData = Boolean(profileBirthDate && profileBirthTime);

  // Token ve premium durumunu yükle
  useEffect(() => {
    fetchBalance();
    fetchStatus();
    // Interstitial reklamını önceden yükle
    preloadInterstitialAd();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (readingMode === 'self') {
        refreshProfile().catch(() => {});
      }
    }, [readingMode, refreshProfile])
  );

  // Tarih değişikliği handler'ı - useCallback ile optimize edildi
  const handleDateChange = useCallback((event, selectedDate) => {
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
  }, []);

  const handleDateConfirm = useCallback(() => {
    setShowDatePicker(false);
  }, []);

  const handleSubmit = useCallback(async () => {
    const effectiveBirthDate = readingMode === 'self' ? profileBirthDate : dogumTarihi;
    const effectiveBirthTime = readingMode === 'self' ? profileBirthTime : dogumSaati;
    
    if (!effectiveBirthDate) {
      if (readingMode === 'self') {
        showWarning(t('common.profileInfoMissing'));
        navigation.navigate('EditProfile');
      } else {
        showError(t('chinese.selectBirthDate'));
      }
      return;
    }
    
    if (!effectiveBirthTime) {
      if (readingMode === 'self') {
        showWarning(t('common.profileInfoMissing'));
        navigation.navigate('EditProfile');
      } else {
        showError(t('chinese.enterBirthTime'));
      }
      return;
    }
    
    // Token kontrolü (Premium değilse)
    if (!hasPremium && balance < TOKEN_COSTS.CHINESE) {
      setShowTokenModal(true);
      return;
    }
    
    setLoading(true);
    try {
      const fortuneData = {
        dogumTarihi: effectiveBirthDate,
        dogumSaati: effectiveBirthTime,
        language: currentLanguage,
        readingTier: hasPremium ? 'premium' : 'free',
        reading_for: readingMode,
      };
      
      // Aynı bilgilerle fal baktırılıp baktırılmadığını kontrol et
      if (checkDuplicateRequest(fortuneData)) {
        showInfo(t('chinese.duplicateRequestInfo'));
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
      
      navigation.navigate('Chinese Sonuç', { 
        baZi: result.data.ba_zi,
        elements: result.data.element_counts,
        analysis: result.data.analysis,
        readingTier: result.data.reading_tier,
        yorum: result.data.yorum
      });
    } catch (err) {
      const errorMessage = err.response?.data?.error || t('chinese.generalError');
      
      // Token hatası ise özel mesaj göster
      if (errorMessage.includes('insufficient tokens')) {
        setShowTokenModal(true);
      } else {
        showError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [readingMode, profileBirthDate, profileBirthTime, dogumTarihi, dogumSaati, hasPremium, balance, checkDuplicateRequest, getFortune, fetchBalance, navigation]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0D0B1F" />
        
        <LinearGradient
          colors={['#0D0B1F', '#1B1B2F', '#2A2A3F']}
          style={styles.gradientBg}
        >
        <KeyboardAvoidingView 
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : Platform.OS === 'android' ? 20 : 0}
          enabled={true}
        >
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <ScrollView 
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
            >
              {/* Header Section */}
              <View style={styles.headerSection}>
                <LazyImage
                  source={require('../../assets/backgrounds/ba-zi.jpg')}
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
                  
                  <Text style={styles.title}>{t('chinese.baZiFortune')}</Text>
                  <Text style={styles.subtitle}>
                    {t('chinese.baZiSubtitle')}
                  </Text>
                  
                  {/* Token ve Premium Bilgisi */}

                  
                  <View style={styles.originInCard}>
                    <Ionicons name="globe" size={16} color="#C5A100" />
                <Text style={styles.originTextInCard}>{t('chinese.china')}</Text>
                  </View>
                </LinearGradient>
              </View>

              <View style={styles.content}>

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
                canUseProfile={hasProfileData}
                missingMessage={t('common.profileInfoMissing')}
                onPrimaryAction={() => navigation.navigate('EditProfile')}
                primaryActionLabel={hasProfileData ? t('common.editProfileInfo') : t('common.completeProfile')}
                summaryItems={
                  hasProfileData
                    ? [
                        {
                          icon: 'calendar-outline',
                          label: t('chinese.bazibirthDate'),
                          value: formatToDDMMYYYY(profileBirthDate),
                        },
                        {
                          icon: 'time-outline',
                          label: t('chinese.birthTime'),
                          value: profileBirthTime,
                        },
                      ]
                    : []
                }
              />

              {readingMode === 'other' ? (
                <>
                  <View style={styles.dateCard}>
                    <Text style={styles.cardTitle}>{t('chinese.bazibirthDate')}</Text>
                    
                    <TouchableOpacity
                      style={styles.dateButton}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <Text style={styles.dateButtonText}>
                        {dogumTarihi ? formatToDDMMYYYY(dogumTarihi) : t('chinese.selectBirthDate')}
                      </Text>
                      <Ionicons name="calendar" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.timeCard}>
                    <Text style={styles.cardTitle}>{t('chinese.birthTime')}</Text>
                    <TimePickerField
                      value={dogumSaati}
                      onChange={setDogumSaati}
                      placeholder={t('chinese.enterBirthTime')}
                      title={t('chinese.birthTime')}
                      cancelLabel={t('common.cancel')}
                      confirmLabel={t('common.ok')}
                      locale={pickerLocale}
                    />
                  </View>
                </>
              ) : null}

              {/* Submit Button */}
              <FortunePrimaryButton
                label={t('chinese.sendMyFortune')}
                loadingLabel={t('chinese.fortuneBeingInterpreted')}
                loading={loading || fortuneLoading}
                disabled={loading || fortuneLoading}
                onPress={handleSubmit}
                style={styles.submitButton}
              />
              </View>
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
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
        requiredTokens={TOKEN_COSTS.CHINESE}
        readingType="chinese"
      />
      <FortuneLoadingOverlay visible={loading || fortuneLoading} readingType="chinese" />
      <FortuneInfoSheet
        visible={showInfoSheet}
        onClose={() => setShowInfoSheet(false)}
        title={t('chinese.baZiFortune')}
        subtitle={t('chinese.baZiSubtitle')}
        sections={[
          {
            title: t('chinese.aboutBaZi'),
            body: t('chinese.baZiDescription'),
            icon: 'leaf-outline',
          },
        ]}
        tips={[t('chinese.bazitip1'), t('chinese.bazitip2'), t('chinese.bazitip3')]}
      />
      {!hasPremium && !showInfoSheet && !isKeyboardVisible ? (
        <View style={styles.bannerAdContainer}>
          <AdMobBanner />
        </View>
      ) : null}

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
                <Text style={styles.modalTitle}>{t('chinese.selectBirthDateTitle')}</Text>
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
                  locale={pickerLocale}
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
            locale={pickerLocale}
          />
        )
      )}
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
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  header: {
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Added for back button and info button
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
  dateCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 20,
    borderRadius: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(197,161,0,0.10)',
  },
  cardTitle: {
    fontSize: 20,
    color: '#C5A100',
    marginBottom: 16,
    ...fontStyles.headingBold,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateInputContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  inputLabel: {
    fontSize: 14,
    color: '#C5A100',
    marginBottom: 8,
    ...fontStyles.bodyBold,
  },
  dateInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 18,
    minHeight: 56,
    paddingHorizontal: 18,
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  timeCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 20,
    borderRadius: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(197,161,0,0.10)',
  },
  tipsCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 20,
    borderRadius: 24,
    marginBottom: 24,
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
    marginBottom: 32,
  },
  pickerContainer: {
    backgroundColor: '#0D0B1F',
    alignItems: 'center',
    paddingVertical: 10,
  },
  dateButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(197, 161, 0, 0.2)',
    shadowColor: Platform.OS === 'ios' ? '#000' : 'transparent',
    shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 2 } : { width: 0, height: 0 },
    shadowOpacity: Platform.OS === 'ios' ? 0.1 : 0,
    shadowRadius: Platform.OS === 'ios' ? 8 : 0,
    elevation: Platform.OS === 'android' ? 3 : 0,
  },
  dateButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
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

export default ChineseFormScreen; 
