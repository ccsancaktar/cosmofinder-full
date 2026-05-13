import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { readingsAPI, fortuneAPI } from '../services/api';
import { useStore, useReadingsStore } from '../stores/useStore';
import { useLanguage } from '../context/LanguageContext';

// Fal geçmişini getir
export const useReadingsHistory = (params = {}) => {
  return useQuery({
    queryKey: ['readings', 'history', params],
    queryFn: () => readingsAPI.getHistory(params),
    staleTime: 5 * 60 * 1000, // 5 dakika
    select: (data) => data.data
  });
};

// Fal detayını getir
export const useReadingDetail = (readingId) => {
  return useQuery({
    queryKey: ['readings', 'detail', readingId],
    queryFn: () => readingsAPI.getReadingDetail(readingId),
    enabled: !!readingId,
    staleTime: 10 * 60 * 1000 // 10 dakika
  });
};

// Fal istatistiklerini getir
export const useReadingStats = () => {
  return useQuery({
    queryKey: ['readings', 'stats'],
    queryFn: () => readingsAPI.getStatistics(),
    staleTime: 15 * 60 * 1000, // 15 dakika
    select: (data) => data.data
  });
};

// Yıldızname falı
export const useYildizname = () => {
  const queryClient = useQueryClient();
  const { addReadingToCache, generateCacheKey, setLoading } = useStore();
  const { addReading } = useReadingsStore();
  const { currentLanguage } = useLanguage();
  
  return useMutation({
    mutationFn: (data) => fortuneAPI.yildizname({ ...data, language: currentLanguage }),
    onMutate: () => {
      setLoading('readings', true);
    },
    onSuccess: (response, variables) => {
      const reading = response.data;
      const cacheKey = generateCacheKey('yildizname', variables);
      
      // Cache'e ekle
      addReadingToCache(cacheKey, reading);
      
      // Store'a ekle
      addReading(reading);
      
      // İlgili query'leri invalidate et
      queryClient.invalidateQueries({ queryKey: ['readings', 'history'] });
      queryClient.invalidateQueries({ queryKey: ['readings', 'stats'] });
      
      setLoading('readings', false);
    },
    onError: (error) => {
      setLoading('readings', false);
      console.error('Yıldızname falı hatası:', error);
    }
  });
};

// Rune falı
export const useRune = () => {
  const queryClient = useQueryClient();
  const { addReadingToCache, generateCacheKey, setLoading } = useStore();
  const { addReading } = useReadingsStore();
  const { currentLanguage } = useLanguage();
  
  return useMutation({
    mutationFn: (data) => fortuneAPI.rune({ ...data, language: currentLanguage }),
    onMutate: () => {
      setLoading('readings', true);
    },
    onSuccess: (response, variables) => {
      const reading = response.data;
      const cacheKey = generateCacheKey('rune', variables);
      
      addReadingToCache(cacheKey, reading);
      addReading(reading);
      
      queryClient.invalidateQueries({ queryKey: ['readings', 'history'] });
      queryClient.invalidateQueries({ queryKey: ['readings', 'stats'] });
      
      setLoading('readings', false);
    },
    onError: (error) => {
      setLoading('readings', false);
      console.error('Rune falı hatası:', error);
    }
  });
};

// Tarot falı
export const useTarot = () => {
  const queryClient = useQueryClient();
  const { addReadingToCache, generateCacheKey, setLoading } = useStore();
  const { addReading } = useReadingsStore();
  const { currentLanguage } = useLanguage();
  
  return useMutation({
    mutationFn: (data) => fortuneAPI.tarot({ ...data, language: currentLanguage }),
    onMutate: () => {
      setLoading('readings', true);
    },
    onSuccess: (response, variables) => {
      const reading = response.data;
      const cacheKey = generateCacheKey('tarot', variables);
      
      addReadingToCache(cacheKey, reading);
      addReading(reading);
      
      queryClient.invalidateQueries({ queryKey: ['readings', 'history'] });
      queryClient.invalidateQueries({ queryKey: ['readings', 'stats'] });
      
      setLoading('readings', false);
    },
    onError: (error) => {
      setLoading('readings', false);
      console.error('Tarot falı hatası:', error);
    }
  });
};

// Çin falı
export const useChinese = () => {
  const queryClient = useQueryClient();
  const { addReadingToCache, generateCacheKey, setLoading } = useStore();
  const { addReading } = useReadingsStore();
  
  return useMutation({
    mutationFn: (data) => fortuneAPI.chinese(data),
    onMutate: () => {
      setLoading('readings', true);
    },
    onSuccess: (response, variables) => {
      const reading = response.data;
      const cacheKey = generateCacheKey('chinese', variables);
      
      addReadingToCache(cacheKey, reading);
      addReading(reading);
      
      queryClient.invalidateQueries({ queryKey: ['readings', 'history'] });
      queryClient.invalidateQueries({ queryKey: ['readings', 'stats'] });
      
      setLoading('readings', false);
    },
    onError: (error) => {
      setLoading('readings', false);
      console.error('Çin falı hatası:', error);
    }
  });
};

// Kahve falı
export const useCoffee = () => {
  const queryClient = useQueryClient();
  const { addReadingToCache, generateCacheKey, setLoading } = useStore();
  const { addReading } = useReadingsStore();
  
  return useMutation({
    mutationFn: (data) => fortuneAPI.coffee(data),
    onMutate: () => {
      setLoading('readings', true);
    },
    onSuccess: (response, variables) => {
      const reading = response.data;
      const cacheKey = generateCacheKey('coffee', variables);
      
      addReadingToCache(cacheKey, reading);
      addReading(reading);
      
      queryClient.invalidateQueries({ queryKey: ['readings', 'history'] });
      queryClient.invalidateQueries({ queryKey: ['readings', 'stats'] });
      
      setLoading('readings', false);
    },
    onError: (error) => {
      setLoading('readings', false);
      console.error('Kahve falı hatası:', error);
    }
  });
};

// Kabala falı
export const useKabala = () => {
  const queryClient = useQueryClient();
  const { addReadingToCache, generateCacheKey, setLoading } = useStore();
  const { addReading } = useReadingsStore();
  
  return useMutation({
    mutationFn: (data) => fortuneAPI.kabala(data),
    onMutate: () => {
      setLoading('readings', true);
    },
    onSuccess: (response, variables) => {
      const reading = response.data;
      const cacheKey = generateCacheKey('kabala', variables);
      
      addReadingToCache(cacheKey, reading);
      addReading(reading);
      
      queryClient.invalidateQueries({ queryKey: ['readings', 'history'] });
      queryClient.invalidateQueries({ queryKey: ['readings', 'stats'] });
      
      setLoading('readings', false);
    },
    onError: (error) => {
      setLoading('readings', false);
      console.error('Kabala falı hatası:', error);
    }
  });
};

// Günlük fal
export const useDaily = () => {
  const queryClient = useQueryClient();
  const { addReadingToCache, generateCacheKey, setLoading } = useStore();
  const { addReading } = useReadingsStore();
  
  return useMutation({
    mutationFn: (data) => fortuneAPI.daily(data),
    onMutate: () => {
      setLoading('readings', true);
    },
    onSuccess: (response, variables) => {
      const reading = response.data;
      const cacheKey = generateCacheKey('daily', variables);
      
      addReadingToCache(cacheKey, reading);
      addReading(reading);
      
      queryClient.invalidateQueries({ queryKey: ['readings', 'history'] });
      queryClient.invalidateQueries({ queryKey: ['readings', 'stats'] });
      
      setLoading('readings', false);
    },
    onError: (error) => {
      setLoading('readings', false);
      console.error('Günlük fal hatası:', error);
    }
  });
};

// Cache'den fal sonucu al
export const useCachedReading = (method, data) => {
  const { getCachedReading, generateCacheKey } = useStore();
  
  if (!data) return null;
  
  const cacheKey = generateCacheKey(method, data);
  return getCachedReading(cacheKey);
};
