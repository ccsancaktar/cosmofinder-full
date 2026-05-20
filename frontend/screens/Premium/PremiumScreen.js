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
  const { showError, showSuccess } = useNotification();
  const { hasPremium, daysRemaining, loading, fetchStatus, updateStatus } = usePremium();
  const [plans, setPlans] = useState([]);
  const [loadingPlanId, setLoadingPlanId] = useState(null);
  const [storeReady, setStoreReady] = useState(true);

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
            name: isMonthly ? 'Premium Aylık' : 'Premium 6 Aylık',
            rcPackage: pkg,
            price: Number(product?.price ?? 0),
            localizedPrice: product?.priceString || '',
            period: isMonthly ? 'ay' : '6 ay',
            features: isMonthly
              ? [
                  'Sınırsız fal çekme',
                  'Reklamsız deneyim',
                  'Tüm premium özellikler',
                ]
              : [
                  '6 ay kesintisiz kullanım',
                  'Reklamsız deneyim',
                  'Toplamda daha avantajlı fiyat',
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
      badgeText: isYearly ? 'Daha Avantajlı' : 'Aylık Plan',
      eyebrow: isYearly ? 'Uzun dönem kullanım için daha düşük maliyet' : 'En hızlı başlangıç',
      description: isYearly
        ? 'Tek seferde 6 ayı sabitle, daha az düşün ve daha avantajlı kal.'
        : 'Premium özelliklere hemen geç, aylık olarak esnek şekilde devam et.',
      accentBorder: isYearly ? 'rgba(245, 208, 106, 0.34)' : 'rgba(197, 161, 0, 0.16)',
      ctaLabel: isYearly ? '6 Aylık Planı Al' : 'Aylık Planı Al',
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
            <View style={styles.heroCard}>
              <Text style={styles.heroEyebrow}>PREMIUM DENEYİM</Text>
              <Text style={styles.heroTitle}>{t('premium.choosePlan')}</Text>
              <Text style={styles.heroDescription}>
            App Store fiyatı ile premiuma geç, reklamsız kullan ve tüm fal türlerini limitsiz aç.
              </Text>
            </View>

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
                    <Text style={styles.storePendingTitle}>App Store ürünleri hazırlanıyor</Text>
                    <Text style={styles.storePendingText}>
                      Premium paketleri App Store’dan doğrulanınca burada otomatik görünecek.
                    </Text>
                    {!storeReady && (
                      <TouchableOpacity style={styles.retryButton} onPress={loadPlans}>
                        <Ionicons name="refresh" size={15} color="#F5D06A" />
                        <Text style={styles.retryButtonText}>Tekrar dene</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}
            </View>
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
  heroCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(245, 208, 106, 0.18)',
    borderRadius: 24,
    padding: 20,
    marginBottom: 18,
  },
  heroEyebrow: {
    fontSize: 11,
    letterSpacing: 1.4,
    color: '#F5D06A',
    marginBottom: 8,
    fontWeight: '700',
  },
  heroTitle: {
    fontSize: 28,
    lineHeight: 34,
    color: '#FFFFFF',
    fontFamily: 'CinzelDecorative-Bold',
    marginBottom: 10,
  },
  heroDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.78)',
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
