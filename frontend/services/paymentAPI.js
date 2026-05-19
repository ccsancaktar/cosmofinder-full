import api from './api';

class PaymentAPI {
  /**
   * Token paketlerini getir
   */
  static async getTokenPackages() {
    try {
      const response = await api.get('/payment/token-packages');
      return response.data;
    } catch (error) {
      console.error('Token paketleri getirilemedi:', error);
      throw error;
    }
  }

  /**
   * Token satın alma için ödeme intent'i oluştur
   */
  static async createTokenPayment(packageId) {
    try {
      const response = await api.post('/payment/create-token-payment', {
        package_id: packageId
      });
      return response.data;
    } catch (error) {
      console.error('Token ödeme intent oluşturulamadı:', error);
      throw error;
    }
  }

  /**
   * Premium subscription için ödeme intent'i oluştur
   */
  static async createPremiumSubscription(planType) {
    try {
      const response = await api.post('/payment/create-premium-subscription', {
        plan_type: planType
      });
      return response.data;
      } catch (error) {
      console.error('Premium subscription intent oluşturulamadı:', error);
      throw error;
    }
  }

  /**
   * Ödeme durumunu kontrol et
   */
  static async getPaymentStatus(paymentIntentId) {
    try {
      const response = await api.get(`/payment/payment-status/${paymentIntentId}`);
      return response.data;
    } catch (error) {
      console.error('Ödeme durumu kontrol edilemedi:', error);
      throw error;
    }
  }

  /**
   * Ödeme geçmişini getir
   */
  static async getPaymentHistory() {
    try {
      const response = await api.get('/payment/payment-history');
      return response.data;
    } catch ( error) {
      console.error('Ödeme geçmişi getirilemedi:', error);
      throw error;
    }
  }

  /**
   * Test ödeme (sadece development)
   */
  static async createTestPayment(amount = 10.0, userId, paymentType = 'token_purchase') {
    try {
      const response = await api.post('/payment/test-payment', {
        amount: amount,
        user_id: userId,
        type: paymentType
      });
      return response.data;
    } catch (error) {
      console.error('Test ödeme oluşturulamadı:', error);
      throw error;
    }
  }

  /**
   * Test webhook (sadece development)
   */
  static async testWebhook(eventType = 'payment_intent.succeeded', userId, paymentType = 'token_purchase') {
    try {
      const response = await api.post('/payment/test-webhook', {
        event_type: eventType,
        user_id: userId,
        type: paymentType
      });
      return response.data;
    } catch (error) {
      console.error('Test webhook çalıştırılamadı:', error);
      throw error;
    }
  }

  /**
   * Manuel token yükleme (development için)
   */
  static async manualTokenLoad(packageId, tokenAmount, paymentIntentId) {
    try {
      const response = await api.post('/payment/manual-token-load', {
        package_id: packageId,
        token_amount: tokenAmount,
        payment_intent_id: paymentIntentId
      });
      return response.data;
    } catch (error) {
      console.error('Manuel token yükleme hatası:', error);
      throw error;
    }
  }

  static async syncMobileTokenPurchase(packageId) {
    try {
      const response = await api.post('/revenuecat/claim-token-purchase', {
        product_id: packageId
      });
      return response.data;
    } catch (error) {
      console.error('RevenueCat token claim hatası:', error);
      throw error;
    }
  }

  /**
   * Manuel premium activation (development için)
   */
  static async manualPremiumActivate(planType, paymentIntentId) {
    try {
      const response = await api.post('/payment/manual-premium-activate', {
        plan_type: planType,
        payment_intent_id: paymentIntentId
      });
      return response.data;
    } catch (error) {
      console.error('Manuel premium activation hatası:', error);
      throw error;
    }
  }

  static async syncMobilePremiumPurchase() {
    try {
      const response = await api.post('/revenuecat/sync-premium');
      return response.data;
    } catch (error) {
      console.error('RevenueCat premium sync hatası:', error);
      throw error;
    }
  }
}

export default PaymentAPI;
