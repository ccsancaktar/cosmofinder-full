import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';

const LanguageDropdown = ({ style }) => {
  const { t } = useTranslation();
  const { currentLanguage, switchLanguage, getCurrentLanguageInfo, getSupportedLanguages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const currentLangInfo = getCurrentLanguageInfo();
  const supportedLanguages = getSupportedLanguages();

  const toggleDropdown = () => {
    const toValue = isOpen ? 0 : 1;
    Animated.timing(animation, {
      toValue,
      duration: 200,
      useNativeDriver: false,
    }).start();
    setIsOpen(!isOpen);
  };

  const handleLanguageSelect = async (languageCode) => {
    if (languageCode === currentLanguage) {
      toggleDropdown();
      return;
    }

    try {
      await switchLanguage(languageCode);
      toggleDropdown();
    } catch (error) {
      console.error('Dil değiştirme hatası:', error);
    }
  };

  const dropdownHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, supportedLanguages.length * 40],
  });

  const rotateIcon = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={styles.trigger}
        onPress={toggleDropdown}
        activeOpacity={0.7}
      >
        <Ionicons name="language" size={20} color="#C5A100" />
        <Animated.View style={{ transform: [{ rotate: rotateIcon }] }}>
          <Ionicons name="chevron-down" size={16} color="#C5A100" />
        </Animated.View>
      </TouchableOpacity>

      <Animated.View style={[styles.dropdown, { height: dropdownHeight }]}>
        {supportedLanguages.map((lang) => (
          <TouchableOpacity
            key={lang.code}
            style={[
              styles.languageItem,
              currentLanguage === lang.code && styles.selectedLanguage
            ]}
            onPress={() => handleLanguageSelect(lang.code)}
          >
            <Text style={styles.languageFlag}>{lang.flag}</Text>
          </TouchableOpacity>
        ))}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 9999,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomWidth: 0,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#1B1B2F',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C5A100',
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 9999,
  },
  languageItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A3F',
  },
  selectedLanguage: {
    backgroundColor: '#C5A10020',
  },
  languageFlag: {
    fontSize: 20,
  },
});

export default LanguageDropdown;
