import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/env';

// Production'da sadece hata durumunda log
if (__DEV__) {
  console.log('API URL:', API_BASE_URL);
}

// Network test fonksiyonu (sadece development'ta)
export const testNetworkConnection = async () => {
  if (!__DEV__) return true; // Production'da test yapma
  
  try {
    console.log('🔍 Testing network connection...');
    console.log('   API URL:', API_BASE_URL);
    console.log('   Base URL:', API_BASE_URL);
    
    // Test 1: Health check with axios
    console.log('📡 Attempting health check...');
    const axiosResponse = await api.get('/health', { timeout: 5000 });
    console.log('✅ Health check successful:', axiosResponse.status);
    
    return true;
  } catch (error) {
    console.error('❌ Network test failed:');
    console.error('   Error Code:', error.code);
    console.error('   Error Message:', error.message);
    console.error('   Config URL:', error.config?.url);
    console.error('   Config Base:', error.config?.baseURL);
    if (error.response) {
      console.error('   Response Status:', error.response.status);
    }
    return false;
  }
};

// Axios instance oluştur
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 saniye timeout (ilk attempt için yeterli)
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // 4xx durumları catch bloğuna düşsün ki auth/validation akışları doğru çalışsın.
  validateStatus: (status) => status >= 200 && status < 300,
});

// Request interceptor - token ekle
api.interceptors.request.use(
  async (config) => {
    if (__DEV__) {
      console.log('🚀 API Request:', config.method?.toUpperCase(), config.url);
    }
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Token ekleme hatası:', error);
    }
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - hata yönetimi
api.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      console.log('✅ API Response:', response.status, response.config.url);
      console.log('   Response Data:', response.data);
    }
    return response;
  },
  async (error) => {
    if (__DEV__) {
      console.error('❌ API Error Details:');
      console.error('  - Message:', error.message);
      console.error('  - Code:', error.code);
      console.error('  - Config URL:', error.config?.url);
      console.error('  - Config baseURL:', error.config?.baseURL);
      console.error('  - Response Status:', error.response?.status);
      console.error('  - Response Data:', error.response?.data);
      console.error('  - Full Error:', error);
    }
    
    // Network error handling
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      if (__DEV__) {
        console.error('🌐 Network connection issue detected');
        console.error('   Trying to connect to:', error.config?.baseURL || API_BASE_URL);
        console.error('   Full URL:', error.config?.url);
      }
      
      // Timeout vs actual network error
      if (error.code === 'ECONNABORTED') {
        console.error('Request timeout');
      } else if (!error.response && !error.request) {
        console.error('Cannot reach server at:', API_BASE_URL);
      }
    }
    
    if (error.response?.status === 401) {
      // Token geçersiz, kullanıcıyı logout yap
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('auth_user');
      // Burada navigation ile login sayfasına yönlendirme yapılabilir
    }
    console.error('API Hatası:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authAPI = {
  // Kullanıcı kayıt
  register: (userData) => api.post('/auth/register', userData),
  
  // Kullanıcı giriş
  login: (credentials) => api.post('/auth/login', credentials),

  // Apple ile giriş
  appleVerify: (payload) => api.post('/auth/apple/verify', payload),
  
  // Profil bilgilerini getir
  getProfile: () => api.get('/auth/profile'),
  
  // Profil güncelle
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  
  // Profil resmi yükle
  uploadProfileImage: (imageData) => api.post('/auth/upload-profile-image', { profile_image: imageData }),
  
  // Profil resmi sil
  deleteProfileImage: () => api.delete('/auth/delete-profile-image'),
  
  // Şifre değiştir
  changePassword: (passwordData) => api.post('/auth/change-password', passwordData),

  // Şifre sıfırlama isteği
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),

  // Reset token ile yeni şifre belirle
  resetPassword: (payload) => api.post('/auth/reset-password', payload),
  
  // Çıkış yap
  logout: () => api.post('/auth/logout'),
};

// Readings API endpoints
export const readingsAPI = {
  // Fal geçmişini getir
  getHistory: (params = {}) => api.get('/readings/history', { params }),
  
  // Fal detayını getir
  getReadingDetail: (readingId) => api.get(`/readings/history/${readingId}`),
  
  // Fal kaydını sil
  deleteReading: (readingId) => api.delete(`/readings/history/${readingId}`),
  
  // Fal görünürlüğünü değiştir
  toggleVisibility: (readingId, isPublic) => 
    api.put(`/readings/history/${readingId}/visibility`, { is_public: isPublic }),
  
  // Fal istatistiklerini getir
  getStatistics: () => api.get('/readings/statistics'),
};

// Fal API endpoints
export const fortuneAPI = {
  // Yıldızname falı
  yildizname: (data) => api.post('/yildizname', data, { timeout: 65000 }),
  
  // Rune falı
  rune: (data) => api.post('/rune', data, { timeout: 65000 }),
  
  // Çin falı
  chinese: (data) => api.post('/chinese', data, { timeout: 65000 }),
  
  // Kahve falı
  coffee: (data) => api.post('/coffee', data, { timeout: 65000 }),
  
  // Tarot falı
  tarot: (data) => api.post('/tarot', data, { timeout: 65000 }),
  
  // Günlük falı
  daily: (data) => api.post('/daily', data, { timeout: 65000 }),
  
  // Kabala falı
  kabala: (data) => api.post('/kabala', data, { timeout: 65000 }),

  // Numeroloji
  numerology: (data) => api.post('/numerology', data, { timeout: 65000 }),

  // Uyum analizi
  compatibility: (data) => api.post('/compatibility', data, { timeout: 65000 }),

  // Melek sayıları
  angelNumbers: (data) => api.post('/angel-numbers', data, { timeout: 65000 }),
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
};

// Notification API endpoints
export const notificationAPI = {
  // Push token kaydet
  registerToken: (pushToken) => api.post('/notifications/register', { push_token: pushToken }),
  
  // Notification ayarlarını getir
  getSettings: () => api.get('/notifications/settings'),
  
  // Notification ayarlarını güncelle
  updateSettings: (settings) => api.put('/notifications/settings', { notification_settings: settings }),
  
  
  
  // Notification geçmişini getir
  getHistory: () => api.get('/notifications/history'),
};

export default api; 
