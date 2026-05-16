import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import authService from "../services/authService";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await authService.login(username, password);
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Admin login error:", err);
      setError(err.response?.data?.error || "Giriş yapılamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.form
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.05] p-8"
      >
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-[1.5rem] border border-primary/25 bg-primary/10 mb-6">
          <ShieldCheck className="w-8 h-8 text-primary" />
        </div>
        <p className="text-xs uppercase tracking-[0.32em] text-primary/75 mb-3">CosmoFinder Admin</p>
        <h1 className="text-4xl font-black gradient-text mb-3">Operasyon Girişi</h1>
        <p className="text-gray-400 leading-7 mb-6">Bu arayüz uygulamanın monitoring ve operasyon takibi için ayrılmıştır.</p>

        <div className="space-y-4">
          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Admin kullanıcı adı"
            className="w-full rounded-2xl border border-white/10 bg-[#100d1d] px-5 py-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary"
          />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Şifre"
            className="w-full rounded-2xl border border-white/10 bg-[#100d1d] px-5 py-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary"
          />
        </div>

        {error ? <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div> : null}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-[1.6rem] py-4 text-lg font-bold text-white disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, #f5b933 0%, #8b5cf6 100%)" }}
        >
          {loading ? "Giriş yapılıyor..." : "Admin Paneline Gir"}
        </button>
      </motion.form>
    </div>
  );
}
