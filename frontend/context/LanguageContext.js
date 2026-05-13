import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  initI18n, 
  changeLanguage, 
  getCurrentLanguage, 
  getLanguageInfo, 
  getAllLanguages,
  SUPPORTED_LANGUAGES 
} from '../locales/i18n';

// Context oluştur
const LanguageContext = createContext();

// Hook oluştur
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Provider component
export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('tr');
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // i18n'i başlat
  useEffect(() => {
    const initializeLanguage = async () => {
      try {
        setIsLoading(true);
        
        // i18n'i başlat
        await initI18n();
        
        // Mevcut dili al
        const storedLang = await AsyncStorage.getItem('user_language');
        let deviceLang;
        try {
          deviceLang = getCurrentLanguage();
        } catch (error) {
          console.log('Cihaz dili alınamadı, varsayılan kullanılıyor:', error);
          deviceLang = 'tr';
        }
        const initialLang = storedLang || deviceLang || 'tr';
        
        setCurrentLanguage(initialLang);
        setIsInitialized(true);
        
        console.log('Dil sistemi başlatıldı:', initialLang);
      } catch (error) {
        console.error('Dil sistemi başlatma hatası:', error);
        setCurrentLanguage('tr'); // Fallback
        setIsInitialized(true);
      } finally {
        setIsLoading(false);
      }
    };

    initializeLanguage();
  }, []);

  // Dil değiştirme fonksiyonu
  const switchLanguage = async (languageCode) => {
    try {
      if (!SUPPORTED_LANGUAGES[languageCode]) {
        throw new Error(`Desteklenmeyen dil: ${languageCode}`);
      }

      // Dil değiştir
      const success = await changeLanguage(languageCode);
      
      if (success) {
        setCurrentLanguage(languageCode);
        console.log(`Dil başarıyla değiştirildi: ${languageCode}`);
        
        // Force re-render için state'i tekrar set et
        setTimeout(() => {
          setCurrentLanguage(languageCode);
        }, 50);
        
        return true;
      } else {
        throw new Error('Dil değiştirme başarısız');
      }
    } catch (error) {
      console.error('Dil değiştirme hatası:', error);
      return false;
    }
  };

  // Mevcut dil bilgilerini al
  const getCurrentLanguageInfo = () => {
    return getLanguageInfo(currentLanguage);
  };

  // Tüm desteklenen dilleri al
  const getSupportedLanguages = () => {
    return getAllLanguages();
  };

  // Dil değişikliği olup olmadığını kontrol et
  const hasLanguageChanged = (newLanguage) => {
    return currentLanguage !== newLanguage;
  };

  // Context value
  const value = {
    // State
    currentLanguage,
    isInitialized,
    isLoading,
    
    // Actions
    switchLanguage,
    
    // Getters
    getCurrentLanguageInfo,
    getSupportedLanguages,
    hasLanguageChanged,
    
    // Constants
    SUPPORTED_LANGUAGES,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
