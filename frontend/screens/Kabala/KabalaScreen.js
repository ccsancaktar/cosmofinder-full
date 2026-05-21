import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, TouchableWithoutFeedback, Keyboard, Dimensions, StatusBar, StyleSheet, Platform, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { 
  Text, 
  TextInput, 
  TouchableOpacity
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import LazyImage from '../../components/LazyImage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useKabalaCache } from '../../hooks/useFortuneCache';
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

const { width, height } = Dimensions.get('window');

const KabalaScreen = React.memo(({ navigation }) => {
  const { t } = useTranslation();
  const { showError, showWarning, showInfo } = useNotification();
  const { balance, fetchBalance } = useToken();
  const { hasPremium, fetchStatus } = usePremium();
  const { getFortune, checkDuplicateRequest, isLoading: fortuneLoading } = useKabalaCache();
  const { currentLanguage } = useLanguage();
  const { user, refreshProfile } = useAuth();
  const [isim, setIsim] = useState('');
  const [dogumTarihi, setDogumTarihi] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [showInfoSheet, setShowInfoSheet] = useState(false);
  const [readingMode, setReadingMode] = useState('self');
  const isKeyboardVisible = useKeyboardVisibility();
  const profileName = user?.first_name || user?.name || user?.username || '';
  const profileBirthDate = user?.birth_date || '';
  const hasProfileData = Boolean(profileName && profileBirthDate);

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

  const handleBackgroundPress = useCallback(() => {
    Keyboard.dismiss();
  }, []);

  const [selectedDate, setSelectedDate] = useState(new Date());

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

    if (!effectiveName) {
      if (readingMode === 'self') {
        showWarning(t('common.profileInfoMissing'));
        navigation.navigate('EditProfile');
      } else {
        showError(t('kabala.enterName'));
      }
      return;
    }

    if (!effectiveBirthDate) {
      if (readingMode === 'self') {
        showWarning(t('common.profileInfoMissing'));
        navigation.navigate('EditProfile');
      } else {
        showError(t('kabala.selectBirthDate'));
      }
      return;
    }

    // Token kontrolü (Premium değilse)
    if (!hasPremium && balance < TOKEN_COSTS.KABALA) {
      setShowTokenModal(true);
      return;
    }

    // Premium kullanıcılar için token kontrolü yapma
    if (hasPremium) {
      // Premium kullanıcı - token kontrolü yapılmıyor
    } else {
      // Token kontrolü yapılıyor
    }

    setLoading(true);
    try {
      const fortuneData = {
        isim: effectiveName,
        dogumTarihi: effectiveBirthDate,
        language: currentLanguage,
        readingTier: hasPremium ? 'premium' : 'free',
        reading_for: readingMode,
      };
      
      // Aynı bilgilerle fal baktırılıp baktırılmadığını kontrol et
      if (checkDuplicateRequest(fortuneData)) {
        showInfo(t('kabala.duplicateRequestInfo'));
        setLoading(false);
        return;
      }
      
      // Fal sonucunu al (cache kontrolü ile)
      const result = await getFortune.mutateAsync(fortuneData);
      
      // Token bakiyesini güncelle (sadece premium olmayan kullanıcılar için)
      if (!hasPremium) {
        await fetchBalance();
      }
      
      if (result.data.success) {
        // Premium değilse önce reklam göster
        if (!hasPremium) {
          try {
            await showInterstitialAd();
          } catch (adError) {
            // Reklam gösterilemedi
          }
        } else {
          // Premium kullanıcı - reklam gösterilmiyor
        }
        
        navigation.navigate('Kabala Sonuç', {
          hebrew_name: result.data.hebrew_name,
          name_value: result.data.name_value,
          reduced_value: result.data.reduced_value,
          selected_sefirot: result.data.selected_sefirot,
          yorum: result.data.yorum,
          original_name: result.data.original_name || effectiveName,
          readingTier: result.data.reading_tier || (hasPremium ? 'premium' : 'free'),
        });
      } else {
        showError(result.data.error || t('errors.general'));
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || t('errors.general');
      
      // Token hatası ise özel mesaj göster
      if (errorMessage.includes('Yetersiz token')) {
        setShowTokenModal(true);
      } else {
        showError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [readingMode, profileName, profileBirthDate, isim, dogumTarihi, hasPremium, balance, checkDuplicateRequest, getFortune, fetchBalance, navigation]);

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
                <TouchableOpacity
                  onPress={() => setShowInfoSheet(true)}
                  style={styles.infoButtonInCard}
                >
                  <Ionicons name="information-circle-outline" size={22} color="#FFFFFF" />
                </TouchableOpacity>
                
                <Text style={styles.title}>{t('kabala.kabalaFortune')}</Text>
                <Text style={styles.subtitle}>
                  {t('kabala.kabalaSubtitle')}
                </Text>
                
                {/* Token ve Premium Bilgisi */}

                
                <View style={styles.originInCard}>
                  <Ionicons name="globe" size={16} color="#C5A100" />
                <Text style={styles.originTextInCard}>{t('kabala.hebrewMysticalTradition')}</Text>
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
                        { icon: 'person-outline', label: t('kabala.yourName'), value: profileName },
                        { icon: 'calendar-outline', label: t('kabala.kabalabirthDate'), value: formatToDDMMYYYY(profileBirthDate) },
                      ]
                    : []
                }
              />

              {readingMode === 'other' ? (
                <View style={styles.formCard}>
                  <Text style={styles.formTitle}>{t('kabala.enterYourInfo')}</Text>
                  
                  <View style={styles.inputSection}>
                    <Text style={styles.inputLabel}>{t('kabala.yourName')}</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder={t('kabala.enterNamePlaceholder')}
                      placeholderTextColor="#A1A1AA"
                      value={isim}
                      onChangeText={setIsim}
                      autoCapitalize="words"
                    />
                    <Text style={styles.inputHint}>
                      {t('kabala.nameHebrewHint')}
                    </Text>
                  </View>

                  <View style={styles.inputSection}>
                    <Text style={styles.inputLabel}>{t('kabala.kabalabirthDate')}</Text>
                    <TouchableOpacity
                      style={styles.dateButton}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <Text style={styles.dateButtonText}>
                        {dogumTarihi ? formatToDDMMYYYY(dogumTarihi) : t('kabala.selectBirthDate')}
                      </Text>
                      <Ionicons name="calendar" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.inputHint}>
                      {t('kabala.birthDateHint')}
                    </Text>
                  </View>

                  <View style={styles.infoSection}>
                    <Text style={styles.infoTitle}>{t('kabala.kabalaAnalysis')}</Text>
                    <View style={styles.infoItems}>
                      <View style={styles.infoItem}>
                        <Text style={styles.hebrewLetter}>א</Text>
                        <Text style={styles.infoText}>{t('kabala.hebrewNumerology')}</Text>
                      </View>
                      <View style={styles.infoItem}>
                        <Text style={styles.hebrewLetter}>ב</Text>
                        <Text style={styles.infoText}>{t('kabala.sefirotEnergies')}</Text>
                      </View>
                      <View style={styles.infoItem}>
                        <Text style={styles.hebrewLetter}>ג</Text>
                        <Text style={styles.infoText}>{t('kabala.spiritualPath')}</Text>
                      </View>
                      <View style={styles.infoItem}>
                        <Text style={styles.hebrewLetter}>ד</Text>
                        <Text style={styles.infoText}>{t('kabala.destinyAnalysis')}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ) : null}

              <View style={styles.ctaWrap}>
                <FortunePrimaryButton
                  label={t('kabala.getKabalaFortune')}
                  loadingLabel={t('kabala.fortuneBeingPrepared')}
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
                <Text style={styles.modalTitle}>{t('kabala.selectBirthDate')}</Text>
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
      
      {/* Token Warning Modal - Sadece Premium olmayan kullanıcılar için */}
      {!hasPremium && (
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
          requiredTokens={TOKEN_COSTS.KABALA}
          readingType="kabala"
        />
      )}
      <FortuneLoadingOverlay visible={loading || fortuneLoading} readingType="kabala" />
      <FortuneInfoSheet
        visible={showInfoSheet}
        onClose={() => setShowInfoSheet(false)}
        title={t('kabala.kabalaFortune')}
        subtitle={t('kabala.kabalaSubtitle')}
        sections={[
          {
            title: t('kabala.whatIsKabala'),
            body: t('kabala.kabalaDescription'),
            icon: 'sparkles-outline',
          },
          {
            title: t('kabala.sefirot'),
            body: t('kabala.sefirotDescription'),
            icon: 'git-network-outline',
          },
          {
            title: t('kabala.treeOfLife'),
            body: t('kabala.treeOfLifeDescription'),
            icon: 'leaf-outline',
          },
        ]}
        tips={[
          t('kabala.nameNumerologyAnalysis'),
          t('kabala.spiritualPathDestinyAnalysis'),
          t('kabala.mysticalSpiritualInterpretation'),
        ]}
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
  header: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
    shadowColor: Platform.OS === 'ios' ? '#000' : 'transparent',
    shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 2 } : { width: 0, height: 0 },
    shadowOpacity: Platform.OS === 'ios' ? 0.3 : 0,
    shadowRadius: Platform.OS === 'ios' ? 8 : 0,
    elevation: Platform.OS === 'android' ? 5 : 0,
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
  formCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 20,
    borderRadius: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(197,161,0,0.10)',
  },
  formTitle: {
    fontSize: 20,
    color: '#C5A100',
    marginBottom: 16,
    ...fontStyles.headingBold,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
    ...fontStyles.bodyBold,
  },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 18,
    minHeight: 56,
    paddingHorizontal: 18,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    ...fontStyles.body,
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
    fontSize: 16,
    color: '#FFFFFF',
    ...fontStyles.body,
  },
  inputHint: {
    fontSize: 12,
    color: '#A1A1AA',
    marginTop: 4,
    ...fontStyles.body,
  },
  infoSection: {
    marginTop: 24,
  },
  infoTitle: {
    fontSize: 20,
    color: '#C5A100',
    marginBottom: 16,
    textAlign: 'center',
    ...fontStyles.headingBold,
  },
  infoItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 16,
  },
  infoItem: {
    alignItems: 'center',
    marginBottom: 16,
    width: '45%',
    backgroundColor: '#2A2A3F',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  hebrewLetter: {
    fontSize: 24,
    color: '#C5A100',
    marginBottom: 4,
    ...fontStyles.headingBold,
  },
  infoText: {
    fontSize: 12,
    color: '#E0E0E0',
    textAlign: 'center',
    ...fontStyles.body,
  },
  submitButton: {
    marginBottom: 0,
  },
  ctaWrap: {
    marginBottom: 32,
  },
  // Modal styles - EditProfileScreen'den alındı
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
  bannerAdContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0D0B1F',
  },
});

export default KabalaScreen;
