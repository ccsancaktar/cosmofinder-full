import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from './LanguageSelector';

const LanguageTest = () => {
  const { t } = useTranslation();
  const { currentLanguage, getCurrentLanguageInfo } = useLanguage();
  
  const currentLangInfo = getCurrentLanguageInfo();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌍 Dil Sistemi Testi</Text>
      
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Mevcut Dil:</Text>
        <Text style={styles.value}>{currentLangInfo.nativeName} {currentLangInfo.flag}</Text>
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Dil Kodu:</Text>
        <Text style={styles.value}>{currentLanguage}</Text>
      </View>
      
      <View style={styles.translationsContainer}>
        <Text style={styles.sectionTitle}>Çeviri Örnekleri:</Text>
        
        <View style={styles.translationItem}>
          <Text style={styles.translationKey}>common.loading:</Text>
          <Text style={styles.translationValue}>{t('common.loading')}</Text>
        </View>
        
        <View style={styles.translationItem}>
          <Text style={styles.translationKey}>fortune.title:</Text>
          <Text style={styles.translationValue}>{t('fortune.title')}</Text>
        </View>
        
        <View style={styles.translationItem}>
          <Text style={styles.translationKey}>auth.login:</Text>
          <Text style={styles.translationValue}>{t('auth.login')}</Text>
        </View>
        
        <View style={styles.translationItem}>
          <Text style={styles.translationKey}>premium.title:</Text>
          <Text style={styles.translationValue}>{t('premium.title')}</Text>
        </View>
      </View>
      
      <View style={styles.selectorContainer}>
        <Text style={styles.sectionTitle}>Dil Değiştirici:</Text>
        <LanguageSelector />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#212529',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
  },
  value: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: '600',
  },
  translationsContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#212529',
  },
  translationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  translationKey: {
    fontSize: 14,
    color: '#6c757d',
    fontFamily: 'monospace',
  },
  translationValue: {
    fontSize: 14,
    color: '#212529',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
    marginLeft: 10,
  },
  selectorContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default LanguageTest;
