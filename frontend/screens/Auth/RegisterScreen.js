import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useGoogleAuth } from '../../hooks/useGoogleAuth';
import { useNotification } from '../../context/NotificationContext';
import Logo from '../../components/Logo';

export default function RegisterScreen({ navigation }) {
  const { t } = useTranslation();
  const { showError } = useNotification();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  
  const { register } = useAuth();
  const { googleAuth } = useGoogleAuth();

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };


  const validateForm = () => {
    if (!formData.email.trim()) {
      showError(t('auth.emailRequired'));
      return false;
    }
    if (!formData.password.trim()) {
      showError(t('auth.passwordRequired'));
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      showError(t('auth.passwordsDoNotMatch'));
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    const result = await register(formData);
    setLoading(false);

    if (result.success) {
      return;
    } else {
      showError(result.error);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    const result = await googleAuth();
    setLoading(false);

    if (result.success) {
      return;
    } else {
      showError(result.error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#0D0B1F', '#1B1B2F', '#2A2A3F']}
        style={styles.container}
      >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Logo size="large" />
            <Text style={styles.appSubtitle}>{t('auth.quickStartHint')}</Text>
          </View>

          {/* Register Form */}
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>{t('auth.signUp')}</Text>
            <Text style={styles.formSubtitle}>{t('auth.continueWithEmail')}</Text>
            
            {/* Email */}
            <View style={styles.inputContainer}>
              <Ionicons name="mail" size={20} color="#C5A100" />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#666"
                value={formData.email}
                onChangeText={(value) => updateFormData('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            {/* Şifre */}
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed" size={20} color="#C5A100" />
              <TextInput
                style={styles.input}
                placeholder={t('auth.password')}
                placeholderTextColor="#666"
                value={formData.password}
                onChangeText={(value) => updateFormData('password', value)}
                secureTextEntry={!showPassword}
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
                disabled={loading}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color="#C5A100"
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.inputHelper}>{t('auth.passwordHelper')}</Text>

            {/* Şifre Tekrar */}
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed" size={20} color="#C5A100" />
              <TextInput
                style={styles.input}
                placeholder={t('auth.confirmPassword')}
                placeholderTextColor="#666"
                value={formData.confirmPassword}
                onChangeText={(value) => updateFormData('confirmPassword', value)}
                secureTextEntry={!showConfirmPassword}
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeButton}
                disabled={loading}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off" : "eye"}
                  size={20}
                  color="#C5A100"
                />
              </TouchableOpacity>
            </View>


            <TouchableOpacity
              style={[styles.registerButton, loading && styles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#000000" size="small" />
              ) : (
                <Text style={styles.registerButtonText}>{t('auth.register')}</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t('common.or')}</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Sign-Up Button - Altta */}
          <View style={styles.googleContainer}>
            <TouchableOpacity
              style={[styles.googleButton, loading && styles.googleButtonDisabled]}
              onPress={handleGoogleSignUp}
              disabled={loading}
            >
              <Ionicons name="logo-google" size={24} color="#FFFFFF" />
              <Text style={styles.googleButtonText}>{t('auth.continueWithGoogle')}</Text>
            </TouchableOpacity>
          </View>


          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>{t('auth.alreadyHaveAccount')}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={loading}>
                              <Text style={styles.loginLink}>{t('auth.login')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0D0B1F',
  },
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },

  googleContainer: {
    marginBottom: 16,
  },
  appSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 8,
    opacity: 0.8,
    fontFamily: 'Inter-Regular',
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'CinzelDecorative-Bold',
  },
  formSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.72)',
    textAlign: 'center',
    marginTop: -10,
    marginBottom: 24,
    fontFamily: 'Inter-Regular',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    marginBottom: 16,
    height: 50,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 12,
  },
  eyeButton: {
    padding: 8,
  },
  inputHelper: {
    color: 'rgba(255,255,255,0.56)',
    fontSize: 13,
    lineHeight: 18,
    marginTop: -4,
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  registerButton: {
    backgroundColor: '#C5A100',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dividerText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginHorizontal: 16,
    opacity: 0.7,
  },
  googleButton: {
    backgroundColor: '#DB4437',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  googleButtonDisabled: {
    opacity: 0.6,
  },
  googleButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  loginLink: {
    color: '#C5A100',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
}); 
