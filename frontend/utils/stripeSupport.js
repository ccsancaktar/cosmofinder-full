import React from 'react';
import { Alert } from 'react-native';
import Constants from 'expo-constants';

export const isExpoGo = Constants.appOwnership === 'expo';
export const shouldDisableStripe = __DEV__ && isExpoGo;

export const StripeProviderWrapper = ({ publishableKey, children }) => {
  if (shouldDisableStripe) {
    return children;
  }

  const { StripeProvider } = require('@stripe/stripe-react-native');
  return (
    <StripeProvider publishableKey={publishableKey}>
      {children}
    </StripeProvider>
  );
};

export const useOptionalStripe = () => {
  if (shouldDisableStripe) {
    const unsupported = async () => ({
      error: {
        message: 'Stripe Expo Go gelistirme modunda gecici olarak devre disi.',
      },
    });

    return {
      initPaymentSheet: unsupported,
      presentPaymentSheet: unsupported,
    };
  }

  const { useStripe } = require('@stripe/stripe-react-native');
  return useStripe();
};

export const showStripeDisabledAlert = () => {
  Alert.alert(
    'Odeme Gecici Kapali',
    'Expo Go gelistirme modunda Stripe devre disi. Odeme testi icin native dev build kullanin.'
  );
};
