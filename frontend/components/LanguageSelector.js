import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { useNotification } from '../context/NotificationContext';
import Ionicons from 'react-native-vector-icons/Ionicons';

const LanguageSelector = ({ style, compact = false, visible = false, onClose }) => {
  const { t } = useTranslation();
  const { showError } = useNotification();
  const { 
    currentLanguage, 
    switchLanguage, 
    getCurrentLanguageInfo, 
    getSupportedLanguages 
  } = useLanguage();
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isChanging, setIsChanging] = useState(false);

  // visible prop'u varsa onu kullan, yoksa local state'i kullan
  const modalVisible = visible !== undefined ? visible : isModalVisible;
  const setModalVisible = visible !== undefined ? onClose : setIsModalVisible;

  const currentLangInfo = getCurrentLanguageInfo();
  const supportedLanguages = getSupportedLanguages();

  const handleLanguageChange = async (languageCode) => {
    if (languageCode === currentLanguage) {
      setModalVisible(false);
      return;
    }

    try {
      setIsChanging(true);
      const success = await switchLanguage(languageCode);
      
      if (success) {
        setModalVisible(false);
        // Dil değişikliği sonrası kısa bir gecikme ekle
        setTimeout(() => {
          console.log('Dil değişikliği tamamlandı, modal kapatıldı');
        }, 100);
      }
    } catch (error) {
      showError('Dil değiştirme başarısız');
    } finally {
      setIsChanging(false);
    }
  };

  const handleModalOpen = () => {
    console.log('Modal açılıyor...');
    setIsModalVisible(true);
  };

  if (compact) {
    return (
      <>
        <TouchableOpacity
          style={[styles.compactButton, style]}
          onPress={handleModalOpen}
          disabled={isChanging}
        >
          <Text style={styles.compactFlag}>{currentLangInfo.flag}</Text>
        </TouchableOpacity>

        <Modal
          visible={isModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t('language.select')}</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setIsModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.languageList}>
                {supportedLanguages.map((lang) => (
                  <TouchableOpacity
                    key={lang.code}
                    style={[
                      styles.languageItem,
                      currentLanguage === lang.code && styles.selectedLanguage
                    ]}
                    onPress={() => handleLanguageChange(lang.code)}
                    disabled={isChanging}
                  >
                    <View style={styles.languageItemContent}>
                      <Text style={styles.languageFlag}>{lang.flag}</Text>
                      <Text style={[
                        styles.languageName,
                        currentLanguage === lang.code && styles.selectedLanguageName
                      ]}>
                        {lang.name}
                      </Text>
                    </View>
                    {currentLanguage === lang.code && (
                      <Ionicons name="checkmark" size={20} color="#C5A100" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </>
    );
  }

  // Modal prop'u ile kullanım için
  return (
    <Modal
      visible={modalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('language.select')}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.languageList}>
            {supportedLanguages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageItem,
                  currentLanguage === lang.code && styles.selectedLanguage
                ]}
                onPress={() => handleLanguageChange(lang.code)}
                disabled={isChanging}
              >
                <View style={styles.languageItemContent}>
                  <Text style={styles.languageFlag}>{lang.flag}</Text>
                  <Text style={[
                    styles.languageName,
                    currentLanguage === lang.code && styles.selectedLanguageName
                  ]}>
                    {lang.name}
                  </Text>
                </View>
                {currentLanguage === lang.code && (
                  <Ionicons name="checkmark" size={20} color="#C5A100" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  selectorButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    minWidth: 120,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  flag: {
    fontSize: 20,
    marginRight: 8,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    flex: 1,
  },
  arrow: {
    fontSize: 12,
    color: '#6c757d',
    marginLeft: 8,
  },
  compactButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(197, 161, 0, 0.25)',
    borderWidth: 2,
    borderColor: 'rgba(197, 161, 0, 0.5)',
    minWidth: 32,
    maxWidth: 36,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C5A100',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },

  compactFlag: {
    fontSize: 14,
    color: '#C5A100',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1B1B2F',
    borderRadius: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: '#C5A100',
    shadowColor: '#C5A100',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(197, 161, 0, 0.3)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#C5A100',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(197, 161, 0, 0.2)',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#C5A100',
    fontWeight: '600',
  },
  languageList: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  selectedLanguage: {
    backgroundColor: 'rgba(197, 161, 0, 0.2)',
    borderWidth: 2,
    borderColor: '#C5A100',
  },
  languageItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 16,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  selectedLanguageName: {
    color: '#C5A100',
  },
  checkmark: {
    fontSize: 20,
    color: '#C5A100',
    fontWeight: 'bold',
  },
  loadingContainer: {
    paddingVertical: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(197, 161, 0, 0.3)',
  },
  loadingText: {
    fontSize: 14,
    color: '#C5A100',
  },
});

export default LanguageSelector;
