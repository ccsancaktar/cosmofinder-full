import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import tokensReducer from "./tokensSlice";
import premiumReducer from "./premiumSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    tokens: tokensReducer,
    premium: premiumReducer,
  },
});

export default store;
