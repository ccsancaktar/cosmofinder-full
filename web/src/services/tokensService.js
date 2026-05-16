import API from "./api";

const tokensService = {
  // Token bakiyesi
  getBalance: async () => {
    return API.get("/tokens/balance");
  },

  // Token paketleri
  getPackages: async () => {
    return API.get("/tokens/packages");
  },

  // Token satın al
  buyTokens: async (packageId) => {
    return API.post("/tokens/buy", { packageId });
  },

  // Token satın alma için Stripe payment intent oluştur
  createTokenPayment: async (packageData) => {
    return API.post("/payment/create-token-payment", packageData);
  },

  // Token işlemleri
  getTransactions: async (userId) => {
    return API.get(`/tokens/transactions/${userId}`);
  },

  getHistory: async () => {
    return API.get("/tokens/history");
  },
};

export default tokensService;
