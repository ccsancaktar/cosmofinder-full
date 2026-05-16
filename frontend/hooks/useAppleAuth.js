import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { normalizeErrorMessage } from '../utils/errorMessages';

export const useAppleAuth = () => {
  const { finalizeAuthenticatedSession } = useAuth();
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    let active = true;

    const checkAvailability = async () => {
      if (Platform.OS !== 'ios') {
        if (active) setAvailable(false);
        return;
      }

      try {
        const isAvailable = await AppleAuthentication.isAvailableAsync();
        if (active) setAvailable(isAvailable);
      } catch (_error) {
        if (active) setAvailable(false);
      }
    };

    checkAvailability();
    return () => {
      active = false;
    };
  }, []);

  const appleAuth = useCallback(async () => {
    if (Platform.OS !== 'ios') {
      return { success: false, error: 'Apple ile giriş yalnızca iOS cihazlarda kullanılabilir.' };
    }

    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential?.identityToken) {
        return { success: false, error: 'Apple kimlik doğrulaması tamamlanamadı.' };
      }

      const payload = {
        identity_token: credential.identityToken,
        apple_user: credential.user,
        email: credential.email || '',
        first_name: credential.fullName?.givenName || '',
        last_name: credential.fullName?.familyName || '',
      };

      const response = await authAPI.appleVerify(payload);
      const { token, user } = response.data;

      await finalizeAuthenticatedSession(token, user);
      return { success: true };
    } catch (error) {
      if (error?.code === 'ERR_REQUEST_CANCELED' || error?.code === 'ERR_CANCELED') {
        return { success: false, error: 'Apple ile giriş iptal edildi.' };
      }

      if (error?.code === 'ERR_REQUEST_NOT_HANDLED') {
        return { success: false, error: 'Apple ile giriş bu cihazda kullanılamıyor.' };
      }

      return { success: false, error: normalizeErrorMessage(error) };
    }
  }, [finalizeAuthenticatedSession]);

  return {
    appleAuth,
    appleSignIn: appleAuth,
    appleSignUp: appleAuth,
    isAppleAuthAvailable: available,
  };
};
