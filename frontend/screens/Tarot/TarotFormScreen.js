import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { usePremium } from '../../context/PremiumContext';
import LazyImage from '../../components/LazyImage';
import FortuneInfoSheet from '../../components/FortuneInfoSheet';
import AdMobBanner from '../../components/AdMobBanner';
import useKeyboardVisibility from '../../hooks/useKeyboardVisibility';
import { fontStyles } from '../../utils/fontStyles';
import FortunePrimaryButton from '../../components/FortunePrimaryButton';

const TarotFormScreen = React.memo(() => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { hasPremium } = usePremium();
  const [niyet, setNiyet] = useState('');
  const [showInfoSheet, setShowInfoSheet] = useState(false);
  const isKeyboardVisible = useKeyboardVisibility();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0D0B1F" />

        <LinearGradient colors={['#0D0B1F', '#1B1B2F', '#2A2A3F']} style={styles.gradientBg}>
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.headerSection}>
              <LazyImage
                source={require('../../assets/backgrounds/tarot.jpg')}
                style={styles.headerBackgroundImage}
                resizeMode="cover"
                showPlaceholder={false}
                fadeInDuration={500}
              />
              <LinearGradient colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.9)']} style={styles.headerGradient}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonInCard}>
                  <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowInfoSheet(true)} style={styles.infoButtonInCard}>
                  <Ionicons name="information-circle-outline" size={22} color="#FFFFFF" />
                </TouchableOpacity>

                <Text style={styles.title}>{t('tarot.tarotFortune')}</Text>
                <Text style={styles.subtitle}>{t('tarot.tarotSubtitle')}</Text>

                <View style={styles.originInCard}>
                  <Ionicons name="globe" size={16} color="#C5A100" />
                  <Text style={styles.originTextInCard}>{t('tarot.italy')}</Text>
                </View>
              </LinearGradient>
            </View>

            <View style={styles.intentionCard}>
              <Text style={styles.eyebrow}>{t('tarot.writeIntention')}</Text>
              <Text style={styles.intentionTitle}>{t('tarot.intentStepTitle')}</Text>
              <Text style={styles.intentionDescription}>
                {hasPremium ? t('tarot.intentStepDescriptionPremium') : t('tarot.intentStepDescriptionFree')}
              </Text>

              {hasPremium ? (
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    placeholder={t('tarot.intentionPlaceholder')}
                    placeholderTextColor="#999"
                    value={niyet}
                    onChangeText={text => setNiyet(text.slice(0, 200))}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                  <Text style={styles.charCount}>{niyet.length} / 200</Text>
                </View>
              ) : (
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={styles.lockedQuestionCard}
                  onPress={() => navigation.navigate('Premium')}
                >
                  <View style={styles.lockedHeaderRow}>
                    <View style={styles.lockedFieldLabelWrap}>
                      <Text style={styles.lockedFieldLabel}>{t('tarot.writeIntention')}</Text>
                      <View style={styles.premiumMiniBadge}>
                        <Ionicons name="sparkles" size={11} color="#0D0B1F" />
                  <Text style={styles.premiumMiniBadgeText}>{t('premium.title')}</Text>
                      </View>
                    </View>
                    <Ionicons name="lock-closed" size={18} color="#F5D06A" />
                  </View>

                  <View style={styles.lockedTextarea}>
                    <Text style={styles.lockedPlaceholder}>{t('tarot.intentionPlaceholder')}</Text>
                  </View>

                  <View style={styles.lockedFooterRow}>
                    <View style={styles.premiumPromptContent}>
                      <Text style={styles.premiumPromptTitle}>{t('tarot.questionPremiumTitle')}</Text>
                      <Text style={styles.premiumPromptText}>{t('tarot.questionPremiumDescription')}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#F5D06A" />
                  </View>
                </TouchableOpacity>
              )}

              <View style={styles.previewCard}>
                <View style={styles.previewIconWrap}>
                  <Ionicons name="albums-outline" size={18} color="#F5D06A" />
                </View>
                <View style={styles.previewContent}>
                  <Text style={styles.previewTitle}>{t('tarot.chooseYourSpread')}</Text>
                  <Text style={styles.previewText}>{t('tarot.selectionSubtitle')}</Text>
                </View>
              </View>

              <FortunePrimaryButton
                label={t('tarot.continueToCardSelection')}
                onPress={() => navigation.navigate('TarotSelection', { niyet: hasPremium ? niyet.trim() : '' })}
                style={styles.submitButton}
              />

              {hasPremium ? (
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => navigation.navigate('TarotSelection', { niyet: '' })}
                >
                  <Text style={styles.secondaryButtonText}>{t('tarot.skipIntention')}</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </ScrollView>
        </LinearGradient>

        <FortuneInfoSheet
          visible={showInfoSheet}
          onClose={() => setShowInfoSheet(false)}
          title={t('tarot.tarotFortune')}
          subtitle={t('tarot.tarotSubtitle')}
          sections={[
            {
              title: t('tarot.whatIsTarot'),
              body: t('tarot.tarotDescription'),
              icon: 'albums-outline',
            },
          ]}
          tips={[t('tarot.tarottip1'), t('tarot.tarottip2'), t('tarot.tarottip3')]}
        />
        {!hasPremium && !showInfoSheet && !isKeyboardVisible ? (
          <View style={styles.bannerAdContainer}>
            <AdMobBanner />
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0D0B1F',
  },
  container: {
    flex: 1,
    backgroundColor: '#0D0B1F',
  },
  gradientBg: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  headerSection: {
    height: 240,
    overflow: 'hidden',
    position: 'relative',
  },
  headerBackgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  headerGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  backButtonInCard: {
    position: 'absolute',
    top: 40,
    left: 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    borderWidth: 1,
    borderColor: 'rgba(197, 161, 0, 0.3)',
  },
  infoButtonInCard: {
    position: 'absolute',
    top: 40,
    right: 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    borderWidth: 1,
    borderColor: 'rgba(197, 161, 0, 0.3)',
  },
  originInCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(197, 161, 0, 0.3)',
  },
  originTextInCard: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 4,
    ...fontStyles.body,
  },
  title: {
    fontSize: 28,
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    ...fontStyles.headingBold,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    ...fontStyles.body,
  },
  intentionCard: {
    padding: 24,
    backgroundColor: '#1B1B2F',
    minHeight: 520,
  },
  eyebrow: {
    fontSize: 13,
    color: '#F5D06A',
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    marginBottom: 10,
    ...fontStyles.bodyBold,
  },
  intentionTitle: {
    fontSize: 26,
    color: '#FFFFFF',
    marginBottom: 14,
    ...fontStyles.headingBold,
  },
  intentionDescription: {
    fontSize: 16,
    lineHeight: 25,
    color: '#D2D1DD',
    marginBottom: 24,
    ...fontStyles.body,
  },
  inputContainer: {
    marginBottom: 24,
  },
  lockedQuestionCard: {
    backgroundColor: 'rgba(245, 208, 106, 0.06)',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(245, 208, 106, 0.2)',
    marginBottom: 24,
  },
  lockedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  lockedFieldLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lockedFieldLabel: {
    color: '#F0EEF7',
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
    ...fontStyles.bodyBold,
  },
  premiumMiniBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#F5D06A',
  },
  premiumMiniBadgeText: {
    color: '#0D0B1F',
    fontSize: 11,
    ...fontStyles.bodyBold,
  },
  lockedTextarea: {
    minHeight: 110,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(245, 208, 106, 0.16)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    justifyContent: 'flex-start',
    marginBottom: 14,
  },
  lockedPlaceholder: {
    color: 'rgba(255,255,255,0.36)',
    fontSize: 16,
    ...fontStyles.body,
  },
  lockedFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  premiumPromptIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(245, 208, 106, 0.12)',
  },
  premiumPromptContent: {
    flex: 1,
  },
  premiumPromptTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    marginBottom: 4,
    ...fontStyles.headingBold,
  },
  premiumPromptText: {
    color: '#D3D1DE',
    fontSize: 14,
    lineHeight: 21,
    ...fontStyles.body,
  },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 18,
    padding: 18,
    fontSize: 16,
    color: '#FFFFFF',
    minHeight: 110,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    ...fontStyles.body,
  },
  charCount: {
    fontSize: 13,
    color: '#8D8AA7',
    textAlign: 'right',
    marginTop: 8,
    ...fontStyles.body,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(245, 208, 106, 0.16)',
    marginBottom: 24,
  },
  previewIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(245, 208, 106, 0.12)',
  },
  previewContent: {
    flex: 1,
  },
  previewTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    marginBottom: 6,
    ...fontStyles.headingBold,
  },
  previewText: {
    color: '#C9C8D7',
    fontSize: 15,
    lineHeight: 22,
    ...fontStyles.body,
  },
  submitButton: {
    marginHorizontal: 18,
    marginBottom: 32,
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 10,
  },
  secondaryButtonText: {
    color: '#C5A100',
    fontSize: 15,
    ...fontStyles.bodyBold,
  },
  bannerAdContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0D0B1F',
  },
});

export default TarotFormScreen;
