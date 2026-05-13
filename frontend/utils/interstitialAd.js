import { Platform } from 'react-native';
import {
  ADMOB_IOS_INTERSTITIAL_ID,
  ADMOB_ANDROID_INTERSTITIAL_ID
} from '@env';
import { shouldDisableAdMob } from './adMobSupport';

// Platform-specific interstitial ad unit ID
const getInterstitialAdUnitId = (TestIds) => {
  if (__DEV__) return TestIds.INTERSTITIAL;
  
  return Platform.select({
    ios: ADMOB_IOS_INTERSTITIAL_ID,
    android: ADMOB_ANDROID_INTERSTITIAL_ID,
    default: ADMOB_IOS_INTERSTITIAL_ID
  });
};

const getMobileAdsModule = () => {
  if (shouldDisableAdMob) {
    return null;
  }

  return require('react-native-google-mobile-ads');
};

// Geçiş reklamı göster (fal sonucu öncesi)
export const showInterstitialAd = () => {
  return new Promise((resolve, reject) => {
    if (shouldDisableAdMob) {
      console.log('Expo Go dev modunda interstitial reklam atlandi');
      resolve(false);
      return;
    }

    const { InterstitialAd, AdEventType, TestIds } = getMobileAdsModule();

    console.log('Interstitial reklam başlatılıyor...');
    
    // Her seferinde yeni instance oluştur
    const newInterstitialAd = InterstitialAd.createForAdRequest(
      getInterstitialAdUnitId(TestIds),
      {
        requestNonPersonalizedAdsOnly: false,
      }
    );

    let isResolved = false;

    // Event listener'ları ekle
    const onLoaded = () => {
      console.log('Interstitial reklam yüklendi, gösteriliyor...');
      newInterstitialAd.show();
      
      // Reklam başladığında 5 saniye sonra otomatik resolve et (test için)
      setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          newInterstitialAd.removeAllListeners();
          console.log('Interstitial reklam otomatik tamamlandı');
          resolve(true);
        }
      }, 12000); // 12 saniye minimum reklam süresi
    };

    // CLOSED event'ini kaldırdık - reklamlar kapatılamaz
    // Production'da zaten kapatılamaz, test mode'da da istemiyoruz

    const onError = (error) => {
      console.log('Interstitial reklam hatası:', error);
      if (!isResolved) {
        isResolved = true;
        newInterstitialAd.removeAllListeners();
        // Hata olsa da devam et
        resolve(false);
      }
    };

    newInterstitialAd.addAdEventListener(AdEventType.LOADED, onLoaded);
    // AdEventType.CLOSED listener'ını kaldırdık - reklamlar kapatılamaz
    newInterstitialAd.addAdEventListener(AdEventType.ERROR, onError);

    // Reklamı yükle
    newInterstitialAd.load();

    // 30 saniye timeout
    setTimeout(() => {
      if (!isResolved) {
        isResolved = true;
        newInterstitialAd.removeAllListeners();
        console.log('Interstitial reklam timeout');
        resolve(false);
      }
    }, 30000);
  });
};

// Reklamın hazır olup olmadığını kontrol et
export const isInterstitialAdLoaded = () => {
  if (shouldDisableAdMob) {
    return false;
  }

  const { InterstitialAd, TestIds } = getMobileAdsModule();
  const interstitialAd = InterstitialAd.createForAdRequest(
    getInterstitialAdUnitId(TestIds),
    {
      requestNonPersonalizedAdsOnly: false,
    }
  );

  return interstitialAd.loaded;
};

// Component mount edildiğinde reklamı önceden yükle
export const preloadInterstitialAd = () => {
  if (shouldDisableAdMob) {
    return;
  }

  const { InterstitialAd, TestIds } = getMobileAdsModule();
  const interstitialAd = InterstitialAd.createForAdRequest(
    getInterstitialAdUnitId(TestIds),
    {
      requestNonPersonalizedAdsOnly: false,
    }
  );

  if (!interstitialAd.loaded) {
    interstitialAd.load();
  }
};
