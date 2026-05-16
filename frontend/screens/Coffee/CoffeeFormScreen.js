import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Alert,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Text,
  TextInput,
  StyleSheet,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useCoffeeCache } from '../../hooks/useFortuneCache';
import { useToken, TOKEN_COSTS } from '../../context/TokenContext';
import { usePremium } from '../../context/PremiumContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNotification } from '../../context/NotificationContext';
import { showInterstitialAd, preloadInterstitialAd } from '../../utils/interstitialAd';
import TokenWarningModal from '../../components/TokenWarningModal';
import LazyImage from '../../components/LazyImage';
import FortuneLoadingOverlay from '../../components/FortuneLoadingOverlay';
import FortuneInfoSheet from '../../components/FortuneInfoSheet';
import AdMobBanner from '../../components/AdMobBanner';
import useKeyboardVisibility from '../../hooks/useKeyboardVisibility';
import { fontStyles } from '../../utils/fontStyles';

const CoffeeFormScreen = React.memo(({ navigation }) => {
  const { t } = useTranslation();
  const { showError, showWarning, showInfo } = useNotification();
  const { balance, fetchBalance } = useToken();
  const { hasPremium, fetchStatus } = usePremium();
  const { getFortune, checkDuplicateRequest, isLoading: fortuneLoading } = useCoffeeCache();
  const { currentLanguage } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [showInfoSheet, setShowInfoSheet] = useState(false);
  const isKeyboardVisible = useKeyboardVisibility();
  const [question, setQuestion] = useState('');
  const [images, setImages] = useState([
    { uri: null, base64: null, id: 1 },
    { uri: null, base64: null, id: 2 },
    { uri: null, base64: null, id: 3 },
  ]);

  useEffect(() => {
    fetchBalance();
    fetchStatus();
    preloadInterstitialAd();
  }, [fetchBalance, fetchStatus]);

  const photoSlots = useMemo(
    () => [
      {
        title: t('coffee.photo1Title'),
        description: t('coffee.photo1Description'),
      },
      {
        title: t('coffee.photo2Title'),
        description: t('coffee.photo2Description'),
      },
      {
        title: t('coffee.photo3Title'),
        description: t('coffee.photo3Description'),
      },
    ],
    [t]
  );

  const updateImage = useCallback(
    (imageIndex, uri, base64) => {
      const maxSizeInBytes = 5 * 1024 * 1024;
      const base64Size = base64 ? base64.length * 0.75 : 0;

      if (base64Size > maxSizeInBytes) {
        Alert.alert(
          t('coffee.fileSizeWarning'),
          `${t('coffee.fileSizeTooLarge')}\n\n${t('coffee.fileSizeInfo')}`,
          [{ text: t('common.ok'), style: 'default' }]
        );
        return;
      }

      setImages(prevImages =>
        prevImages.map((img, index) => (index === imageIndex ? { ...img, uri, base64 } : img))
      );
    },
    [t]
  );

  const pickImage = useCallback(
    async (imageIndex, source = 'library') => {
      try {
        if (source === 'camera') {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') {
            showError(t('coffee.cameraPermissionRequired'));
            return;
          }
        } else {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') {
            showError(t('coffee.galleryPermissionRequired'));
            return;
          }
        }

        const pickerMethod =
          source === 'camera'
            ? ImagePicker.launchCameraAsync
            : ImagePicker.launchImageLibraryAsync;

        const result = await pickerMethod({
          mediaTypes: 'images',
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

        if (result.canceled) {
          return;
        }

        const uri = result.assets?.[0]?.uri;
        if (!uri) {
          showError(t('coffee.imageSelectionFailed'));
          return;
        }

        const manipulatedImage = await ImageManipulator.manipulateAsync(
          uri,
          [{ resize: { width: 896 } }],
          {
            compress: 0.55,
            format: ImageManipulator.SaveFormat.JPEG,
            base64: true,
          }
        );

        updateImage(
          imageIndex,
          manipulatedImage.uri,
          manipulatedImage.base64 ? `data:image/jpeg;base64,${manipulatedImage.base64}` : null
        );
      } catch (error) {
        console.error(t('coffee.imageSelectionError'), error);
        showError(t('coffee.imageSelectionFailed'));
      }
    },
    [showError, t, updateImage]
  );

  const openImageSourcePicker = useCallback(
    imageIndex => {
      Alert.alert(t('coffee.choosePhotoSource'), '', [
        {
          text: t('coffee.takePhoto'),
          onPress: () => pickImage(imageIndex, 'camera'),
        },
        {
          text: t('coffee.chooseFromGallery'),
          onPress: () => pickImage(imageIndex, 'library'),
        },
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
      ]);
    },
    [pickImage, t]
  );

  const removeImage = useCallback(
    imageIndex => {
      updateImage(imageIndex, null, null);
    },
    [updateImage]
  );

  const handleSubmit = useCallback(async () => {
    const allImagesUploaded = images.every(img => img.base64);

    if (!allImagesUploaded) {
      showWarning(t('coffee.upload3Photos'));
      return;
    }

    if (!hasPremium && balance < TOKEN_COSTS.COFFEE) {
      setShowTokenModal(true);
      return;
    }

    setLoading(true);

    try {
      const trimmedQuestion = question.trim();
      const fortuneData = {
        images: images.map(img => img.base64),
        language: currentLanguage,
        question: trimmedQuestion,
        soru: trimmedQuestion,
      };

      if (checkDuplicateRequest(fortuneData)) {
        showInfo(t('coffee.duplicateRequestInfo'));
        setLoading(false);
        return;
      }

      const result = await getFortune.mutateAsync(fortuneData);
      await fetchBalance();

      if (result.data.success) {
        if (!hasPremium) {
          try {
            await showInterstitialAd();
          } catch (adError) {
            console.log('Reklam gösterilemedi:', adError);
          }
        }

        navigation.navigate('Kahve Sonuç', {
          yorum: result.data.yorum,
          interpretation: result.data.interpretation,
          fallback: result.data.fallback || false,
          question: result.data.question || trimmedQuestion,
          images: images.map(img => img.uri).filter(Boolean),
        });
      } else {
        showError(result.data.error || t('errors.general'));
      }
    } catch (error) {
      console.error('Error:', error);

      const errorMessage = error.response?.data?.error || error.message || t('errors.general');

      if (errorMessage.includes('Yetersiz token')) {
        setShowTokenModal(true);
      } else if (error.name === 'AbortError') {
        showError(t('errors.timeout'));
      } else if (error.message.includes('Network request failed')) {
        showError(t('errors.network'));
      } else {
        showError(error.response?.data?.error || t('errors.general'));
      }
    } finally {
      setLoading(false);
    }
  }, [
    balance,
    checkDuplicateRequest,
    currentLanguage,
    fetchBalance,
    getFortune,
    hasPremium,
    images,
    navigation,
    question,
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
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.headerSection}>
              <LazyImage
                source={require('../../assets/backgrounds/turk-kahvesi.jpg')}
                style={styles.headerBackgroundImage}
                resizeMode="cover"
                showPlaceholder={false}
                fadeInDuration={500}
              />
              <LinearGradient
                colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.9)']}
                style={styles.headerGradient}
              >
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonInCard}>
                  <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowInfoSheet(true)} style={styles.infoButtonInCard}>
                  <Ionicons name="information-circle-outline" size={22} color="#FFFFFF" />
                </TouchableOpacity>

                <Text style={styles.title}>{t('coffee.turkishCoffeeTitle')}</Text>
                <Text style={styles.subtitle}>{t('coffee.upload3Photos')}</Text>

                <View style={styles.originInCard}>
                  <Ionicons name="globe" size={16} color="#C5A100" />
                  <Text style={styles.originTextInCard}>{t('coffee.turkey')}</Text>
                </View>
              </LinearGradient>
            </View>

            <View style={styles.uploadCard}>
              <Text style={styles.cardTitle}>{t('coffee.coffeeCupPhotos')}</Text>
              <Text style={styles.cardText}>{t('coffee.photoInstructions')}</Text>

              <View style={styles.uploadList}>
                {images.map((image, index) => (
                  <View key={image.id} style={styles.uploadSlotCard}>
                    <TouchableOpacity
                      style={styles.imageUploadButton}
                      onPress={() => openImageSourcePicker(index)}
                    >
                      {image.uri ? (
                        <View style={styles.imageWrapper}>
                          <Image source={{ uri: image.uri }} style={styles.selectedImage} resizeMode="cover" />
                          <TouchableOpacity
                            style={styles.removeButton}
                            onPress={() => removeImage(index)}
                          >
                            <Ionicons name="close-circle" size={24} color="#FF4444" />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <View style={styles.uploadContent}>
                          <Ionicons name="camera" size={28} color="#C5A100" />
                          <Text style={styles.uploadText}>{t('common.add')}</Text>
                        </View>
                      )}
                    </TouchableOpacity>

                    <View style={styles.slotTextWrap}>
                      <Text style={styles.slotTitle}>{photoSlots[index].title}</Text>
                      <Text style={styles.slotDescription}>{photoSlots[index].description}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.questionCard}>
              <View style={styles.questionLabelRow}>
                <Text style={styles.cardTitle}>{t('coffee.optionalQuestion')}</Text>
                <Text style={styles.optionalBadge}>{t('common.optional')}</Text>
              </View>
              <Text style={styles.cardText}>{t('coffee.optionalQuestionHint')}</Text>
              <TextInput
                style={styles.questionInput}
                placeholder={t('coffee.optionalQuestionPlaceholder')}
                placeholderTextColor="#7C7C92"
                value={question}
                onChangeText={text => setQuestion(text.slice(0, 180))}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>{question.length} / 180</Text>
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                (!images.every(img => img.base64) || loading || fortuneLoading) &&
                  styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!images.every(img => img.base64) || loading || fortuneLoading}
            >
              {loading || fortuneLoading ? (
                <>
                  <Ionicons name="hourglass" size={24} color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>{t('coffee.fortuneBeingInterpreted')}</Text>
                </>
              ) : (
                <>
                  <Ionicons name="sparkles" size={24} color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>{t('coffee.sendMyFortune')}</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </LinearGradient>

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
          requiredTokens={TOKEN_COSTS.COFFEE}
          readingType="coffee"
        />
        <FortuneLoadingOverlay visible={loading || fortuneLoading} readingType="coffee" />
        <FortuneInfoSheet
          visible={showInfoSheet}
          onClose={() => setShowInfoSheet(false)}
          title={t('fortune.coffee')}
          subtitle={t('fortune.coffeeDescription')}
          sections={[
            {
              title: t('coffee.whatIsCoffeeFortune'),
              body: t('coffee.coffeeFortuneDescription'),
              icon: 'cafe-outline',
            },
            {
              title: t('coffee.coffeeCupPhotos'),
              body: t('coffee.photoInstructions'),
              icon: 'camera-outline',
            },
          ]}
          tips={[t('coffee.tip1'), t('coffee.tip2'), t('coffee.tip3')]}
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
  uploadCard: {
    backgroundColor: '#1B1B2F',
    padding: 24,
    marginBottom: 20,
    width: '100%',
  },
  questionCard: {
    backgroundColor: '#151529',
    padding: 24,
    marginBottom: 24,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(197, 161, 0, 0.12)',
  },
  cardTitle: {
    fontSize: 20,
    color: '#C5A100',
    marginBottom: 12,
    ...fontStyles.headingBold,
  },
  cardText: {
    fontSize: 15,
    color: '#CCC8D9',
    marginBottom: 20,
    lineHeight: 23,
    ...fontStyles.body,
  },
  uploadList: {
    gap: 14,
  },
  uploadSlotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(197, 161, 0, 0.14)',
  },
  imageUploadButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(197, 161, 0, 0.4)',
    borderStyle: 'dashed',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    width: 96,
    height: 96,
    overflow: 'visible',
  },
  imageWrapper: {
    position: 'relative',
  },
  selectedImage: {
    width: 96,
    height: 96,
    borderRadius: 16,
  },
  removeButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: 'rgba(0,0,0,0.78)',
    borderRadius: 15,
    padding: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 68, 68, 0.3)',
  },
  uploadContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  uploadText: {
    fontSize: 14,
    color: '#C5A100',
    textAlign: 'center',
    marginTop: 6,
    ...fontStyles.bodyBold,
  },
  slotTextWrap: {
    flex: 1,
  },
  slotTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 6,
    ...fontStyles.bodyBold,
  },
  slotDescription: {
    fontSize: 14,
    color: '#B9B6C9',
    lineHeight: 20,
    ...fontStyles.body,
  },
  questionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionalBadge: {
    fontSize: 12,
    color: '#F5D06A',
    backgroundColor: 'rgba(245, 208, 106, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: 'hidden',
    ...fontStyles.bodyBold,
  },
  questionInput: {
    minHeight: 112,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(197, 161, 0, 0.18)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 22,
    ...fontStyles.body,
  },
  charCount: {
    marginTop: 10,
    textAlign: 'right',
    color: '#8C88A6',
    fontSize: 12,
    ...fontStyles.body,
  },
  submitButton: {
    backgroundColor: '#8A4FFF',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
    width: '100%',
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
  bannerAdContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0D0B1F',
  },
});

export default CoffeeFormScreen;
