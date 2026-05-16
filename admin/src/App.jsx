import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import authService from "./services/authService";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

function Protected({ children }) {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      if (!authService.isAuthenticated()) {
        setAllowed(false);
        setLoading(false);
        return;
      }

      try {
        const response = await authService.getProfile();
        const user = response.data?.admin || response.data;
        setAllowed(Boolean(user?.is_admin));
        if (!user?.is_admin) {
          authService.logout();
        }
      } catch {
        authService.logout();
        setAllowed(false);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-white">Yükleniyor...</div>;
  }

  if (!allowed) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AdminShell() {
  const navigate = useNavigate();
  return <Dashboard onLogout={() => navigate("/login", { replace: true })} />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <Protected>
            <AdminShell />
          </Protected>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
