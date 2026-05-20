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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import LazyImage from '../../components/LazyImage';
import FortuneInfoSheet from '../../components/FortuneInfoSheet';
import FortuneLoadingOverlay from '../../components/FortuneLoadingOverlay';
import TokenWarningModal from '../../components/TokenWarningModal';
import AdMobBanner from '../../components/AdMobBanner';
import { useCompatibilityCache } from '../../hooks/useFortuneCache';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNotification } from '../../context/NotificationContext';
import { usePremium } from '../../context/PremiumContext';
import { TOKEN_COSTS, useToken } from '../../context/TokenContext';
import { preloadInterstitialAd, showInterstitialAd } from '../../utils/interstitialAd';
import useKeyboardVisibility from '../../hooks/useKeyboardVisibility';
import FortunePrimaryButton from '../../components/FortunePrimaryButton';

const RELATIONSHIP_OPTIONS = ['ask', 'arkadaslik', 'genel'];

export default function CompatibilityFormScreen({ navigation }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { currentLanguage } = useLanguage();
  const { showError } = useNotification();
  const { balance, fetchBalance } = useToken();
  const { hasPremium, fetchStatus } = usePremium();
  const { getFortune, checkDuplicateRequest, isLoading: fortuneLoading } = useCompatibilityCache();

  const [kisi1Isim, setKisi1Isim] = useState('');
  const [kisi1DogumTarihi, setKisi1DogumTarihi] = useState('');
  const [kisi2Isim, setKisi2Isim] = useState('');
  const [kisi2DogumTarihi, setKisi2DogumTarihi] = useState('');
  const [iliskiTuru, setIliskiTuru] = useState('ask');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeDateField, setActiveDateField] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showInfoSheet, setShowInfoSheet] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const isKeyboardVisible = useKeyboardVisibility();
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

  const infoSections = useMemo(() => [
    { icon: 'heart-half', title: t('compatibility.whatIs'), body: t('compatibility.description') },
    { icon: 'chatbubble-ellipses', title: t('compatibility.sectionFlowTitle'), body: t('compatibility.sectionFlowBody') },
    { icon: 'sparkles', title: t('compatibility.sectionInsightTitle'), body: t('compatibility.sectionInsightBody') },
  ], [t]);

  const tips = useMemo(() => [t('compatibility.tip1'), t('compatibility.tip2'), t('compatibility.tip3')], [t]);

  const formatDisplayDate = useCallback((value) => {
    if (!value) return t('compatibility.selectBirthDate');
    if (value.includes('-')) {
      const [year, month, day] = value.split('-');
      return `${day}.${month}.${year}`;
    }
    return value;
  }, [t]);

  const openDatePicker = useCallback((field) => {
    setActiveDateField(field);
    setShowDatePicker(true);
  }, []);

  const handleDateChange = useCallback((event, nextDate) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (!nextDate || !activeDateField) return;

    setSelectedDate(nextDate);
    const year = nextDate.getFullYear();
    const month = String(nextDate.getMonth() + 1).padStart(2, '0');
    const day = String(nextDate.getDate()).padStart(2, '0');
    const formatted = `${year}-${month}-${day}`;

    if (activeDateField === 'kisi1') setKisi1DogumTarihi(formatted);
    if (activeDateField === 'kisi2') setKisi2DogumTarihi(formatted);
  }, [activeDateField]);

  const useProfileForFirstPerson = useCallback(() => {
    if (!hasProfileData) {
      navigation.navigate('EditProfile');
      return;
    }
    setKisi1Isim(profileName);
    setKisi1DogumTarihi(profileBirthDate);
  }, [hasProfileData, navigation, profileBirthDate, profileName]);

  const handleSubmit = useCallback(async () => {
    if (!kisi1Isim.trim()) return showError(t('compatibility.enterFirstName'));
    if (!kisi1DogumTarihi) return showError(t('compatibility.selectFirstBirthDate'));
    if (!kisi2Isim.trim()) return showError(t('compatibility.enterSecondName'));
    if (!kisi2DogumTarihi) return showError(t('compatibility.selectSecondBirthDate'));

    if (!hasPremium && balance < TOKEN_COSTS.COMPATIBILITY) {
      setShowTokenModal(true);
      return;
    }

    const payload = {
      kisi1Isim: kisi1Isim.trim(),
      kisi1DogumTarihi,
      kisi2Isim: kisi2Isim.trim(),
      kisi2DogumTarihi,
      iliskiTuru,
      language: currentLanguage,
      readingTier: hasPremium ? 'premium' : 'free',
    };

    if (checkDuplicateRequest(payload)) {
      showError(t('compatibility.duplicateRequestInfo'));
      return;
    }

    setLoading(true);
    try {
      const result = await getFortune.mutateAsync(payload);
      if (!hasPremium) {
        await fetchBalance();
        try {
          await showInterstitialAd();
        } catch (_error) {}
      }

      navigation.navigate('Compatibility Sonuç', {
        yorum: result.data.yorum,
        analysis: result.data.analysis,
        readingTier: result.data.reading_tier || (hasPremium ? 'premium' : 'free'),
        pair: payload,
      });
    } catch (error) {
      const message = error.response?.data?.error || t('common.error');
      if (message.includes('Yetersiz token')) {
        setShowTokenModal(true);
      } else {
        showError(message);
      }
    } finally {
      setLoading(false);
    }
  }, [balance, checkDuplicateRequest, currentLanguage, fetchBalance, getFortune, hasPremium, iliskiTuru, kisi1DogumTarihi, kisi1Isim, kisi2DogumTarihi, kisi2Isim, navigation, showError, t]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0D0B1F" />
        <LinearGradient colors={['#0D0B1F', '#1B1B2F', '#2A2A3F']} style={styles.gradientBg}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              <View style={styles.headerSection}>
                <LazyImage
                  source={require('../../assets/backgrounds/yildizname.jpg')}
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
                  <Text style={styles.title}>{t('compatibility.title')}</Text>
                  <Text style={styles.subtitle}>{t('compatibility.subtitle')}</Text>
                </LinearGradient>
              </View>

              <View style={styles.content}>
                <View style={styles.formCard}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.cardTitle}>{t('compatibility.personOne')}</Text>
                    <TouchableOpacity style={styles.profileUseButton} onPress={useProfileForFirstPerson}>
                      <Ionicons name="sparkles" size={14} color="#C5A100" />
                      <Text style={styles.profileUseText}>{t('compatibility.useMyProfile')}</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.label}>{t('compatibility.name')}</Text>
                  <TextInput
                    style={styles.input}
                    value={kisi1Isim}
                    onChangeText={setKisi1Isim}
                    placeholder={t('compatibility.firstNamePlaceholder')}
                    placeholderTextColor="rgba(255,255,255,0.34)"
                  />

                  <Text style={styles.label}>{t('compatibility.birthDate')}</Text>
                  <TouchableOpacity style={styles.dateButton} onPress={() => openDatePicker('kisi1')}>
                    <Ionicons name="calendar-outline" size={18} color="#C5A100" />
                    <Text style={[styles.dateText, !kisi1DogumTarihi && styles.datePlaceholder]}>
                      {formatDisplayDate(kisi1DogumTarihi)}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.formCard}>
                  <Text style={styles.cardTitle}>{t('compatibility.personTwo')}</Text>
                  <Text style={styles.label}>{t('compatibility.name')}</Text>
                  <TextInput
                    style={styles.input}
                    value={kisi2Isim}
                    onChangeText={setKisi2Isim}
                    placeholder={t('compatibility.secondNamePlaceholder')}
                    placeholderTextColor="rgba(255,255,255,0.34)"
                  />

                  <Text style={styles.label}>{t('compatibility.birthDate')}</Text>
                  <TouchableOpacity style={styles.dateButton} onPress={() => openDatePicker('kisi2')}>
                    <Ionicons name="calendar-outline" size={18} color="#C5A100" />
                    <Text style={[styles.dateText, !kisi2DogumTarihi && styles.datePlaceholder]}>
                      {formatDisplayDate(kisi2DogumTarihi)}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.segmentCard}>
                  <Text style={styles.cardTitle}>{t('compatibility.relationshipType')}</Text>
                  <View style={styles.segmentWrap}>
                    {RELATIONSHIP_OPTIONS.map((option) => {
                      const active = iliskiTuru === option;
                      return (
                        <TouchableOpacity
                          key={option}
                          style={[styles.segmentButton, active && styles.segmentButtonActive]}
                          onPress={() => setIliskiTuru(option)}
                        >
                          <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                            {t(`compatibility.${option}`)}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <FortunePrimaryButton
                  label={t('compatibility.getReading')}
                  icon="heart-half"
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
          title={t('compatibility.title')}
          subtitle={t('compatibility.subtitle')}
          sections={infoSections}
          tips={tips}
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
          requiredTokens={TOKEN_COSTS.COMPATIBILITY}
          readingType="compatibility"
        />

        <FortuneLoadingOverlay visible={loading || fortuneLoading} readingType="compatibility" />
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
  safeArea: { flex: 1, backgroundColor: '#0D0B1F' },
  container: { flex: 1, backgroundColor: '#0D0B1F' },
  gradientBg: { flex: 1 },
  scrollContent: { paddingBottom: 120 },
  headerSection: { height: 210, position: 'relative' },
  headerBackgroundImage: { position: 'absolute', width: '100%', height: '100%' },
  headerGradient: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 22, paddingTop: 20 },
  backButtonInCard: { position: 'absolute', top: 20, left: 20, width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(0,0,0,0.66)', alignItems: 'center', justifyContent: 'center' },
  infoButtonInCard: { position: 'absolute', top: 20, right: 20, width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(0,0,0,0.44)', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 34, fontWeight: '700', color: '#FFFFFF', textAlign: 'center', marginBottom: 10 },
  subtitle: { color: 'rgba(255,255,255,0.82)', fontSize: 16, lineHeight: 24, textAlign: 'center', maxWidth: 300 },
  content: { paddingHorizontal: 18, paddingTop: 18 },
  formCard: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: 'rgba(197,161,0,0.10)', marginBottom: 16 },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  cardTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', marginBottom: 12 },
  profileUseButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 999, backgroundColor: 'rgba(197,161,0,0.10)' },
  profileUseText: { color: '#C5A100', fontSize: 12, fontWeight: '700', marginLeft: 6 },
  label: { color: '#FFFFFF', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { height: 56, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 18, color: '#FFFFFF', marginBottom: 16 },
  dateButton: { height: 56, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18 },
  dateText: { color: '#FFFFFF', marginLeft: 10, fontSize: 15 },
  datePlaceholder: { color: 'rgba(255,255,255,0.34)' },
  segmentCard: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: 'rgba(197,161,0,0.10)', marginBottom: 18 },
  segmentWrap: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.035)', borderRadius: 18, padding: 5 },
  segmentButton: { flex: 1, minHeight: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  segmentButtonActive: { backgroundColor: '#C5A100' },
  segmentText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  segmentTextActive: { color: '#0D0B1F' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', paddingHorizontal: 18 },
  modalBackdrop: { ...StyleSheet.absoluteFillObject },
  modalContent: { backgroundColor: '#1B1B2F', borderRadius: 20, paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 10 : 0, borderWidth: 1, borderColor: 'rgba(197,161,0,0.14)' },
  modalDoneButton: { alignSelf: 'center', paddingHorizontal: 18, paddingVertical: 10 },
  modalDoneText: { color: '#C5A100', fontSize: 15, fontWeight: '700' },
  bannerAdContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#0D0B1F' },
});
