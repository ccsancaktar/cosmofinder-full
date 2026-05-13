import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';

export default function OnboardingWelcomeScreen({ navigation }) {
  const { t } = useTranslation();
  const { skipOnboarding } = useAuth();

  const handleSkip = async () => {
    await skipOnboarding();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#0D0B1F', '#1B1B2F', '#2A2A3F']} style={styles.container}>
        <View style={styles.topActions}>
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip} activeOpacity={0.85}>
            <Text style={styles.skipText}>{t('onboarding.skip')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.iconShell}>
            <LinearGradient colors={['rgba(197,161,0,0.26)', 'rgba(197,161,0,0.08)']} style={styles.iconGradient}>
              <Ionicons name="sparkles" size={42} color="#C5A100" />
            </LinearGradient>
          </View>

          <Text style={styles.title}>{t('onboarding.title')}</Text>
          <Text style={styles.subtitle}>{t('onboarding.subtitle')}</Text>

          <View style={styles.highlightCard}>
            <View style={styles.highlightRow}>
              <Ionicons name="person-outline" size={18} color="#C5A100" />
              <Text style={styles.highlightText}>{t('onboarding.firstName')}</Text>
            </View>
            <View style={styles.highlightRow}>
              <Ionicons name="calendar-outline" size={18} color="#C5A100" />
              <Text style={styles.highlightText}>{t('onboarding.birthDate')}</Text>
            </View>
            <View style={styles.highlightRow}>
              <Ionicons name="time-outline" size={18} color="#C5A100" />
              <Text style={styles.highlightText}>{t('onboarding.birthTime')}</Text>
            </View>
            <View style={styles.highlightRow}>
              <Ionicons name="location-outline" size={18} color="#C5A100" />
              <Text style={styles.highlightText}>{t('onboarding.birthPlace')}</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('OnboardingDetails')}
            activeOpacity={0.9}
          >
            <LinearGradient colors={['#E9C15F', '#C59A17']} style={styles.primaryButtonGradient}>
              <Text style={styles.primaryButtonText}>{t('onboarding.start')}</Text>
              <Ionicons name="arrow-forward" size={18} color="#0D0B1F" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: 24,
    paddingBottom: 28,
  },
  topActions: {
    alignItems: 'flex-end',
    paddingTop: 8,
  },
  skipButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  skipText: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 15,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconShell: {
    width: 116,
    height: 116,
    borderRadius: 58,
    padding: 1,
    marginBottom: 28,
    backgroundColor: 'rgba(197,161,0,0.16)',
  },
  iconGradient: {
    flex: 1,
    borderRadius: 57,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 14,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(255,255,255,0.72)',
    textAlign: 'center',
    marginBottom: 28,
    maxWidth: 310,
  },
  highlightCard: {
    width: '100%',
    borderRadius: 24,
    padding: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(197,161,0,0.16)',
    gap: 16,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  highlightText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  footer: {
    paddingTop: 12,
  },
  primaryButton: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  primaryButtonText: {
    color: '#0D0B1F',
    fontSize: 18,
    fontWeight: '700',
  },
});
