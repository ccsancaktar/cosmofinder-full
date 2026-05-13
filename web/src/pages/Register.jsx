import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import authService from "../services/authService";
import { loginSuccess } from "../store/authSlice";
import Button from "../components/common/Button";
import StarField from "../components/home/StarField";
import { Toast } from "../components/common/Toast";
import { User, Mail, Lock } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.first_name || !formData.last_name || !formData.email || !formData.password) {
      Toast.warning("Lütfen tüm alanları doldurun");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Toast.error("Şifreler eşleşmiyor");
      return;
    }

    if (formData.password.length < 6) {
      Toast.error("Şifre en az 6 karakter olmalıdır");
      return;
    }

    setLoading(true);
    try {
      const response = await authService.register({
        username: formData.username,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
      });

      // Backend'den gelen user data'sını handle et ve token set et
      const userData = response.data.user || response.data;
      const token = response.data.token;
      
      if (token) {
        localStorage.setItem('jwt_token', token);
      }
      
      dispatch(loginSuccess(userData));
      Toast.success("Başarıyla kayıt oldunuz!");
      navigate("/dashboard");
    } catch (error) {
      Toast.error(error.response?.data?.message || "Kayıt başarısız oldu");
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
        <div className="glass rounded-2xl border border-white/10 p-8 backdrop-blur-xl hover:border-primary/30 transition">
          <h1 className="text-4xl font-black text-primary text-center mb-2 font-decorative">
            COSMO FINDER
          </h1>
          <p className="text-gray-400 text-center mb-8">
            Yeni hesap oluşturun
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Kullanıcı Adı
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/50" size={18} />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Kullanıcı adınız"
                  className="w-full pl-10 pr-4 py-2.5 glass border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Adı
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/50" size={18} />
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="Adınız"
                  className="w-full pl-10 pr-4 py-2.5 glass border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Soyadı
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/50" size={18} />
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Soyadınız"
                  className="w-full pl-10 pr-4 py-2.5 glass border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Email
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

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Şifre
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
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Şifre Tekrar
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/50" size={18} />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 glass border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? "Kayıt Yapılıyor..." : "Kayıt Ol"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-dark-bg">
            <Button
              variant="secondary"
              className="w-full flex items-center justify-center gap-2"
            >
              <span>🔵</span>
              Google ile Kayıt Ol
            </Button>
          </div>

          <p className="text-center text-gray-400 mt-6">
            Zaten hesabın var mı?{" "}
            <Link to="/login" className="text-primary hover:underline font-semibold">
              Giriş Yap
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
