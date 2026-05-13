import { Platform } from 'react-native';
import {
  ADMOB_IOS_REWARDED_ID,
  ADMOB_ANDROID_REWARDED_ID
} from '@env';
import { BONUS_AMOUNTS } from '../context/TokenContext';
import { shouldDisableAdMob } from './adMobSupport';

// Platform-specific rewarded ad unit ID
const getRewardedAdUnitId = (TestIds) => {
  if (__DEV__) return TestIds.REWARDED;
  
  return Platform.select({
    ios: ADMOB_IOS_REWARDED_ID,
    android: ADMOB_ANDROID_REWARDED_ID,
    default: ADMOB_IOS_REWARDED_ID
  });
};

const getMobileAdsModule = () => {
  if (shouldDisableAdMob) {
    return null;
  }

  return require('react-native-google-mobile-ads');
};

// Basit yaklaşım - EventListener ile
export const showRewardedAd = () => {
  return new Promise((resolve, reject) => {
    try {
      if (shouldDisableAdMob) {
        console.log('Expo Go dev modunda odullu reklam atlandi');
        resolve({
          type: 'coins',
          amount: BONUS_AMOUNTS.VIDEO,
        });
        return;
      }

      const { RewardedAd, RewardedAdEventType, AdEventType, TestIds } = getMobileAdsModule();

      // Platform-specific ad unit ID kullan
      const adUnitId = getRewardedAdUnitId(TestIds);
      
      // Reklam instance'ı oluştur
      const rewardedAd = RewardedAd.createForAdRequest(adUnitId, {
        requestNonPersonalizedAdsOnly: false,
      });

      let isResolved = false;

      // Event listener'ları ekle
      const onLoaded = () => {
        console.log('Reklam yüklendi, gösteriliyor...');
        rewardedAd.show();
      };

              const onEarnedReward = (reward) => {
          console.log('Ödül kazanıldı:', reward);
          if (!isResolved) {
            isResolved = true;
            rewardedAd.removeAllListeners();
            resolve({
              type: 'coins',
              amount: BONUS_AMOUNTS.VIDEO,  // Backend ile uyumlu 5 token
            });
          }
        };

      const onFailedToLoad = (error) => {
        console.log('Reklam yüklenemedi:', error);
        if (!isResolved) {
          isResolved = true;
          rewardedAd.removeAllListeners();
          reject(new Error('Reklam yüklenemedi'));
        }
      };

      // CLOSED event'ini kaldırdık - reklamlar kapatılamaz
      // Production'da zaten kapatılamaz, test mode'da da istemiyoruz

      rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, onLoaded);
      rewardedAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, onEarnedReward);
      rewardedAd.addAdEventListener(AdEventType.ERROR, onFailedToLoad);
      // AdEventType.CLOSED listener'ını kaldırdık

      console.log('Ödüllü reklam yükleniyor...');
      rewardedAd.load();

      // 30 saniye timeout
      setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          rewardedAd.removeAllListeners();
          reject(new Error('Reklam yükleme zaman aşımı'));
        }
      }, 30000);

    } catch (error) {
      console.log('Reklam sistemi hatası:', error);
      reject(new Error('Reklam sistemi başlatılamadı'));
    }
  });
};

// Reklamın hazır olup olmadığını kontrol et
export const isRewardedAdLoaded = () => {
  return true; // Test mode'da her zaman true döndür
};

// Component mount edildiğinde reklamı önceden yükle
export const preloadRewardedAd = () => {
  console.log('Preload reklam - test mode');
};
