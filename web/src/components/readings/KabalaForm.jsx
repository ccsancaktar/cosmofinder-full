import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpenText, Calendar, Crown, Sparkles } from "lucide-react";
import API from "../../services/api";
import authService from "../../services/authService";
import { setBalance } from "../../store/tokensSlice";
import { useAuth } from "../../hooks/useAuth";

export default function KabalaForm() {
  const [formData, setFormData] = useState({
    name: "",
    birth_date: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const tokenBalance = useSelector((state) => state.tokens.balance);
  const { user } = useAuth();
  const profileName = user?.name || [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim();
  const profileBirthDate = user?.birth_date || "";

  const KABALA_COST = 45;

  const refreshTokenBalance = async () => {
    try {
      const response = await authService.getTokenBalance();
      dispatch(setBalance(response.data.balance || 0));
    } catch (err) {
      console.error("Token balance refresh failed:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const fillFromProfile = () => {
    setFormData((prev) => ({
      ...prev,
      name: profileName || prev.name,
      birth_date: profileBirthDate || prev.birth_date,
    }));
    setError("");
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Lütfen adını gir.");
      return false;
    }
    if (!formData.birth_date) {
      setError("Lütfen doğum tarihini seç.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (tokenBalance < KABALA_COST) {
      setError(`Yeterli token yok. Gerekli: ${KABALA_COST}, Sahip olunan: ${tokenBalance}`);
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await API.post("/kabala", {
        isim: formData.name.trim(),
        dogumTarihi: formData.birth_date,
        language: "tr",
      });

      if (response.data.success) {
        await refreshTokenBalance();
        navigate("/reading/kabala", {
          state: {
            type: "kabala",
            title: "Kabala Analizi Sonucu",
            kabalaData: {
              hebrew_name: response.data.hebrew_name,
              name_value: response.data.name_value,
              reduced_value: response.data.reduced_value,
              selected_sefirot: response.data.selected_sefirot,
              original_name: formData.name.trim(),
            },
            fortune: response.data.yorum,
            readingId: response.data.reading_id,
          },
        });
      } else {
        setError(response.data.message || "Kabala analizi oluşturulurken hata oluştu");
      }
    } catch (err) {
      console.error("Kabala error:", err);
      setError(err.response?.data?.message || "Kabala analizi oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="text-center mb-10">
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="inline-flex h-16 w-16 items-center justify-center rounded-[1.5rem] border border-violet-400/20 bg-violet-400/10 mb-5"
        >
          <Sparkles className="w-8 h-8 text-violet-300" />
        </motion.div>
        <h2 className="text-4xl md:text-5xl font-black font-decorative bg-gradient-to-r from-violet-300 via-primary to-fuchsia-400 bg-clip-text text-transparent mb-4">
          Kabala Analizi
        </h2>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto leading-8">
          İsminin titreşimini, indirgenmiş sayını ve mistik ağın açtığı ruhsal kapıları daha temiz bir ritüelle okuyalım.
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4">
          <p className="text-sm text-red-200">{error}</p>
        </div>
      ) : null}

      <div className="glass rounded-[2rem] border border-white/10 p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl border border-violet-300/20 bg-violet-300/10 flex items-center justify-center">
              <BookOpenText className="w-5 h-5 text-violet-300" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-violet-300/80 mb-1">Ruhsal Kimlik</p>
              <h3 className="text-2xl font-bold text-white">İsim ve doğum izi</h3>
            </div>
          </div>

          <button
            type="button"
            onClick={fillFromProfile}
            className="inline-flex items-center gap-2 rounded-full border border-violet-300/25 bg-violet-300/10 px-4 py-2 text-sm font-medium text-violet-200 hover:bg-violet-300/15 transition"
          >
            <Crown size={14} />
            Profil bilgilerimi kullan
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
              Tam adın
            </label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Örn: Ahmet Yılmaz"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-300"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-2">
              İbrani numerolojisi için tam isim daha güçlü bir analiz üretir.
            </p>
          </div>

          <div>
            <label htmlFor="birth_date" className="block text-sm font-medium text-gray-300 mb-2">
              Doğum tarihi
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-300/80 w-4 h-4" />
              <input
                id="birth_date"
                type="date"
                name="birth_date"
                value={formData.birth_date}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-300"
                disabled={loading}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="glass rounded-2xl border border-white/10 p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-gray-400 mb-3">Maliyet</p>
          <p className="text-2xl font-bold text-violet-300">{KABALA_COST} Token</p>
        </div>
        <div className="glass rounded-2xl border border-white/10 p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-gray-400 mb-3">Mevcut Bakiye</p>
          <p className={`text-2xl font-bold ${tokenBalance >= KABALA_COST ? "text-green-400" : "text-red-400"}`}>{tokenBalance}</p>
        </div>
        <div className="glass rounded-2xl border border-white/10 p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-gray-400 mb-3">Yorum Türü</p>
          <p className="text-lg font-bold text-violet-200">İsim • Sayı • Sefirot</p>
        </div>
      </div>

      <div className="glass rounded-[2rem] border border-white/10 p-5 md:p-6">
        <p className="text-sm text-gray-300 leading-7">
          Kabala yorumunda isminin taşıdığı titreşim, indirgenmiş sayı ve seçilen sefirotların ruhsal etkisi birlikte ele alınır.
          Bu yüzden isim ve doğum tarihi alanları burada yorumun omurgasını oluşturur.
        </p>
      </div>

      <motion.button
        type="button"
        onClick={handleSubmit}
        disabled={loading || tokenBalance < KABALA_COST || !formData.name.trim() || !formData.birth_date}
        whileHover={!loading && tokenBalance >= KABALA_COST && formData.name.trim() && formData.birth_date ? { scale: 1.01 } : {}}
        whileTap={!loading && tokenBalance >= KABALA_COST && formData.name.trim() && formData.birth_date ? { scale: 0.99 } : {}}
        className="w-full rounded-[1.75rem] py-5 text-lg font-bold text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: "linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)",
          boxShadow: loading || tokenBalance < KABALA_COST || !formData.name.trim() || !formData.birth_date
            ? "none"
            : "0 0 24px rgba(168, 85, 247, 0.28)",
        }}
      >
        {loading ? "Kabala Analizi Hazırlanıyor..." : "Kabala Analizini Başlat"}
      </motion.button>
    </motion.div>
  );
}
