import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState, useRef } from "react";
import authService from "../services/authService";
import { setUser, logout } from "../store/authSlice";
import { setBalance } from "../store/tokensSlice";

export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    // Bir kez çalışması için kontrol et
    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    const checkAuth = async () => {
      try {
        if (!authService.isAuthenticated()) {
          dispatch(logout());
          setLoading(false);
          return;
        }

        // Profili yükle
        const profileResponse = await authService.getProfile();
        const userData = profileResponse.data?.user || profileResponse.data;
        
        console.log("✅ Profile loaded:", userData);
        
        if (userData && userData.username) {
          dispatch(setUser(userData));
        } else {
          throw new Error("Invalid user data");
        }

        // Token balance yükle
        try {
          const balanceResponse = await authService.getTokenBalance();
          const balance = balanceResponse.data?.balance || balanceResponse.data || 0;
          console.log("✅ Balance loaded:", balance);
          dispatch(setBalance(balance));
        } catch (balanceError) {
          console.error("❌ Balance fetch failed:", balanceError);
          dispatch(setBalance(0));
        }
      } catch (error) {
        console.error("❌ Auth check failed:", error);
        localStorage.removeItem("jwt_token");
        dispatch(logout());
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [dispatch]);

  return {
    ...auth,
    loading,
    logout: () => {
      localStorage.removeItem("jwt_token");
      dispatch(logout());
    },
  };
};
