import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BONUS_AMOUNTS, useToken, TOKEN_COSTS } from '../../context/TokenContext';
import { usePremium } from '../../context/PremiumContext';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../../context/NotificationContext';
import { showRewardedAd, preloadRewardedAd } from '../../utils/rewardedAd';

export default function TokenBalanceScreen({ navigation }) {
  const { t } = useTranslation();
  const { showSuccess, showError } = useNotification();
  const {
    balance,
    loading,
    dailyBonusStatus,
    fetchBalance,
    fetchDailyBonusStatus,
    fetchVideoLimitStatus,
    watchVideo,
    claimDailyBonus,
  } = useToken();
  const { hasPremium } = usePremium();
  const [videoLoading, setVideoLoading] = useState(false);
  const [bonusLoading, setBonusLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [videoCooldown, setVideoCooldown] = useState(0);
  const [videoLimitReached, setVideoLimitReached] = useState(false);

  useEffect(() => {
    fetchBalance();
    fetchDailyBonusStatus();
    checkVideoLimit();
    preloadRewardedAd();
  }, []);

  const checkVideoLimit = async () => {
    try {
      const status = await fetchVideoLimitStatus();
      setVideoLimitReached(status.limit_reached);
    } catch (error) {
      console.log('Video limit kontrol hatası:', error);
    }
  };

  useEffect(() => {
    if (dailyBonusStatus.remainingSeconds > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            fetchDailyBonusStatus();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [dailyBonusStatus.remainingSeconds]);

  useEffect(() => {
    setCountdown(dailyBonusStatus.remainingSeconds);
  }, [dailyBonusStatus.remainingSeconds]);

  useEffect(() => {
    if (videoCooldown > 0) {
      const timer = setInterval(() => {
        setVideoCooldown((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [videoCooldown]);

  const fortuneEstimate = useMemo(() => {
    if (hasPremium) return null;

    const options = [
      { label: 'daily', cost: TOKEN_COSTS.DAILY },
      { label: 'tarot', cost: TOKEN_COSTS.TAROT },
      { label: 'numerology', cost: TOKEN_COSTS.NUMEROLOGY },
    ];

    return options.map((item) => ({
      ...item,
      count: Math.floor(balance / item.cost),
    }));
  }, [balance, hasPremium]);

  const handleWatchVideo = async () => {
    try {
      setVideoLoading(true);
      setVideoCooldown(30);

      const reward = await showRewardedAd();
      const result = await watchVideo(reward.amount);
      await fetchBalance();

      showSuccess(
        `${t('common.videoReward', { amount: reward.amount })} ${t('common.newBalance', {
          balance: result.new_balance,
        })}`
      );

      await checkVideoLimit();
      preloadRewardedAd();
    } catch (error) {
      console.log('Video izleme hatası:', error);
      showError(error.message || t('common.videoError'));
      setVideoCooldown(0);
    } finally {
      setVideoLoading(false);
    }
  };

  const handleDailyBonus = async () => {
    try {
      setBonusLoading(true);
      const result = await claimDailyBonus();
      showSuccess(
        `${result.message} ${t('common.newBalance', { balance: result.new_balance })}`
      );
    } catch (error) {
      showError(error.message || t('common.dailyBonusError'));
    } finally {
      setBonusLoading(false);
    }
  };

  const formatCountdown = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const videoButtonLabel = videoLoading
    ? t('common.watchingAd')
    : videoCooldown > 0
      ? `${t('common.waitTime')}: ${videoCooldown}s`
      : videoLimitReached
        ? `${t('common.dailyLimitReached')} (${BONUS_AMOUNTS.DAILY_VIDEO_LIMIT}/${BONUS_AMOUNTS.DAILY_VIDEO_LIMIT})`
        : `${t('common.watchVideo')} (+${BONUS_AMOUNTS.VIDEO} ${t('common.tokens')})`;

  const bonusButtonLabel = bonusLoading
    ? t('common.claiming')
    : !dailyBonusStatus.canClaim
      ? `${t('common.nextBonus')}: ${formatCountdown(countdown)}`
      : `${t('common.dailyBonus')} (+${BONUS_AMOUNTS.DAILY} ${t('common.tokens')})`;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#C5A100" />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <LinearGradient colors={['#0D0B1F', '#1B1B2F', '#2A2A3F']} style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#C5A100" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('common.tokenBalance')}</Text>
            <View style={styles.headerSpacer} />
          </View>

          <LinearGradient
            colors={hasPremium ? ['rgba(197,161,0,0.22)', 'rgba(74,74,138,0.24)'] : ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.04)']}
            style={styles.heroCard}
          >
            <View style={styles.heroTopRow}>
              <View style={styles.heroBadge}>
                <Ionicons
                  name={hasPremium ? 'diamond' : 'sparkles'}
                  size={16}
                  color={hasPremium ? '#FFE082' : '#C5A100'}
                />
                <Text style={styles.heroBadgeText}>
                  {hasPremium ? t('common.premiumActive') : t('common.currentTokens')}
                </Text>
              </View>
            </View>

            <Text style={[styles.heroValue, hasPremium && styles.heroValuePremium]}>
              {hasPremium ? '∞' : balance}
            </Text>
            <Text style={styles.heroSubtitle}>
              {hasPremium ? t('common.unlimitedFortunes1') : t('common.tokenInfo')}
            </Text>

            {!hasPremium && fortuneEstimate ? (
              <View style={styles.estimateRow}>
                {fortuneEstimate.map((item) => (
                  <View key={item.label} style={styles.estimatePill}>
                    <Text style={styles.estimateCount}>{item.count}</Text>
                    <Text style={styles.estimateText}>{t(`fortune.${item.label}`)}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            {!hasPremium ? (
              <View style={styles.freeEarnStrip}>
                <View style={styles.freeEarnStripItem}>
                  <Text style={styles.freeEarnStripValue}>+{BONUS_AMOUNTS.DAILY}</Text>
                  <Text style={styles.freeEarnStripLabel}>{t('tokens.dailyGift')}</Text>
                </View>
                <View style={styles.freeEarnStripItem}>
                  <Text style={styles.freeEarnStripValue}>+{BONUS_AMOUNTS.VIDEO}</Text>
                  <Text style={styles.freeEarnStripLabel}>{t('tokens.videoReward')}</Text>
                </View>
                <View style={styles.freeEarnStripItem}>
                  <Text style={styles.freeEarnStripValue}>+{BONUS_AMOUNTS.DAILY + (BONUS_AMOUNTS.VIDEO * BONUS_AMOUNTS.DAILY_VIDEO_LIMIT)}</Text>
                  <Text style={styles.freeEarnStripLabel}>{t('tokens.dailyMax')}</Text>
                </View>
              </View>
            ) : null}

            <View style={styles.heroActions}>
              {!hasPremium ? (
                <>
                  <TouchableOpacity
                    style={styles.primaryAction}
                    onPress={() => navigation.navigate('TokenPurchase')}
                  >
                    <Ionicons name="add-circle" size={18} color="#0D0B1F" />
                    <Text style={styles.primaryActionText}>{t('common.buyTokens')}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.secondaryAction}
                    onPress={() => navigation.navigate('Premium')}
                  >
                    <Ionicons name="diamond-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.secondaryActionText}>{t('common.goPremium1')}</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={styles.primaryAction}
                  onPress={() => navigation.navigate('Premium')}
                >
                  <Ionicons name="diamond" size={18} color="#0D0B1F" />
                  <Text style={styles.primaryActionText}>{t('common.goPremium')}</Text>
                </TouchableOpacity>
              )}
            </View>
          </LinearGradient>

          {!hasPremium ? (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{t('common.earnTokens')}</Text>
                <Text style={styles.sectionHint}>{t('common.dailyBonusInfo')}</Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.actionRow,
                  (videoLoading || videoCooldown > 0 || videoLimitReached) && styles.actionRowDisabled,
                ]}
                onPress={handleWatchVideo}
                disabled={videoLoading || videoCooldown > 0 || videoLimitReached}
              >
                <View style={[styles.actionIconWrap, styles.videoIconWrap]}>
                  <Ionicons name="play-circle" size={22} color="#6DDC8B" />
                </View>
                <View style={styles.actionCopy}>
                  <Text style={styles.actionTitle}>{t('common.watchVideo')}</Text>
                  <Text style={styles.actionDescription}>{videoButtonLabel}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.45)" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionRow,
                  (bonusLoading || !dailyBonusStatus.canClaim) && styles.actionRowDisabled,
                ]}
                onPress={handleDailyBonus}
                disabled={bonusLoading || !dailyBonusStatus.canClaim}
              >
                <View style={[styles.actionIconWrap, styles.bonusIconWrap]}>
                  <Ionicons name="gift" size={22} color="#F5C04F" />
                </View>
                <View style={styles.actionCopy}>
                  <Text style={styles.actionTitle}>{t('common.dailyBonus')}</Text>
                  <Text style={styles.actionDescription}>{bonusButtonLabel}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.45)" />
              </TouchableOpacity>
            </View>
          ) : null}

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{t('common.tokenInfo1')}</Text>

            <TouchableOpacity
              style={styles.navRow}
              onPress={() => navigation.navigate('TokenHistory')}
            >
              <View style={styles.navIconWrap}>
                <Ionicons name="list" size={20} color="#C5A100" />
              </View>
              <View style={styles.actionCopy}>
                <Text style={styles.actionTitle}>{t('common.tokenHistory')}</Text>
                <Text style={styles.actionDescription}>
                  {hasPremium ? t('common.unlimitedFortunes1') : t('common.tokenInfo')}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.45)" />
            </TouchableOpacity>
          </View>
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(197,161,0,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSpacer: {
    width: 42,
    height: 42,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'CinzelDecorative-Bold',
    color: '#C5A100',
  },
  heroCard: {
    marginHorizontal: 20,
    marginBottom: 18,
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 8,
  },
  heroValue: {
    fontSize: 52,
    lineHeight: 58,
    fontWeight: '800',
    color: '#FFD76B',
    marginBottom: 8,
  },
  heroValuePremium: {
    fontSize: 60,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.74)',
    fontSize: 14,
    lineHeight: 22,
  },
  freeEarnStrip: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    marginBottom: 2,
  },
  freeEarnStripItem: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  freeEarnStripValue: {
    color: '#FFD76B',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  freeEarnStripLabel: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 11,
    textAlign: 'center',
  },
  estimateRow: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 18,
    justifyContent: 'space-between',
  },
  estimatePill: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  estimateCount: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  estimateText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 11,
    textAlign: 'center',
  },
  heroActions: {
    marginTop: 18,
  },
  primaryAction: {
    height: 56,
    borderRadius: 18,
    backgroundColor: '#C5A100',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 12,
  },
  primaryActionText: {
    color: '#0D0B1F',
    fontWeight: '800',
    fontSize: 16,
    marginLeft: 10,
  },
  secondaryAction: {
    height: 54,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  secondaryActionText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
    marginLeft: 10,
  },
  sectionCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 24,
    padding: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  sectionHeader: {
    marginBottom: 8,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  sectionHint: {
    color: 'rgba(255,255,255,0.58)',
    fontSize: 13,
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  actionRowDisabled: {
    opacity: 0.58,
  },
  actionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  videoIconWrap: {
    backgroundColor: 'rgba(109,220,139,0.14)',
  },
  bonusIconWrap: {
    backgroundColor: 'rgba(245,192,79,0.14)',
  },
  navIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    backgroundColor: 'rgba(197,161,0,0.14)',
  },
  actionCopy: {
    flex: 1,
    paddingRight: 10,
  },
  actionTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  actionDescription: {
    color: 'rgba(255,255,255,0.60)',
    fontSize: 13,
    lineHeight: 20,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
});
