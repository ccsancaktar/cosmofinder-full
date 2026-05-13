import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateUser,
  setUser,
} = authSlice.actions;

export default authSlice.reducer;
