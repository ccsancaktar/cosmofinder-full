import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Alert, Dimensions, ScrollView, StatusBar, TouchableOpacity, Text, TextInput, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import TokenIcon from '../../components/TokenIcon';
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
import { fontStyles } from '../../utils/fontStyles';

const { width, height } = Dimensions.get('window');

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
  const [images, setImages] = useState([
    { uri: null, base64: null, id: 1 },
    { uri: null, base64: null, id: 2 },
    { uri: null, base64: null, id: 3 }
  ]);

  // Token ve premium durumunu yükle
  useEffect(() => {
    fetchBalance();
    fetchStatus();
    // Interstitial reklamını önceden yükle
    preloadInterstitialAd();
  }, []);

    const pickImage = useCallback(async (imageIndex) => {
    try {
      // İzinleri kontrol et
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showError(t('coffee.galleryPermissionRequired'));
        return;
      }

      // Galeriden imaj seç
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1], // Kare format zorunlu
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled) {
        let uri = result.assets[0].uri;
        
        // Tüm resimleri otomatik olarak küçült (HEIC dahil)
        const manipulatedImage = await ImageManipulator.manipulateAsync(
          uri,
          [
            { resize: { width: 800, height: 800 } } // Maksimum 800x800 boyut
          ],
          {
            compress: 0.6, // Daha agresif sıkıştırma
            format: ImageManipulator.SaveFormat.JPEG,
          }
        );
        
        // Yeni base64 oluştur
        const response = await fetch(manipulatedImage.uri);
        const blob = await response.blob();
        const reader = new FileReader();
        
        reader.onload = () => {
          const newBase64 = reader.result.split(',')[1];
          updateImage(imageIndex, manipulatedImage.uri, `data:image/jpeg;base64,${newBase64}`);
        };
        reader.readAsDataURL(blob);
      }
    } catch (error) {
      console.error(t('coffee.imageSelectionError'), error);
      showError(t('coffee.imageSelectionFailed'));
    }
  }, []);

  const updateImage = useCallback((imageIndex, uri, base64) => {
    // Dosya boyutunu kontrol et (5MB = 5 * 1024 * 1024 bytes) - artık resimler otomatik küçültülüyor
    const maxSizeInBytes = 5 * 1024 * 1024;
    const base64Size = base64 ? base64.length * 0.75 : 0; // Base64 boyutunu byte'a çevir
    
    if (base64Size > maxSizeInBytes) {
      Alert.alert(
        t('coffee.fileSizeWarning'),
        `${t('coffee.fileSizeTooLarge')}\n\n${t('coffee.fileSizeInfo')}`,
        [{ text: t('common.ok'), style: 'default' }]
      );
      return;
    }
    
    setImages(prevImages => 
      prevImages.map((img, index) => 
        index === imageIndex 
          ? { ...img, uri, base64 }
          : img
      )
    );
  }, [t]);

  const removeImage = useCallback((imageIndex) => {
    updateImage(imageIndex, null, null);
  }, [updateImage]);

  const handleSubmit = useCallback(async () => {
    // Tüm resimlerin yüklenip yüklenmediğini kontrol et
    const allImagesUploaded = images.every(img => img.base64);
    
    if (!allImagesUploaded) {
      showWarning(t('coffee.upload3Photos'));
      return;
    }

    // Token kontrolü (Premium değilse)
    if (!hasPremium && balance < TOKEN_COSTS.COFFEE) {
      setShowTokenModal(true);
      return;
    }

    setLoading(true);

    try {
      const fortuneData = {
        images: images.map(img => img.base64),
        language: currentLanguage
      };
      
      // Aynı bilgilerle fal baktırılıp baktırılmadığını kontrol et
      if (checkDuplicateRequest(fortuneData)) {
        showInfo(t('coffee.duplicateRequestInfo'));
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
            console.log('Reklam gösterilemedi:', adError);
          }
        }
        
        navigation.navigate('Kahve Sonuç', {
          yorum: result.data.yorum,
          interpretation: result.data.interpretation,
          fallback: result.data.fallback || false
        });
      } else {
        showError(result.data.error || t('errors.general'));
      }
    } catch (error) {
      console.error('Error:', error);
      
      const errorMessage = error.response?.data?.error || error.message || t('errors.general');
      
      // Token hatası ise özel mesaj göster
      if (errorMessage.includes('Yetersiz token')) {
        setShowTokenModal(true);
      } else if (error.name === 'AbortError') {
        showError(t('errors.timeout'));
      } else if (error.message.includes('Network request failed')) {
        showError(t('errors.network'));
      } else {
        showError(t('errors.general'));
      }
    } finally {
      setLoading(false);
    }
  }, [images, hasPremium, balance, checkDuplicateRequest, getFortune, fetchBalance, navigation]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0D0B1F" />
        
        <LinearGradient
          colors={['#0D0B1F', '#1B1B2F', '#2A2A3F']}
          style={styles.gradientBg}
        >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header Section */}
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
              
              <Text style={styles.title}>{t('coffee.turkishCoffeeTitle')}</Text>
              <Text style={styles.subtitle}>
                {t('coffee.upload3Photos')}
              </Text>
              
                              {/* Token ve Premium Bilgisi */}

              
              <View style={styles.originInCard}>
                <Ionicons name="globe" size={16} color="#C5A100" />
                <Text style={styles.originTextInCard}>{t('coffee.turkey')}</Text>
              </View>
            </LinearGradient>
          </View>

          {/* Upload Cards */}
          <View style={styles.uploadCard}>
            <Text style={styles.cardTitle}>{t('coffee.coffeeCupPhotos')}</Text>
            <Text style={styles.cardText}>
              {t('coffee.photoInstructions')}
            </Text>
            
            <View style={styles.imageGrid}>
              {images.map((image, index) => (
                <View key={image.id} style={styles.imageContainer}>
                  <TouchableOpacity
                    style={styles.imageUploadButton}
                    onPress={() => pickImage(index)}
                  >
                    {image.uri ? (
                      <View style={styles.imageWrapper}>
                        <LazyImage 
                      source={{ uri: image.uri }} 
                      style={styles.selectedImage}
                      showPlaceholder={true}
                      fadeInDuration={300}
                    />
                        <TouchableOpacity
                          style={styles.removeButton}
                          onPress={() => removeImage(index)}
                        >
                          <Ionicons name="close-circle" size={24} color="#FF4444" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={styles.uploadContent}>
                        <Ionicons name="camera" size={32} color="#C5A100" />
                        <Text style={styles.uploadText}>{t('common.add')}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, (!images.every(img => img.base64) || loading || fortuneLoading) && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!images.every(img => img.base64) || loading || fortuneLoading}
          >
            {(loading || fortuneLoading) ? (
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
      {!hasPremium && !showInfoSheet ? (
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
  header: {
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
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
  uploadCard: {
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
    marginBottom: 16,
    ...fontStyles.headingBold,
  },
  cardText: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 24,
    lineHeight: 24,
    ...fontStyles.body,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: 10,
    gap: 16,
  },
  imageContainer: {
    width: '30%',
    marginVertical: 10,
    alignItems: 'center',
  },
  imageUploadButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(197, 161, 0, 0.4)',
    borderStyle: 'dashed',
    borderRadius: 20,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    width: 100,
    height: 100,
    shadowColor: Platform.OS === 'ios' ? '#000' : 'transparent',
    shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 2 } : { width: 0, height: 0 },
    shadowOpacity: Platform.OS === 'ios' ? 0.1 : 0,
    shadowRadius: Platform.OS === 'ios' ? 8 : 0,
    elevation: Platform.OS === 'android' ? 3 : 0,
  },
  imageWrapper: {
    position: 'relative',
  },
  selectedImage: {
    width: 100,
    height: 100,
    borderRadius: 16,
  },
  removeButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 15,
    padding: 5,
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
    ...fontStyles.bodyBold,
  },
  imageLabel: {
    fontSize: 14,
    color: '#fff',
    marginTop: 8,
    textAlign: 'center',
  },
  tipsCard: {
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
  submitButton: {
    backgroundColor: '#8A4FFF',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: 0,
    marginBottom: 32,
    elevation: Platform.OS === 'android' ? 8 : 0,
    shadowColor: Platform.OS === 'ios' ? '#8A4FFF' : 'transparent',
    shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 4 } : { width: 0, height: 0 },
    shadowOpacity: Platform.OS === 'ios' ? 0.4 : 0,
    shadowRadius: Platform.OS === 'ios' ? 12 : 0,
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

export default CoffeeFormScreen; 
