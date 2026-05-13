import { useCallback } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { normalizeErrorMessage } from '../utils/errorMessages';

// Web browser'ı tamamla
WebBrowser.maybeCompleteAuthSession();

// Google OAuth konfigürasyonu
const GOOGLE_CLIENT_ID = '570245285347-23me36mthan1ui4lu96n6pffvlsrber6.apps.googleusercontent.com';
// Doğru redirect URI - çift /api sorunu düzeltildi
const GOOGLE_REDIRECT_URI = 'https://cosmofinder.com/api/auth/google/callback';

export const useGoogleAuth = () => {
  const { login, setToken, setUser } = useAuth();

  const googleAuth = useCallback(async () => {
    try {
      console.log('Google ile devam et akışı başlatılıyor...');
      console.log('Client ID:', GOOGLE_CLIENT_ID);
      console.log('Redirect URI:', GOOGLE_REDIRECT_URI);
      
      // Manuel OAuth URL oluştur - Authorization Code flow
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}&` +
        `redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}&` +
        `response_type=code&` +
        `scope=openid https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email&` +
        `prompt=select_account&` +
        `access_type=offline`;

      console.log('OAuth URL oluşturuldu, browser açılıyor...');
      console.log('Auth URL:', authUrl);
      console.log('Redirect URI:', GOOGLE_REDIRECT_URI);

      // WebBrowser ile OAuth flow'u başlat - deep linking için cosmofinder://auth kullan
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        'cosmofinder://auth', // Deep linking URL
        {
          showInRecents: false,
          preferEphemeralSession: true
        }
      );

      console.log('OAuth result:', result);
      console.log('OAuth result type:', result.type);
      console.log('OAuth result url:', result.url);

      if (result.type === 'success') {
        console.log('Google ile devam et başarılı - Deep linking ile işleniyor');
        
        // URL'den token'ı çıkar
        const url = result.url;
        const tokenMatch = url.match(/[?&]token=([^&]+)/);
        
        if (tokenMatch) {
          const token = decodeURIComponent(tokenMatch[1]);
          console.log('Token alındı:', token);
          
          // Token'ı kaydet
          await AsyncStorage.setItem('auth_token', token);
          
          // Profil bilgilerini al
          try {
            const response = await fetch('https://cosmofinder.com/api/auth/profile', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              const userData = data.user;
              
              // User bilgilerini kaydet
              await AsyncStorage.setItem('auth_user', JSON.stringify(userData));
              setToken(token);
              setUser(userData);
              
              console.log('Google authentication başarılı, kullanıcı uygulamaya alındı');
              return { success: true };
            } else {
              console.error('Profil bilgileri alınamadı:', response.status);
              return { success: false, error: normalizeErrorMessage('Profil bilgileri alınamadı') };
            }
          } catch (error) {
            console.error('Profil bilgileri alma hatası:', error);
            return { success: false, error: normalizeErrorMessage(error) };
          }
        } else {
          console.error('Token URL\'de bulunamadı');
          return { success: false, error: normalizeErrorMessage('Token alınamadı') };
        }
      } else if (result.type === 'cancel') {
        console.log('Kullanıcı Google ile devam et akışını iptal etti');
        return { success: false, error: 'Google ile devam et işlemi iptal edildi' };
      } else {
        console.error('OAuth result type:', result.type);
        return { success: false, error: normalizeErrorMessage('Google ile devam et başarısız') };
      }
    } catch (error) {
      console.error('Google continue hatası:', error);
      return { success: false, error: normalizeErrorMessage(error) };
    }
  }, [login]);

  const googleSignIn = useCallback(() => googleAuth(), [googleAuth]);
  const googleSignUp = useCallback(() => googleAuth(), [googleAuth]);

  return { 
    googleSignIn, 
    googleSignUp,
    googleAuth 
  };
};
