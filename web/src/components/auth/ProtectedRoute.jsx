import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Loading from "../common/Loading";

export default function ProtectedRoute({ children }) {
  const { loading } = useAuth();
  const token = localStorage.getItem("jwt_token");

  if (loading) return <Loading />;

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
