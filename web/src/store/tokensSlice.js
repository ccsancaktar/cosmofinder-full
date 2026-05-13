import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  balance: 0,
  transactions: [],
  loading: false,
  error: null,
};

const tokensSlice = createSlice({
  name: "tokens",
  initialState,
  reducers: {
    setBalance: (state, action) => {
      state.balance = action.payload;
    },
    addTransaction: (state, action) => {
      state.transactions.unshift(action.payload);
    },
    setTransactions: (state, action) => {
      state.transactions = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    decreaseBalance: (state, action) => {
      state.balance -= action.payload;
    },
    increaseBalance: (state, action) => {
      state.balance += action.payload;
    },
  },
});

export const {
  setBalance,
  addTransaction,
  setTransactions,
  setLoading,
  setError,
  decreaseBalance,
  increaseBalance,
} = tokensSlice.actions;

export default tokensSlice.reducer;
