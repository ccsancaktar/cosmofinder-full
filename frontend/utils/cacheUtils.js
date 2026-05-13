import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStore } from '../stores/useStore';

// Cache key'leri
export const CACHE_KEYS = {
  READINGS: 'readings_cache',
  USER_STATS: 'user_stats',
  TOKEN_BALANCE: 'token_balance',
  RECENT_READINGS: 'recent_readings',
  FAVORITE_METHODS: 'favorite_methods'
};

// Cache expiration süreleri (milisaniye)
export const CACHE_EXPIRY = {
  READINGS: 24 * 60 * 60 * 1000, // 24 saat
  USER_STATS: 1 * 60 * 60 * 1000, // 1 saat
  TOKEN_BALANCE: 5 * 60 * 1000, // 5 dakika
  RECENT_READINGS: 7 * 24 * 60 * 60 * 1000, // 7 gün
  FAVORITE_METHODS: 30 * 24 * 60 * 60 * 1000 // 30 gün
};

// Cache item'ı oluştur
export const createCacheItem = (data, expiry = CACHE_EXPIRY.READINGS) => ({
  data,
  timestamp: Date.now(),
  expiresAt: Date.now() + expiry
});

// Cache item'ın geçerli olup olmadığını kontrol et
export const isCacheValid = (cacheItem) => {
  if (!cacheItem || !cacheItem.expiresAt) return false;
  return Date.now() < cacheItem.expiresAt;
};

// Cache'den veri al
export const getFromCache = async (key) => {
  try {
    const cached = await AsyncStorage.getItem(key);
    if (!cached) return null;
    
    const cacheItem = JSON.parse(cached);
    
    if (!isCacheValid(cacheItem)) {
      // Expired cache'i temizle
      await AsyncStorage.removeItem(key);
      return null;
    }
    
    return cacheItem.data;
  } catch (error) {
    console.error('Cache read error:', error);
    return null;
  }
};

// Cache'e veri kaydet
export const setToCache = async (key, data, expiry = CACHE_EXPIRY.READINGS) => {
  try {
    const cacheItem = createCacheItem(data, expiry);
    await AsyncStorage.setItem(key, JSON.stringify(cacheItem));
    return true;
  } catch (error) {
    console.error('Cache write error:', error);
    return false;
  }
};

// Cache'den veri sil
export const removeFromCache = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Cache remove error:', error);
    return false;
  }
};

// Tüm cache'i temizle
export const clearAllCache = async () => {
  try {
    const keys = Object.values(CACHE_KEYS);
    await AsyncStorage.multiRemove(keys);
    return true;
  } catch (error) {
    console.error('Cache clear error:', error);
    return false;
  }
};

// Expired cache'leri temizle
export const cleanupExpiredCache = async () => {
  try {
    const keys = Object.values(CACHE_KEYS);
    const items = await AsyncStorage.multiGet(keys);
    
    const expiredKeys = [];
    
    for (const [key, value] of items) {
      if (value) {
        try {
          const cacheItem = JSON.parse(value);
          if (!isCacheValid(cacheItem)) {
            expiredKeys.push(key);
          }
        } catch (e) {
          // Invalid JSON, temizle
          expiredKeys.push(key);
        }
      }
    }
    
    if (expiredKeys.length > 0) {
      await AsyncStorage.multiRemove(expiredKeys);
      console.log(`${expiredKeys.length} expired cache items cleaned up`);
    }
    
    return expiredKeys.length;
  } catch (error) {
    console.error('Cache cleanup error:', error);
    return 0;
  }
};

// Cache size'ını hesapla
export const getCacheSize = async () => {
  try {
    const keys = Object.values(CACHE_KEYS);
    const items = await AsyncStorage.multiGet(keys);
    
    let totalSize = 0;
    let itemCount = 0;
    
    for (const [key, value] of items) {
      if (value) {
        totalSize += new Blob([value]).size;
        itemCount++;
      }
    }
    
    return {
      itemCount,
      totalSizeBytes: totalSize,
      totalSizeKB: (totalSize / 1024).toFixed(2),
      totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2)
    };
  } catch (error) {
    console.error('Cache size calculation error:', error);
    return { itemCount: 0, totalSizeBytes: 0, totalSizeKB: '0', totalSizeMB: '0' };
  }
};

// Cache hit rate hesapla
export const calculateCacheHitRate = (hits, misses) => {
  const total = hits + misses;
  if (total === 0) return 0;
  return (hits / total * 100).toFixed(2);
};

// Cache performance metrics
export const getCacheMetrics = async () => {
  try {
    const size = await getCacheSize();
    const cleanupCount = await cleanupExpiredCache();
    
    return {
      ...size,
      cleanupCount,
      timestamp: Date.now()
    };
  } catch (error) {
    console.error('Cache metrics error:', error);
    return null;
  }
};

// Cache warming (önceden yükleme)
export const warmCache = async (key, dataFetcher, expiry = CACHE_EXPIRY.READINGS) => {
  try {
    // Cache'de zaten var mı kontrol et
    const cached = await getFromCache(key);
    if (cached) return cached;
    
    // Veriyi fetch et ve cache'e kaydet
    const data = await dataFetcher();
    if (data) {
      await setToCache(key, data, expiry);
    }
    
    return data;
  } catch (error) {
    console.error('Cache warming error:', error);
    return null;
  }
};

// Cache invalidation patterns
export const invalidateCachePattern = async (pattern) => {
  try {
    const keys = Object.values(CACHE_KEYS);
    const items = await AsyncStorage.multiGet(keys);
    
    const matchingKeys = keys.filter(key => key.includes(pattern));
    
    if (matchingKeys.length > 0) {
      await AsyncStorage.multiRemove(matchingKeys);
      console.log(`${matchingKeys.length} cache items invalidated for pattern: ${pattern}`);
    }
    
    return matchingKeys.length;
  } catch (error) {
    console.error('Cache invalidation error:', error);
    return 0;
  }
};

// Cache compression (büyük veriler için)
export const compressCacheData = (data) => {
  try {
    // Basit compression - JSON string'i sıkıştır
    const jsonString = JSON.stringify(data);
    
    // Gereksiz whitespace'leri kaldır
    const compressed = jsonString.replace(/\s+/g, ' ').trim();
    
    return compressed;
  } catch (error) {
    console.error('Cache compression error:', error);
    return data;
  }
};

// Cache decompression
export const decompressCacheData = (compressedData) => {
  try {
    return JSON.parse(compressedData);
  } catch (error) {
    console.error('Cache decompression error:', error);
    return null;
  }
};
