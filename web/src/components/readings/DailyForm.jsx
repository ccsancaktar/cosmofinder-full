import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../../services/api";
import authService from "../../services/authService";
import { setBalance } from "../../store/tokensSlice";
import { Sparkles, Zap, MessageCircle } from "lucide-react";

// Zodiac signs with their date ranges
const ZODIAC_SIGNS = [
  { name: "Koç", english: "Aries", dates: "21 Mart - 20 Nisan", symbol: "♈" },
  { name: "Boğa", english: "Taurus", dates: "21 Nisan - 20 Mayıs", symbol: "♉" },
  { name: "İkizler", english: "Gemini", dates: "21 Mayıs - 20 Haziran", symbol: "♊" },
  { name: "Yengeç", english: "Cancer", dates: "21 Haziran - 22 Temmuz", symbol: "♋" },
  { name: "Aslan", english: "Leo", dates: "23 Temmuz - 22 Ağustos", symbol: "♌" },
  { name: "Başak", english: "Virgo", dates: "23 Ağustos - 22 Eylül", symbol: "♍" },
  { name: "Terazi", english: "Libra", dates: "23 Eylül - 22 Ekim", symbol: "♎" },
  { name: "Akrep", english: "Scorpio", dates: "23 Ekim - 21 Kasım", symbol: "♏" },
  { name: "Yay", english: "Sagittarius", dates: "22 Kasım - 21 Aralık", symbol: "♐" },
  { name: "Oğlak", english: "Capricorn", dates: "22 Aralık - 19 Ocak", symbol: "♑" },
  { name: "Kova", english: "Aquarius", dates: "20 Ocak - 18 Şubat", symbol: "♒" },
  { name: "Balık", english: "Pisces", dates: "19 Şubat - 20 Mart", symbol: "♓" },
];

export default function DailyForm() {
  const [selectedZodiac, setSelectedZodiac] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const tokenBalance = useSelector((state) => state.tokens.balance);

  const DAILY_COST = 15;

  const refreshTokenBalance = async () => {
    try {
      const response = await authService.getTokenBalance();
      dispatch(setBalance(response.data.balance || 0));
    } catch (err) {
      console.error("Token balance refresh failed:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Token kontrolü
    if (tokenBalance < DAILY_COST) {
      setError(`Yeterli token yok. Gerekli: ${DAILY_COST}, Sahip olunan: ${tokenBalance}`);
      return;
    }

    if (!selectedZodiac) {
      setError("Lütfen burcunuzu seçin");
      return;
    }

    setLoading(true);

    try {
      const response = await API.post("/daily", {
        zodiac: selectedZodiac,
        language: "tr",
      });

      if (response.data.success) {
        // Token balance'ı güncelle
        await refreshTokenBalance();

        // Sonuç sayfasına yönlendir
        navigate("/reading/daily-zodiac", {
          state: {
            type: "daily",
            title: "Günlük Burç Yorumu",
            zodiacSign: selectedZodiac,
            fortune: response.data.yorum,
            readingId: response.data.reading_id,
          },
        });
      } else {
        setError(response.data.message || "Günlük burç yorumu oluşturulurken hata oluştu");
      }
    } catch (err) {
      console.error("Daily error:", err);
      setError(err.response?.data?.message || "Günlük burç yorumu oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.");
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
          <Zap className="w-10 h-10 text-orange-400" />
        </motion.div>
        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 bg-clip-text text-transparent">
          Günlük Burç Yorumu
        </h2>
        <p className="text-gray-400 mt-2">Günün enerjisini ve gezegen konumlarını keşfet</p>
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

      {/* Zodiac Selection */}
      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-br from-orange/5 via-transparent to-secondary/5 border border-orange-500/20 rounded-2xl p-6 md:p-8 backdrop-blur-sm"
      >
        <h3 className="text-lg font-semibold text-gray-200 mb-4">Burcunuzu Seçin</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {ZODIAC_SIGNS.map((sign, idx) => (
            <motion.button
              key={sign.english}
              type="button"
              onClick={() => setSelectedZodiac(sign.english)}
              disabled={loading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`p-4 rounded-lg border-2 transition-all text-center ${
                selectedZodiac === sign.english
                  ? "border-orange-500 bg-orange-500/20 text-white shadow-lg shadow-orange-500/30"
                  : "border-orange-500/20 bg-white/5 text-gray-400 hover:border-orange-500/50 hover:bg-orange-500/10"
              }`}
            >
              <div className="text-2xl mb-1">{sign.symbol}</div>
              <div className="font-semibold text-sm">{sign.name}</div>
              <div className="text-xs text-gray-500 mt-1">{sign.dates}</div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Token Cost */}
      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-br from-orange/5 via-transparent to-secondary/5 border border-orange-500/20 rounded-2xl p-4 md:p-6 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between">
          <span className="text-gray-300">Günlük Burç Maliyeti:</span>
          <span className="font-semibold text-orange-400">{DAILY_COST} Token</span>
        </div>
        <div className="mt-3 text-sm text-gray-400">
          Mevcut Token:{" "}
          <span className={tokenBalance >= DAILY_COST ? "text-green-400 font-semibold" : "text-red-400 font-semibold"}>
            {tokenBalance}
          </span>
        </div>
      </motion.div>

      {/* Submit Button */}
      <motion.button
        variants={itemVariants}
        type="submit"
        onClick={handleSubmit}
        disabled={loading || tokenBalance < DAILY_COST || !selectedZodiac}
        whileHover={!loading && tokenBalance >= DAILY_COST && selectedZodiac ? { scale: 1.02 } : {}}
        whileTap={!loading && tokenBalance >= DAILY_COST && selectedZodiac ? { scale: 0.98 } : {}}
        className="w-full py-4 rounded-xl font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: loading || tokenBalance < DAILY_COST || !selectedZodiac
            ? "linear-gradient(135deg, #b45309, #f97316)"
            : "linear-gradient(135deg, #f59e0b, #ec4899)",
          boxShadow: loading || tokenBalance < DAILY_COST || !selectedZodiac
            ? "none"
            : "0 0 20px rgba(245, 158, 11, 0.5)",
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
              <span>Günlük Burç Yorumu Alınıyor...</span>
            </>
          ) : (
            <>
              <Sparkles size={20} />
              <span>Günlük Burç Yorumu Al</span>
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
            <strong>Bilgi:</strong> Günlük burç yorumları, günün gezegen energileri ve sizin burçunuzun özelliklerine göre hazırlanır. Her gün yeni enerjiler taşır!
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
