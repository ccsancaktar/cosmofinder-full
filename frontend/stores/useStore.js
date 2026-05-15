import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Ana store
export const useStore = create(
  persist(
    (set, get) => ({
      // Fal sonuçları cache'i
      readingsCache: new Map(),
      
      // Token balance
      tokenBalance: 0,
      
      // Kullanıcı istatistikleri
      userStats: {
        total_readings: 0,
        days_registered: 0,
        favorite_method: null
      },
      
      // Son fal sonuçları
      recentReadings: [],
      
      // Loading states
      loading: {
        readings: false,
        tokens: false,
        profile: false
      },
      
      // Actions
      setTokenBalance: (balance) => set({ tokenBalance: balance }),
      
      updateUserStats: (stats) => set({ userStats: { ...get().userStats, ...stats } }),
      
      addReadingToCache: (key, reading) => {
        const cache = new Map(get().readingsCache);
        cache.set(key, {
          ...reading,
          timestamp: Date.now(),
          expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 saat
        });
        set({ readingsCache: cache });
      },
      
      getCachedReading: (key) => {
        const cache = get().readingsCache;
        const reading = cache.get(key);
        
        if (reading && reading.expiresAt > Date.now()) {
          return reading;
        }
        
        // Expired reading'i temizle
        if (reading) {
          const newCache = new Map(cache);
          newCache.delete(key);
          set({ readingsCache: newCache });
        }
        
        return null;
      },
      
      clearExpiredCache: () => {
        const cache = get().readingsCache;
        const now = Date.now();
        const newCache = new Map();
        
        for (const [key, reading] of cache.entries()) {
          if (reading.expiresAt > now) {
            newCache.set(key, reading);
          }
        }
        
        set({ readingsCache: newCache });
      },
      
      addRecentReading: (reading) => {
        const recent = get().recentReadings;
        const newRecent = [reading, ...recent.filter(r => r.id !== reading.id)].slice(0, 10);
        set({ recentReadings: newRecent });
      },
      
      setLoading: (key, value) => 
        set({ loading: { ...get().loading, [key]: value } }),
      
      // Cache key generator - Fal sonuçları için optimize edilmiş
      generateCacheKey: (method, data) => {
        // Fal yöntemine göre özel cache key'leri
        if (method === 'yildizname') {
          const { isim, anneAdi, dogumTarihi, dogumYeri, dogumSaati, readingTier, language } = data;
          return `yildizname_${readingTier || 'free'}_${language || 'tr'}_${isim}_${anneAdi}_${dogumTarihi}_${dogumYeri || ''}_${dogumSaati}`;
        }
        
        if (method === 'tarot') {
          const { soru, question, selectedCards, readingTier, language } = data;
          const normalizedQuestion = soru || question || '';
          const normalizedCards = Array.isArray(selectedCards) ? selectedCards.join('-') : '';
          return `tarot_${readingTier || 'free'}_${language || 'tr'}_${normalizedQuestion}_${normalizedCards}`;
        }
        
        if (method === 'rune') {
          const { soru, question, readingTier, language } = data;
          const normalizedQuestion = soru || question || '';
          return `rune_${readingTier || 'free'}_${language || 'tr'}_${normalizedQuestion}`;
        }
        
        if (method === 'chinese') {
          const { dogumTarihi, dogumSaati, readingTier, language } = data;
          return `chinese_${readingTier || 'free'}_${language || 'tr'}_${dogumTarihi}_${dogumSaati}`;
        }
        
        if (method === 'coffee') {
          const { question, soru, images, language } = data;
          const normalizedQuestion = (soru || question || '__general__').trim();
          const imageFingerprint = Array.isArray(images)
            ? images
                .map((img, index) => {
                  if (typeof img !== 'string' || !img.length) {
                    return `empty_${index}`;
                  }
                  return `${img.length}_${img.slice(-24)}`;
                })
                .join('|')
            : 'no_images';
          return `coffee_${language || 'tr'}_${normalizedQuestion}_${imageFingerprint}`;
        }
        
        if (method === 'kabala') {
          const { isim, dogumTarihi, readingTier, language } = data;
          return `kabala_${readingTier || 'free'}_${language || 'tr'}_${isim || ''}_${dogumTarihi}`;
        }
        
        if (method === 'daily') {
          const { dogumTarihi, language } = data;
          return `daily_v2_${language || 'tr'}_${dogumTarihi}`;
        }
        
        // Genel cache key
        const sortedData = Object.keys(data)
          .sort()
          .reduce((result, key) => {
            result[key] = data[key];
            return result;
          }, {});
        
        return `${method}_${JSON.stringify(sortedData)}`;
      },
      
      // Aynı fal bilgileriyle tekrar istek yapılıp yapılmadığını kontrol et
      isDuplicateRequest: (method, data) => {
        const cacheKey = get().generateCacheKey(method, data);
        const cached = get().getCachedReading(cacheKey);
        return cached !== null;
      }
    }),
    {
      name: 'fal-app-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        tokenBalance: state.tokenBalance,
        userStats: state.userStats,
        recentReadings: state.recentReadings
      })
    }
  )
);

// Fal sonuçları için özel store
export const useReadingsStore = create(
  persist(
    (set, get) => ({
      // Fal geçmişi
      readingsHistory: [],
      
      // Favori fal yöntemleri
      favoriteMethods: [],
      
      // Fal istatistikleri
      readingStats: {
        total: 0,
        byMethod: {},
        byDate: {}
      },
      
      // Actions
      setReadingsHistory: (history) => set({ readingsHistory: history }),
      
      addReading: (reading) => {
        const history = get().readingsHistory;
        const newHistory = [reading, ...history.filter(r => r.id !== reading.id)];
        set({ readingsHistory: newHistory });
      },
      
      updateReading: (id, updates) => {
        const history = get().readingsHistory;
        const newHistory = history.map(r => 
          r.id === id ? { ...r, ...updates } : r
        );
        set({ readingsHistory: newHistory });
      },
      
      deleteReading: (id) => {
        const history = get().readingsHistory;
        const newHistory = history.filter(r => r.id !== id);
        set({ readingsHistory: newHistory });
      },
      
      updateStats: (stats) => set({ readingStats: { ...get().readingStats, ...stats } })
    }),
    {
      name: 'readings-store',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);
