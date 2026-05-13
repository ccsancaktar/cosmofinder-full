import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

// Dil dosyalarını import et
import tr from './tr.json';
import en from './en.json';
import de from './de.json';

// Desteklenen diller
export const SUPPORTED_LANGUAGES = {
  tr: {
    code: 'tr',
    name: 'Türkçe',
    flag: '🇹🇷',
    nativeName: 'Türkçe'
  },
  en: {
    code: 'en',
    name: 'English',
    flag: '🇺🇸',
    nativeName: 'English'
  },
  de: {
    code: 'de',
    name: 'Deutsch',
    flag: '🇩🇪',
    nativeName: 'Deutsch'
  }
};

// Varsayılan dil
const DEFAULT_LANGUAGE = 'tr';

// Dil kaynakları
const resources = {
  tr: {
    translation: tr
  },
  en: {
    translation: en
  },
  de: {
    translation: de
  }
};

// AsyncStorage'dan dil tercihini al
const getStoredLanguage = async () => {
  try {
    const storedLang = await AsyncStorage.getItem('user_language');
    return storedLang || null;
  } catch (error) {
    console.log('Dil tercihi alınamadı:', error);
    return null;
  }
};

// Cihaz dilini algıla
const getDeviceLanguage = () => {
  try {
    const deviceLang = Localization.locale;
    if (!deviceLang) {
      return DEFAULT_LANGUAGE;
    }
    const langCode = deviceLang.split('-')[0];
    return Object.keys(SUPPORTED_LANGUAGES).includes(langCode) ? langCode : DEFAULT_LANGUAGE;
  } catch (error) {
    console.log('Cihaz dili algılanamadı:', error);
    return DEFAULT_LANGUAGE;
  }
};

// i18n'i başlat
const initI18n = async () => {
  try {
    // Stored language'i al
    const storedLang = await getStoredLanguage();
    
    // Dil seçimi önceliği: stored > device > default
    const initialLang = storedLang || getDeviceLanguage() || DEFAULT_LANGUAGE;

  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: initialLang,
      fallbackLng: DEFAULT_LANGUAGE,
      debug: __DEV__, // Sadece development'ta debug
      
      // Interpolation ayarları
      interpolation: {
        escapeValue: false, // React zaten XSS koruması sağlıyor
      },
      
      // React Native için özel ayarlar
      react: {
        useSuspense: false, // React Native'de Suspense kullanmıyoruz
      },
      
      // Cache ayarları
      cache: {
        enabled: true,
        expirationTime: 7 * 24 * 60 * 60 * 1000, // 7 gün
      },
      
      // Hata ayıklama
      missingKeyHandler: (lng, ns, key, fallbackValue) => {
        if (__DEV__) {
          console.warn(`Missing translation key: ${key} for language: ${lng}`);
        }
        return fallbackValue || key;
      },
      
      // Varsayılan namespace
      defaultNS: 'translation',
      ns: ['translation'],
    });

    return i18n;
  } catch (error) {
    console.error('i18n başlatma hatası:', error);
    // Hata durumunda varsayılan ayarlarla başlat
    i18n
      .use(initReactI18next)
      .init({
        resources,
        lng: DEFAULT_LANGUAGE,
        fallbackLng: DEFAULT_LANGUAGE,
        debug: false,
        interpolation: {
          escapeValue: false,
        },
        react: {
          useSuspense: false,
        },
      });
    
    return i18n;
  }
};

// Dil değiştirme fonksiyonu
export const changeLanguage = async (languageCode) => {
  try {
    // Dil kodunu doğrula
    if (!SUPPORTED_LANGUAGES[languageCode]) {
      throw new Error(`Desteklenmeyen dil: ${languageCode}`);
    }

    // i18n'de dili değiştir
    await i18n.changeLanguage(languageCode);
    
    // AsyncStorage'a kaydet
    await AsyncStorage.setItem('user_language', languageCode);
    
    console.log(`Dil başarıyla değiştirildi: ${languageCode}`);
    return true;
  } catch (error) {
    console.error('Dil değiştirme hatası:', error);
    return false;
  }
};

// Mevcut dili al
export const getCurrentLanguage = () => {
  try {
    return i18n.language || DEFAULT_LANGUAGE;
  } catch (error) {
    console.log('i18n.language alınamadı:', error);
    return DEFAULT_LANGUAGE;
  }
};

// Dil bilgilerini al
export const getLanguageInfo = (languageCode) => {
  return SUPPORTED_LANGUAGES[languageCode] || SUPPORTED_LANGUAGES[DEFAULT_LANGUAGE];
};

// Tüm desteklenen dilleri al
export const getAllLanguages = () => {
  return Object.values(SUPPORTED_LANGUAGES);
};

// Varsayılan dili al
export const getDefaultLanguage = () => {
  return DEFAULT_LANGUAGE;
};

// i18n'i export et
export default i18n;

// Başlatma fonksiyonunu export et
export { initI18n };
