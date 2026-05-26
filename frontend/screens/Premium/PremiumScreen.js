import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { usePremium } from '../../context/PremiumContext';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../../context/NotificationContext';
import PaymentAPI from '../../services/paymentAPI';
import purchasesService from '../../services/purchasesService';

const { width } = Dimensions.get('window');
const PLAN_CARD_WIDTH = width - 40;

export default function PremiumScreen({ navigation }) {
  const { t } = useTranslation();
  const { showError, showSuccess, showInfo } = useNotification();
  const { hasPremium, daysRemaining, loading, fetchStatus, updateStatus } = usePremium();
  const [plans, setPlans] = useState([]);
  const [loadingPlanId, setLoadingPlanId] = useState(null);
  const [storeReady, setStoreReady] = useState(true);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    fetchStatus();
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const offering = await purchasesService.getCurrentOffering();
      const packages = offering?.availablePackages || [];
      const normalized = packages
        .map((pkg) => {
          const product = pkg.product;
          const productId = product?.identifier || '';
          const isMonthly = productId === 'premium_monthly';
          const isSixMonths = productId === 'premium_yearly';

          if (!isMonthly && !isSixMonths) {
            return null;
          }

          return {
            id: productId,
            name: isMonthly ? t('premium.monthlyCardTitle') : t('premium.sixMonthCardTitle'),
            rcPackage: pkg,
            price: Number(product?.price ?? 0),
            localizedPrice: product?.priceString || '',
            period: isMonthly ? t('premium.monthUnit') : t('premium.sixMonthUnit'),
            features: isMonthly
              ? [
                  t('premium.monthlyFeature1'),
                  t('premium.monthlyFeature2'),
                  t('premium.monthlyFeature3'),
                ]
              : [
                  t('premium.sixMonthFeature1'),
                  t('premium.sixMonthFeature2'),
                  t('premium.sixMonthFeature3'),
                ],
          };
        })
        .filter(Boolean)
        .sort((a, b) => (a.id === 'premium_monthly' ? -1 : 1));

      setStoreReady(normalized.length > 0);
      setPlans(normalized);
    } catch (error) {
      setStoreReady(false);
      console.warn('Premium offerings could not be loaded:', error?.message || error);
    }
  };

  const handleSubscribe = async (plan) => {
    if (!plan) {
      showError(t('premium.selectPlan'));
      return;
    }

    try {
      setLoadingPlanId(plan.id);
      await purchasesService.purchasePackage(plan.rcPackage);
      const syncResult = await PaymentAPI.syncMobilePremiumPurchase();
      await fetchStatus();
      updateStatus({
        has_premium: Boolean(syncResult?.has_premium),
        plan_type: syncResult?.plan_type || plan.id,
        days_remaining: syncResult?.days_remaining ?? (plan.id === 'premium_monthly' ? 30 : 182),
      });
      showSuccess(t('premium.purchaseSuccessful'));
    } catch (error) {
      console.error('Premium subscription error:', error);
      if (error?.userCancelled) {
        return;
      }
      showError(error?.message || t('premium.purchaseFailed'));
    } finally {
      setLoadingPlanId(null);
    }
  };

  const handleRestorePurchases = async () => {
    try {
      setIsRestoring(true);
      await purchasesService.restorePurchases();
      const syncResult = await PaymentAPI.syncMobilePremiumPurchase();

      updateStatus({
        has_premium: Boolean(syncResult?.has_premium),
        plan_type: syncResult?.plan_type || null,
        days_remaining: syncResult?.days_remaining ?? null,
      });

      if (syncResult?.has_premium) {
        showSuccess(t('premium.restorePurchaseSuccess'));
      } else {
        showInfo(t('premium.restorePurchaseEmpty'));
      }
    } catch (error) {
      console.error('Restore purchase error:', error);
      showError(error?.message || t('premium.restorePurchaseFailed'));
    } finally {
      setIsRestoring(false);
    }
  };

  const visiblePlans = Array.isArray(plans)
    ? [...plans].sort((a, b) => {
        const aIsYearly = a.id?.includes('yearly');
        const bIsYearly = b.id?.includes('yearly');

        if (aIsYearly !== bIsYearly) return aIsYearly ? 1 : -1;
        return 0;
      })
    : [];

  const getPlanMeta = (plan) => {
    const isYearly = plan.id?.includes('yearly');

    return {
      isYearly,
      badgeText: isYearly ? t('premium.sixMonthBadge') : t('premium.monthlyBadge'),
      eyebrow: isYearly ? t('premium.sixMonthEyebrow') : t('premium.monthlyEyebrow'),
      description: isYearly
        ? t('premium.sixMonthDescription')
        : t('premium.monthlyDescription'),
      accentBorder: isYearly ? 'rgba(245, 208, 106, 0.34)' : 'rgba(197, 161, 0, 0.16)',
      ctaLabel: isYearly ? t('premium.sixMonthCta') : t('premium.monthlyCta'),
    };
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top']}>
        <ActivityIndicator size="large" color="#C5A100" />
        <Text style={styles.loadingText}>{t('premium.loading')}</Text>
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
          <Text style={styles.headerTitle}>{t('premium.choosePlan')}</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Premium Status for Premium Users */}
        {hasPremium && (
          <View style={styles.premiumStatusInfo}>
            <View style={styles.premiumStatusCardCompact}>
              <LinearGradient
                colors={['#4CAF50', '#45A049']}
                style={styles.premiumStatusGradientCompact}
              >
                <Ionicons name="checkmark-circle" size={32} color="#FFFFFF" />
                <View style={styles.premiumStatusTextContainer}>
                  <Text style={styles.premiumStatusTitleCompact}>{t('premium.premiumActive')}</Text>
                  {daysRemaining !== null && (
                    <Text style={styles.daysRemainingCompact}>
                      {daysRemaining} {t('premium.daysLeft')}
                    </Text>
                  )}
                </View>
              </LinearGradient>
            </View>
          </View>
        )}

        {/* Premium Plans */}
        {!hasPremium && (
          <View style={styles.plansContainer}>
            <Text style={styles.sectionTitle}>{t('premium.premiumPlans')}</Text>
            <Text style={styles.sectionSubtitle}>{t('premium.heroDescription')}</Text>

            <View style={styles.planList}>
              {visiblePlans.length > 0 ? visiblePlans.map((plan) => {
                const meta = getPlanMeta(plan);

                return (
                <View
                  key={plan.id}
                  style={[
                    styles.planCard,
                    { borderColor: meta.accentBorder }
                  ]}
                >
                  <LinearGradient
                    colors={['rgba(255,255,255,0.04)', 'rgba(255,255,255,0.02)']}
                    style={styles.planCardGlow}
                  >
                    <View style={styles.planTopRow}>
                      <View style={styles.planTitleBlock}>
                        <Text style={styles.planEyebrow}>{meta.eyebrow}</Text>
                        <View style={styles.planNameRow}>
                          <Ionicons
                            name={meta.isYearly ? 'sparkles' : 'star'}
                            size={18}
                            color="#F5D06A"
                          />
                          <Text style={styles.planName}>{plan.name}</Text>
                        </View>
                        <Text style={styles.planDescription}>{meta.description}</Text>
                      </View>
                      <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>{meta.badgeText}</Text>
                      </View>
                    </View>

                    <View style={styles.priceRow}>
                      <Text style={styles.priceAmount}>{plan.localizedPrice}</Text>
                      <View style={styles.priceMeta}>
                        <Text style={styles.priceCurrency}></Text>
                        <Text style={styles.pricePeriod}>/{plan.period}</Text>
                      </View>
                    </View>

                    <View style={styles.planFeatures}>
                      {plan.features.slice(0, 3).map((feature, idx) => (
                        <View key={idx} style={styles.featureItem}>
                          <View style={styles.featureIconWrap}>
                            <Ionicons
                              name="checkmark"
                              size={14}
                              color="#F5D06A"
                            />
                          </View>
                          <Text style={styles.featureText}>{feature}</Text>
                        </View>
                      ))}
                    </View>

                    <TouchableOpacity
                      style={styles.planSubscribeButton}
                      onPress={() => handleSubscribe(plan)}
                      disabled={loadingPlanId !== null}
                    >
                      <Text style={styles.planSubscribeButtonText}>
                        {loadingPlanId === plan.id ? t('premium.processing') : meta.ctaLabel}
                      </Text>
                      <Ionicons
                        name="arrow-forward"
                        size={16}
                        color="#0D0B1F"
                      />
                    </TouchableOpacity>
                  </LinearGradient>
                </View>
              )}) : (
                <View style={styles.emptyPlansContainer}>
                  <View style={styles.storePendingCard}>
                  <View style={styles.storePendingIconWrap}>
                      <Ionicons name="time-outline" size={24} color="#F5D06A" />
                    </View>
                    <Text style={styles.storePendingTitle}>{t('premium.storePendingTitle')}</Text>
                    <Text style={styles.storePendingText}>
                      {t('premium.storePendingDescription')}
                    </Text>
                    {!storeReady && (
                      <TouchableOpacity style={styles.retryButton} onPress={loadPlans}>
                        <Ionicons name="refresh" size={15} color="#F5D06A" />
                        <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {hasPremium ? (
          <View style={styles.activeInsightsSection}>
            <Text style={styles.restoreTitle}>{t('premium.premiumActiveInsightsTitle')}</Text>
            <Text style={styles.restoreDescription}>{t('premium.premiumActiveInsightsDescription')}</Text>

            <View style={styles.activeInsightsGrid}>
              <View style={[styles.insightCard, styles.insightCardHalf]}>
                <Ionicons name="wallet-outline" size={18} color="#F5D06A" />
                <Text style={styles.insightValue}>{t('premium.noTokenShort')}</Text>
                <Text style={styles.insightLabel}>{t('premium.noTokenSpending')}</Text>
              </View>

              <View style={[styles.insightCard, styles.insightCardHalf]}>
                <Ionicons name="sparkles-outline" size={18} color="#F5D06A" />
                <Text style={styles.insightValueSmall}>{t('premium.unlimitedShort')}</Text>
                <Text style={styles.insightLabel}>{t('premium.unlimitedReadings')}</Text>
              </View>

              <View style={[styles.insightCard, styles.insightCardWide]}>
                <View style={styles.insightWideRow}>
                  <View style={styles.insightWideIconWrap}>
                    <Ionicons name="videocam-off-outline" size={18} color="#F5D06A" />
                  </View>
                  <View style={styles.insightWideText}>
                    <Text style={styles.insightValue}>{t('premium.adFreeShort')}</Text>
                    <Text style={styles.insightLabel}>{t('premium.noAds')}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.restoreSection}>
            <Text style={styles.restoreTitle}>{t('premium.restorePurchase')}</Text>
            <Text style={styles.restoreDescription}>{t('premium.restorePurchaseDescription')}</Text>
            <TouchableOpacity
              style={[styles.restoreButton, isRestoring && styles.restoreButtonDisabled]}
              onPress={handleRestorePurchases}
              disabled={isRestoring}
            >
              <Ionicons name="refresh-circle-outline" size={18} color="#F5D06A" />
              <Text style={styles.restoreButtonText}>
                {isRestoring ? t('premium.processing') : t('premium.restorePurchase')}
              </Text>
            </TouchableOpacity>
          </View>
        )}

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
  scrollView: {
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: Platform.OS === 'ios' ? 20 : 28,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(197, 161, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'CinzelDecorative-Bold',
    color: '#C5A100',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  premiumStatusCardCompact: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 22,
    overflow: 'hidden',
  },
  premiumStatusGradientCompact: {
    padding: 16,
    alignItems: 'center',
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  premiumStatusTitleCompact: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
    fontFamily: 'CinzelDecorative-Bold',
  },
  daysRemainingCompact: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
    marginLeft: 8,
  },
  plansContainer: {
    marginBottom: 24,
    marginTop: 8,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#C5A100',
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: 'rgba(255,255,255,0.66)',
    marginBottom: 18,
  },
  planList: {
    gap: 14,
  },
  planCard: {
    borderRadius: 26,
    borderWidth: 2,
    borderColor: 'rgba(197, 161, 0, 0.16)',
    position: 'relative',
    overflow: 'hidden',
    width: PLAN_CARD_WIDTH,
    shadowColor: Platform.OS === 'ios' ? '#C5A100' : 'transparent',
    shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 4 } : { width: 0, height: 0 },
    shadowOpacity: Platform.OS === 'ios' ? 0.1 : 0,
    shadowRadius: Platform.OS === 'ios' ? 8 : 0,
    elevation: Platform.OS === 'android' ? 5 : 0,
  },
  planCardGlow: {
    padding: 20,
  },
  planTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 18,
    gap: 12,
  },
  planTitleBlock: {
    flex: 1,
  },
  planEyebrow: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
    marginBottom: 10,
  },
  planNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.72)',
    marginTop: 12,
  },
  planName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 10,
    fontFamily: 'CinzelDecorative-Bold',
  },
  discountBadge: {
    backgroundColor: 'rgba(121, 209, 99, 0.18)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(121, 209, 99, 0.35)',
  },
  discountText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 18,
  },
  priceMeta: {
    marginLeft: 8,
  },
  priceAmount: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#F5D06A',
    fontFamily: 'CinzelDecorative-Bold',
  },
  priceCurrency: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F5D06A',
    fontFamily: 'CinzelDecorative-Bold',
  },
  pricePeriod: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.72)',
    marginTop: 2,
  },
  planFeatures: {
    marginBottom: 18,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  featureIconWrap: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(245, 208, 106, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  featureText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  planSubscribeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5D06A',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#F5D06A',
    elevation: Platform.OS === 'android' ? 2 : 0,
  },
  planSubscribeButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0D0B1F',
    fontFamily: 'CinzelDecorative-Bold',
  },
  emptyPlansContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyPlansText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.7,
  },
  restoreSection: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 32,
    padding: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(197, 161, 0, 0.18)',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  restoreTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#C5A100',
    marginBottom: 6,
  },
  restoreDescription: {
    fontSize: 13,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.68)',
    marginBottom: 14,
  },
  restoreButton: {
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 208, 106, 0.35)',
    backgroundColor: 'rgba(245, 208, 106, 0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  restoreButtonDisabled: {
    opacity: 0.65,
  },
  restoreButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F5D06A',
  },
  activeInsightsSection: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 32,
    padding: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(125, 211, 110, 0.22)',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  activeInsightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 14,
  },
  insightCard: {
    minHeight: 112,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.035)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    padding: 14,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  insightCardHalf: {
    width: '48.5%',
  },
  insightCardWide: {
    width: '100%',
    minHeight: 84,
    justifyContent: 'center',
  },
  insightValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  insightValueSmall: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  insightLabel: {
    fontSize: 12,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.66)',
  },
  insightWideRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  insightWideIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(245, 208, 106, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(245, 208, 106, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  insightWideText: {
    flex: 1,
  },
  storePendingCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(245, 208, 106, 0.18)',
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 22,
    alignItems: 'center',
  },
  storePendingIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(245, 208, 106, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(245, 208, 106, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  storePendingTitle: {
    fontSize: 18,
    lineHeight: 24,
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  storePendingText: {
    fontSize: 14,
    lineHeight: 21,
    color: 'rgba(255,255,255,0.68)',
    textAlign: 'center',
    maxWidth: 280,
  },
  retryButton: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(245, 208, 106, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(245, 208, 106, 0.20)',
  },
  retryButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F5D06A',
  },
  premiumStatusInfo: {
    marginBottom: 20,
  },
  premiumStatusTextContainer: {
    flex: 1,
    marginLeft: 12,
  },


}); 
