import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

export default function ChangePasswordScreen({ navigation }) {
  const { t } = useTranslation();
  const { changePassword, loading } = useAuth();
  const { showError, showSuccess } = useNotification();
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);

    if (password.length < minLength) {
      return t('password.minLengthError');
    }
    if (!hasUpperCase) {
      return t('password.uppercaseError');
    }
    if (!hasLowerCase) {
      return t('password.lowercaseError');
    }
    if (!hasNumbers) {
      return t('password.numberError');
    }
    return null;
  };

  const handleChangePassword = async () => {
    // Validation
    if (!formData.currentPassword.trim()) {
      showError(t('password.currentPasswordRequired'));
      return;
    }

    if (!formData.newPassword.trim()) {
      showError(t('password.newPasswordRequired'));
      return;
    }

    if (!formData.confirmPassword.trim()) {
      showError(t('password.confirmPasswordRequired'));
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      showError(t('password.mismatchError'));
      return;
    }

    const passwordError = validatePassword(formData.newPassword);
    if (passwordError) {
      showError(passwordError);
      return;
    }

    setIsUpdating(true);
    try {
      const result = await changePassword({
        current_password: formData.currentPassword,
        new_password: formData.newPassword,
      });
      
      if (result.success) {
        showSuccess(t('password.changeSuccess'));
        // Form'u temizle
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setTimeout(() => navigation.goBack(), 1500);
      } else {
        showError(result.error || t('password.changeError'));
      }
    } catch (error) {
      showError(t('password.changeError'));
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top']}>
        <ActivityIndicator size="large" color="#C5A100" />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={['#0D0B1F', '#1B1B2F', '#2A2A3F']}
        style={styles.gradientBg}
      >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#C5A100" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('password.changePassword')}</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color="#C5A100" />
            <Text style={styles.infoText}>
              {t('password.infoText')}
            </Text>
          </View>

          {/* Current Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t('password.currentPassword')} *</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={formData.currentPassword}
                onChangeText={(text) => handleInputChange('currentPassword', text)}
                placeholder={t('password.currentPasswordPlaceholder')}
                placeholderTextColor="#666"
                secureTextEntry={!showPasswords.current}
                editable={!isUpdating}
              />
              <TouchableOpacity
                onPress={() => togglePasswordVisibility('current')}
                style={styles.eyeButton}
                disabled={isUpdating}
              >
                <Ionicons
                  name={showPasswords.current ? "eye-off" : "eye"}
                  size={20}
                  color="#C5A100"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* New Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t('password.newPassword')} *</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={formData.newPassword}
                onChangeText={(text) => handleInputChange('newPassword', text)}
                placeholder={t('password.newPasswordPlaceholder')}
                placeholderTextColor="#666"
                secureTextEntry={!showPasswords.new}
                editable={!isUpdating}
              />
              <TouchableOpacity
                onPress={() => togglePasswordVisibility('new')}
                style={styles.eyeButton}
                disabled={isUpdating}
              >
                <Ionicons
                  name={showPasswords.new ? "eye-off" : "eye"}
                  size={20}
                  color="#C5A100"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t('password.confirmPassword')} *</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={formData.confirmPassword}
                onChangeText={(text) => handleInputChange('confirmPassword', text)}
                placeholder={t('password.confirmPasswordPlaceholder')}
                placeholderTextColor="#666"
                secureTextEntry={!showPasswords.confirm}
                editable={!isUpdating}
              />
              <TouchableOpacity
                onPress={() => togglePasswordVisibility('confirm')}
                style={styles.eyeButton}
                disabled={isUpdating}
              >
                <Ionicons
                  name={showPasswords.confirm ? "eye-off" : "eye"}
                  size={20}
                  color="#C5A100"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Password Requirements */}
          <View style={styles.requirementsCard}>
            <Text style={styles.requirementsTitle}>{t('password.requirementsTitle')}:</Text>
            <View style={styles.requirementItem}>
              <Ionicons 
                name={formData.newPassword.length >= 8 ? "checkmark-circle" : "close-circle"} 
                size={16} 
                color={formData.newPassword.length >= 8 ? "#4CAF50" : "#FF6B6B"} 
              />
              <Text style={[styles.requirementText, formData.newPassword.length >= 8 && styles.requirementMet]}>
                {t('password.minLength')}
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <Ionicons 
                name={/[A-Z]/.test(formData.newPassword) ? "checkmark-circle" : "close-circle"} 
                size={16} 
                color={/[A-Z]/.test(formData.newPassword) ? "#4CAF50" : "#FF6B6B"} 
              />
              <Text style={[styles.requirementText, /[A-Z]/.test(formData.newPassword) && styles.requirementMet]}>
                {t('password.uppercase')}
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <Ionicons 
                name={/[a-z]/.test(formData.newPassword) ? "checkmark-circle" : "close-circle"} 
                size={16} 
                color={/[a-z]/.test(formData.newPassword) ? "#4CAF50" : "#FF6B6B"} 
              />
              <Text style={[styles.requirementText, /[a-z]/.test(formData.newPassword) && styles.requirementMet]}>
                {t('password.lowercase')}
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <Ionicons 
                name={/\d/.test(formData.newPassword) ? "checkmark-circle" : "close-circle"} 
                size={16} 
                color={/\d/.test(formData.newPassword) ? "#4CAF50" : "#FF6B6B"} 
              />
              <Text style={[styles.requirementText, /\d/.test(formData.newPassword) && styles.requirementMet]}>
                {t('password.number')}
              </Text>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, isUpdating && styles.submitButtonDisabled]}
            onPress={handleChangePassword}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <ActivityIndicator size="small" color="#000000" />
            ) : (
              <Text style={styles.submitButtonText}>{t('password.changePassword')}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0B1F',
  },
  gradientBg: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0D0B1F',
  },
  loadingText: {
    color: '#C5A100',
    fontSize: 16,
    marginTop: 16,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'ios' ? 16 : 20,
    marginTop: 0,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'CinzelDecorative-Bold',
    color: '#C5A100',
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(197, 161, 0, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  infoText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 8,
    fontWeight: '500',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
  },
  eyeButton: {
    padding: 12,
  },
  requirementsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  requirementsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#C5A100',
    marginBottom: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 8,
    opacity: 0.7,
  },
  requirementMet: {
    opacity: 1,
    color: '#4CAF50',
  },
  submitButton: {
    backgroundColor: '#C5A100',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 
