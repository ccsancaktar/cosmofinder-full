import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import authService from "../services/authService";
import { loginSuccess } from "../store/authSlice";
import { setBalance } from "../store/tokensSlice";
import Button from "../components/common/Button";
import StarField from "../components/home/StarField";
import { Toast } from "../components/common/Toast";
import { Mail, Lock, Sparkles } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      Toast.warning("Lütfen tüm alanları doldurun");
      return;
    }

    setLoading(true);
    try {
      const response = await authService.login(formData.email, formData.password);
      
      // Backend'den gelen user data'sını handle et
      const userData = response.data.user || response.data;
      const token = response.data.token;
      
      dispatch(loginSuccess(userData));
      
      Toast.success("Başarıyla giriş yapıldı!");
      navigate(userData?.onboarding_completed === false ? "/onboarding" : "/readings");
    } catch (error) {
      Toast.error(error.response?.data?.message || "Giriş başarısız oldu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-white relative overflow-hidden flex items-center justify-center px-4 pt-24 md:pt-32">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <StarField count={60} />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="glass rounded-2xl border border-white/10 p-8 backdrop-blur-xl hover:border-primary/30 transition">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="text-primary" size={28} />
            </div>
            <h1 className="text-4xl font-black gradient-text mb-2 font-decorative">
              COSMO FINDER
            </h1>
            <p className="text-gray-400 text-sm">
              Kaderinizi keşfetmeye başlayın
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Email Adresiniz
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/50" size={18} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ornek@email.com"
                  className="w-full pl-10 pr-4 py-2.5 glass border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Şifreniz
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/50" size={18} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 glass border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition"
                />
              </div>
              <div className="mt-2 text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:text-cyan-400 transition font-medium"
                >
                  Şifremi unuttum
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="w-full mt-8"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Giriş Yapılıyor...
                </span>
              ) : (
                "Giriş Yap"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 text-gray-400">veya</span>
            </div>
          </div>

          {/* Social Login */}
          <Button
            variant="glass"
            className="w-full flex items-center justify-center gap-2"
          >
            <span>🔵</span>
            <span>Google ile Giriş</span>
          </Button>

          {/* Footer */}
          <p className="text-center text-gray-400 text-sm mt-6">
            Hesabınız yok mu?{" "}
            <Link 
              to="/register" 
              className="text-primary hover:text-cyan-400 transition font-semibold"
            >
              Kayıt Ol
            </Link>
          </p>
        </div>

        {/* Test Credentials Info */}
        <div className="mt-6 glass rounded-lg border border-white/10 p-4 text-center text-xs text-gray-400">
          <p>Test Hesabı: <span className="text-primary">aa@aa.com</span> / <span className="text-primary">sancak123</span></p>
        </div>
      </div>
    </div>
  );
}
