import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Query client konfigürasyonu
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache süresi: 24 saat
      staleTime: 24 * 60 * 60 * 1000,
      
      // Cache'de tutulacak süre: 7 gün
      gcTime: 7 * 24 * 60 * 60 * 1000,
      
      // Fal sonuçları için özel cache key'leri
      queryKeyHashFn: (queryKey) => {
        // Fal sonuçları için aynı bilgilerle yapılan istekleri cache'le
        if (Array.isArray(queryKey) && queryKey[0]?.includes('fortune')) {
          // Kullanıcı bilgilerini hash'le
          const userData = queryKey[1];
          if (userData && typeof userData === 'object') {
            const hash = JSON.stringify(userData);
            return `${queryKey[0]}_${hash}`;
          }
        }
        return JSON.stringify(queryKey);
      },
      
      // Retry sayısı
      retry: (failureCount, error) => {
        // Network hatası ise 2 kez dene (yerine 3)
        if (error?.message?.includes('Network Error')) {
          return failureCount < 2;
        }
        // 5xx hatalar için 1 kez dene
        if (error?.response?.status >= 500) {
          return failureCount < 1;
        }
        // Diğer hatalar için deneme yok
        return false;
      },
      
      // Retry delay
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Background'da refetch
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      
      // Error handling
      onError: (error) => {
        console.error('Query Error:', error);
        // Burada Sentry'ye hata gönderilebilir
      }
    },
    
    mutations: {
      // Mutation retry
      retry: 1,
      
      // Error handling
      onError: (error) => {
        console.error('Mutation Error:', error);
        // Burada Sentry'ye hata gönderilebilir
      }
    }
  }
});

export const QueryProvider = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};
