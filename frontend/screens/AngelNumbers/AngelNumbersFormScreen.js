import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import LazyImage from '../../components/LazyImage';
import FortuneInfoSheet from '../../components/FortuneInfoSheet';
import FortuneLoadingOverlay from '../../components/FortuneLoadingOverlay';
import TokenWarningModal from '../../components/TokenWarningModal';
import AdMobBanner from '../../components/AdMobBanner';
import { useAngelNumbersCache } from '../../hooks/useFortuneCache';
import { useLanguage } from '../../context/LanguageContext';
import { useNotification } from '../../context/NotificationContext';
import { usePremium } from '../../context/PremiumContext';
import { TOKEN_COSTS, useToken } from '../../context/TokenContext';
import useKeyboardVisibility from '../../hooks/useKeyboardVisibility';

const DAILY_NUMBER_SEQUENCE = ['111', '222', '333', '444', '555', '777', '888', '999', '1111'];

export default function AngelNumbersFormScreen({ navigation }) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { showError } = useNotification();
  const { balance, fetchBalance } = useToken();
  const { hasPremium, fetchStatus } = usePremium();
  const { getFortune, checkDuplicateRequest, isLoading: fortuneLoading } = useAngelNumbersCache();
  const [sayi, setSayi] = useState('');
  const [loading, setLoading] = useState(false);
  const [showInfoSheet, setShowInfoSheet] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const isKeyboardVisible = useKeyboardVisibility();
  const didInitRef = useRef(false);
  const todayNumber = useMemo(() => {
    const now = new Date();
    const seed = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
    const index = Array.from(seed).reduce((total, char) => total + char.charCodeAt(0), 0) % DAILY_NUMBER_SEQUENCE.length;
    return DAILY_NUMBER_SEQUENCE[index];
  }, []);

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    fetchBalance();
    fetchStatus();
  }, []);

  const infoSections = useMemo(() => [
    { icon: 'sparkles', title: t('angelNumbers.whatIs'), body: t('angelNumbers.description') },
    { icon: 'sunny', title: t('angelNumbers.dailySignalTitle'), body: t('angelNumbers.dailySignalBody') },
    { icon: 'share-social', title: t('angelNumbers.shareFeatureTitle'), body: t('angelNumbers.shareFeatureBody') },
  ], [t]);

  const handleSubmit = useCallback(async (presetValue) => {
    const numberValue = String(presetValue || sayi).trim();
    if (!numberValue) {
      showError(t('angelNumbers.enterNumber'));
      return;
    }
    if (!/^\d{3,4}$/.test(numberValue)) {
      showError(t('angelNumbers.invalidNumber'));
      return;
    }

    if (!hasPremium && balance < TOKEN_COSTS.ANGEL) {
      setShowTokenModal(true);
      return;
    }

    const payload = {
      sayi: numberValue,
      language: currentLanguage,
      readingTier: hasPremium ? 'premium' : 'free',
    };

    if (checkDuplicateRequest(payload)) {
      showError(t('angelNumbers.duplicateRequestInfo'));
      return;
    }

    setLoading(true);
    try {
      const result = await getFortune.mutateAsync(payload);
      if (!hasPremium) {
        await fetchBalance();
      }
      navigation.navigate('Angel Numbers Sonuç', {
        sayi: numberValue,
        yorum: result.data.yorum,
        analysis: result.data.analysis,
        readingTier: result.data.reading_tier || (hasPremium ? 'premium' : 'free'),
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
  }, [balance, checkDuplicateRequest, currentLanguage, fetchBalance, getFortune, hasPremium, sayi, showError, t]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0D0B1F" />
        <LinearGradient colors={['#0D0B1F', '#1B1B2F', '#2A2A3F']} style={styles.gradientBg}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              <View style={styles.headerSection}>
                <LazyImage source={require('../../assets/backgrounds/777.png')} style={styles.headerBackgroundImage} resizeMode="cover" showPlaceholder={false} fadeInDuration={450} />
                <LinearGradient colors={['rgba(0,0,0,0.58)', 'rgba(0,0,0,0.92)']} style={styles.headerGradient}>
                  <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonInCard}>
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setShowInfoSheet(true)} style={styles.infoButtonInCard}>
                    <Ionicons name="information-circle-outline" size={22} color="#FFFFFF" />
                  </TouchableOpacity>
                  <Text style={styles.title}>{t('angelNumbers.title')}</Text>
                  <Text style={styles.subtitle}>{t('angelNumbers.subtitle')}</Text>
                </LinearGradient>
              </View>

              <View style={styles.content}>
                <TouchableOpacity style={styles.dailySignalCard} onPress={() => handleSubmit(todayNumber)} activeOpacity={0.86}>
                  <View style={styles.dailySignalBadge}>
                    <Text style={styles.dailySignalBadgeText}>{t('angelNumbers.dailySignalBadge')}</Text>
                  </View>
                  <Text style={styles.dailySignalNumber}>{todayNumber}</Text>
                  <Text style={styles.dailySignalTitle}>{t('angelNumbers.dailySignalTitle')}</Text>
                  <Text style={styles.dailySignalBody}>{t('angelNumbers.dailySignalCta')}</Text>
                  <View style={styles.dailySignalAction}>
                    <Text style={styles.dailySignalActionText}>{t('angelNumbers.getReading')}</Text>
                    <Ionicons name="arrow-forward" size={16} color="#0D0B1F" />
                  </View>
                </TouchableOpacity>

                <View style={styles.formCard}>
                  <Text style={styles.cardTitle}>{t('angelNumbers.pickNumberTitle')}</Text>
                  <Text style={styles.helperText}>{t('angelNumbers.helper')}</Text>
                  <TextInput
                    style={styles.input}
                    value={sayi}
                    onChangeText={setSayi}
                    keyboardType="number-pad"
                    placeholder={t('angelNumbers.placeholder')}
                    placeholderTextColor="rgba(255,255,255,0.34)"
                    maxLength={4}
                  />
                </View>

                <TouchableOpacity style={styles.submitButton} onPress={() => handleSubmit()} disabled={loading || fortuneLoading}>
                  <LinearGradient colors={['#C5A100', '#E9C15F']} style={styles.submitGradient}>
                    <Ionicons name="sparkles" size={18} color="#0D0B1F" />
                    <Text style={styles.submitText}>{t('angelNumbers.getReading')}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </TouchableWithoutFeedback>
        </LinearGradient>

        <FortuneInfoSheet
          visible={showInfoSheet}
          onClose={() => setShowInfoSheet(false)}
          title={t('angelNumbers.title')}
          subtitle={t('angelNumbers.subtitle')}
          sections={infoSections}
          tips={[t('angelNumbers.tip1'), t('angelNumbers.tip2')]}
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
          requiredTokens={TOKEN_COSTS.ANGEL}
          readingType="angel_numbers"
        />

        <FortuneLoadingOverlay visible={loading || fortuneLoading} readingType="angelNumbers" />
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
  headerSection: { height: 210, position: 'relative', marginBottom: 12 },
  headerBackgroundImage: { position: 'absolute', width: '100%', height: '100%' },
  headerGradient: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 22, paddingTop: 20 },
  backButtonInCard: { position: 'absolute', top: 20, left: 20, width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(0,0,0,0.66)', alignItems: 'center', justifyContent: 'center' },
  infoButtonInCard: { position: 'absolute', top: 20, right: 20, width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(0,0,0,0.44)', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 34, fontWeight: '700', color: '#FFFFFF', textAlign: 'center', marginBottom: 10 },
  subtitle: { color: 'rgba(255,255,255,0.82)', fontSize: 16, lineHeight: 24, textAlign: 'center', maxWidth: 300 },
  content: { paddingHorizontal: 18, paddingTop: 12 },
  dailySignalCard: { backgroundColor: 'rgba(245,215,123,0.10)', borderRadius: 22, paddingHorizontal: 18, paddingVertical: 16, borderWidth: 1, borderColor: 'rgba(245,215,123,0.14)', marginBottom: 14, alignItems: 'center' },
  dailySignalBadge: { alignSelf: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.08)', marginBottom: 12 },
  dailySignalBadgeText: { color: '#F5D77B', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  dailySignalNumber: { color: '#FFFFFF', fontSize: 30, fontWeight: '800', letterSpacing: 4, marginBottom: 4 },
  dailySignalTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginBottom: 4, textAlign: 'center' },
  dailySignalBody: { color: 'rgba(255,255,255,0.70)', lineHeight: 20, textAlign: 'center', marginBottom: 14 },
  dailySignalAction: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5D77B', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  dailySignalActionText: { color: '#0D0B1F', fontSize: 13, fontWeight: '800', marginRight: 6 },
  formCard: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 22, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginBottom: 16 },
  cardTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: '700', marginBottom: 8 },
  helperText: { color: 'rgba(255,255,255,0.62)', lineHeight: 20, marginBottom: 12 },
  input: { height: 54, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', paddingHorizontal: 16, color: '#FFFFFF', fontSize: 20, fontWeight: '700', letterSpacing: 2, textAlign: 'center' },
  submitButton: { borderRadius: 18, overflow: 'hidden' },
  submitGradient: { height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  submitText: { color: '#0D0B1F', fontSize: 16, fontWeight: '800', marginLeft: 10 },
  bannerAdContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#0D0B1F' },
});
