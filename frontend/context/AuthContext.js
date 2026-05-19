import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI, notificationAPI } from '../services/api';
import PaymentAPI from '../services/paymentAPI';
import notificationService from '../services/notificationService';
import { normalizeErrorMessage } from '../utils/errorMessages';
import purchasesService from '../services/purchasesService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const PROFILE_REFRESH_COOLDOWN_MS = 30000;
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    total_readings: 0,
    days_registered: 0
  });
  const profileRefreshPromiseRef = useRef(null);
  const lastProfileRefreshAtRef = useRef(0);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('auth_token');
      const storedUser = await AsyncStorage.getItem('auth_user');
      
      if (storedToken && storedUser) {
        // Önce state'i güncelle (synchronous)
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        const parsedUser = JSON.parse(storedUser);
        purchasesService.logIn(parsedUser?.id).catch((error) => {
          console.error('RevenueCat oturum eşleme hatası:', error);
        });
        PaymentAPI.syncMobilePremiumPurchase().catch((error) => {
          console.error('Başlangıç premium senkronizasyon hatası:', error);
        });

        // Sunucu tarafında yönetilen reminder'ların eski local kopyalarını her açılışta temizle.
        notificationService.clearServerManagedReminderNotifications().catch((error) => {
          console.error('Eski local reminder temizleme hatası:', error);
        });
        
        // Uygulama başlangıç yüklemesi tamamlandı
        setInitializing(false);
        setLoading(false);
        
        // Profil bilgilerini arka planda güncelle (async)
        refreshProfile().catch(error => {
          console.error('Profil yenileme hatası:', error);
        });
      } else {
        setInitializing(false);
        setLoading(false);
      }
    } catch (error) {
      console.error('Stored auth yükleme hatası:', error);
      setInitializing(false);
      setLoading(false);
    }
  };

  const refreshProfile = useCallback(async ({ force = false } = {}) => {
    const now = Date.now();

    if (!force && profileRefreshPromiseRef.current) {
      return profileRefreshPromiseRef.current;
    }

    if (!force && now - lastProfileRefreshAtRef.current < PROFILE_REFRESH_COOLDOWN_MS) {
      return { skipped: true };
    }

    const refreshPromise = (async () => {
      lastProfileRefreshAtRef.current = Date.now();
      
      try {
        const response = await authAPI.getProfile();
        const { user: userData, statistics: userStats } = response.data;
        
        setUser(userData);
        setStatistics(userStats);
        
        // AsyncStorage'ı güncelle
        await AsyncStorage.setItem('auth_user', JSON.stringify(userData));
        return { success: true, user: userData };
      } catch (error) {
        if (error?.response?.status === 429) {
          console.warn('Profil yenileme geçici olarak rate limit yedi; mevcut kullanıcı verisi korunuyor.');
        } else {
          console.error('Profil yenileme hatası:', error);
        }
        return { success: false, error };
      } finally {
        profileRefreshPromiseRef.current = null;
      }
    })();

    profileRefreshPromiseRef.current = refreshPromise;

    return refreshPromise;
  }, []);

  const persistAuthSession = async (sessionToken, sessionUser) => {
    if (!sessionToken || !sessionUser) {
      throw new Error('Eksik oturum verisi döndü');
    }

    await AsyncStorage.setItem('auth_token', sessionToken);
    await AsyncStorage.setItem('auth_user', JSON.stringify(sessionUser));
  };

  const finalizeAuthenticatedSession = async (sessionToken, sessionUser) => {
    await persistAuthSession(sessionToken, sessionUser);

    setToken(sessionToken);
    setUser(sessionUser);
    await purchasesService.logIn(sessionUser?.id);
    await PaymentAPI.syncMobilePremiumPurchase().catch((error) => {
      console.error('Oturum sonrası premium senkronizasyon hatası:', error);
    });

    await refreshProfile({ force: true });

    console.log('🔔 Push notification izni alınıyor...');
    const pushToken = await notificationService.registerForPushNotificationsAsync();
    console.log('🔔 Push token alındı:', pushToken);

    if (pushToken) {
      console.log('🔔 Backend\'e push token kaydediliyor...');
      try {
        const result = await notificationAPI.registerToken(pushToken);
        console.log('🔔 Push token başarıyla kaydedildi:', result);
      } catch (error) {
        console.error('❌ Push token kaydedilemedi:', error);
        console.error('❌ Error details:', error.response?.data);
      }
    } else {
      console.log('⚠️ Push token alınamadı!');
    }

    await notificationService.clearServerManagedReminderNotifications();
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await authAPI.login(credentials);
      
      const { token: newToken, user: userData } = response.data;
      await finalizeAuthenticatedSession(newToken, userData);
      
      return { success: true };
    } catch (error) {
      console.error('Login hatası:', error);
      return { 
        success: false, 
        error: normalizeErrorMessage(error, 'errors.general')
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await authAPI.register(userData);
      
      const { token: newToken, user: newUser } = response.data;
      await finalizeAuthenticatedSession(newToken, newUser);
      
      return { success: true };
    } catch (error) {
      console.error('Register hatası:', error);
      return { 
        success: false, 
        error: normalizeErrorMessage(error, 'errors.general')
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout API hatası:', error);
    }
    
    try {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('auth_user');
      
      setToken(null);
      setUser(null);
      setStatistics({
        total_readings: 0,
        days_registered: 0
      });
      await purchasesService.logOut();
    } catch (error) {
      console.error('Logout storage hatası:', error);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      const response = await authAPI.updateProfile(profileData);
      
      const updatedUser = response.data.user;
      setUser(updatedUser);
      
      // AsyncStorage'ı güncelle
      await AsyncStorage.setItem('auth_user', JSON.stringify(updatedUser));
      
      return { success: true };
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      return { 
        success: false, 
        error: normalizeErrorMessage(error, 'profile.updateError')
      };
    } finally {
      setLoading(false);
    }
  };

  const completeOnboarding = async (profileData = {}) => {
    const payload = {
      ...profileData,
      onboarding_completed: true,
    };
    return updateProfile(payload);
  };

  const skipOnboarding = async () => {
    return completeOnboarding({});
  };

  const changePassword = async (passwordData) => {
    try {
      setLoading(true);
      await authAPI.changePassword(passwordData);
      
      return { success: true };
    } catch (error) {
      console.error('Şifre değiştirme hatası:', error);
      return { 
        success: false, 
        error: normalizeErrorMessage(error, 'password.changeError')
      };
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      const response = await authAPI.forgotPassword(email);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Şifre sıfırlama isteği hatası:', error);
      return {
        success: false,
        error: normalizeErrorMessage(error, 'errors.general')
      };
    } finally {
      setLoading(false);
    }
  };



  const value = {
    user,
    token,
    initializing,
    loading,
    statistics,
    login,
    register,
    logout,
    updateProfile,
    completeOnboarding,
    skipOnboarding,
    changePassword,
    forgotPassword,
    refreshProfile,
    finalizeAuthenticatedSession,
    setToken,
    setUser,
    isAuthenticated: !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 
