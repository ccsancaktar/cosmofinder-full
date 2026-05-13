import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../context/NotificationContext';
import { useToken } from '../context/TokenContext';
import { usePremium } from '../context/PremiumContext';
import PaymentAPI from '../services/paymentAPI';
import { showStripeDisabledAlert, shouldDisableStripe, useOptionalStripe } from '../utils/stripeSupport';

const { width, height } = Dimensions.get('window');

const PaymentModal = ({ visible, onClose, paymentType = 'token', onSuccess, selectedPackage: initialSelectedPackage }) => {
  const { t } = useTranslation();
  const { showError, showWarning, showSuccess } = useNotification();
  const { updateBalance } = useToken();
  const { getPlans } = usePremium();
  const [packages, setPackages] = useState([]);
  const [premiumPlans, setPremiumPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(initialSelectedPackage);
  const { initPaymentSheet, presentPaymentSheet } = useOptionalStripe();

  useEffect(() => {
    if (paymentType === 'token' && !initialSelectedPackage) {
      loadTokenPackages();
    } else if (paymentType === 'premium') {
      loadPremiumPlans();
    }
  }, [paymentType, initialSelectedPackage]);

  useEffect(() => {
    setSelectedPackage(initialSelectedPackage);
  }, [initialSelectedPackage]);



  const loadTokenPackages = async () => {
    try {
      setLoading(true);
      console.log('PaymentModal:', t('paymentModal.loadingPackages'));
      const response = await PaymentAPI.getTokenPackages();
      console.log('PaymentModal:', t('paymentModal.packagesLoaded'), response);
      setPackages(response.packages || []);
    } catch (error) {
      console.error('PaymentModal:', t('paymentModal.packagesLoadError'), error);
      showError(t('paymentModal.packagesLoadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const loadPremiumPlans = async () => {
    try {
      setLoading(true);
      console.log('PaymentModal: Loading premium plans from backend');
      const plans = await getPlans();
      console.log('PaymentModal: Premium plans loaded', plans);
      console.log('PaymentModal: First plan price:', plans?.[0]?.price);
      console.log('PaymentModal: Second plan price:', plans?.[1]?.price);
      setPremiumPlans(plans || []);
    } catch (error) {
      console.error('PaymentModal: Premium plans load error', error);
      showError(t('paymentModal.packagesLoadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    const packageToUse = selectedPackage || initialSelectedPackage;
    
    if (!packageToUse && paymentType === 'token') {
      showWarning(t('paymentModal.selectPackage'));
      return;
    }

    if (shouldDisableStripe) {
      showStripeDisabledAlert();
      return;
    }

    try {
      setLoading(true);
      let paymentData;

      if (paymentType === 'token') {
        console.log('PaymentModal:', t('paymentModal.paymentPackageInfo'), packageToUse);
        console.log('PaymentModal:', t('paymentModal.packageIdSent'), packageToUse.id);
        paymentData = await PaymentAPI.createTokenPayment(packageToUse.id);
      } else {
        paymentData = await PaymentAPI.createPremiumSubscription(packageToUse);
      }

      if (paymentData.client_secret) {
        // React Native Stripe ile ödeme işlemini başlat
        try {
          const { error } = await initPaymentSheet({
            paymentIntentClientSecret: paymentData.client_secret,
            merchantDisplayName: 'FAL APP',
            returnURL: 'falapp://payment-success',
          });

          if (error) {
            showError(error.message);
            return;
          }

          const { error: presentError } = await presentPaymentSheet();

          if (presentError) {
            showError(presentError.message);
          } else {
            // Ödeme başarılı - manuel token yükleme
            if (paymentType === 'token') {
              // Token satın alma başarılı - manuel yükleme
              try {
                const packageToUse = selectedPackage || initialSelectedPackage;
                const tokenAmount = packageToUse?.token_amount || 0;
                const packageId = packageToUse?.id;
                
                if (tokenAmount > 0 && packageId) {
                  // Manuel token yükleme
                  const tokenLoadResult = await PaymentAPI.manualTokenLoad(
                    packageId, 
                    tokenAmount, 
                    paymentData.client_secret?.split('_secret_')[0] || 'manual'
                  );
                  
                  if (tokenLoadResult.status === 'success') {
                    // Token bakiyesini güncelle
                    updateBalance(tokenLoadResult.new_balance);
                    showSuccess(`${tokenAmount} ${t('paymentModal.tokenLoadedSuccess')} ${tokenLoadResult.new_balance} ${t('common.token')}`);
                    setTimeout(() => {
                      onSuccess && onSuccess();
                      onClose();
                    }, 1500);
                  } else {
                    showWarning(t('paymentModal.paymentSuccessfulTokenFailed'));
                  }
                                  } else {
                    showError(t('paymentModal.tokenInfoNotFound'));
                  }
                              } catch (error) {
                  console.error(t('paymentModal.tokenLoadError'), error);
                  showWarning(t('paymentModal.paymentSuccessfulTokenFailed'));
                }
            } else {
              // Premium üyelik başarılı - manuel activation
              try {
                const planType = selectedPackage?.id || initialSelectedPackage?.id;
                
                if (planType) {
                  const premiumResult = await PaymentAPI.manualPremiumActivate(
                    planType,
                    paymentData.client_secret?.split('_secret_')[0] || 'manual'
                  );
                  
                  if (premiumResult.status === 'success') {
                    showSuccess(`${t('paymentModal.premiumActivatedSuccess')} ${premiumResult.plan_type} ${t('paymentModal.endDate')} ${new Date(premiumResult.end_date).toLocaleDateString('tr-TR')}`);
                    setTimeout(() => {
                      onSuccess && onSuccess();
                      onClose();
                    }, 1500);
                  } else {
                    showWarning(t('paymentModal.paymentSuccessfulPremiumFailed'));
                  }
                                  } else {
                    showError(t('paymentModal.planInfoNotFound'));
                  }
                              } catch (error) {
                  console.error(t('paymentModal.premiumActivationError'), error);
                  showWarning(t('paymentModal.paymentSuccessfulPremiumFailed'));
                }
            }
          }
        } catch (error) {
          console.error(t('paymentModal.stripePaymentError'), error);
          showError(t('paymentModal.paymentStartFailed'));
        }
      }
    } catch (error) {
      showError(t('paymentModal.paymentStartFailed'));
    } finally {
      setLoading(false);
    }
  };

  const renderTokenPackages = () => {
    // Eğer zaten seçilmiş paket varsa, sadece onu göster
    if (initialSelectedPackage) {
      const pkg = initialSelectedPackage;
      return (
        <View style={styles.selectedPackageDisplay}>
          <View style={styles.packageCard}>
            <View style={styles.packageHeader}>
              <Text style={styles.packageName}>{pkg.name}</Text>
              <Text style={styles.packagePrice}>₺{pkg.price}</Text>
            </View>
            <Text style={styles.packageDescription}>{pkg.description}</Text>
            <View style={styles.tokenInfo}>
              <Text style={styles.tokenAmount}>{pkg.token_amount} {t('common.token')}</Text>
              <Text style={styles.tokenValue}>
                ₺{(pkg.price / pkg.token_amount).toFixed(2)} / {t('common.perToken')}
              </Text>
            </View>
          </View>
        </View>
      );
    }

    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>{t('common.packagesLoading')}</Text>
        </View>
      );
    }

    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        {packages.map((pkg) => (
          <TouchableOpacity
            key={pkg.id}
            style={[
              styles.packageCard,
              selectedPackage?.id === pkg.id && styles.selectedPackage
            ]}
            onPress={() => setSelectedPackage(pkg)}
          >
            <View style={styles.packageHeader}>
              <Text style={styles.packageName}>{pkg.name}</Text>
              <Text style={styles.packagePrice}>₺{pkg.price}</Text>
            </View>
            <Text style={styles.packageDescription}>{pkg.description}</Text>
            <View style={styles.tokenInfo}>
              <Text style={styles.tokenAmount}>{pkg.token_amount} {t('common.token')}</Text>
              <Text style={styles.tokenValue}>
                ₺{(pkg.price / pkg.token_amount).toFixed(2)} / {t('common.perToken')}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const renderPremiumPlans = () => {
    console.log('PaymentModal: renderPremiumPlans called, premiumPlans:', premiumPlans);
    console.log('PaymentModal: premiumPlans length:', premiumPlans?.length);
    
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>{t('common.packagesLoading')}</Text>
        </View>
      );
    }

    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        {premiumPlans.map((plan) => {
          console.log('PaymentModal: Rendering plan:', plan.id, 'price:', plan.price);
          return (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.packageCard,
                selectedPackage?.id === plan.id && styles.selectedPackage
              ]}
              onPress={() => setSelectedPackage(plan)}
            >
              <View style={styles.packageHeader}>
                <Text style={styles.packageName}>{plan.name}</Text>
                <Text style={styles.packagePrice}>₺{plan.price}</Text>
              </View>
              <Text style={styles.packageDescription}>{plan.description}</Text>
              <View style={styles.featuresList}>
                {plan.features.map((feature, index) => (
                  <Text key={index} style={styles.featureItem}>
                    ✓ {feature}
                  </Text>
                ))}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {paymentType === 'token' ? t('common.buyToken') : t('common.premiumMembership')}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {paymentType === 'token' ? renderTokenPackages() : renderPremiumPlans()}
          </View>

          {(selectedPackage || initialSelectedPackage) && (
            <View style={styles.paymentSection}>
              <View style={styles.selectedPackageInfo}>
                <Text style={styles.selectedPackageName}>
                  {(selectedPackage || initialSelectedPackage).name}
                </Text>
                <Text style={styles.selectedPackagePrice}>
                  ₺{(selectedPackage || initialSelectedPackage).price}
                </Text>
              </View>
              
              <TouchableOpacity
                style={[styles.payButton, loading && styles.payButtonDisabled]}
                onPress={handlePayment}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.payButtonText}>
                    {paymentType === 'token' ? t('common.buyToken') : t('common.becomePremium')}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1F2937',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.9,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'CinzelDecorative-Bold',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
    maxHeight: height * 0.6,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
  packageCard: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPackage: {
    borderColor: '#8B5CF6',
    backgroundColor: '#4C1D95',
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  packageName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    fontFamily: 'CinzelDecorative-Bold',
  },
  packagePrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B5CF6',
    fontFamily: 'CinzelDecorative-Bold',
  },
  packageDescription: {
    color: '#D1D5DB',
    marginBottom: 12,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  tokenInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tokenAmount: {
    color: '#8B5CF6',
    fontWeight: 'bold',
    fontSize: 16,
  },
  tokenValue: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  featuresList: {
    marginTop: 8,
  },
  featureItem: {
    color: '#D1D5DB',
    fontSize: 14,
    marginBottom: 4,
  },
  paymentSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#374151',
    backgroundColor: '#111827',
  },
  selectedPackageInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  selectedPackageName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  selectedPackagePrice: {
    color: '#8B5CF6',
    fontSize: 24,
    fontWeight: 'bold',
  },
  payButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  payButtonDisabled: {
    backgroundColor: '#6B7280',
  },
  payButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PaymentModal;
