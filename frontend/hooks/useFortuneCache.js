import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useStore } from '../stores/useStore';
import { fortuneAPI } from '../services/api';

// Fal sonuçlarını cache'lemek için özel hook
export const useFortuneCache = (method) => {
  const { 
    getCachedReading, 
    addReadingToCache, 
    generateCacheKey, 
    isDuplicateRequest 
  } = useStore();
  const queryClient = useQueryClient();

  // Cache'den fal sonucu al
  const getCachedFortune = (data) => {
    const cacheKey = generateCacheKey(method, data);
    return getCachedReading(cacheKey);
  };

  // Aynı bilgilerle fal baktırılıp baktırılmadığını kontrol et
  const checkDuplicateRequest = (data) => {
    return isDuplicateRequest(method, data);
  };

  // Fal sonucunu cache'e ekle
  const cacheFortuneResult = (data, result) => {
    const cacheKey = generateCacheKey(method, data);
    addReadingToCache(cacheKey, {
      method,
      data,
      result,
      timestamp: Date.now()
    });
  };

  // Fal API çağrısı yap (cache kontrolü ile)
  const getFortune = useMutation({
    mutationFn: async (data) => {
      // Önce cache'den kontrol et
      const cached = getCachedFortune(data);
      if (cached) {
        console.log(`${method} falı cache'den alındı`);
        return { data: cached.result, fromCache: true };
      }

      // Cache'de yoksa API'den al
      console.log(`${method} falı API'den alınıyor`);
      const response = await fortuneAPI[method](data);
      
      // Sonucu cache'e ekle
      cacheFortuneResult(data, response.data);
      
      return { data: response.data, fromCache: false };
    },
    onSuccess: (result) => {
      // Cache'i güncelle
      queryClient.invalidateQueries(['fortune', method]);
    },
    onError: (error) => {
      console.error(`${method} fal hatası:`, error);
    }
  });

  return {
    getFortune,
    getCachedFortune,
    checkDuplicateRequest,
    cacheFortuneResult,
    isLoading: getFortune.isPending,
    error: getFortune.error,
    data: getFortune.data
  };
};

// Yıldızname falı için özel hook
export const useYildiznameCache = () => {
  return useFortuneCache('yildizname');
};

// Tarot falı için özel hook
export const useTarotCache = () => {
  return useFortuneCache('tarot');
};

// Rune falı için özel hook
export const useRuneCache = () => {
  return useFortuneCache('rune');
};

// Çin falı için özel hook
export const useChineseCache = () => {
  return useFortuneCache('chinese');
};

// Kahve falı için özel hook
export const useCoffeeCache = () => {
  return useFortuneCache('coffee');
};

// Kabala falı için özel hook
export const useKabalaCache = () => {
  return useFortuneCache('kabala');
};

// Günlük falı için özel hook
export const useDailyCache = () => {
  return useFortuneCache('daily');
};

// Numeroloji için özel hook
export const useNumerologyCache = () => {
  return useFortuneCache('numerology');
};

export const useCompatibilityCache = () => {
  return useFortuneCache('compatibility');
};

export const useAngelNumbersCache = () => {
  return useFortuneCache('angelNumbers');
};
