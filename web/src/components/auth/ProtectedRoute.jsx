import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Loading from "../common/Loading";

export default function ProtectedRoute({ children, allowIncompleteOnboarding = false }) {
  const { loading, user } = useAuth();
  const token = localStorage.getItem("jwt_token");

  if (loading) return <Loading />;

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!allowIncompleteOnboarding && user && user.onboarding_completed === false) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}
