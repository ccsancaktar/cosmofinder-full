import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

export default function AuthModal({ visible, onClose, onLogin, onRegister }) {
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#161127', '#1F1B36', '#292541']}
            style={styles.modalContent}
          >
            <TouchableOpacity style={styles.closeButton} onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Ionicons name="close" size={18} color="rgba(255,255,255,0.72)" />
            </TouchableOpacity>

            <View style={styles.header}>
              <LinearGradient colors={['rgba(197,161,0,0.24)', 'rgba(197,161,0,0.08)']} style={styles.iconHalo}>
                <View style={styles.iconBadge}>
                  <Ionicons name="lock-closed" size={24} color="#C5A100" />
                </View>
              </LinearGradient>
              <Text style={styles.title}>{t('auth.loginRequired')}</Text>
              <Text style={styles.subtitle}>
                {t('auth.loginRequiredMessage')}
              </Text>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.loginButton}
                onPress={onLogin}
              >
                <LinearGradient colors={['#D7B640', '#B68C12']} style={styles.primaryGradient}>
                  <Ionicons name="log-in" size={18} color="#140F06" />
                  <Text style={styles.loginButtonText}>{t('auth.loginNow')}</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.registerButton}
                onPress={onRegister}
              >
                <Ionicons name="person-add" size={20} color="#C5A100" />
                <Text style={styles.registerButtonText}>{t('auth.createAccountNow')}</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(8, 6, 20, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: width * 0.9,
    maxWidth: 420,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 20,
  },
  modalContent: {
    padding: 24,
    paddingTop: 22,
    paddingBottom: 34,
  },
  closeButton: {
    alignSelf: 'flex-end',
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconHalo: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  iconBadge: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(13, 11, 31, 0.94)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(197,161,0,0.30)',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#E0BE54',
    marginBottom: 8,
    fontFamily: 'CinzelDecorative-Bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.74,
    lineHeight: 22,
    fontFamily: 'Inter-Regular',
  },
  buttonContainer: {
    gap: 12,
  },
  loginButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  primaryGradient: {
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: '#140F06',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    fontFamily: 'Inter-Bold',
  },
  registerButton: {
    backgroundColor: 'rgba(197, 161, 0, 0.10)',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#C5A100',
  },
  registerButtonText: {
    color: '#C5A100',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    fontFamily: 'Inter-Bold',
  },
}); 
