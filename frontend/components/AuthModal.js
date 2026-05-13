import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

const { width, height } = Dimensions.get('window');

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
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#0D0B1F', '#1B1B2F', '#2A2A3F']}
            style={styles.modalContent}
          >
            {/* Header */}
            <View style={styles.header}>
              <Ionicons name="lock-closed" size={48} color="#C5A100" />
              <Text style={styles.title}>{t('auth.loginRequired')}</Text>
              <Text style={styles.subtitle}>
                {t('auth.loginRequiredMessage')}
              </Text>
            </View>

            {/* Content */}
            <View style={styles.content}>
              <View style={styles.featureItem}>
                <Ionicons name="star" size={20} color="#C5A100" />
                <Text style={styles.featureText}>{t('auth.loginRequiredDescription')}</Text>
              </View>
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.loginButton}
                onPress={onLogin}
              >
                <Ionicons name="log-in" size={20} color="#000000" />
                <Text style={styles.loginButtonText}>{t('auth.loginNow')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.registerButton}
                onPress={onRegister}
              >
                <Ionicons name="person-add" size={20} color="#C5A100" />
                <Text style={styles.registerButtonText}>{t('auth.createAccountNow')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
              >
                <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.9,
    maxWidth: 400,
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalContent: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#C5A100',
    marginTop: 16,
    marginBottom: 8,
    fontFamily: 'CinzelDecorative-Bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 22,
    fontFamily: 'Inter-Regular',
  },
  content: {
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  featureText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 12,
    fontFamily: 'Inter-Regular',
  },
  buttonContainer: {
    gap: 12,
  },
  loginButton: {
    backgroundColor: '#C5A100',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    fontFamily: 'Inter-Bold',
  },
  registerButton: {
    backgroundColor: 'rgba(197, 161, 0, 0.2)',
    borderRadius: 12,
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
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    opacity: 0.7,
    fontFamily: 'Inter-Regular',
  },
}); 