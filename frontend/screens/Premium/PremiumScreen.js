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
import { showStripeDisabledAlert, shouldDisableStripe, useOptionalStripe } from '../../utils/stripeSupport';

const { width } = Dimensions.get('window');
const PLAN_CARD_WIDTH = width - 40;

export default function PremiumScreen({ navigation }) {
  const { t } = useTranslation();
  const { showError, showSuccess } = useNotification();
  const { hasPremium, daysRemaining, loading, fetchStatus, getPlans, updateStatus } = usePremium();
  const { initPaymentSheet, presentPaymentSheet } = useOptionalStripe();
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loadingPlanId, setLoadingPlanId] = useState(null);

  useEffect(() => {
    fetchStatus();
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const plansData = await getPlans();
      setPlans(plansData);
    } catch (error) {
      showError(t('premium.plansLoadError'));
    }
  };

  const handleSubscribe = async (plan) => {
    if (!plan) {
      showError(t('premium.selectPlan'));
      return;
    }

    if (shouldDisableStripe) {
      showStripeDisabledAlert();
      return;
    }

    try {
      setLoadingPlanId(plan.id);
      
      // Stripe ödeme intent'i oluştur
      const paymentData = await PaymentAPI.createPremiumSubscription(plan.id);
      
      if (paymentData.client_secret) {
        // Stripe Payment Sheet'i başlat
        const { error } = await initPaymentSheet({
          paymentIntentClientSecret: paymentData.client_secret,
          merchantDisplayName: 'FAL APP',
          returnURL: 'falapp://payment-success',
        });

        if (error) {
          showError(error.message);
          return;
        }

        // Payment Sheet'i göster
        const { error: presentError } = await presentPaymentSheet();

        if (presentError) {
          if (presentError.code !== 'Canceled') {
            showError(presentError.message);
          }
          return;
        }

        // Ödeme başarılı, premium durumunu güncelle
        await fetchStatus();
        
        // Premium durumunu hemen güncelle
        updateStatus({
          has_premium: true,
          plan_type: plan.id,
          days_remaining: plan.id === 'premium_monthly' ? 30 : 365
        });
        
        showSuccess(t('premium.purchaseSuccessful'));
        // Premium kullanıcı olduğu için sayfada kal, geri gitme
      } else {
        showError(t('premium.purchaseFailed'));
      }
    } catch (error) {
      console.error('Premium subscription error:', error);
      showError(error.message || t('premium.purchaseFailed'));
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
      accentColors: isYearly ? ['#F5D06A', '#C59A17'] : ['#E9C15F', '#A77B12'],
      badgeText: isYearly ? (plan.discount ? `%${plan.discount.replace('%', '')} Daha Avantajlı` : 'En Avantajlı') : 'En Popüler',
      eyebrow: isYearly ? 'Uzun dönem kullanım için daha düşük maliyet' : 'Hızlı başlamak için en sade seçenek',
      description: isYearly
        ? 'Yıl boyu premium kullan, aylık ödemeye göre daha avantajlı kal.'
        : 'Sınırsız fal, reklamsız deneyim ve tüm premium özelliklere hemen eriş.',
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
                Tek bir premium üyelikle reklamsız deneyime geç, tüm fal türlerine sınırsız eriş ve yorumları daha akıcı şekilde oku.
              </Text>
            </View>

            <View style={styles.planList}>
              {visiblePlans.length > 0 ? visiblePlans.map((plan) => {
                const meta = getPlanMeta(plan);
                const isSelected = selectedPlan?.id === plan.id;

                return (
                <TouchableOpacity
                  key={plan.id}
                  style={[
                    styles.planCard,
                    isSelected && styles.selectedPlan
                  ]}
                  onPress={() => setSelectedPlan(plan)}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={isSelected ? meta.accentColors : ['rgba(255,255,255,0.04)', 'rgba(255,255,255,0.02)']}
                    style={styles.planCardGlow}
                  >
                    <View style={styles.planTopRow}>
                      <View style={styles.planTitleBlock}>
                        <Text style={styles.planEyebrow}>{meta.eyebrow}</Text>
                        <View style={styles.planNameRow}>
                          <Ionicons
                            name={meta.isYearly ? 'sparkles' : 'star'}
                            size={18}
                            color={isSelected ? '#FFFFFF' : '#F5D06A'}
                          />
                          <Text style={styles.planName}>{plan.name}</Text>
                        </View>
                        <Text style={styles.planDescription}>{meta.description}</Text>
                      </View>
                      <View style={[styles.discountBadge, isSelected && styles.discountBadgeSelected]}>
                        <Text style={styles.discountText}>{meta.badgeText}</Text>
                      </View>
                    </View>

                    <View style={styles.priceRow}>
                      <Text style={styles.priceAmount}>{plan.price}</Text>
                      <View style={styles.priceMeta}>
                        <Text style={styles.priceCurrency}>TL</Text>
                        <Text style={styles.pricePeriod}>/{plan.period}</Text>
                      </View>
                    </View>

                    <View style={styles.planFeatures}>
                      {plan.features.slice(0, 4).map((feature, idx) => (
                        <View key={idx} style={styles.featureItem}>
                          <View style={styles.featureIconWrap}>
                            <Ionicons
                              name="checkmark"
                              size={14}
                              color={isSelected ? '#0D0B1F' : '#F5D06A'}
                            />
                          </View>
                          <Text style={styles.featureText}>{feature}</Text>
                        </View>
                      ))}
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.planSubscribeButton,
                        isSelected && styles.planSubscribeButtonSelected
                      ]}
                      onPress={() => handleSubscribe(plan)}
                      disabled={loadingPlanId !== null}
                    >
                      <Text style={[
                        styles.planSubscribeButtonText,
                        isSelected && styles.planSubscribeButtonTextSelected
                      ]}>
                        {loadingPlanId === plan.id ? t('premium.processing') : t('premium.select')}
                      </Text>
                      <Ionicons
                        name="arrow-forward"
                        size={16}
                        color={isSelected ? '#0D0B1F' : '#F5D06A'}
                      />
                    </TouchableOpacity>
                  </LinearGradient>
                </TouchableOpacity>
              )}) : (
                <View style={styles.emptyPlansContainer}>
                  <Text style={styles.emptyPlansText}>{t('premium.plansLoadError')}</Text>
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
  selectedPlan: {
    borderColor: '#F5D06A',
    shadowColor: Platform.OS === 'ios' ? '#C5A100' : 'transparent',
    shadowOpacity: Platform.OS === 'ios' ? 0.3 : 0,
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
  discountBadgeSelected: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderColor: 'rgba(255,255,255,0.25)',
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
    backgroundColor: 'rgba(245, 208, 106, 0.10)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(245, 208, 106, 0.28)',
    elevation: Platform.OS === 'android' ? 2 : 0,
  },
  planSubscribeButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#F5D06A',
    fontFamily: 'CinzelDecorative-Bold',
  },
  planSubscribeButtonSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  planSubscribeButtonTextSelected: {
    color: '#0D0B1F',
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
  premiumStatusInfo: {
    marginBottom: 20,
  },
  premiumStatusTextContainer: {
    flex: 1,
    marginLeft: 12,
  },


}); 
