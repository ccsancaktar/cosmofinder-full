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
import PaymentModal from '../../components/PaymentModal';
import PaymentAPI from '../../services/paymentAPI';

export default function TokenPurchaseScreen({ navigation }) {
  const { t } = useTranslation();
  const { showError } = useNotification();
  const { loading, fetchBalance } = useToken();
  const { hasPremium } = usePremium();
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);

  useEffect(() => {
    loadPackages();
  }, []);

  const visiblePackages = Array.isArray(packages)
    ? [...packages].sort((a, b) => (a.price || 0) - (b.price || 0))
    : [];

  const getPackageMeta = (pkg, index) => {
    const tokenAmount = Number(pkg.token_amount || 0);
    const price = Number(pkg.price || 0);
    const pricePerToken = tokenAmount > 0 ? (price / tokenAmount) : 0;
    const estimatedReadings = tokenAmount > 0 ? Math.max(1, Math.floor(tokenAmount / 15)) : 0;
    const isPopular = index === 1;
    const isBestValue = index === visiblePackages.length - 1 && visiblePackages.length > 2;

    return {
      tokenAmount,
      pricePerToken,
      estimatedReadings,
      badge: isBestValue ? 'En Avantajlı' : isPopular ? 'En Popüler' : null,
      eyebrow: isBestValue
        ? 'Daha fazla token, daha iyi oran'
        : isPopular
          ? 'Çoğu kullanıcı bunu seçiyor'
          : 'Başlamak için ideal paket',
    };
  };

  const loadPackages = async () => {
    try {
      console.log(t('common.packagesLoading'));
      const response = await PaymentAPI.getTokenPackages();
              console.log(t('common.packagesLoaded'), response);
      setPackages(response.packages || []);
    } catch (error) {
              console.error(t('common.packagesLoadError'), error);
      showError(t('common.packagesLoadError'));
    }
  };

  const handlePurchase = () => {
    if (!selectedPackage) {
      showError(t('common.selectPackage'));
      return;
    }
    
    setPaymentModalVisible(true);
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
    <SafeAreaView style={styles.safeArea}>
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

        {/* Info Card */}
        {!hasPremium && (
          <View style={styles.heroCard}>
            <Text style={styles.heroEyebrow}>TOKEN PAKETLERİ</Text>
            <Text style={styles.heroTitle}>{t('tokens.tokenPurchase')}</Text>
            <Text style={styles.heroDescription}>
              İhtiyacın kadar token al, fal çekmeye hemen devam et. Ödeme sonrası tokenlar hesabına anında tanımlanır.
            </Text>
            <View style={styles.heroMetaRow}>
              <View style={styles.heroMetaChip}>
                <Ionicons name="shield-checkmark" size={14} color="#F5D06A" />
                <Text style={styles.heroMetaText}>Güvenli ödeme</Text>
              </View>
              <View style={styles.heroMetaChip}>
                <Ionicons name="flash" size={14} color="#F5D06A" />
                <Text style={styles.heroMetaText}>Anında teslim</Text>
              </View>
            </View>
          </View>
        )}

        {/* Packages */}
        {!hasPremium && (
          <View style={styles.packagesContainer}>
            <Text style={styles.sectionTitle}>{t('common.tokenPackages')}</Text>
            
            {visiblePackages.map((pkg, index) => {
              const meta = getPackageMeta(pkg, index);
              const isSelected = selectedPackage?.id === pkg.id;

              return (
              <TouchableOpacity
                key={pkg.id}
                style={[
                  styles.packageCard,
                  isSelected && styles.selectedPackage
                ]}
                onPress={() => setSelectedPackage(pkg)}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={isSelected ? ['#F5D06A', '#D89E1C'] : ['rgba(255,255,255,0.04)', 'rgba(255,255,255,0.02)']}
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
                      <View style={[styles.packageBadge, isSelected && styles.packageBadgeSelected]}>
                        <Text style={styles.packageBadgeText}>{meta.badge}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.packageStatsRow}>
                    <View style={styles.statPill}>
                      <Text style={[styles.statValue, isSelected && styles.statValueSelected]}>{meta.tokenAmount}</Text>
                      <Text style={[styles.statLabel, isSelected && styles.statLabelSelected]}>token</Text>
                    </View>
                    <View style={styles.statPill}>
                      <Text style={[styles.statValue, isSelected && styles.statValueSelected]}>~{meta.estimatedReadings}</Text>
                      <Text style={[styles.statLabel, isSelected && styles.statLabelSelected]}>fal</Text>
                    </View>
                    <View style={styles.statPill}>
                      <Text style={[styles.statValue, isSelected && styles.statValueSelected]}>{meta.pricePerToken.toFixed(2)}</Text>
                      <Text style={[styles.statLabel, isSelected && styles.statLabelSelected]}>TL/token</Text>
                    </View>
                  </View>

                  <View style={styles.packageBottomRow}>
                    <View>
                      <Text style={[styles.packagePriceCaption, isSelected && styles.packagePriceCaptionSelected]}>Toplam fiyat</Text>
                      <Text style={[styles.packagePrice, isSelected && styles.packagePriceSelected]}>{pkg.price} TL</Text>
                    </View>
                    <View style={[styles.selectPill, isSelected && styles.selectPillSelected]}>
                      <Text style={[styles.selectPillText, isSelected && styles.selectPillTextSelected]}>
                        {isSelected ? 'Seçildi' : 'Paketi Seç'}
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            )})}
          </View>
        )}

        {/* Purchase Button */}
        {!hasPremium && selectedPackage && (
          <TouchableOpacity
            style={styles.purchaseButton}
            onPress={handlePurchase}
            disabled={purchaseLoading}
          >
            <LinearGradient
              colors={['#4CAF50', '#45a049']}
              style={styles.purchaseButtonGradient}
            >
              {purchaseLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="card" size={20} color="#FFFFFF" />
                  <Text style={styles.purchaseButtonText}>
                    {t('common.buyWithPrice', { price: selectedPackage.price })}
                  </Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Premium Promotion */}
        {!hasPremium && (
          <View style={styles.premiumCard}>
            <View style={styles.premiumRow}>
              <View style={styles.premiumCopy}>
                <Text style={styles.premiumTitle}>{t('common.goPremium1')}</Text>
                <Text style={styles.premiumSubtitle}>
                  Sık sık fal çekiyorsan token almak yerine premium üyelikle sınırsız kullanıma geçebilirsin.
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
      
      {/* Payment Modal */}
      <PaymentModal
        visible={paymentModalVisible}
        onClose={() => setPaymentModalVisible(false)}
        paymentType="token"
        selectedPackage={selectedPackage}
        onSuccess={() => {
          setPaymentModalVisible(false);
          fetchBalance(); // Token bakiyesini güncelle
          navigation.goBack();
        }}
      />
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
  heroCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(245, 208, 106, 0.18)',
    borderRadius: 24,
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
    marginBottom: 14,
  },
  heroMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  heroMetaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(245, 208, 106, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(245, 208, 106, 0.14)',
  },
  heroMetaText: {
    color: '#F5D06A',
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '600',
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
    color: '#FFFFFF',
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
    marginBottom: 14,
  },
  packageCard: {
    borderRadius: 24,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: 'rgba(245, 208, 106, 0.16)',
    overflow: 'hidden',
  },
  selectedPackage: {
    borderColor: '#F5D06A',
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
  packageBadgeSelected: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderColor: 'rgba(255,255,255,0.24)',
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
  statValueSelected: {
    color: '#0D0B1F',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.72)',
    textAlign: 'center',
    marginTop: 4,
  },
  statLabelSelected: {
    color: 'rgba(13,11,31,0.72)',
  },
  packagePrice: {
    fontSize: 30,
    color: '#FFFFFF',
    fontWeight: '700',
    fontFamily: 'CinzelDecorative-Bold',
  },
  packagePriceSelected: {
    color: '#0D0B1F',
  },
  packagePriceCaption: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
    marginBottom: 4,
  },
  packagePriceCaptionSelected: {
    color: 'rgba(13,11,31,0.68)',
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
    backgroundColor: 'rgba(245, 208, 106, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(245, 208, 106, 0.24)',
  },
  selectPillSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  selectPillText: {
    color: '#F5D06A',
    fontWeight: '700',
    fontSize: 14,
  },
  selectPillTextSelected: {
    color: '#0D0B1F',
  },
  purchaseButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  purchaseButtonDisabled: {
    opacity: 0.6,
  },
  purchaseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
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
  purchaseButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 0,
    padding: 14,
    elevation: Platform.OS === 'android' ? 4 : 0,
  },
}); 
