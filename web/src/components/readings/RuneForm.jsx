import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageCircle, Sparkles } from "lucide-react";
import API from "../../services/api";
import authService from "../../services/authService";
import { setBalance } from "../../store/tokensSlice";

export default function RuneForm() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const tokenBalance = useSelector((state) => state.tokens.balance);

  const RUNE_COST = 30;

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
    if (tokenBalance < RUNE_COST) {
      setError(`Yeterli token yok. Gerekli: ${RUNE_COST}, Sahip olunan: ${tokenBalance}`);
      return;
    }

    if (!question.trim()) {
      setError("Lütfen bir soru girin");
      return;
    }

    setLoading(true);

    try {
      const response = await API.post("/rune", {
        soru: question,
        language: "tr",
      });

      if (response.data.success) {
        // Token balance'ı güncelle
        await refreshTokenBalance();

        // Sonuç sayfasına yönlendir ve veriyi gönder
        navigate("/reading/rune", {
          state: {
            type: "rune",
            title: "Rune Çekimi Sonucu",
            question: question,
            runes: response.data.runes || [],
            fortune: response.data.yorum,
            readingId: response.data.reading_id,
          },
        });
      } else {
        setError(response.data.message || "Rune çekimi oluşturulurken hata oluştu");
      }
    } catch (err) {
      console.error("Rune error:", err);
      setError(err.response?.data?.message || "Rune çekimi oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.");
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
          Rün Falı
        </h1>
        <p className="text-gray-300 text-lg max-w-xl mx-auto">
          Sorunuzu sorun, Viking runeleri sizin için konuşsun
        </p>
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

        {/* Question Section */}
        <motion.div 
          variants={itemVariants} 
          className="bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 border border-primary/20 rounded-2xl p-6 md:p-8 backdrop-blur-sm"
        >
          <h2 className="text-xl md:text-2xl font-bold text-primary mb-6 flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Sorunuz
          </h2>
          
          <div className="space-y-2">
            <label htmlFor="question" className="text-gray-300 text-sm font-medium">
              Rün çekimi ile merak ettiğiniz soruyu detaylı girin
            </label>
            <textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Hayatınızla ilgili merak ettiğiniz soruyu yazın..."
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
            <span className="text-gray-300">Rün Maliyeti:</span>
            <span className="font-bold text-primary text-lg">{RUNE_COST} Token</span>
          </div>
          <div className="text-sm text-gray-400">
            Mevcut Token: <span className={`font-bold ${tokenBalance >= RUNE_COST ? "text-green-400" : "text-red-400"}`}>
              {tokenBalance}
            </span>
          </div>
        </motion.div>

        {/* Submit Button */}
        <motion.div variants={itemVariants} className="flex justify-center">
          <motion.button
            type="submit"
            disabled={loading || tokenBalance < RUNE_COST || !question.trim()}
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
                  Runeler Çekiliyor...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Runeleri Çek
                </>
              )}
            </span>
          </motion.button>
        </motion.div>
      </form>
    </motion.div>
  );
}
