import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import tokenAPI from '../services/tokenAPI';

import { 
  DAILY_TOKEN_COST,
  COFFEE_TOKEN_COST,
  TAROT_TOKEN_COST,
  CHINESE_TOKEN_COST,
  RUNE_TOKEN_COST,
  KABALA_TOKEN_COST,
  YILDIZNAME_TOKEN_COST,
  NUMEROLOGY_TOKEN_COST,
  COMPATIBILITY_TOKEN_COST,
  ANGEL_TOKEN_COST,
  REGISTRATION_BONUS_TOKENS,
  FREE_DAILY_BONUS_TOKENS,
  VIDEO_REWARD_TOKENS,
  FREE_DAILY_VIDEO_LIMIT
} from '@env';

// Token maliyetleri - Environment variables'dan (fallback ile)
const TOKEN_COSTS = {
  DAILY: parseInt(DAILY_TOKEN_COST) || 3,
  COFFEE: parseInt(COFFEE_TOKEN_COST) || 6,
  TAROT: parseInt(TAROT_TOKEN_COST) || 5,
  CHINESE: parseInt(CHINESE_TOKEN_COST) || 5,
  RUNE: parseInt(RUNE_TOKEN_COST) || 7,
  KABALA: parseInt(KABALA_TOKEN_COST) || 7,
  YILDIZNAME: parseInt(YILDIZNAME_TOKEN_COST) || 9,
  NUMEROLOGY: parseInt(NUMEROLOGY_TOKEN_COST) || 5,
  COMPATIBILITY: parseInt(COMPATIBILITY_TOKEN_COST) || 8,
  ANGEL: parseInt(ANGEL_TOKEN_COST) || 1
};

// Bonus token miktarları - Environment variables'dan (fallback ile)
const BONUS_AMOUNTS = {
  REGISTRATION: parseInt(REGISTRATION_BONUS_TOKENS) || 8,
  DAILY: parseInt(FREE_DAILY_BONUS_TOKENS) || 3,
  VIDEO: parseInt(VIDEO_REWARD_TOKENS) || 5,
  DAILY_VIDEO_LIMIT: parseInt(FREE_DAILY_VIDEO_LIMIT) || 3
};

// Debug için environment variables'ları logla
console.log('Environment Variables Debug:');
console.log('DAILY_TOKEN_COST:', DAILY_TOKEN_COST);
console.log('TOKEN_COSTS:', TOKEN_COSTS);



const TokenContext = createContext();

export const useToken = () => {
  const context = useContext(TokenContext);
  if (!context) {
    throw new Error('useToken must be used within a TokenProvider');
  }
  return context;
};

// Token maliyetlerini ve bonus miktarlarını export et (zaten yukarıda export edildi)

export const TokenProvider = ({ children }) => {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dailyBonusStatus, setDailyBonusStatus] = useState({
    canClaim: true,
    remainingSeconds: 0,
    nextBonusTime: null,
    lastClaimed: null
  });
  const balanceRequestRef = useRef(null);
  const lastBalanceFetchRef = useRef(0);

  // Token bakiyesini getir
  const fetchBalance = async () => {
    const now = Date.now();
    if (balanceRequestRef.current) {
      return balanceRequestRef.current;
    }
    if (now - lastBalanceFetchRef.current < 8000) {
      return balance;
    }

    const request = (async () => {
    try {
      setLoading(true);
      const response = await tokenAPI.getBalance();
      setBalance(response.data.balance);
      lastBalanceFetchRef.current = Date.now();
      setError(null);
      return response.data.balance;
    } catch (err) {
      setError(err.response?.data?.error || 'Token bakiyesi alınamadı');
      console.error('Token balance error:', err);
      throw err;
    } finally {
      setLoading(false);
      balanceRequestRef.current = null;
    }
    })();

    balanceRequestRef.current = request;
    return request;
  };

  // Video izleme ödülü
  const watchVideo = async (rewardAmount = BONUS_AMOUNTS.VIDEO) => {
    try {
      setLoading(true);
      const response = await tokenAPI.videoReward(rewardAmount);
      setBalance(response.data.new_balance);
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Video ödülü alınamadı');
      console.error('Video reward error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Video limit durumunu kontrol et
  const fetchVideoLimitStatus = async () => {
    try {
      const response = await tokenAPI.getVideoLimitStatus();
      return response.data;
    } catch (err) {
      console.error('Video limit status error:', err);
      return { limit_reached: false, videos_watched: 0, daily_limit: BONUS_AMOUNTS.DAILY_VIDEO_LIMIT, remaining_videos: BONUS_AMOUNTS.DAILY_VIDEO_LIMIT };
    }
  };

  // Günlük bonus durumunu getir
  const fetchDailyBonusStatus = async () => {
    try {
      const response = await tokenAPI.getDailyBonusStatus();
      setDailyBonusStatus({
        canClaim: response.data.can_claim,
        remainingSeconds: response.data.remaining_seconds,
        nextBonusTime: response.data.next_bonus_time,
        lastClaimed: response.data.last_claimed
      });
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Günlük bonus durumu alınamadı');
      console.error('Daily bonus status error:', err);
    }
  };

  // Günlük bonus
  const claimDailyBonus = async () => {
    try {
      setLoading(true);
      const response = await tokenAPI.dailyBonus();
      setBalance(response.data.new_balance);
      // Bonus durumunu güncelle
      await fetchDailyBonusStatus();
      setError(null);
      return response.data;
    } catch (err) {
      // Eğer bonus zaten alınmışsa, durumu güncelle
      if (err.response?.data?.remaining_seconds !== undefined) {
        setDailyBonusStatus({
          canClaim: false,
          remainingSeconds: err.response.data.remaining_seconds,
          nextBonusTime: err.response.data.next_bonus_time,
          lastClaimed: null
        });
      }
      setError(err.response?.data?.error || 'Günlük bonus alınamadı');
      console.error('Daily bonus error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Token paketi satın al
  const purchaseTokens = async (packageId) => {
    try {
      setLoading(true);
      const response = await tokenAPI.purchaseTokens(packageId);
      setBalance(response.data.new_balance);
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Token satın alınamadı');
      console.error('Token purchase error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Token geçmişini getir
  const getHistory = async () => {
    try {
      setLoading(true);
      const response = await tokenAPI.getHistory();
      setError(null);
      return response.data.transactions;
    } catch (err) {
      setError(err.response?.data?.error || 'Token geçmişi alınamadı');
      console.error('Token history error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Token paketlerini getir
  const getPackages = async () => {
    try {
      setLoading(true);
      const response = await tokenAPI.getPackages();
      setError(null);
      return response.data.packages;
    } catch (err) {
      setError(err.response?.data?.error || 'Token paketleri alınamadı');
      console.error('Token packages error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Bakiye güncelle
  const updateBalance = (newBalance) => {
    setBalance(newBalance);
  };

  // Hata temizle
  const clearError = () => {
    setError(null);
  };

  const value = {
    balance,
    loading,
    error,
    dailyBonusStatus,
    fetchBalance,
    fetchDailyBonusStatus,
    fetchVideoLimitStatus,
    watchVideo,
    claimDailyBonus,
    purchaseTokens,
    getHistory,
    getPackages,
    updateBalance,
    clearError,
  };

  return (
    <TokenContext.Provider value={value}>
      {children}
    </TokenContext.Provider>
  );
};

// Export TOKEN_COSTS ve BONUS_AMOUNTS - Fal ekranları için gerekli
export { TOKEN_COSTS, BONUS_AMOUNTS };

 
