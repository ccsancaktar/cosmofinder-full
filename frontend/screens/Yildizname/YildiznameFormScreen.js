import React, { useState, useEffect, useCallback } from 'react';
import { View, Platform, TouchableWithoutFeedback, Keyboard, ScrollView, KeyboardAvoidingView, StatusBar, TouchableOpacity, Text, TextInput, StyleSheet, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import LazyImage from '../../components/LazyImage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useYildiznameCache } from '../../hooks/useFortuneCache';
import { useToken, TOKEN_COSTS } from '../../context/TokenContext';
import { usePremium } from '../../context/PremiumContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { showInterstitialAd, preloadInterstitialAd } from '../../utils/interstitialAd';
import TokenWarningModal from '../../components/TokenWarningModal';
import TimePickerField from '../../components/TimePickerField';
import FortuneLoadingOverlay from '../../components/FortuneLoadingOverlay';
import FortuneInfoSheet from '../../components/FortuneInfoSheet';
import ReadingModeCard from '../../components/ReadingModeCard';
import FortunePrimaryButton from '../../components/FortunePrimaryButton';
import AdMobBanner from '../../components/AdMobBanner';
import useKeyboardVisibility from '../../hooks/useKeyboardVisibility';
import { fontStyles } from '../../utils/fontStyles';

const YildiznameFormScreen = React.memo(({ navigation }) => {
  const { t } = useTranslation();
  const { showError, showWarning } = useNotification();
  const { balance, fetchBalance } = useToken();
  const { hasPremium, fetchStatus } = usePremium();
  const { getFortune, checkDuplicateRequest, isLoading: fortuneLoading } = useYildiznameCache();
  const { currentLanguage } = useLanguage();
  const { user, refreshProfile } = useAuth();
  const [isim, setIsim] = useState('');
  const [anneAdi, setAnneAdi] = useState('');
  const [dogumYeri, setDogumYeri] = useState('');
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
  const profileName = user?.first_name || user?.name || user?.username || '';
  const profileBirthDate = user?.birth_date || '';
  const profileBirthTime = user?.birth_time || '';
  const profileBirthPlace = user?.birth_place || '';
  const hasProfileData = Boolean(profileName && profileBirthDate && profileBirthTime && profileBirthPlace);

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
    const effectiveName = readingMode === 'self' ? profileName : isim.trim();
    const effectiveBirthDate = readingMode === 'self' ? profileBirthDate : dogumTarihi;
    const effectiveBirthTime = readingMode === 'self' ? profileBirthTime : dogumSaati;
    const effectiveBirthPlace = readingMode === 'self' ? profileBirthPlace : dogumYeri.trim();
    
    if (!effectiveName) {
      if (readingMode === 'self') {
        showWarning(t('common.profileInfoMissing'));
        navigation.navigate('EditProfile');
      } else {
        showError(t('yildizname.enterName'));
      }
      return;
    }
    
    if (!anneAdi.trim()) {
      showError(t('yildizname.enterMotherName'));
      return;
    }
    
    if (!effectiveBirthDate) {
      if (readingMode === 'self') {
        showWarning(t('common.profileInfoMissing'));
        navigation.navigate('EditProfile');
      } else {
        showError(t('yildizname.selectBirthDate'));
      }
      return;
    }
    
    if (!effectiveBirthTime) {
      if (readingMode === 'self') {
        showWarning(t('common.profileInfoMissing'));
        navigation.navigate('EditProfile');
      } else {
        showError(t('yildizname.enterBirthTime'));
      }
      return;
    }
    
    // Token kontrolü (Premium değilse)
    if (!hasPremium && balance < TOKEN_COSTS.YILDIZNAME) {
      setShowTokenModal(true);
      return;
    }
    
    setLoading(true);
    try {
      const fortuneData = {
        isim: effectiveName, 
        anneAdi, 
        dogumTarihi: effectiveBirthDate, 
        dogumYeri: effectiveBirthPlace, 
        dogumSaati: effectiveBirthTime,
        language: currentLanguage,
        readingTier: hasPremium ? 'premium' : 'free',
        reading_for: readingMode,
      };
      
      // Aynı bilgilerle fal baktırılıp baktırılmadığını kontrol et
      if (checkDuplicateRequest(fortuneData)) {
        showWarning(t('yildizname.duplicateRequestInfo'));
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
          console.log('Reklam gösterilemedi:', adError);
          // Reklam hatası olsa da devam et
        }
      }
      
      navigation.navigate('Sonuç', {
        yorum: result.data.yorum,
        analysis: result.data.analysis,
        readingTier: result.data.reading_tier,
      });
    } catch (err) {
      const errorMessage = err.response?.data?.error || t('yildizname.generalError');
      
      // Token hatası ise özel mesaj göster
      if (errorMessage.includes('Yetersiz token')) {
        setShowTokenModal(true);
      } else {
        showError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [readingMode, profileName, profileBirthDate, profileBirthTime, profileBirthPlace, isim, anneAdi, dogumTarihi, dogumYeri, dogumSaati, hasPremium, balance, navigation, fetchBalance, getFortune, checkDuplicateRequest]);

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
                  <TouchableOpacity
                    onPress={() => setShowInfoSheet(true)}
                    style={styles.infoButtonInCard}
                  >
                    <Ionicons name="information-circle-outline" size={22} color="#FFFFFF" />
                  </TouchableOpacity>
                  
                  <Text style={styles.title}>{t('yildizname.yildiznameFortune')}</Text>
                  <Text style={styles.subtitle}>
                    {t('yildizname.yildiznameSubtitle')}
                  </Text>
                  
                                    {/* Token ve Premium Bilgisi */}

                  
                  <View style={styles.originInCard}>
                    <Ionicons name="globe" size={16} color="#C5A100" />
                <Text style={styles.originTextInCard}>{t('yildizname.turkey')}</Text>
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
                canUseProfile={hasProfileData}
                missingMessage={t('common.profileInfoMissing')}
                onPrimaryAction={() => navigation.navigate('EditProfile')}
                primaryActionLabel={hasProfileData ? t('common.editProfileInfo') : t('common.completeProfile')}
                summaryItems={
                  hasProfileData
                    ? [
                        { icon: 'person-outline', label: t('yildizname.name'), value: profileName },
                        { icon: 'calendar-outline', label: t('yildizname.yildiznamebirthDate'), value: formatToDDMMYYYY(profileBirthDate) },
                        { icon: 'time-outline', label: t('yildizname.birthTime'), value: profileBirthTime },
                        { icon: 'location-outline', label: t('yildizname.birthPlace'), value: profileBirthPlace },
                      ]
                    : []
                }
              />

              <View style={styles.personalCard}>
                <Text style={styles.cardTitle}>{t('yildizname.personalInfo')}</Text>
                {readingMode === 'other' ? (
                  <View style={styles.inputContainer}>
                    <Ionicons name="person" size={24} color="#C5A100" style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder={t('yildizname.name')}
                      placeholderTextColor="#999999"
                      value={isim}
                      onChangeText={setIsim}
                    />
                  </View>
                ) : null}
                <View style={styles.inputContainer}>
                  <Ionicons name="heart" size={24} color="#C5A100" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder={t('yildizname.motherName')}
                    placeholderTextColor="#999999"
                    value={anneAdi}
                    onChangeText={setAnneAdi}
                  />
                </View>
              </View>

              {readingMode === 'other' ? (
                <>

                  <View style={styles.dateCard}>
                    <Text style={styles.cardTitle}>{t('yildizname.yildiznamebirthDate')}</Text>
                    <TouchableOpacity
                      style={styles.dateButton}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <Text style={styles.dateButtonText}>
                        {dogumTarihi ? formatToDDMMYYYY(dogumTarihi) : t('yildizname.selectBirthDate')}
                      </Text>
                      <Ionicons name="calendar" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.timeCard}>
                    <Text style={styles.cardTitle}>{t('yildizname.birthTime')}</Text>
                    <TimePickerField
                      value={dogumSaati}
                      onChange={setDogumSaati}
                      placeholder={t('yildizname.enterBirthTime')}
                      title={t('yildizname.birthTime')}
                      cancelLabel={t('common.cancel')}
                      confirmLabel={t('common.ok')}
                      locale={pickerLocale}
                    />
                  </View>

                  <View style={styles.locationCard}>
                    <Text style={styles.cardTitle}>{t('yildizname.birthPlace')}</Text>
                    <View style={styles.inputContainer}>
                      <Ionicons name="location" size={24} color="#C5A100" style={styles.inputIcon} />
                      <TextInput
                        style={styles.textInput}
                        placeholder={t('yildizname.birthPlacePlaceholder')}
                        placeholderTextColor="#999999"
                        value={dogumYeri}
                        onChangeText={setDogumYeri}
                      />
                    </View>
                  </View>
                </>
              ) : null}

              <FortunePrimaryButton
                label={t('yildizname.sendMyFortune')}
                loadingLabel={t('yildizname.fortuneBeingInterpreted')}
                loading={loading || fortuneLoading}
                disabled={loading || fortuneLoading}
                onPress={handleSubmit}
                style={styles.submitButton}
              />
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
        requiredTokens={TOKEN_COSTS.YILDIZNAME}
        readingType="yildizname"
      />
      <FortuneLoadingOverlay visible={loading || fortuneLoading} readingType="yildizname" />
      <FortuneInfoSheet
        visible={showInfoSheet}
        onClose={() => setShowInfoSheet(false)}
        title={t('yildizname.yildiznameFortune')}
        subtitle={t('yildizname.yildiznameSubtitle')}
        sections={[
          {
            title: t('yildizname.whatIsYildizname'),
            body: t('yildizname.yildiznameDescription'),
            icon: 'star-outline',
          },
          {
            title: t('yildizname.howToRead'),
            body: t('yildizname.howToReadDescription'),
            icon: 'compass-outline',
          },
        ]}
        tips={[
          t('yildizname.yildiznametip1'),
          t('yildizname.yildiznametip2'),
          t('yildizname.yildiznametip3'),
          t('yildizname.yildiznametip4'),
        ]}
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
                <Text style={styles.modalTitle}>{t('yildizname.selectBirthDateTitle')}</Text>
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
    paddingHorizontal: 0,
    paddingBottom: 120,
  },

  bilgiButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginLeft: 10,
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
  personalCard: {
    backgroundColor: '#1B1B2F',
    padding: 24,
    borderRadius: 0,
    marginHorizontal: 0,
    marginBottom: 24,
    elevation: Platform.OS === 'android' ? 4 : 0,
    shadowColor: Platform.OS === 'ios' ? '#000' : 'transparent',
    shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 4 } : { width: 0, height: 0 },
    shadowOpacity: Platform.OS === 'ios' ? 0.3 : 0,
    shadowRadius: Platform.OS === 'ios' ? 8 : 0,
    width: '100%',
  },
  cardTitle: {
    fontSize: 20,
    color: '#C5A100',
    marginBottom: 20,
    ...fontStyles.headingBold,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(197, 161, 0, 0.2)',
    shadowColor: Platform.OS === 'ios' ? '#000' : 'transparent',
    shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 2 } : { width: 0, height: 0 },
    shadowOpacity: Platform.OS === 'ios' ? 0.1 : 0,
    shadowRadius: Platform.OS === 'ios' ? 8 : 0,
    elevation: Platform.OS === 'android' ? 1 : 0,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#fff',
    ...fontStyles.body,
  },
  dateCard: {
    backgroundColor: '#1B1B2F',
    padding: 24,
    borderRadius: 0,
    marginHorizontal: 0,
    marginBottom: 24,
    elevation: Platform.OS === 'android' ? 4 : 0,
    shadowColor: Platform.OS === 'ios' ? '#000' : 'transparent',
    shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 4 } : { width: 0, height: 0 },
    shadowOpacity: Platform.OS === 'ios' ? 0.3 : 0,
    shadowRadius: Platform.OS === 'ios' ? 8 : 0,
    width: '100%',
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
  timeCard: {
    backgroundColor: '#1B1B2F',
    padding: 24,
    borderRadius: 0,
    marginHorizontal: 0,
    marginBottom: 24,
    elevation: Platform.OS === 'android' ? 4 : 0,
    shadowColor: Platform.OS === 'ios' ? '#000' : 'transparent',
    shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 4 } : { width: 0, height: 0 },
    shadowOpacity: Platform.OS === 'ios' ? 0.3 : 0,
    shadowRadius: Platform.OS === 'ios' ? 8 : 0,
    width: '100%',
  },
  inputLabel: {
    fontSize: 14,
    color: '#C5A100',
    marginBottom: 8,
    ...fontStyles.bodyBold,
  },
  locationCard: {
    backgroundColor: '#1B1B2F',
    padding: 24,
    borderRadius: 0,
    marginHorizontal: 0,
    marginBottom: 24,
    elevation: Platform.OS === 'android' ? 4 : 0,
    shadowColor: Platform.OS === 'ios' ? '#000' : 'transparent',
    shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 4 } : { width: 0, height: 0 },
    shadowOpacity: Platform.OS === 'ios' ? 0.3 : 0,
    shadowRadius: Platform.OS === 'ios' ? 8 : 0,
    width: '100%',
  },
  errorCard: {
    marginHorizontal: 0,
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#dc3545',
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#dc3545',
    borderWidth: 1,
    borderColor: 'rgba(220, 53, 69, 0.3)',
    shadowColor: Platform.OS === 'ios' ? '#000' : 'transparent',
    shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 2 } : { width: 0, height: 0 },
    shadowOpacity: Platform.OS === 'ios' ? 0.1 : 0,
    shadowRadius: Platform.OS === 'ios' ? 8 : 0,
    elevation: Platform.OS === 'android' ? 3 : 0,
  },
  errorText: {
    color: '#fff',
    fontSize: 14,
    ...fontStyles.body,
  },
  submitButton: {
    marginBottom: 32,
  },
  submitButtonDisabled: {
    opacity: 0.6,
    backgroundColor: '#666',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 20,
    marginLeft: 12,
    ...fontStyles.bodyBold,
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
  pickerContainer: {
    backgroundColor: '#0D0B1F',
    alignItems: 'center',
    paddingVertical: 10,
  },
  dateButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: Platform.OS === 'ios' ? '#000' : 'transparent',
    shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 2 } : { width: 0, height: 0 },
    shadowOpacity: Platform.OS === 'ios' ? 0.1 : 0,
    shadowRadius: Platform.OS === 'ios' ? 8 : 0,
    elevation: Platform.OS === 'android' ? 1 : 0,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  bannerAdContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0D0B1F',
  },
});

export default YildiznameFormScreen;
