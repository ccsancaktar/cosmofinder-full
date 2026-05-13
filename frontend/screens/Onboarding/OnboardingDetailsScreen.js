import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { useLanguage } from '../../context/LanguageContext';
import TimePickerField from '../../components/TimePickerField';

function formatDateForApi(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateForDisplay(value) {
  if (!value) return '';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

export default function OnboardingDetailsScreen() {
  const { t } = useTranslation();
  const { completeOnboarding, skipOnboarding, user } = useAuth();
  const { showError } = useNotification();
  const { currentLanguage } = useLanguage();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [birthDate, setBirthDate] = useState(user?.birth_date || '');
  const [birthTime, setBirthTime] = useState(user?.birth_time || '');
  const [birthPlace, setBirthPlace] = useState(user?.birth_place || '');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    user?.birth_date ? new Date(user.birth_date) : new Date(1998, 0, 1)
  );

  const cardOpacity = useRef(new Animated.Value(1)).current;
  const cardTranslate = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(step === 1 ? 0.5 : 1)).current;

  const pickerLocale = currentLanguage === 'de' ? 'de_DE' : currentLanguage === 'en' ? 'en_US' : 'tr_TR';

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.spring(cardTranslate, {
        toValue: 0,
        friction: 8,
        tension: 70,
        useNativeDriver: true,
      }),
      Animated.timing(progressAnim, {
        toValue: step === 1 ? 0.5 : 1,
        duration: 280,
        useNativeDriver: false,
      }),
    ]).start();
  }, [cardOpacity, cardTranslate, progressAnim, step]);

  const stepMeta = useMemo(() => {
    if (step === 1) {
      return {
        title: t('onboarding.birthStepTitle'),
        subtitle: t('onboarding.birthStepSubtitle'),
        icon: 'person',
      };
    }

    return {
      title: t('onboarding.locationStepTitle'),
      subtitle: t('onboarding.locationStepSubtitle'),
      icon: 'location',
    };
  }, [step, t]);

  const animateToStep = (nextStep) => {
    Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(cardTranslate, {
        toValue: -18,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      cardTranslate.setValue(18);
      setStep(nextStep);
    });
  };

  const handleDateChange = (_, nextDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (nextDate) {
      setSelectedDate(nextDate);
      setBirthDate(formatDateForApi(nextDate));
    }
  };

  const handleContinue = async () => {
    if (step === 1) {
      if (!firstName.trim()) {
        showError(t('onboarding.firstNameRequired'));
        return;
      }
      if (!birthDate) {
        showError(t('onboarding.birthDateRequired'));
        return;
      }
      animateToStep(2);
      return;
    }

    setLoading(true);
    const result = await completeOnboarding({
      first_name: firstName.trim(),
      birth_date: birthDate || null,
      birth_time: birthTime || null,
      birth_place: birthPlace.trim(),
    });
    setLoading(false);

    if (!result.success) {
      showError(result.error);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    const result = await skipOnboarding();
    setLoading(false);
    if (!result.success) {
      showError(result.error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0B1F" />
      <LinearGradient colors={['#0D0B1F', '#1B1B2F', '#2A2A3F']} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip} disabled={loading}>
            <Text style={styles.skipText}>{t('onboarding.skip')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.progressSection}>
          <Text style={styles.progressLabel}>{t('onboarding.stepLabel', { current: step, total: 2 })}</Text>
          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
        </View>

        <KeyboardAvoidingView
          style={styles.keyboardWrapper}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View
              style={[
                styles.stepCard,
                {
                  opacity: cardOpacity,
                  transform: [{ translateY: cardTranslate }],
                },
              ]}
            >
              <View style={styles.stepIconWrap}>
                <Ionicons name={stepMeta.icon} size={24} color="#C5A100" />
              </View>
              <Text style={styles.stepTitle}>{stepMeta.title}</Text>
              <Text style={styles.stepSubtitle}>{stepMeta.subtitle}</Text>

              {step === 1 ? (
                <>
                  <View style={styles.fieldBlock}>
                    <Text style={styles.fieldLabel}>{t('onboarding.firstName')}</Text>
                    <View style={styles.inputShell}>
                      <Ionicons name="person-outline" size={20} color="#C5A100" />
                      <TextInput
                        style={styles.textInput}
                        placeholder={t('onboarding.firstNamePlaceholder')}
                        placeholderTextColor="#8F8F9F"
                        value={firstName}
                        onChangeText={setFirstName}
                        editable={!loading}
                      />
                    </View>
                  </View>

                  <View style={styles.fieldBlock}>
                    <Text style={styles.fieldLabel}>{t('onboarding.birthDate')}</Text>
                    <TouchableOpacity style={styles.dateField} onPress={() => setShowDatePicker(true)} activeOpacity={0.88}>
                      <Text style={[styles.fieldValue, !birthDate && styles.placeholderText]}>
                        {birthDate ? formatDateForDisplay(birthDate) : t('onboarding.birthDatePlaceholder')}
                      </Text>
                      <Ionicons name="calendar-outline" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>

                </>
              ) : (
                <>
                  <View style={styles.fieldBlock}>
                    <Text style={styles.fieldLabel}>
                      {t('onboarding.birthTime')} <Text style={styles.optionalLabel}>({t('common.optional')})</Text>
                    </Text>
                    <TimePickerField
                      value={birthTime}
                      onChange={setBirthTime}
                      placeholder={t('onboarding.birthTimePlaceholder')}
                      title={t('onboarding.birthTime')}
                      cancelLabel={t('common.cancel')}
                      confirmLabel={t('common.ok')}
                      locale={pickerLocale}
                    />
                    <Text style={styles.hintText}>{t('onboarding.birthTimeHint')}</Text>
                  </View>

                  <View style={styles.fieldBlock}>
                    <Text style={styles.fieldLabel}>
                      {t('onboarding.birthPlace')} <Text style={styles.optionalLabel}>({t('common.optional')})</Text>
                    </Text>
                    <View style={styles.inputShell}>
                      <Ionicons name="location-outline" size={20} color="#C5A100" />
                      <TextInput
                        style={styles.textInput}
                        placeholder={t('onboarding.birthPlacePlaceholder')}
                        placeholderTextColor="#8F8F9F"
                        value={birthPlace}
                        onChangeText={setBirthPlace}
                        editable={!loading}
                      />
                    </View>
                  </View>
                </>
              )}
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>

        <View style={styles.footer}>
          {step === 2 ? (
            <TouchableOpacity style={styles.secondaryButton} onPress={() => animateToStep(1)} disabled={loading}>
              <Text style={styles.secondaryButtonText}>{t('common.previous')}</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.footerSpacer} />
          )}

          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
            onPress={handleContinue}
            disabled={loading}
            activeOpacity={0.9}
          >
            <LinearGradient colors={['#E9C15F', '#C59A17']} style={styles.primaryButtonGradient}>
              <Text style={styles.primaryButtonText}>{step === 1 ? t('onboarding.continue') : t('onboarding.complete')}</Text>
              <Ionicons name={step === 1 ? 'arrow-forward' : 'checkmark'} size={18} color="#0D0B1F" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {Platform.OS === 'ios' ? (
          <Modal visible={showDatePicker} transparent animationType="slide" onRequestClose={() => setShowDatePicker(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Text style={styles.modalButton}>{t('common.cancel')}</Text>
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>{t('onboarding.birthDate')}</Text>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Text style={styles.modalButton}>{t('common.ok')}</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                  themeVariant="dark"
                  locale={pickerLocale}
                  textColor="#FFFFFF"
                />
              </View>
            </View>
          </Modal>
        ) : (
          showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
              maximumDate={new Date()}
              locale={pickerLocale}
            />
          )
        )}
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
    paddingBottom: 26,
  },
  header: {
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
  progressSection: {
    paddingTop: 12,
    paddingBottom: 18,
  },
  progressLabel: {
    color: '#C5A100',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
  },
  progressTrack: {
    width: '100%',
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#C5A100',
  },
  keyboardWrapper: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  stepCard: {
    borderRadius: 28,
    padding: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(197,161,0,0.14)',
  },
  stepIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(197,161,0,0.12)',
    marginBottom: 18,
  },
  stepTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '700',
    marginBottom: 10,
  },
  stepSubtitle: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 24,
  },
  fieldBlock: {
    marginBottom: 18,
  },
  fieldLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
  },
  optionalLabel: {
    color: 'rgba(255,255,255,0.56)',
    fontWeight: '500',
  },
  dateField: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: 'rgba(197,161,0,0.18)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldValue: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  placeholderText: {
    color: '#8F8F9F',
  },
  hintText: {
    color: 'rgba(255,255,255,0.56)',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 10,
  },
  inputShell: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(197,161,0,0.18)',
    paddingHorizontal: 16,
  },
  textInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 12,
    paddingVertical: 17,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 12,
  },
  footerSpacer: {
    flex: 1,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButton: {
    flex: 1.25,
    borderRadius: 18,
    overflow: 'hidden',
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
  },
  primaryButtonText: {
    color: '#0D0B1F',
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0D0B1F',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#C5A100',
  },
  modalButton: {
    fontSize: 16,
    color: '#C5A100',
    fontWeight: '600',
  },
});
