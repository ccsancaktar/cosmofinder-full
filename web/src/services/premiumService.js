import API from "./api";

const premiumService = {
  // Premium durumu
  getStatus: async (userId) => {
    return API.get(`/premium/status/${userId}`);
  },

  // Premium planları
  getPlans: async () => {
    return API.get("/premium/plans");
  },

  // Subscription oluştur
  createSubscription: async (planId) => {
    return API.post("/premium/subscribe", { planId });
  },

  // Subscription iptal et
  cancelSubscription: async (userId) => {
    return API.post(`/premium/cancel/${userId}`);
  },

  // Subscription güncelle
  updateSubscription: async (userId, planId) => {
    return API.put(`/premium/update/${userId}`, { planId });
  },
};

export default premiumService;
