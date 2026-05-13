import React from 'react';
import { View, Text, Platform } from 'react-native';
import {
  ADMOB_IOS_BANNER_ID,
  ADMOB_ANDROID_BANNER_ID
} from '@env';
import { shouldDisableAdMob } from '../utils/adMobSupport';

const AdMobBanner = ({ style }) => {
  if (shouldDisableAdMob) {
    return null;
  }

  const { BannerAd, BannerAdSize, TestIds } = require('react-native-google-mobile-ads');

  // Platform-specific banner ad unit ID
  const adUnitId = __DEV__ 
    ? TestIds.BANNER 
    : Platform.select({
        ios: ADMOB_IOS_BANNER_ID,
        android: ADMOB_ANDROID_BANNER_ID,
        default: ADMOB_IOS_BANNER_ID
      });

  return (
    <View style={[{ alignItems: 'center', marginVertical: 10 }, style]}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false,
        }}
        onAdLoaded={() => {
          console.log('Banner ad loaded');
        }}
        onAdFailedToLoad={(error) => {
          console.log('Banner ad failed to load:', error);
        }}
      />
    </View>
  );
};

export default AdMobBanner;
