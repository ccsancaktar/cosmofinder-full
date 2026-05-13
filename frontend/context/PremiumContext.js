import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import premiumAPI from '../services/premiumAPI';

const PremiumContext = createContext();

export const usePremium = () => {
  const context = useContext(PremiumContext);
  if (!context) {
    throw new Error('usePremium must be used within a PremiumProvider');
  }
  return context;
};

export const PremiumProvider = ({ children }) => {
  const [hasPremium, setHasPremium] = useState(false);
  const [planType, setPlanType] = useState(null);
  const [daysRemaining, setDaysRemaining] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const statusRequestRef = useRef(null);
  const lastStatusFetchRef = useRef(0);

  // Premium durumunu getir
  const fetchStatus = async () => {
    const now = Date.now();
    if (statusRequestRef.current) {
      return statusRequestRef.current;
    }
    if (now - lastStatusFetchRef.current < 8000) {
      return {
        has_premium: hasPremium,
        plan_type: planType,
        days_remaining: daysRemaining,
      };
    }

    const request = (async () => {
    try {
      setLoading(true);
      const response = await premiumAPI.getStatus();
      setHasPremium(response.data.has_premium);
      setPlanType(response.data.plan_type);
      setDaysRemaining(response.data.days_remaining);
      lastStatusFetchRef.current = Date.now();
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Premium durumu alınamadı');
      console.error('Premium status error:', err);
      throw err;
    } finally {
      setLoading(false);
      statusRequestRef.current = null;
    }
    })();

    statusRequestRef.current = request;
    return request;
  };

  // Premium planlarını getir
  const getPlans = async () => {
    try {
      setLoading(true);
      const response = await premiumAPI.getPlans();
      setError(null);
      return response.data.plans;
    } catch (err) {
      setError(err.response?.data?.error || 'Premium planları alınamadı');
      console.error('Premium plans error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Premium üyelik satın al
  const subscribe = async (planId) => {
    try {
      setLoading(true);
      const response = await premiumAPI.subscribe(planId);
      setHasPremium(true);
      setPlanType(response.data.plan_type);
      setDaysRemaining(response.data.days_remaining);
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Premium üyelik satın alınamadı');
      console.error('Premium subscribe error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Premium üyeliği iptal et
  const cancel = async () => {
    try {
      setLoading(true);
      const response = await premiumAPI.cancel();
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Premium üyelik iptal edilemedi');
      console.error('Premium cancel error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Premium üyeliği yeniden aktifleştir
  const reactivate = async () => {
    try {
      setLoading(true);
      const response = await premiumAPI.reactivate();
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Premium üyelik yeniden aktifleştirilemedi');
      console.error('Premium reactivate error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Premium durumunu güncelle
  const updateStatus = (status) => {
    setHasPremium(status.has_premium);
    setPlanType(status.plan_type);
    setDaysRemaining(status.days_remaining);
  };

  // Hata temizle
  const clearError = () => {
    setError(null);
  };

  const value = {
    hasPremium,
    planType,
    daysRemaining,
    loading,
    error,
    fetchStatus,
    getPlans,
    subscribe,
    cancel,
    reactivate,
    updateStatus,
    clearError,
  };

  return (
    <PremiumContext.Provider value={value}>
      {children}
    </PremiumContext.Provider>
  );
}; 
