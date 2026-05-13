import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../../services/api";
import authService from "../../services/authService";
import { setBalance } from "../../store/tokensSlice";
import { Sparkles, Calendar, MessageCircle } from "lucide-react";

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

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Lütfen adınızı girin");
      return false;
    }
    if (!formData.birth_date) {
      setError("Lütfen doğum tarihinizi girin");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Token kontrolü
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
        // Token balance'ı güncelle
        await refreshTokenBalance();

        // Sonuç sayfasına yönlendir
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="w-full max-w-4xl mx-auto px-4 py-8 space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center mb-8">
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="inline-block mb-4"
        >
          <Sparkles className="w-10 h-10 text-purple-400" />
        </motion.div>
        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-300 via-primary to-purple-500 bg-clip-text text-transparent">
          Kabala Analizi
        </h2>
        <p className="text-gray-400 mt-2">İbrani mistik geleneğinin bilgeliğini keşfet</p>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          variants={itemVariants}
          className="bg-red-500/10 border border-red-500/30 rounded-xl p-4"
        >
          <p className="text-sm text-red-400">{error}</p>
        </motion.div>
      )}

      {/* Personal Information Section */}
      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-br from-purple/5 via-transparent to-secondary/5 border border-purple-500/20 rounded-2xl p-6 md:p-8 backdrop-blur-sm"
      >
        <h3 className="text-lg font-semibold text-gray-200 mb-4">Kişisel Bilgiler</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
              Adınız
            </label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Örn: Ahmet Yılmaz"
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-purple-500/20 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
              disabled={loading}
              autoCapitalize="words"
            />
            <p className="text-xs text-gray-500 mt-2">
              İbrani numeroloji için tam adınız kullanılır.
            </p>
          </div>

          <div>
            <label htmlFor="birth_date" className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <Calendar size={16} /> Doğum Tarihi
            </label>
            <input
              id="birth_date"
              type="date"
              name="birth_date"
              value={formData.birth_date}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-purple-500/20 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
              disabled={loading}
            />
          </div>
        </div>
      </motion.div>

      {/* Token Cost */}
      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-br from-purple/5 via-transparent to-secondary/5 border border-purple-500/20 rounded-2xl p-4 md:p-6 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between">
          <span className="text-gray-300">Kabala Maliyeti:</span>
          <span className="font-semibold text-purple-400">{KABALA_COST} Token</span>
        </div>
        <div className="mt-3 text-sm text-gray-400">
          Mevcut Token:{" "}
          <span className={tokenBalance >= KABALA_COST ? "text-green-400 font-semibold" : "text-red-400 font-semibold"}>
            {tokenBalance}
          </span>
        </div>
      </motion.div>

      {/* Submit Button */}
      <motion.button
        variants={itemVariants}
        type="submit"
        onClick={handleSubmit}
        disabled={loading || tokenBalance < KABALA_COST || !formData.name.trim() || !formData.birth_date}
        whileHover={!loading && tokenBalance >= KABALA_COST ? { scale: 1.02 } : {}}
        whileTap={!loading && tokenBalance >= KABALA_COST ? { scale: 0.98 } : {}}
        className="w-full py-4 rounded-xl font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: loading || tokenBalance < KABALA_COST || !formData.name.trim() || !formData.birth_date
            ? "linear-gradient(135deg, #6b21a8, #7c3aed)"
            : "linear-gradient(135deg, #a855f7, #ec4899)",
          boxShadow: loading || tokenBalance < KABALA_COST || !formData.name.trim() || !formData.birth_date
            ? "none"
            : "0 0 20px rgba(168, 85, 247, 0.5)",
        }}
      >
        <div className="flex items-center justify-center gap-2">
          {loading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles size={20} />
              </motion.div>
              <span>Kabala Analizi Yapılıyor...</span>
            </>
          ) : (
            <>
              <Sparkles size={20} />
              <span>Kabala Analizi Yap</span>
            </>
          )}
        </div>
      </motion.button>

      {/* Info */}
      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-500/10 border border-blue-500/20 rounded-xl p-4 md:p-6 backdrop-blur-sm"
      >
        <div className="flex gap-3">
          <MessageCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
          <p className="text-sm text-blue-300">
            <strong>Bilgi:</strong> Kabala, İbrani mistik geleneğinin köklü bilgeliğidir. İsminizin sayısal değeri ve Sefirot enerjileri ile ruhsal yolunuz analiz edilecektir.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
