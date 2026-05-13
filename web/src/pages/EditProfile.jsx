import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { motion } from "framer-motion";
import { User, Phone, MapPin, AlertCircle, Check, Loader } from "lucide-react";
import Button from "../components/common/Button";
import StarField from "../components/home/StarField";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import authService from "../services/authService";

function EditProfileContent() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    birth_date: "",
    birth_time: "",
    birth_place: "",
    theme: "dark",
    language: "tr",
    privacy_level: "public",
    notifications_enabled: true,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        phone: user.phone || "",
        birth_date: user.birth_date || "",
        birth_time: user.birth_time || "",
        birth_place: user.birth_place || "",
        theme: user.theme || "dark",
        language: user.language || "tr",
        privacy_level: user.privacy_level || "public",
        notifications_enabled: user.notifications_enabled !== false,
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const response = await authService.updateProfile(formData);
      if (response.status === 200) {
        setSuccess("Profil başarıyla güncellendi!");
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } else {
        setError(response.data.error || "Profil güncellenirken hata oluştu");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Profil güncellenirken bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen text-white relative pt-24 md:pt-32 overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <StarField count={60} />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold gradient-text mb-2">Profilini Düzenle</h1>
          <p className="text-gray-400">Kişisel bilgilerini güncelleyin</p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass rounded-xl border border-white/10 p-8"
        >
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex gap-3">
              <AlertCircle size={20} className="text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex gap-3">
              <Check size={20} className="text-green-400 flex-shrink-0" />
              <p className="text-sm text-green-400">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-300 mb-2">
                  Ad
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="Adınız"
                  className="w-full px-4 py-3 rounded-lg bg-light-bg border border-gray-600/30 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-300 mb-2">
                  Soyadı
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Soyadınız"
                  className="w-full px-4 py-3 rounded-lg bg-light-bg border border-gray-600/30 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                E-posta (Değiştirilemez)
              </label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600/30 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-2">E-posta güvenlik nedeniyle değiştirilemez</p>
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                Telefon Numarası
              </label>
              <div className="relative">
                <Phone size={18} className="absolute left-3 top-3.5 text-primary" />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+90 5xx xxx xxxx"
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-light-bg border border-gray-600/30 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            {/* Birth Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="birth_date" className="block text-sm font-medium text-gray-300 mb-2">
                  Doğum Tarihi
                </label>
                <input
                  type="date"
                  id="birth_date"
                  name="birth_date"
                  value={formData.birth_date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-light-bg border border-gray-600/30 text-white focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label htmlFor="birth_time" className="block text-sm font-medium text-gray-300 mb-2">
                  Doğum Saati
                </label>
                <input
                  type="time"
                  id="birth_time"
                  name="birth_time"
                  value={formData.birth_time}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-light-bg border border-gray-600/30 text-white focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            {/* Birth Place */}
            <div>
              <label htmlFor="birth_place" className="block text-sm font-medium text-gray-300 mb-2">
                Doğum Yeri
              </label>
              <div className="relative">
                <MapPin size={18} className="absolute left-3 top-3.5 text-primary" />
                <input
                  type="text"
                  id="birth_place"
                  name="birth_place"
                  value={formData.birth_place}
                  onChange={handleChange}
                  placeholder="Şehir, Ülke"
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-light-bg border border-gray-600/30 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            {/* Settings Section */}
            <div className="border-t border-gray-600/30 pt-6">
              <h3 className="text-lg font-semibold text-white mb-4">Ayarlar</h3>
              
              <div className="space-y-4">
                {/* Theme */}
                <div>
                  <label htmlFor="theme" className="block text-sm font-medium text-gray-300 mb-2">
                    Tema
                  </label>
                  <select
                    id="theme"
                    name="theme"
                    value={formData.theme}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-light-bg border border-gray-600/30 text-white focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="dark">Koyu Tema</option>
                    <option value="light">Açık Tema</option>
                  </select>
                </div>

                {/* Language */}
                <div>
                  <label htmlFor="language" className="block text-sm font-medium text-gray-300 mb-2">
                    Dil
                  </label>
                  <select
                    id="language"
                    name="language"
                    value={formData.language}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-light-bg border border-gray-600/30 text-white focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="tr">Türkçe</option>
                    <option value="en">English</option>
                  </select>
                </div>

                {/* Privacy Level */}
                <div>
                  <label htmlFor="privacy_level" className="block text-sm font-medium text-gray-300 mb-2">
                    Gizlilik Seviyesi
                  </label>
                  <select
                    id="privacy_level"
                    name="privacy_level"
                    value={formData.privacy_level}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-light-bg border border-gray-600/30 text-white focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="public">Açık (Herkese Görünür)</option>
                    <option value="private">Özel (Kimseye Görünmez)</option>
                    <option value="friends">Arkadaşlara (Sadece Arkadaşlar)</option>
                  </select>
                </div>

                {/* Notifications */}
                <div className="flex items-center gap-3 p-4 glass rounded-lg border border-white/10">
                  <input
                    type="checkbox"
                    id="notifications_enabled"
                    name="notifications_enabled"
                    checked={formData.notifications_enabled}
                    onChange={handleChange}
                    className="w-4 h-4 cursor-pointer accent-primary"
                  />
                  <label htmlFor="notifications_enabled" className="flex-1 text-sm font-medium text-gray-300 cursor-pointer">
                    Bildirimleri Etkinleştir
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6">
              <Button
                type="submit"
                disabled={saving}
                className="flex-1 gap-2"
              >
                {saving ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    Değişiklikleri Kaydet
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard")}
                className="flex-1"
              >
                İptal
              </Button>
            </div>
          </form>
        </motion.div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 glass rounded-xl border border-secondary/20 p-6"
        >
          <h3 className="text-lg font-semibold text-secondary mb-4">💡 Bilgi</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex gap-2">
              <span className="text-secondary">▸</span>
              <span><strong>Tüm alanlar isteğe bağlıdır</strong> - Sadece değiştirmek istediğiniz alanları doldurun</span>
            </li>
            <li className="flex gap-2">
              <span className="text-secondary">▸</span>
              <span><strong>E-posta değiştirilemez</strong> - Güvenlik nedeniyle e-posta sabit tutulur</span>
            </li>
            <li className="flex gap-2">
              <span className="text-secondary">▸</span>
              <span><strong>Doğum bilgileri</strong> - Fal hesaplamalarında kullanılır</span>
            </li>
            <li className="flex gap-2">
              <span className="text-secondary">▸</span>
              <span><strong>Gizlilik seviyesi</strong> - Profilin kaç kişi tarafından görülüp görülemeyeceğini belirler</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}

export default function EditProfile() {
  return (
    <ProtectedRoute>
      <EditProfileContent />
    </ProtectedRoute>
  );
}
