import API from "./api";

const paymentService = {
  // Payment intent oluştur
  createPaymentIntent: async (amount, description) => {
    return API.post("/payment/intent", { amount, description });
  },

  // Token payment intent oluştur
  createTokenPaymentIntent: async (packageId) => {
    return API.post("/payment/create-token-payment", { package_id: packageId });
  },

  // Ödeme durumu
  getPaymentStatus: async (paymentId) => {
    return API.get(`/payment/payment-status/${paymentId}`);
  },

  // Ödeme geçmişi
  getPaymentHistory: async (userId) => {
    return API.get(`/payment/history/${userId}`);
  },

  // Faturalar
  getInvoices: async (userId) => {
    return API.get(`/payment/invoices/${userId}`);
  },
};

export default paymentService;

