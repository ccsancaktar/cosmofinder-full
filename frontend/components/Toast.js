import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import i18n from '../locales/i18n';

const { width } = Dimensions.get('window');

const FEEDBACK_LABELS = {
  tr: {
    success: 'Tamam',
    error: 'Dikkat',
    warning: 'Not',
    info: 'Bilgi',
  },
  en: {
    success: 'Done',
    error: 'Attention',
    warning: 'Note',
    info: 'Info',
  },
  de: {
    success: 'Fertig',
    error: 'Hinweis',
    warning: 'Notiz',
    info: 'Info',
  },
};

const Toast = ({ visible, message, type = 'success', onHide, duration = 3000 }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      // Toast göster
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true })
      ]).start();

      // Otomatik gizle
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -100, duration: 300, useNativeDriver: true })
    ]).start(() => {
      if (onHide) onHide();
    });
  };

  const getToastStyle = () => {
    const language = i18n.language?.startsWith('de') ? 'de' : i18n.language?.startsWith('en') ? 'en' : 'tr';
    const labels = FEEDBACK_LABELS[language];

    switch (type) {
      case 'success':
        return { 
          label: labels.success,
          icon: 'checkmark-circle',
          iconColor: '#E9C15F',
          accent: '#B9952F',
          iconGlow: 'rgba(233,193,95,0.16)',
        };
      case 'error':
        return { 
          label: labels.error,
          icon: 'alert-circle',
          iconColor: '#F2A7A0',
          accent: '#A94442',
          iconGlow: 'rgba(242,167,160,0.16)',
        };
      case 'warning':
        return { 
          label: labels.warning,
          icon: 'warning',
          iconColor: '#F0C674',
          accent: '#C58B17',
          iconGlow: 'rgba(240,198,116,0.16)',
        };
      case 'info':
        return { 
          label: labels.info,
          icon: 'information-circle',
          iconColor: '#C5A100',
          accent: '#7667C8',
          iconGlow: 'rgba(118,103,200,0.18)',
        };
      default:
        return { 
          label: labels.success,
          icon: 'checkmark-circle',
          iconColor: '#E9C15F',
          accent: '#B9952F',
          iconGlow: 'rgba(233,193,95,0.16)',
        };
    }
  };

  const toastStyle = getToastStyle();

  if (!visible) return null;

  return (
    <Animated.View 
      style={[
        styles.toast,
        { 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <LinearGradient
        colors={['rgba(13,11,31,0.97)', 'rgba(27,27,47,0.98)', 'rgba(42,42,63,0.98)']}
        style={styles.gradient}
      >
        <View style={[styles.accentBar, { backgroundColor: toastStyle.accent }]} />
        <View style={[styles.iconShell, { backgroundColor: toastStyle.iconGlow }]}>
          <Ionicons name={toastStyle.icon} size={20} color={toastStyle.iconColor} />
        </View>
        <View style={styles.copyBlock}>
          <Text style={[styles.toastLabel, { color: toastStyle.iconColor }]}>{toastStyle.label}</Text>
          <Text style={styles.toastText}>{message}</Text>
        </View>
        <TouchableOpacity onPress={hideToast} style={styles.closeButton} activeOpacity={0.8}>
          <Ionicons name="close" size={18} color="rgba(255,255,255,0.72)" />
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 9999,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(197,161,0,0.12)',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 74,
    paddingLeft: 0,
    paddingRight: 12,
    paddingVertical: 12,
  },
  accentBar: {
    width: 4,
    alignSelf: 'stretch',
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
    marginRight: 14,
  },
  iconShell: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  copyBlock: {
    flex: 1,
    paddingRight: 10,
  },
  toastLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
});

export default Toast;
