import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import Logo from '../../components/Logo';

export default function ForgotPasswordScreen({ navigation }) {
  const { t } = useTranslation();
  const { forgotPassword } = useAuth();
  const { showError, showSuccess } = useNotification();

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const handleSubmit = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      showError(t('auth.emailRequired'));
      return;
    }

    setSubmitting(true);
    const result = await forgotPassword(trimmedEmail);
    setSubmitting(false);

    if (!result.success) {
      showError(result.error);
      return;
    }

    setSuccessData(result.data);
    showSuccess(result.data?.message || t('auth.resetLinkSentMessage'));
  };

  const debugResetLink = successData?.debug_reset_link;
  const debugResetToken = successData?.debug_reset_token;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <LinearGradient colors={['#0D0B1F', '#1B1B2F', '#2A2A3F']} style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.85}>
              <Ionicons name="arrow-back" size={22} color="#C5A100" />
            </TouchableOpacity>

            <View style={styles.header}>
              <Logo size="large" />
              <Text style={styles.title}>{t('auth.forgotPassword')}</Text>
              <Text style={styles.subtitle}>{t('auth.forgotPasswordSubtitle')}</Text>
            </View>

            <View style={styles.card}>
              {!successData ? (
                <>
                  <View style={styles.inputContainer}>
                    <Ionicons name="mail-outline" size={20} color="#C5A100" />
                    <TextInput
                      style={styles.input}
                      placeholder={t('auth.email')}
                      placeholderTextColor="#8F8F9F"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={email}
                      onChangeText={setEmail}
                      editable={!submitting}
                    />
                  </View>

                  <Text style={styles.helperText}>{t('auth.resetEmailHint')}</Text>

                  <TouchableOpacity
                    style={[styles.primaryButton, submitting && styles.primaryButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={submitting}
                    activeOpacity={0.9}
                  >
                    <LinearGradient colors={['#E9C15F', '#C59A17']} style={styles.primaryButtonGradient}>
                      {submitting ? (
                        <ActivityIndicator color="#0D0B1F" size="small" />
                      ) : (
                        <>
                          <Text style={styles.primaryButtonText}>{t('auth.sendResetLink')}</Text>
                          <Ionicons name="arrow-forward" size={18} color="#0D0B1F" />
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <View style={styles.successIconWrap}>
                    <Ionicons name="mail-open-outline" size={28} color="#C5A100" />
                  </View>
                  <Text style={styles.successTitle}>{t('auth.resetLinkSentTitle')}</Text>
                  <Text style={styles.successText}>
                    {successData?.message || t('auth.resetLinkSentMessage')}
                  </Text>

                  {__DEV__ && (debugResetLink || debugResetToken) ? (
                    <View style={styles.debugCard}>
                      <Text style={styles.debugTitle}>{t('auth.debugResetAccess')}</Text>
                      {debugResetLink ? <Text style={styles.debugText}>{debugResetLink}</Text> : null}
                      {debugResetToken ? <Text style={styles.debugText}>{debugResetToken}</Text> : null}
                    </View>
                  ) : null}

                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => navigation.navigate('Login')}
                    activeOpacity={0.88}
                  >
                    <Text style={styles.secondaryButtonText}>{t('auth.backToSignIn')}</Text>
                  </TouchableOpacity>
                </>
              )}
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
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
  },
  backButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(197,161,0,0.18)',
  },
  header: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 24,
    color: 'rgba(255,255,255,0.72)',
    textAlign: 'center',
    maxWidth: 310,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(197,161,0,0.14)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 56,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    color: '#FFFFFF',
    fontSize: 16,
  },
  helperText: {
    marginTop: 14,
    marginBottom: 24,
    color: 'rgba(255,255,255,0.68)',
    fontSize: 14,
    lineHeight: 22,
  },
  primaryButton: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonGradient: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  primaryButtonText: {
    color: '#0D0B1F',
    fontSize: 17,
    fontWeight: '700',
  },
  successIconWrap: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignSelf: 'center',
    marginBottom: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(197,161,0,0.14)',
  },
  successTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  successText: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
  },
  debugCard: {
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(197,161,0,0.12)',
  },
  debugTitle: {
    color: '#C5A100',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  debugText: {
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 6,
  },
  secondaryButton: {
    marginTop: 22,
    minHeight: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
