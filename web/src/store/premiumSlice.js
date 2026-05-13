import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isPremium: false,
  plan: null,
  status: null,
  expiresAt: null,
  loading: false,
  error: null,
};

const premiumSlice = createSlice({
  name: "premium",
  initialState,
  reducers: {
    setPremiumStatus: (state, action) => {
      state.isPremium = action.payload.isPremium;
      state.plan = action.payload.plan;
      state.status = action.payload.status;
      state.expiresAt = action.payload.expiresAt;
    },
    upgradeToPremium: (state, action) => {
      state.isPremium = true;
      state.plan = action.payload.plan;
      state.expiresAt = action.payload.expiresAt;
    },
    downgradePremium: (state) => {
      state.isPremium = false;
      state.plan = null;
      state.expiresAt = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setPremiumStatus,
  upgradeToPremium,
  downgradePremium,
  setLoading,
  setError,
} = premiumSlice.actions;

export default premiumSlice.reducer;
