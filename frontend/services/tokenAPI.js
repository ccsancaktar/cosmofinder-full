import api from './api';

// Token API endpoints
export const tokenAPI = {
  // Token bakiyesini getir
  getBalance: () => api.get('/tokens/balance'),
  
  // Token paketlerini getir
  getPackages: () => api.get('/tokens/packages'),
  
  // Token paketi satın al
  purchaseTokens: (packageId) => api.post('/tokens/purchase', { package_id: packageId }),
  
  // Token geçmişini getir
  getHistory: () => api.get('/tokens/history'),
  
  // Video izleme ödülü
  videoReward: (rewardAmount) => api.post('/tokens/video-reward', { reward_amount: rewardAmount }),
  
  // Günlük bonus
  dailyBonus: () => api.post('/tokens/daily-bonus'),
  
  // Günlük bonus durumunu kontrol et
  getDailyBonusStatus: () => api.get('/tokens/daily-bonus-status'),
  
  // Video limit durumunu kontrol et
  getVideoLimitStatus: () => api.get('/tokens/video-limit-status'),
};

export default tokenAPI; 