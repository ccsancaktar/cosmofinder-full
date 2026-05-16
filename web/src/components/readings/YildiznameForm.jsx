import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../../services/api";
import authService from "../../services/authService";
import { setBalance } from "../../store/tokensSlice";
import { Sparkles, Calendar, Clock, MapPin, MessageCircle } from "lucide-react";
import ReadingModePanel from "./ReadingModePanel";
import { useAuth } from "../../hooks/useAuth";

export default function YildiznameForm() {
  const [formData, setFormData] = useState({
    name: "",
    mother_name: "",
    birth_date: "",
    birth_time: "",
    birth_place: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const tokenBalance = useSelector((state) => state.tokens.balance);
  const { user } = useAuth();
  const [readingMode, setReadingMode] = useState("self");
  const profileName = user?.name || [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim();
  const profileBirthDate = user?.birth_date || "";
  const profileBirthTime = user?.birth_time || "";
  const profileBirthPlace = user?.birth_place || "";
  const canUseProfile = Boolean(profileName && profileBirthDate && profileBirthTime && profileBirthPlace);
  const language = user?.language || "tr";

  const YILDIZNAME_COST = 50;

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
    const effectiveName = readingMode === "self" ? profileName : formData.name;
    const effectiveBirthDate = readingMode === "self" ? profileBirthDate : formData.birth_date;
    const effectiveBirthTime = readingMode === "self" ? profileBirthTime : formData.birth_time;
    const effectiveBirthPlace = readingMode === "self" ? profileBirthPlace : formData.birth_place;

    if (!effectiveName.trim()) {
      setError("Lütfen adınızı girin");
      return false;
    }
    if (!formData.mother_name.trim()) {
      setError("Lütfen annenizin adını girin");
      return false;
    }
    if (!effectiveBirthDate) {
      setError("Lütfen doğum tarihinizi girin");
      return false;
    }
    if (!effectiveBirthTime) {
      setError("Lütfen doğum saatinizi girin");
      return false;
    }
    if (!effectiveBirthPlace.trim()) {
      setError("Lütfen doğum yerinizi girin");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Token kontrolü
    if (tokenBalance < YILDIZNAME_COST) {
      setError(`Yeterli token yok. Gerekli: ${YILDIZNAME_COST}, Sahip olunan: ${tokenBalance}`);
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const effectiveName = readingMode === "self" ? profileName : formData.name;
      const effectiveBirthDate = readingMode === "self" ? profileBirthDate : formData.birth_date;
      const effectiveBirthTime = readingMode === "self" ? profileBirthTime : formData.birth_time;
      const effectiveBirthPlace = readingMode === "self" ? profileBirthPlace : formData.birth_place;

      const response = await API.post("/yildizname", {
        isim: effectiveName,
        anneAdi: formData.mother_name,
        dogumTarihi: effectiveBirthDate,
        dogumSaati: effectiveBirthTime,
        dogumYeri: effectiveBirthPlace,
        language,
        reading_for: readingMode,
      });

      if (response.data.success) {
        // Token balance'ı güncelle
        await refreshTokenBalance();

        // Sonuç sayfasına yönlendir
        navigate("/reading/yildizname", {
          state: {
            type: "yildizname",
            title: "Yıldızname Yorumu",
            data: {
              ...formData,
              name: effectiveName,
              birth_date: effectiveBirthDate,
              birth_time: effectiveBirthTime,
              birth_place: effectiveBirthPlace,
            },
            fortune: response.data.yorum,
            readingId: response.data.reading_id,
          },
        });
      } else {
        setError(response.data.message || "Yıldızname oluşturulurken hata oluştu");
      }
    } catch (err) {
      console.error("Yildizname error:", err);
      setError(err.response?.data?.message || "Yıldızname oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.");
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
          <Sparkles className="w-10 h-10 text-primary" />
        </motion.div>
        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-300 via-primary to-yellow-500 bg-clip-text text-transparent">
          Yıldızname Analizi
        </h2>
        <p className="text-gray-400 mt-2">Yıldızların rehberliğinde kaderini keşfet</p>
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

      <motion.div variants={itemVariants}>
        <ReadingModePanel
          mode={readingMode}
          onChangeMode={setReadingMode}
          canUseProfile={canUseProfile}
          summaryLines={[
            profileName ? `İsim: ${profileName}` : null,
            profileBirthDate ? `Doğum tarihi: ${profileBirthDate}` : null,
            profileBirthTime ? `Doğum saati: ${profileBirthTime}` : null,
            profileBirthPlace ? `Doğum yeri: ${profileBirthPlace}` : null,
          ].filter(Boolean)}
        />
      </motion.div>

      {/* Personal Information Section */}
      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 border border-primary/20 rounded-2xl p-6 md:p-8 backdrop-blur-sm"
      >
        <h3 className="text-lg font-semibold text-gray-200 mb-4">Kişisel Bilgiler</h3>
        <div className="space-y-4">
          {readingMode === "self" && !canUseProfile ? (
            <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
              Profilinde eksik bilgi var. `Kendim için` modu tam çalışsın diye ad, doğum tarihi, doğum saati ve doğum yerini profilinde tamamlamalısın.
            </div>
          ) : null}

          {readingMode === "other" ? (
            <>
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
              placeholder="Örn: Ahmet"
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-primary/20 text-white placeholder-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
              disabled={loading}
            />
          </div>
            </>
          ) : (
            <div className="rounded-2xl border border-primary/20 bg-primary/10 p-5 space-y-2">
              <p className="text-sm font-semibold text-white">Profilindeki bilgilerle yıldızname hazırlanacak</p>
              <p className="text-sm text-gray-300">{profileName || "İsim eksik"}</p>
              <p className="text-sm text-gray-400">{profileBirthDate || "Doğum tarihi eksik"}</p>
              <p className="text-sm text-gray-400">{profileBirthTime || "Doğum saati eksik"}</p>
              <p className="text-sm text-gray-400">{profileBirthPlace || "Doğum yeri eksik"}</p>
            </div>
          )}

          <div>
            <label htmlFor="mother_name" className="block text-sm font-medium text-gray-300 mb-2">
              Annenizin Adı
            </label>
            <input
              id="mother_name"
              type="text"
              name="mother_name"
              value={formData.mother_name}
              onChange={handleChange}
              placeholder="Örn: Ayşe"
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-primary/20 text-white placeholder-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
              disabled={loading}
            />
          </div>
        </div>
      </motion.div>

      {/* Birth Information Section */}
      <motion.div 
        variants={itemVariants} 
        className="bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 border border-primary/20 rounded-2xl p-6 md:p-8 backdrop-blur-sm"
      >
        <h3 className="text-lg font-semibold text-gray-200 mb-4">Doğum Bilgileri</h3>
        {readingMode === "other" ? (
        <div className="space-y-4">
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
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-primary/20 text-white focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="birth_time" className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <Clock size={16} /> Doğum Saati (SS:DD)
            </label>
            <input
              id="birth_time"
              type="time"
              name="birth_time"
              value={formData.birth_time}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-primary/20 text-white focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="birth_place" className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <MapPin size={16} /> Doğum Yeri
            </label>
            <input
              id="birth_place"
              type="text"
              name="birth_place"
              value={formData.birth_place}
              onChange={handleChange}
              placeholder="Örn: İstanbul"
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-primary/20 text-white placeholder-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
              disabled={loading}
            />
          </div>
        </div>
        ) : null}
      </motion.div>

      {/* Token Cost */}
      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 border border-primary/20 rounded-2xl p-4 md:p-6 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between">
          <span className="text-gray-300">Yıldızname Maliyeti:</span>
          <span className="font-semibold text-primary">{YILDIZNAME_COST} Token</span>
        </div>
        <div className="mt-3 text-sm text-gray-400">
          Mevcut Token:{" "}
          <span className={tokenBalance >= YILDIZNAME_COST ? "text-green-400 font-semibold" : "text-red-400 font-semibold"}>
            {tokenBalance}
          </span>
        </div>
      </motion.div>

      {/* Submit Button */}
      <motion.button
        variants={itemVariants}
        type="submit"
        onClick={handleSubmit}
        disabled={loading || tokenBalance < YILDIZNAME_COST || !formData.name.trim() || !formData.mother_name.trim() || !formData.birth_date || !formData.birth_time || !formData.birth_place.trim()}
        whileHover={!loading && tokenBalance >= YILDIZNAME_COST ? { scale: 1.02 } : {}}
        whileTap={!loading && tokenBalance >= YILDIZNAME_COST ? { scale: 0.98 } : {}}
        className="w-full py-4 rounded-xl font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: loading || tokenBalance < YILDIZNAME_COST || !formData.name.trim() || !formData.mother_name.trim() || !formData.birth_date || !formData.birth_time || !formData.birth_place.trim()
            ? "linear-gradient(135deg, #1e40af, #3b82f6)"
            : "linear-gradient(135deg, #fbbf24, #f97316)",
          boxShadow: loading || tokenBalance < YILDIZNAME_COST || !formData.name.trim() || !formData.mother_name.trim() || !formData.birth_date || !formData.birth_time || !formData.birth_place.trim()
            ? "none"
            : "0 0 20px rgba(251, 191, 36, 0.5)",
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
              <span>Yıldızname Analiz Ediliyor...</span>
            </>
          ) : (
            <>
              <Sparkles size={20} />
              <span>Yıldızname Analiz Et</span>
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
            <strong>Bilgi:</strong> Doğum saatiniz ne kadar doğru olursa, Yıldızname analizi o kadar detaylı ve doğru olacaktır.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
