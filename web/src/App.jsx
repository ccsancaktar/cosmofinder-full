import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";

import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import ToastContainer from "./components/common/Toast";
import ScrollToTop from "./components/common/ScrollToTop";

import Home from "./pages/Home";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Support from "./pages/Support";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";

import "./index.css";

const legacyAppRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/readings",
  "/readings/:type",
  "/tarot",
  "/numerology",
  "/compatibility",
  "/angel-numbers",
  "/reading/tarot",
  "/reading/yildizname",
  "/reading/chinese",
  "/reading/rune",
  "/reading/kabala",
  "/reading/daily-zodiac",
  "/reading/numerology",
  "/reading/compatibility",
  "/reading/angel-numbers",
  "/yildizname",
  "/rune",
  "/chinese",
  "/kabala",
  "/daily",
  "/premium",
  "/add-balance",
  "/payment",
  "/onboarding",
  "/dashboard",
  "/edit-profile",
  "/change-password",
  "/reading-history",
  "/reading-history/:id",
  "/token-history",
];

function AppContent() {
  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/support" element={<Support />} />
          <Route path="/terms" element={<Terms />} />
          {legacyAppRoutes.map((path) => (
            <Route key={path} path={path} element={<Navigate to="/" replace />} />
          ))}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
