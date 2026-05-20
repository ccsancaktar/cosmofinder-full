import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useToken } from '../../context/TokenContext';
import { usePremium } from '../../context/PremiumContext';
import { useNotification } from '../../context/NotificationContext';
import TokenIcon from '../../components/TokenIcon';
import { useTranslation } from 'react-i18next';
import PaymentAPI from '../../services/paymentAPI';
import purchasesService from '../../services/purchasesService';

const PRODUCT_ORDER = ['token_pack_small', 'token_pack_medium', 'token_pack_large'];

export default function TokenPurchaseScreen({ navigation }) {
  const { t } = useTranslation();
  const { showError } = useNotification();
  const { loading, fetchBalance } = useToken();
  const { hasPremium } = usePremium();
  const [packages, setPackages] = useState([]);
  const [loadingProductId, setLoadingProductId] = useState(null);

  useEffect(() => {
    loadPackages();
  }, []);

  const visiblePackages = Array.isArray(packages)
    ? [...packages].sort((a, b) => (a.token_amount || 0) - (b.token_amount || 0))
    : [];

  const getPackageMeta = (pkg, index) => {
    const tokenAmount = Number(pkg.token_amount || 0);
    const estimatedReadings = tokenAmount > 0 ? Math.max(1, Math.floor(tokenAmount / 12)) : 0;
    const isPopular = tokenAmount === 90 || index === 1;
    const isBestValue = tokenAmount === 160 || (index === visiblePackages.length - 1 && visiblePackages.length > 2);
    const isStarter = tokenAmount === 40;

    return {
      tokenAmount,
      estimatedReadings,
      badge: isBestValue
        ? t('tokens.bestValueBadge')
        : isPopular
          ? t('tokens.mostPopularBadge')
          : isStarter
            ? t('tokens.starterBadge')
            : t('tokens.betterValueBadge'),
      eyebrow: isBestValue
        ? t('tokens.bestValueEyebrow')
        : isPopular
          ? t('tokens.popularEyebrow')
          : isStarter
            ? t('tokens.starterEyebrow')
            : t('tokens.regularUseEyebrow'),
    };
  };

  const loadPackages = async () => {
    try {
      console.log(t('common.packagesLoading'));
      const [response, storeProducts] = await Promise.all([
        PaymentAPI.getTokenPackages(),
        purchasesService.getTokenProducts(),
      ]);

      const backendPackages = response.packages || [];
      const sortedPackages = [...backendPackages].sort((a, b) => (a.token_amount || 0) - (b.token_amount || 0));
      const productMap = Object.fromEntries(
        (storeProducts || []).map((product) => [product.identifier, product])
      );

      const normalizedPackages = sortedPackages.map((pkg, index) => {
        const productId = PRODUCT_ORDER[index];
        const storeProduct = productMap[productId];
        return {
          ...pkg,
          productId,
          storeProduct,
          localizedPrice: storeProduct?.priceString || null,
          storePrice: Number(storeProduct?.price ?? 0),
        };
      });

      console.log(t('common.packagesLoaded'), normalizedPackages);
      setPackages(normalizedPackages);
    } catch (error) {
      console.error(t('common.packagesLoadError'), error);
      showError(t('common.packagesLoadError'));
    }
  };

  const handlePurchase = async (pkg) => {
    if (!pkg?.storeProduct) {
      showError(t('tokens.storeProductUnavailable'));
      return;
    }

    try {
      setLoadingProductId(pkg.productId);
      await purchasesService.purchaseProduct(pkg.storeProduct);
      const claimResult = await PaymentAPI.syncMobileTokenPurchase(
        pkg.productId
      );

      if ((claimResult?.claimed_count || 0) === 0) {
        throw new Error(t('tokens.purchaseClaimPending'));
      }

      await fetchBalance();
      navigation.goBack();
    } catch (error) {
      if (!error?.userCancelled) {
        showError(error?.message || t('tokens.purchaseIncomplete'));
      }
    } finally {
      setLoadingProductId(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#C5A100" />
        <Text style={styles.loadingText}>{t('common.packagesLoading')}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <LinearGradient
        colors={['#0D0B1F', '#1B1B2F', '#2A2A3F']}
        style={styles.container}
      >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Title */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('tokens.tokenPurchase')}</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Premium Kullanıcı Uyarısı */}
        {hasPremium && (
          <View style={styles.premiumWarning}>
            <Ionicons name="diamond" size={24} color="#FFD700" />
            <Text style={styles.premiumWarningText}>
              {t('common.premiumActive')}
            </Text>
          </View>
        )}

        {/* Packages */}
        {!hasPremium && (
          <View style={styles.packagesContainer}>
            <Text style={styles.sectionTitle}>{t('common.tokenPackages')}</Text>
            <Text style={styles.sectionSubtitle}>
              {t('tokens.purchaseSubtitle')}
            </Text>
            
            {visiblePackages.map((pkg, index) => {
              const meta = getPackageMeta(pkg, index);
              const isAvailable = Boolean(pkg.storeProduct && pkg.localizedPrice);
              const isLoading = loadingProductId === pkg.productId;

              return (
              <View
                key={pkg.id}
                style={[
                  styles.packageCard,
                  !isAvailable && styles.packageCardDisabled,
                ]}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.04)', 'rgba(255,255,255,0.02)']}
                  style={styles.packageCardInner}
                >
                  <View style={styles.packageTopRow}>
                    <View style={styles.packageTitleBlock}>
                      <Text style={styles.packageEyebrow}>{meta.eyebrow}</Text>
                      <View style={styles.packageNameRow}>
                        <TokenIcon size={20} />
                        <Text style={styles.packageName}>{pkg.name}</Text>
                      </View>
                    </View>
                    {meta.badge && (
                      <View style={styles.packageBadge}>
                        <Text style={styles.packageBadgeText}>{meta.badge}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.packageStatsRow}>
                    <View style={styles.statPill}>
                      <Text style={styles.statValue}>{meta.tokenAmount}</Text>
                      <Text style={styles.statLabel}>{t('tokens.tokenUnit')}</Text>
                    </View>
                    <View style={styles.statPill}>
                      <Text style={styles.statValue}>~{meta.estimatedReadings}</Text>
                      <Text style={styles.statLabel}>{t('tokens.readingUnit')}</Text>
                    </View>
                  </View>

                  <View style={styles.packageBottomRow}>
                    <View>
                      <Text style={styles.packagePriceCaption}>{t('tokens.appStorePrice')}</Text>
                      {pkg.localizedPrice ? (
                        <Text style={styles.packagePrice}>
                          {pkg.localizedPrice}
                        </Text>
                      ) : (
                        <View style={styles.priceLoadingWrap}>
                          <View style={styles.priceLoadingBarPrimary} />
                          <View style={styles.priceLoadingBarSecondary} />
                          <Text style={styles.packagePriceLoading}>{t('tokens.appStorePriceLoading')}</Text>
                        </View>
                      )}
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.selectPill,
                        !isAvailable && styles.selectPillDisabled,
                        isLoading && styles.selectPillLoading,
                      ]}
                      onPress={() => handlePurchase(pkg)}
                      disabled={!isAvailable || Boolean(loadingProductId)}
                    >
                      {isLoading ? (
                        <ActivityIndicator size="small" color="#0D0B1F" />
                      ) : (
                        <Text style={styles.selectPillText}>
                          {!isAvailable ? t('tokens.preparing') : t('common.buy')}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </View>
            )})}
          </View>
        )}

        {/* Premium Promotion */}
        {!hasPremium && (
          <View style={styles.premiumCard}>
            <View style={styles.premiumRow}>
              <View style={styles.premiumCopy}>
                <Text style={styles.premiumTitle}>{t('common.goPremium1')}</Text>
                <Text style={styles.premiumSubtitle}>
                  {t('tokens.goPremiumSubtitle')}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.premiumButton}
                onPress={() => navigation.navigate('Premium')}
              >
                <Text style={styles.premiumButtonText}>{t('common.discoverPremium')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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
  },
  placeholder: {
    width: 40,
  },
  packagesContainer: {
    marginBottom: 14,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#C5A100',
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: 'rgba(255,255,255,0.66)',
    marginBottom: 14,
  },
  packageCard: {
    borderRadius: 24,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: 'rgba(245, 208, 106, 0.16)',
    overflow: 'hidden',
  },
  packageCardDisabled: {
    opacity: 0.58,
  },
  packageCardInner: {
    padding: 18,
  },
  packageTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  packageTitleBlock: {
    flex: 1,
  },
  packageEyebrow: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
    marginBottom: 10,
  },
  packageNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  packageName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 10,
    flex: 1,
    fontFamily: 'CinzelDecorative-Bold',
  },
  packageBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(121, 209, 99, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(121, 209, 99, 0.35)',
  },
  packageBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  packageStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 16,
  },
  statPill: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  statValue: {
    fontSize: 18,
    color: '#F5D06A',
    fontWeight: '700',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.72)',
    textAlign: 'center',
    marginTop: 4,
  },
  packagePrice: {
    fontSize: 30,
    color: '#FFFFFF',
    fontWeight: '700',
    fontFamily: 'CinzelDecorative-Bold',
  },
  priceLoadingWrap: {
    paddingTop: 2,
    minHeight: 58,
    justifyContent: 'center',
  },
  priceLoadingBarPrimary: {
    width: 126,
    height: 26,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginBottom: 8,
  },
  priceLoadingBarSecondary: {
    width: 72,
    height: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(245, 208, 106, 0.12)',
    marginBottom: 6,
  },
  packagePriceLoading: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.50)',
    letterSpacing: 0.2,
  },
  packagePriceCaption: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
    marginBottom: 4,
  },
  packageBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  selectPill: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: '#F5D06A',
    borderWidth: 1,
    borderColor: '#F5D06A',
    minWidth: 116,
    alignItems: 'center',
  },
  selectPillDisabled: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: 'rgba(255,255,255,0.10)',
  },
  selectPillLoading: {
    backgroundColor: '#E7C04F',
    borderColor: '#E7C04F',
  },
  selectPillText: {
    color: '#0D0B1F',
    fontWeight: '700',
    fontSize: 14,
  },
  premiumCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 18,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(245, 208, 106, 0.12)',
  },
  premiumRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  premiumCopy: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  premiumSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.76)',
    lineHeight: 20,
  },
  premiumButton: {
    backgroundColor: 'rgba(245, 208, 106, 0.14)',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(245, 208, 106, 0.22)',
  },
  premiumButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F5D06A',
  },
  premiumWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 18,
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  premiumWarningText: {
    fontSize: 14,
    color: '#FFD700',
    marginLeft: 8,
    flex: 1,
  },
});
