import React, { useEffect, useRef, useState } from 'react';
import { View, Text } from 'react-native';
import { AuthProvider } from './context/AuthContext';
import { TokenProvider } from './context/TokenContext';
import { PremiumProvider } from './context/PremiumContext';
import { QueryProvider } from './providers/QueryProvider';
import { LanguageProvider } from './context/LanguageContext';
import { NotificationProvider } from './context/NotificationContext';
import { initSentry } from './config/sentry';
import ErrorBoundary from './components/ErrorBoundary';
import AppNavigator from './navigation/AppNavigator';
import * as Notifications from 'expo-notifications';
import * as Font from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SplashScreen from './components/SplashScreen';
import { navigateFromNotification } from './navigation/navigationService';
import purchasesService from './services/purchasesService';

function removeNotificationListener(subscription) {
  if (!subscription) {
    return;
  }

  if (typeof subscription.remove === 'function') {
    subscription.remove();
    return;
  }

  if (typeof Notifications.removeNotificationSubscription === 'function') {
    Notifications.removeNotificationSubscription(subscription);
  }
}

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // Fontları yükle
    const loadFonts = async () => {
      try {
        await Font.loadAsync({
          'CinzelDecorative-Regular': require('./assets/fonts/CinzelDecorative-Regular.ttf'),
          'CinzelDecorative-Bold': require('./assets/fonts/CinzelDecorative-Bold.ttf'),
          'Inter-Regular': require('./assets/fonts/Inter-Regular.ttf'),
          'Inter-Bold': require('./assets/fonts/Inter-Bold.ttf'),
          // Opsiyonel: Runik Unicode desteği için
          'NotoSansRunic': require('./assets/fonts/NotoSansRunic-Regular.ttf'),
        });
        setFontsLoaded(true);
        console.log('Fontlar başarıyla yüklendi!');
        console.log('CinzelDecorative-Bold font yüklendi:', Font.isLoaded('CinzelDecorative-Bold'));
      } catch (error) {
        console.error('Font yükleme hatası:', error);
        setFontsLoaded(true); // Hata olsa bile devam et
      }
    };

    loadFonts();
  }, []);

  useEffect(() => {
    // Minimum 3 saniye splash screen göster
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    purchasesService.initialize().catch((error) => {
      console.error('RevenueCat initialize hatası:', error);
    });

    // Sentry'yi başlat
    initSentry();
    
    // Notification listener'ları ayarla
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification alındı:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tıklandı:', response);
      
      // Notification tipine göre yönlendirme
      const { type, screen } = response.notification.request.content.data;
      if (screen) {
        navigateFromNotification(screen);
      }
    });

    return () => {
      removeNotificationListener(notificationListener.current);
      removeNotificationListener(responseListener.current);
    };
  }, []);

  // Fontlar yüklenene kadar loading ekranı göster
  if (!fontsLoaded || showSplash) {
    return <SplashScreen />;
  }

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <LanguageProvider>
          <QueryProvider>
              <AuthProvider>
                <TokenProvider>
                  <PremiumProvider>
                    <NotificationProvider>
                      <AppNavigator />
                    </NotificationProvider>
                  </PremiumProvider>
                </TokenProvider>
              </AuthProvider>
          </QueryProvider>
        </LanguageProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
} 
