import api from './api';

// Premium API endpoints
export const premiumAPI = {
  // Premium durumunu getir
  getStatus: () => api.get('/premium/status'),
  
  // Premium planlarını getir
  getPlans: () => api.get('/premium/plans'),
  
  // Premium üyelik satın al
  subscribe: (planId) => api.post('/premium/subscribe', { plan_id: planId }),
  
  // Premium üyeliği iptal et
  cancel: () => api.post('/premium/cancel'),
  
  // Premium üyeliği yeniden aktifleştir
  reactivate: () => api.post('/premium/reactivate'),
};

export default premiumAPI; 