import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider, useDispatch } from "react-redux";
import { useEffect } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import store from "./store/store";
import { loginSuccess } from "./store/authSlice";
import { setBalance } from "./store/tokensSlice";
import authService from "./services/authService";
import { STRIPE_PUBLIC_KEY } from "./config/env";

// Stripe'ı başlat
const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

// Layout Components
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import ToastContainer from "./components/common/Toast";
import ScrollToTop from "./components/common/ScrollToTop";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Readings from "./pages/Readings";
import Premium from "./pages/Premium";
import Dashboard from "./pages/Dashboard";
import EditProfile from "./pages/EditProfile";
import AddBalance from "./pages/AddBalance";
import Payment from "./pages/Payment";
import Tarot from "./pages/Tarot";
import TarotResult from "./pages/TarotResult";
import YildizNameResult from "./pages/YildizNameResult";
import ChineseResult from "./pages/ChineseResult";
import RuneResult from "./pages/RuneResult";
import KabalaResult from "./pages/KabalaResult";
import DailyZodiacResult from "./pages/DailyZodiacResult";
import Yildizname from "./pages/Yildizname";
import Rune from "./pages/Rune";
import Chinese from "./pages/Chinese";
import Kabala from "./pages/Kabala";
import Daily from "./pages/Daily";
import NotFound from "./pages/NotFound";

// Protected Route
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Styles
import "./index.css";

function AppContent() {
  const dispatch = useDispatch();

  useEffect(() => {
    // App başlangıcında token var mı diye kontrol et
    const initializeAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          // Profil ve token balance'ı yükle
          const [profileRes, tokenRes] = await Promise.all([
            authService.getProfile().catch(() => null),
            authService.getTokenBalance().catch(() => null),
          ]);

          if (profileRes?.data) {
            // Backend response'u içinden user data'sını çıkar
            const userData = profileRes.data?.user || profileRes.data;
            dispatch(loginSuccess(userData));
          }

          if (tokenRes?.data) {
            dispatch(setBalance(tokenRes.data.balance || 0));
          }
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
      }
    };

    initializeAuth();
  }, [dispatch]);

  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/readings" element={<Readings />} />
          <Route path="/readings/:type" element={<Readings />} />
          <Route path="/tarot" element={<Tarot />} />
          <Route path="/reading/tarot" element={<TarotResult />} />
          <Route path="/reading/yildizname" element={<YildizNameResult />} />
          <Route path="/reading/chinese" element={<ChineseResult />} />
          <Route path="/reading/rune" element={<RuneResult />} />
          <Route path="/reading/kabala" element={<KabalaResult />} />
          <Route path="/reading/daily-zodiac" element={<DailyZodiacResult />} />
          <Route path="/yildizname" element={<Yildizname />} />
          <Route path="/rune" element={<Rune />} />
          <Route path="/chinese" element={<Chinese />} />
          <Route path="/kabala" element={<Kabala />} />
          <Route path="/daily" element={<Daily />} />
          <Route path="/premium" element={<Premium />} />
          <Route
            path="/add-balance"
            element={
              <ProtectedRoute>
                <AddBalance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment"
            element={
              <ProtectedRoute>
                <Payment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-profile"
            element={
              <ProtectedRoute>
                <EditProfile />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <ToastContainer />
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <Elements stripe={stripePromise}>
        <Router>
          <AppContent />
        </Router>
      </Elements>
    </Provider>
  );
}
export default App;
