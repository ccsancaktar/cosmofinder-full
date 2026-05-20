import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Keyboard,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import LazyImage from '../../components/LazyImage';
import ReadingModeCard from '../../components/ReadingModeCard';
import TokenWarningModal from '../../components/TokenWarningModal';
import FortuneLoadingOverlay from '../../components/FortuneLoadingOverlay';
import FortuneInfoSheet from '../../components/FortuneInfoSheet';
import { useNumerologyCache } from '../../hooks/useFortuneCache';
import { useToken, TOKEN_COSTS } from '../../context/TokenContext';
import { usePremium } from '../../context/PremiumContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { preloadInterstitialAd, showInterstitialAd } from '../../utils/interstitialAd';
import AdMobBanner from '../../components/AdMobBanner';
import useKeyboardVisibility from '../../hooks/useKeyboardVisibility';
import FortunePrimaryButton from '../../components/FortunePrimaryButton';

export default function NumerologyFormScreen({ navigation }) {
  const { t } = useTranslation();
  const { showError, showInfo, showWarning } = useNotification();
  const { balance, fetchBalance } = useToken();
  const { hasPremium, fetchStatus } = usePremium();
  const { currentLanguage } = useLanguage();
  const { user, refreshProfile } = useAuth();
  const { getFortune, checkDuplicateRequest, isLoading: fortuneLoading } = useNumerologyCache();

  const [isim, setIsim] = useState('');
  const [dogumTarihi, setDogumTarihi] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [showInfoSheet, setShowInfoSheet] = useState(false);
  const isKeyboardVisible = useKeyboardVisibility();
  const [readingMode, setReadingMode] = useState('self');
  const didInitRef = useRef(false);

  const profileName = user?.first_name || user?.name || user?.username || '';
  const profileBirthDate = user?.birth_date || '';
  const hasProfileData = Boolean(profileName && profileBirthDate);

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    fetchBalance();
    fetchStatus();
    preloadInterstitialAd();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (readingMode === 'self') {
        refreshProfile().catch(() => {});
      }
    }, [readingMode, refreshProfile])
  );

  const infoSections = useMemo(
    () => [
      {
        icon: 'grid',
        title: t('numerology.whatIs'),
        body: t('numerology.description'),
      },
      {
        icon: 'sparkles',
        title: t('numerology.sectionNumbersTitle'),
        body: t('numerology.sectionNumbersBody'),
      },
      {
        icon: 'compass',
        title: t('numerology.howWorks'),
        body: t('numerology.howWorksBody'),
      },
    ],
    [t]
  );

  const infoTips = useMemo(
    () => [t('numerology.tip1'), t('numerology.tip2'), t('numerology.tip3')],
    [t]
  );

  const handleDateChange = useCallback((event, nextDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (nextDate) {
      setSelectedDate(nextDate);
      const year = nextDate.getFullYear();
      const month = String(nextDate.getMonth() + 1).padStart(2, '0');
      const day = String(nextDate.getDate()).padStart(2, '0');
      setDogumTarihi(`${year}-${month}-${day}`);
    }
  }, []);

  const formatDisplayDate = useCallback((value) => {
    if (!value) return t('numerology.selectBirthDate');
    if (value.includes('-')) {
      const [year, month, day] = value.split('-');
      return `${day}.${month}.${year}`;
    }
    return value;
  }, [t]);

  const handleSubmit = useCallback(async () => {
    const effectiveName = readingMode === 'self' ? profileName : isim.trim();
    const effectiveBirthDate = readingMode === 'self' ? profileBirthDate : dogumTarihi;

    if (!effectiveName) {
      if (readingMode === 'self') {
        showWarning(t('common.profileInfoMissing'));
        navigation.navigate('EditProfile');
      } else {
        showError(t('numerology.enterName'));
      }
      return;
    }

    if (!effectiveBirthDate) {
      if (readingMode === 'self') {
        showWarning(t('common.profileInfoMissing'));
        navigation.navigate('EditProfile');
      } else {
        showError(t('numerology.selectBirthDateError'));
      }
      return;
    }

    if (!hasPremium && balance < TOKEN_COSTS.NUMEROLOGY) {
      setShowTokenModal(true);
      return;
    }

    const fortuneData = {
      isim: effectiveName,
      dogumTarihi: effectiveBirthDate,
      language: currentLanguage,
      readingTier: hasPremium ? 'premium' : 'free',
      reading_for: readingMode,
    };

    if (checkDuplicateRequest(fortuneData)) {
      showInfo(t('numerology.duplicateRequestInfo'));
      return;
    }

    setLoading(true);
    try {
      const result = await getFortune.mutateAsync(fortuneData);
      if (!hasPremium) {
        await fetchBalance();
      }

      if (result.data.success) {
        if (!hasPremium) {
          try {
            await showInterstitialAd();
          } catch (_error) {}
        }

        navigation.navigate('Numerology Sonuç', {
          yorum: result.data.yorum,
          analysis: result.data.analysis,
          original_name: result.data.original_name || effectiveName,
          birth_date: result.data.birth_date || effectiveBirthDate,
          readingTier: result.data.reading_tier || (hasPremium ? 'premium' : 'free'),
        });
      } else {
        showError(result.data.error || t('common.error'));
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || t('common.error');
      if (errorMessage.includes('Yetersiz token')) {
        setShowTokenModal(true);
      } else {
        showError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [
    balance,
    checkDuplicateRequest,
    currentLanguage,
    dogumTarihi,
    fetchBalance,
    getFortune,
    hasPremium,
    isim,
    navigation,
    profileBirthDate,
    profileName,
    readingMode,
    showError,
    showInfo,
    showWarning,
    t,
  ]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0D0B1F" />

        <LinearGradient colors={['#0D0B1F', '#1B1B2F', '#2A2A3F']} style={styles.gradientBg}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              <View style={styles.headerSection}>
                <LazyImage
                  source={require('../../assets/backgrounds/kabala.jpg')}
                  style={styles.headerBackgroundImage}
                  resizeMode="cover"
                  showPlaceholder={false}
                  fadeInDuration={450}
                />
                <LinearGradient colors={['rgba(0,0,0,0.58)', 'rgba(0,0,0,0.92)']} style={styles.headerGradient}>
                  <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonInCard}>
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setShowInfoSheet(true)} style={styles.infoButtonInCard}>
                    <Ionicons name="information-circle-outline" size={22} color="#FFFFFF" />
                  </TouchableOpacity>

                  <Text style={styles.title}>{t('numerology.title')}</Text>
                  <Text style={styles.subtitle}>{t('numerology.subtitle')}</Text>

                  <View style={styles.originInCard}>
                    <Ionicons name="grid" size={16} color="#C5A100" />
                    <Text style={styles.originTextInCard}>{t('numerology.originText')}</Text>
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
                  summaryTitle={t('common.profileSummary')}
                  summaryDescription={t('common.profileInfoWillBeUsed')}
                  summaryItems={[
                    { label: t('numerology.name'), value: profileName || '-', icon: 'person-outline' },
                    { label: t('numerology.birthDate'), value: profileBirthDate ? formatDisplayDate(profileBirthDate) : '-', icon: 'calendar-outline' },
                  ]}
                  canUseProfile={hasProfileData}
                  missingMessage={t('common.profileInfoMissing')}
                  onPrimaryAction={() => navigation.navigate('EditProfile')}
                  primaryActionLabel={t('common.editProfileInfo')}
                  badgeLabel={t('common.profileSummary')}
                />

                {readingMode === 'other' ? (
                  <View style={styles.formCard}>
                    <Text style={styles.cardTitle}>{t('numerology.personalInfo')}</Text>

                    <Text style={styles.label}>{t('numerology.name')}</Text>
                    <TextInput
                      style={styles.input}
                      value={isim}
                      onChangeText={setIsim}
                      placeholder={t('numerology.enterNamePlaceholder')}
                      placeholderTextColor="rgba(255,255,255,0.34)"
                    />

                    <Text style={styles.label}>{t('numerology.birthDate')}</Text>
                    <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
                      <Ionicons name="calendar-outline" size={18} color="#C5A100" />
                      <Text style={[styles.dateText, !dogumTarihi && styles.datePlaceholder]}>
                        {formatDisplayDate(dogumTarihi)}
                      </Text>
                    </TouchableOpacity>
                    <Text style={styles.helperText}>{t('numerology.birthDateHint')}</Text>
                  </View>
                ) : (
                  <View style={styles.profileCard}>
                    <Text style={styles.cardTitle}>{t('numerology.profileReadyTitle')}</Text>
                    <Text style={styles.profileCardText}>{t('numerology.profileReadyBody')}</Text>
                  </View>
                )}

                <FortunePrimaryButton
                  label={t('numerology.getReading')}
                  onPress={handleSubmit}
                  disabled={loading || fortuneLoading}
                  loading={loading || fortuneLoading}
                />
              </View>
            </ScrollView>
          </TouchableWithoutFeedback>
        </LinearGradient>

        {showDatePicker && (
          <Modal visible transparent animationType="fade" onRequestClose={() => setShowDatePicker(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={() => setShowDatePicker(false)}>
                <View style={styles.modalBackdrop} />
              </TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                  themeVariant="dark"
                  locale={currentLanguage === 'de' ? 'de-DE' : currentLanguage === 'en' ? 'en-US' : 'tr-TR'}
                />
                {Platform.OS === 'ios' ? (
                  <TouchableOpacity style={styles.modalDoneButton} onPress={() => setShowDatePicker(false)}>
                    <Text style={styles.modalDoneText}>{t('common.confirm')}</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          </Modal>
        )}

        <FortuneInfoSheet
          visible={showInfoSheet}
          onClose={() => setShowInfoSheet(false)}
          title={t('numerology.title')}
          subtitle={t('numerology.subtitle')}
          sections={infoSections}
          tips={infoTips}
          accentColor="#C5A100"
        />

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
          requiredTokens={TOKEN_COSTS.NUMEROLOGY}
          readingType="numerology"
        />

        <FortuneLoadingOverlay visible={loading || fortuneLoading} readingType="numerology" />
      {!hasPremium && !showInfoSheet && !isKeyboardVisible ? (
        <View style={styles.bannerAdContainer}>
          <AdMobBanner />
        </View>
      ) : null}
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
  scrollContent: {
    paddingBottom: 120,
  },
  headerSection: {
    height: 210,
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
    paddingHorizontal: 22,
    paddingTop: 20,
  },
  backButtonInCard: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0,0,0,0.66)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoButtonInCard: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0,0,0,0.44)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: 280,
  },
  originInCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  originTextInCard: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontSize: 13,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  formCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(197,161,0,0.10)',
    marginBottom: 18,
  },
  profileCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(197,161,0,0.10)',
    marginBottom: 18,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 18,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  dateButton: {
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  dateText: {
    color: '#FFFFFF',
    marginLeft: 10,
    fontSize: 15,
  },
  datePlaceholder: {
    color: 'rgba(255,255,255,0.34)',
  },
  helperText: {
    color: 'rgba(255,255,255,0.54)',
    fontSize: 13,
    marginTop: 10,
  },
  profileCardText: {
    color: 'rgba(255,255,255,0.74)',
    fontSize: 14,
    lineHeight: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    backgroundColor: '#1B1B2F',
    borderRadius: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 10 : 0,
    borderWidth: 1,
    borderColor: 'rgba(197,161,0,0.14)',
  },
  modalDoneButton: {
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  modalDoneText: {
    color: '#C5A100',
    fontSize: 15,
    fontWeight: '700',
  },
  bannerAdContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0D0B1F',
  },
});
