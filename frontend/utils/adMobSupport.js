import Constants from 'expo-constants';

export const isExpoGo = Constants.appOwnership === 'expo';

// Temporary dev safeguard: keep AdMob disabled only in Expo Go.
// Native dev/prod builds continue using the real AdMob integration.
export const shouldDisableAdMob = __DEV__ && isExpoGo;
