import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, MessageCircle, Sparkles } from "lucide-react";
import API from "../../services/api";
import authService from "../../services/authService";
import { setBalance } from "../../store/tokensSlice";
import ReadingModePanel from "./ReadingModePanel";
import { useAuth } from "../../hooks/useAuth";

export default function ChineseForm() {
  const [formData, setFormData] = useState({
    birth_date: "",
    birth_time: "",
    question: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const tokenBalance = useSelector((state) => state.tokens.balance);
  const { user } = useAuth();
  const [readingMode, setReadingMode] = useState("self");
  const profileBirthDate = user?.birth_date || "";
  const profileBirthTime = user?.birth_time || "";
  const canUseProfile = Boolean(profileBirthDate && profileBirthTime);
  const language = user?.language || "tr";

  const CHINESE_COST = 40;

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
    const effectiveBirthDate = readingMode === "self" ? profileBirthDate : formData.birth_date;
    const effectiveBirthTime = readingMode === "self" ? profileBirthTime : formData.birth_time;
    if (!effectiveBirthDate) {
      setError("Lütfen doğum tarihinizi girin");
      return false;
    }
    if (!effectiveBirthTime) {
      setError("Lütfen doğum saatinizi girin");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Token kontrolü
    if (tokenBalance < CHINESE_COST) {
      setError(`Yeterli token yok. Gerekli: ${CHINESE_COST}, Sahip olunan: ${tokenBalance}`);
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const effectiveBirthDate = readingMode === "self" ? profileBirthDate : formData.birth_date;
      const effectiveBirthTime = readingMode === "self" ? profileBirthTime : formData.birth_time;
      const response = await API.post("/chinese", {
        dogumTarihi: effectiveBirthDate,
        dogumSaati: effectiveBirthTime,
        soru: formData.question || "Ba Zi analizi yapınız",
        language,
        reading_for: readingMode,
      });

      if (response.data.success) {
        // Token balance'ı güncelle
        await refreshTokenBalance();

        // Sonuç sayfasına yönlendir
        navigate("/reading/chinese", {
          state: {
            type: "chinese",
            title: "Ba Zi Analizi Sonucu",
            question: formData.question || "Ba Zi Analizi",
            baziData: response.data.ba_zi,
            fortune: response.data.yorum,
            readingId: response.data.reading_id,
          },
        });
      } else {
        setError(response.data.message || "Ba Zi analizi oluşturulurken hata oluştu");
      }
    } catch (err) {
      console.error("Chinese error:", err);
      setError(err.response?.data?.message || "Ba Zi analizi oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.");
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
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="w-full max-w-4xl mx-auto px-4 py-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center mb-12">
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="inline-block mb-4"
        >
          <Sparkles className="w-12 h-12 text-primary" />
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-gradient-to-r from-yellow-300 via-primary to-yellow-500 bg-clip-text mb-4">
          Ba Zi Analizi
        </h1>
              <p className="text-gray-300 text-lg max-w-xl mx-auto">
                Doğum tarih ve saatinizi girin, kozmik enerjilerinizi keşfedin
              </p>
      </motion.div>

      <motion.div variants={itemVariants}>
        <ReadingModePanel
          mode={readingMode}
          onChangeMode={setReadingMode}
          canUseProfile={canUseProfile}
          summaryLines={[
            profileBirthDate ? `Doğum tarihi: ${profileBirthDate}` : null,
            profileBirthTime ? `Doğum saati: ${profileBirthTime}` : null,
          ].filter(Boolean)}
          summaryDescription="Profilindeki doğum tarihi ve saat bu analiz için doğrudan kullanılacak."
        />
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Error Message */}
        {error && (
          <motion.div 
            variants={itemVariants}
            className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex gap-3 items-start"
          >
            <div className="text-red-400 mt-0.5">⚠</div>
            <p className="text-sm text-red-300">{error}</p>
          </motion.div>
        )}

        {/* Birth Information Section */}
        <motion.div 
          variants={itemVariants} 
          className="bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 border border-primary/20 rounded-2xl p-6 md:p-8 backdrop-blur-sm"
        >
          <h2 className="text-xl md:text-2xl font-bold text-primary mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Doğum Bilgileri
          </h2>
          {readingMode === "self" && !canUseProfile ? (
            <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100 mb-4">
              Profilinde doğum tarihi veya saat eksik. `Kendim için` analiz almak istersen önce profilini tamamlamalısın.
            </div>
          ) : null}

          {readingMode === "other" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Birth Date */}
            <motion.div variants={itemVariants} className="space-y-2">
              <label htmlFor="birth_date" className="text-gray-300 flex items-center gap-2 text-sm font-medium">
                <Calendar className="w-4 h-4 text-primary" />
                Doğum Tarihi
              </label>
              <input
                id="birth_date"
                type="date"
                name="birth_date"
                value={formData.birth_date}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-primary/20 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 disabled:opacity-50"
              />
            </motion.div>

            {/* Birth Time */}
            <motion.div variants={itemVariants} className="space-y-2">
              <label htmlFor="birth_time" className="text-gray-300 flex items-center gap-2 text-sm font-medium">
                <Clock className="w-4 h-4 text-primary" />
                Doğum Saati
              </label>
              <input
                id="birth_time"
                type="time"
                name="birth_time"
                value={formData.birth_time}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-primary/20 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 disabled:opacity-50"
              />
            </motion.div>
          </div>
          ) : (
            <div className="rounded-2xl border border-primary/20 bg-primary/10 p-5 space-y-2">
              <p className="text-sm font-semibold text-white">Profilindeki doğum bilgileri kullanılacak</p>
              <p className="text-sm text-gray-300">{profileBirthDate || "Doğum tarihi eksik"}</p>
              <p className="text-sm text-gray-400">{profileBirthTime || "Doğum saati eksik"}</p>
            </div>
          )}
        </motion.div>

        {/* Question Section */}
        <motion.div 
          variants={itemVariants} 
          className="bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 border border-primary/20 rounded-2xl p-6 md:p-8 backdrop-blur-sm"
        >
          <h2 className="text-xl md:text-2xl font-bold text-primary mb-6 flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Sorunuz (İsteğe Bağlı)
          </h2>
          
          <div className="space-y-2">
            <label htmlFor="question" className="text-gray-300 text-sm font-medium">
              Ba Zi analizi hakkında merak ettiğiniz soru
            </label>
            <textarea
              id="question"
              name="question"
              value={formData.question}
              onChange={handleChange}
              placeholder="Ba Zi analizi ile ilgili sorunuz varsa yazabilirsiniz..."
              rows={4}
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-primary/20 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 resize-none disabled:opacity-50"
            />
          </div>
        </motion.div>

        {/* Token Cost Info */}
        <motion.div 
          variants={itemVariants}
          className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30 rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300">Ba Zi Maliyeti:</span>
            <span className="font-bold text-primary text-lg">{CHINESE_COST} Token</span>
          </div>
          <div className="text-sm text-gray-400">
            Mevcut Token: <span className={`font-bold ${tokenBalance >= CHINESE_COST ? "text-green-400" : "text-red-400"}`}>
              {tokenBalance}
            </span>
          </div>
        </motion.div>

        {/* Submit Button */}
        <motion.div variants={itemVariants} className="flex justify-center">
          <motion.button
            type="submit"
            disabled={loading || tokenBalance < CHINESE_COST || !formData.birth_date || !formData.birth_time}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative px-12 py-6 text-lg font-bold bg-gradient-to-r from-yellow-400 via-primary to-yellow-300 text-white rounded-xl hover:shadow-2xl hover:shadow-primary/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-5 h-5" />
                  </motion.div>
                  Ba Zi Analizi Yapılıyor...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Ba Zi Analizi Yap
                </>
              )}
            </span>
          </motion.button>
        </motion.div>
      </form>
    </motion.div>
  );
}
