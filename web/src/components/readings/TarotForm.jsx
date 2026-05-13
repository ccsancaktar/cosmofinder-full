import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, MapPin, User, Heart, MessageCircle, Sparkles } from "lucide-react";
import Loading from "../common/Loading";
import API from "../../services/api";
import authService from "../../services/authService";
import { setBalance } from "../../store/tokensSlice";

export default function TarotForm() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const tokenBalance = useSelector((state) => state.tokens.balance);

  const [tarotCards, setTarotCards] = useState([]);
  const [cardsLoading, setCardsLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: "",
    birthPlace: "",
    birthDate: "",
    birthTime: "",
    motherName: "",
    question: "",
  });
  
  const [selectedCards, setSelectedCards] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Backend'den tarot kartlarını çek
  useEffect(() => {
    const fetchTarotCards = async () => {
      try {
        const response = await API.get("/tarot/cards");
        if (response.data && Array.isArray(response.data)) {
          setTarotCards(response.data);
        } else if (response.data.cards) {
          setTarotCards(response.data.cards);
        }
      } catch (err) {
        console.error("Tarot cards fetch error:", err);
        // Fallback: hardcoded kartlar
        setTarotCards([
          { name: "Büyücü", meaning: "Yeni başlangıçlar", name_tr: "Büyücü" },
          { name: "High Priestess", meaning: "Sezgi", name_tr: "Yüksek Rahibe" },
          { name: "Empress", meaning: "Bereket", name_tr: "İmparatoriçe" },
          { name: "Emperor", meaning: "Otorite", name_tr: "İmparator" },
          { name: "Wheel of Fortune", meaning: "Değişim", name_tr: "Kader Çarkı" },
          { name: "Justice", meaning: "Denge", name_tr: "Adalet" },
          { name: "Star", meaning: "Umut", name_tr: "Yıldız" },
          { name: "Moon", meaning: "Sezgi", name_tr: "Ay" },
        ]);
      } finally {
        setCardsLoading(false);
      }
    };

    fetchTarotCards();
  }, []);

  const TAROT_COST = 35;
  const REQUIRED_CARDS = 3;

  const refreshTokenBalance = async () => {
    try {
      const response = await authService.getTokenBalance();
      dispatch(setBalance(response.data.balance || 0));
    } catch (err) {
      console.error("Token balance refresh failed:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCardSelect = (id) => {
    setSelectedCards((prev) => {
      if (prev.includes(id)) {
        return prev.filter((cardId) => cardId !== id);
      }
      if (prev.length < 3) {
        return [...prev, id];
      }
      return prev;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (selectedCards.length !== REQUIRED_CARDS) {
      setError("Lütfen 3 kart seçin");
      return;
    }

    // Token kontrolü
    if (tokenBalance < TAROT_COST) {
      setError(`Yeterli token yok. Gerekli: ${TAROT_COST}, Sahip olunan: ${tokenBalance}`);
      return;
    }

    if (!formData.question.trim()) {
      setError("Lütfen bir soru girin");
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedCardData = selectedCards.map(idx => tarotCards[idx]);
      
      const response = await API.post("/tarot", {
        soru: formData.question,
        selectedCards: selectedCards.sort(),
        selectedCardData: selectedCardData,
        language: "tr",
        name: formData.name,
        birthPlace: formData.birthPlace,
        birthDate: formData.birthDate,
        birthTime: formData.birthTime,
        motherName: formData.motherName,
      });

      if (response.data.success) {
        // Token balance'ı güncelle
        await refreshTokenBalance();

        // Sonuç sayfasına yönlendir ve veriyi gönder
        navigate("/reading/tarot", {
          state: {
            type: "tarot",
            question: formData.question,
            cards: response.data.cards || selectedCardData,
            fortune: response.data.yorum,
            readingId: response.data.reading_id,
            formData: formData,
          },
        });
      } else {
        setError(response.data.message || "Tarot falı oluşturulurken hata oluştu");
      }
    } catch (err) {
      console.error("Tarot error:", err);
      setError(err.response?.data?.message || "Tarot falı oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsSubmitting(false);
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
          Tarot Falı
        </h1>
        <p className="text-gray-300 text-lg max-w-xl mx-auto">
          Doğum bilgilerinizi girin, 3 kart seçin ve kaderinizi keşfedin
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

        {/* Personal Information Section */}
        <motion.div 
          variants={itemVariants} 
          className="bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 border border-primary/20 rounded-2xl p-6 md:p-8 backdrop-blur-sm"
        >
          <h2 className="text-xl md:text-2xl font-bold text-primary mb-6 flex items-center gap-2">
            <User className="w-5 h-5" />
            Kişisel Bilgiler
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <motion.div variants={itemVariants} className="space-y-2">
              <label htmlFor="name" className="text-gray-300 flex items-center gap-2 text-sm font-medium">
                <User className="w-4 h-4 text-primary" />
                İsim
              </label>
              <input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Adınızı girin"
                required
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-primary/20 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              />
            </motion.div>

            {/* Mother's Name */}
            <motion.div variants={itemVariants} className="space-y-2">
              <label htmlFor="motherName" className="text-gray-300 flex items-center gap-2 text-sm font-medium">
                <Heart className="w-4 h-4 text-primary" />
                Anne Adı
              </label>
              <input
                id="motherName"
                name="motherName"
                value={formData.motherName}
                onChange={handleInputChange}
                placeholder="Annenizin adını girin"
                required
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-primary/20 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              />
            </motion.div>

            {/* Birth Place */}
            <motion.div variants={itemVariants} className="space-y-2">
              <label htmlFor="birthPlace" className="text-gray-300 flex items-center gap-2 text-sm font-medium">
                <MapPin className="w-4 h-4 text-primary" />
                Doğum Yeri
              </label>
              <input
                id="birthPlace"
                name="birthPlace"
                value={formData.birthPlace}
                onChange={handleInputChange}
                placeholder="Doğum yerinizi girin"
                required
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-primary/20 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              />
            </motion.div>

            {/* Birth Date */}
            <motion.div variants={itemVariants} className="space-y-2">
              <label htmlFor="birthDate" className="text-gray-300 flex items-center gap-2 text-sm font-medium">
                <Calendar className="w-4 h-4 text-primary" />
                Doğum Tarihi
              </label>
              <input
                id="birthDate"
                name="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-primary/20 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              />
            </motion.div>

            {/* Birth Time */}
            <motion.div variants={itemVariants} className="space-y-2 md:col-span-2 md:w-1/2">
              <label htmlFor="birthTime" className="text-gray-300 flex items-center gap-2 text-sm font-medium">
                <Clock className="w-4 h-4 text-primary" />
                Doğum Saati
              </label>
              <input
                id="birthTime"
                name="birthTime"
                type="time"
                value={formData.birthTime}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-primary/20 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              />
            </motion.div>
          </div>
        </motion.div>

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
              Kartlara sormak istediğiniz soru
            </label>
            <textarea
              id="question"
              name="question"
              value={formData.question}
              onChange={handleInputChange}
              placeholder="Hayatınızla ilgili merak ettiğiniz soruyu yazın..."
              required
              rows={4}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-primary/20 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 resize-none"
            />
          </div>
        </motion.div>

        {/* Token Cost Info */}
        <motion.div 
          variants={itemVariants}
          className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30 rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300">Tarot Maliyeti:</span>
            <span className="font-bold text-primary text-lg">{TAROT_COST} Token</span>
          </div>
          <div className="text-sm text-gray-400">
            Mevcut Token: <span className={`font-bold ${tokenBalance >= TAROT_COST ? "text-green-400" : "text-red-400"}`}>
              {tokenBalance}
            </span>
          </div>
        </motion.div>

        {/* Tarot Cards Section */}
        <motion.div 
          variants={itemVariants} 
          className="bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 border border-primary/20 rounded-2xl p-6 md:p-8 backdrop-blur-sm"
        >
          <h2 className="text-xl md:text-2xl font-bold text-primary mb-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Tarot Kartlarını Seçin
          </h2>
          <p className="text-gray-400 mb-8">
            Aşağıdaki kartlardan 3 tanesini seçin ({selectedCards.length}/3)
          </p>

          {cardsLoading ? (
            <div className="flex justify-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full"
              />
            </div>
          ) : (
            <>
              <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                <AnimatePresence>
                  {tarotCards.map((card, index) => (
                    <motion.button
                      key={index}
                      type="button"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleCardSelect(index)}
                      disabled={isSubmitting || (selectedCards.length >= 3 && !selectedCards.includes(index))}
                      className={`aspect-[2/3] w-20 md:w-24 rounded-xl border-2 transition-all flex items-center justify-center overflow-hidden relative group ${
                        selectedCards.includes(index)
                          ? "border-primary shadow-lg shadow-primary/50 bg-primary/10"
                          : "border-gray-600/30 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <img 
                        src="/assets/tarot/tarot-back.jpg" 
                        alt={`Card ${card.name_tr || card.name}`}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      {selectedCards.includes(index) && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute inset-0 bg-primary/40 flex items-center justify-center z-10"
                        >
                          <Sparkles className="w-6 h-6 text-white" />
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>

              {/* Selected cards indicator */}
              <motion.div variants={itemVariants} className="mt-8 flex justify-center gap-3">
                {[1, 2, 3].map((num) => (
                  <motion.div
                    key={num}
                    animate={{
                      scale: selectedCards.length >= num ? 1.2 : 1,
                    }}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      selectedCards.length >= num
                        ? "bg-primary shadow-lg shadow-primary/50"
                        : "bg-gray-600"
                    }`}
                  />
                ))}
              </motion.div>
            </>
          )}
        </motion.div>

        {/* Submit Button */}
        <motion.div variants={itemVariants} className="flex justify-center">
          <motion.button
            type="submit"
            disabled={isSubmitting || tokenBalance < TAROT_COST || selectedCards.length !== 3}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative px-12 py-6 text-lg font-bold bg-gradient-to-r from-yellow-400 via-primary to-yellow-300 text-white rounded-xl hover:shadow-2xl hover:shadow-primary/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              {isSubmitting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-5 h-5" />
                  </motion.div>
                  Falınız Hazırlanıyor...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Falımı Gör
                </>
              )}
            </span>
            
            {/* Shimmer effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-300 bg-gradient-to-r from-transparent via-white to-transparent" />
          </motion.button>
        </motion.div>
      </form>
    </motion.div>
  );
}
