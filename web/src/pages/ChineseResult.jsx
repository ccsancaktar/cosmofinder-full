import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Star, ArrowLeft, Wind, Flame, Leaf, Droplets, Mountain } from "lucide-react";
import StarField from "../components/home/StarField";

// İngilizce element adlarını Türkçeye eşle
const ELEMENT_TR_MAP = {
  "Metal": "Metal",
  "Water": "Su",
  "Wood": "Ağaç",
  "Fire": "Ateş",
  "Earth": "Toprak",
  "Su": "Su",
  "Ağaç": "Ağaç",
  "Ateş": "Ateş",
  "Toprak": "Toprak"
};

const ELEMENT_COLORS = {
  Metal: { bg: "from-gray-400/30 to-gray-500/20", border: "border-gray-300", text: "text-gray-200", icon: Mountain },
  Water: { bg: "from-blue-400/30 to-cyan-500/20", border: "border-blue-300", text: "text-blue-200", icon: Droplets },
  Su: { bg: "from-blue-400/30 to-cyan-500/20", border: "border-blue-300", text: "text-blue-200", icon: Droplets },
  Wood: { bg: "from-green-400/30 to-emerald-500/20", border: "border-green-300", text: "text-green-200", icon: Leaf },
  Ağaç: { bg: "from-green-400/30 to-emerald-500/20", border: "border-green-300", text: "text-green-200", icon: Leaf },
  Fire: { bg: "from-red-400/30 to-orange-500/20", border: "border-red-300", text: "text-red-200", icon: Flame },
  Ateş: { bg: "from-red-400/30 to-orange-500/20", border: "border-red-300", text: "text-red-200", icon: Flame },
  Earth: { bg: "from-yellow-400/30 to-amber-500/20", border: "border-yellow-300", text: "text-yellow-200", icon: Wind },
  Toprak: { bg: "from-yellow-400/30 to-amber-500/20", border: "border-yellow-300", text: "text-yellow-200", icon: Wind },
};

export default function ChineseResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  
  const fortuneData = location.state;

  useEffect(() => {
    if (!fortuneData) {
      navigate("/");
      return;
    }

    const timer = setTimeout(() => {
      setIsLoading(false);
      setTimeout(() => setShowContent(true), 500);
    }, 3000);

    return () => clearTimeout(timer);
  }, [fortuneData, navigate]);

  if (!fortuneData) {
    return null;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const baziData = fortuneData.baziData || {};
  
  // Personality object'ini flatten et
  const personality = baziData.personality || {};
  const mappedBaziData = {
    ...baziData,
    personality_traits: personality.main_characteristics || baziData.personality_traits || "",
    lucky_colors: personality.lucky_colors || baziData.lucky_colors || "",
    lucky_direction: personality.lucky_direction || baziData.lucky_direction || "",
    career_suggestions: personality.career_suggestions || baziData.career_suggestions || [],
    relationship_advice: personality.relationship_advice || baziData.relationship_advice || ""
  };

  const renderElementPillar = (label, element, index) => {
    if (!element) return null;
    // Element adını normalize et ve Türkçeye çevir
    const elementTr = ELEMENT_TR_MAP[element] || element;
    const color = ELEMENT_COLORS[elementTr] || ELEMENT_COLORS[element] || ELEMENT_COLORS.Metal;
    const Icon = color.icon;
    
    return (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 30 }}
        animate={showContent ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: index * 0.15 }}
        whileHover={{ scale: 1.05 }}
        className={`bg-gradient-to-br ${color.bg} ${color.border} border-2 rounded-2xl p-6 backdrop-blur-md text-center group`}
      >
        <div className="mb-3 flex justify-center">
          <Icon className={`w-8 h-8 ${color.text}`} />
        </div>
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">{label}</p>
        <p className={`text-2xl font-bold ${color.text} group-hover:drop-shadow-lg transition`}>
          {elementTr}
        </p>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen relative overflow-hidden text-white">
      <StarField />
      
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(ellipse at top, transparent 0%, hsl(230 25% 8%) 70%),
            radial-gradient(ellipse at bottom, hsl(280 30% 10% / 0.5) 0%, transparent 60%)
          `,
        }}
      />

      <div className="relative z-10">
        <nav className="w-full py-6 px-6 md:px-12">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition" onClick={() => navigate("/")}>
              <span className="text-primary text-2xl">✦</span>
              <span className="font-bold text-xl md:text-2xl text-transparent bg-gradient-to-r from-yellow-300 via-primary to-yellow-500 bg-clip-text">
                FORTUNE FINDER
              </span>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/30 hover:border-primary/50 text-primary hover:text-white transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4" />
              Geri Dön
            </motion.button>
          </div>
        </nav>

        <main className="pb-16 px-4">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center min-h-[60vh]"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="relative w-32 h-32 mb-8"
                >
                  <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                  <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full" />
                  <div className="absolute inset-4 border-2 border-primary/30 rounded-full" />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <Sparkles className="w-10 h-10 text-primary" />
                  </motion.div>
                </motion.div>
                
                <motion.p
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-xl font-bold text-primary"
                >
                  Ba Zi Analizi Yapılıyor...
                </motion.p>
                <p className="text-gray-400 mt-2">
                  Dört Sütun Okunuyor
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="max-w-6xl mx-auto"
              >
                {/* Başlık */}
                <motion.div variants={itemVariants} className="text-center mb-12">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="inline-block mb-4"
                  >
                    <Star className="w-12 h-12 text-primary fill-primary" />
                  </motion.div>
                  <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-gradient-to-r from-yellow-300 via-primary to-yellow-500 bg-clip-text mb-4">
                    Ba Zi (Dört Sütun) Analizi
                  </h1>
                  <p className="text-gray-400">
                    Doğum tarihiniz ve saatinizin kozmik anlamı
                  </p>
                </motion.div>

                {/* Dört Sütun (Four Pillars) */}
                <motion.div variants={itemVariants} className="mb-16">
                  <h2 className="text-2xl font-bold text-center mb-8 text-primary">Dört Sütun</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {renderElementPillar("Yıl", mappedBaziData.year_element, 0)}
                    {renderElementPillar("Ay", mappedBaziData.month_element, 1)}
                    {renderElementPillar("Gün", mappedBaziData.day_element, 2)}
                    {renderElementPillar("Saat", mappedBaziData.hour_element, 3)}
                  </div>
                </motion.div>

                {/* Yin-Yang Dengesi */}
                {mappedBaziData.yin_yang_balance && (
                  <motion.div variants={itemVariants} className="mb-16">
                    <h2 className="text-2xl font-bold text-center mb-8 text-primary">Yin-Yang Dengesi</h2>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={showContent ? { opacity: 1, scale: 1 } : {}}
                      transition={{ duration: 0.8, delay: 0.5 }}
                      className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-2 border-indigo-400/40 rounded-2xl p-10 backdrop-blur-md text-center"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        className="text-6xl mb-6 inline-block"
                      >
                        ☯️
                      </motion.div>
                      <p className="text-gray-300 mb-4 text-lg">
                        {mappedBaziData.yin_yang_balance.description || "Dinamik denge"}
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <p className="text-sm text-gray-400 mb-2">Yin</p>
                          <p className="text-2xl font-bold text-indigo-300">
                            {mappedBaziData.yin_yang_balance.yin_percentage ? Math.round(mappedBaziData.yin_yang_balance.yin_percentage) : "—"}%
                          </p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <p className="text-sm text-gray-400 mb-2">Yang</p>
                          <p className="text-2xl font-bold text-orange-300">
                            {mappedBaziData.yin_yang_balance.yang_percentage ? Math.round(mappedBaziData.yin_yang_balance.yang_percentage) : "—"}%
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}

                {/* Analiz Kartları */}
                <motion.div variants={itemVariants} className="mb-16">
                  <h2 className="text-2xl font-bold text-center mb-8 text-primary">Hayat Alanları</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Kişilik */}
                    <motion.div
                      initial={{ opacity: 0, x: -30 }}
                      animate={showContent ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.6, delay: 0.8 }}
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-br from-rose-500/20 to-pink-500/20 border-2 border-rose-400/30 rounded-xl p-6 backdrop-blur-sm hover:shadow-lg hover:shadow-rose-500/20"
                    >
                      <h3 className="font-bold text-rose-200 mb-3">👤 Kişilik Özellikleri</h3>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {mappedBaziData.personality_traits || "Dört Sütun analizi çerçevesinde kişilik özellikleriniz belirlenmiştir."}
                      </p>
                    </motion.div>

                    {/* Şanslı Yön ve Renk */}
                    <motion.div
                      initial={{ opacity: 0, x: 30 }}
                      animate={showContent ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.6, delay: 0.9 }}
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-2 border-cyan-400/30 rounded-xl p-6 backdrop-blur-sm hover:shadow-lg hover:shadow-cyan-500/20"
                    >
                      <h3 className="font-bold text-cyan-200 mb-3">🧭 Şanslı Yön & Renk</h3>
                      <div className="space-y-2 text-sm text-gray-300">
                        <p><span className="text-cyan-400 font-semibold">Yön:</span> {mappedBaziData.lucky_direction || "—"}</p>
                        <p><span className="text-cyan-400 font-semibold">Renk:</span> {mappedBaziData.lucky_colors || "—"}</p>
                      </div>
                    </motion.div>

                    {/* Kariyer */}
                    <motion.div
                      initial={{ opacity: 0, x: -30 }}
                      animate={showContent ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.6, delay: 1 }}
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 border-2 border-emerald-400/30 rounded-xl p-6 backdrop-blur-sm hover:shadow-lg hover:shadow-emerald-500/20"
                    >
                      <h3 className="font-bold text-emerald-200 mb-3">💼 Kariyer Önerileri</h3>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {Array.isArray(mappedBaziData.career_suggestions) 
                          ? mappedBaziData.career_suggestions.join(", ")
                          : (mappedBaziData.career_suggestions || "Kariyer yolunuzda başarı için tavsiyeler.")}
                      </p>
                    </motion.div>

                    {/* İlişkiler */}
                    <motion.div
                      initial={{ opacity: 0, x: 30 }}
                      animate={showContent ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.6, delay: 1.1 }}
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-br from-fuchsia-500/20 to-pink-500/20 border-2 border-fuchsia-400/30 rounded-xl p-6 backdrop-blur-sm hover:shadow-lg hover:shadow-fuchsia-500/20"
                    >
                      <h3 className="font-bold text-fuchsia-200 mb-3">💝 İlişki Tavsiyesi</h3>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {mappedBaziData.relationship_advice || "İlişkilerinizde uyum ve denge için öneriler."}
                      </p>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Ba Zi Bilgisi */}
                <motion.div
                  variants={itemVariants}
                  className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border-2 border-purple-400/30 rounded-2xl p-8 backdrop-blur-sm text-center mb-8"
                >
                  <h2 className="text-xl font-bold text-purple-200 mb-4">Ba Zi (Dört Sütun) Nedir?</h2>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Ba Zi (Dört Sütun), doğum tarihi ve saatiniz üzerine kurulu antik Çin falı sistemtir. 
                    Her sütun bir zaman periyodunu (yıl, ay, gün, saat) temsil eder. Beş element (Metal, Su, Ağaç, Ateş, Toprak) 
                    ve Yin-Yang ilkesiyle harmonize edilerek, kişilik, kader ve yaşam yolunuz analiz edilir. 
                    Bu antik bilge sistem, 2000 yıldan fazla süredir insanların geleceklerini aydınlatmaktadır.
                  </p>
                </motion.div>

                {/* AI Analizi */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.3 }}
                  className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/30 rounded-2xl p-8 mb-8 backdrop-blur-sm"
                >
                  <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-yellow-300 via-primary to-yellow-500 bg-clip-text mb-6">
                    🤖 Yapay Zeka Analizi
                  </h2>
                  {fortuneData.fortune ? (
                    <p className="text-gray-300 leading-relaxed whitespace-pre-line text-base md:text-lg">
                      {fortuneData.fortune}
                    </p>
                  ) : (
                    <p className="text-gray-400 text-sm">Analiz yükleniyor...</p>
                  )}
                </motion.div>

                {/* Butonlar */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.5 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/")}
                    className="px-8 py-3 rounded-lg font-bold bg-gradient-to-r from-yellow-400 via-primary to-yellow-300 text-white hover:shadow-2xl hover:shadow-primary/50 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    Yeni Fal Baktır
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.print()}
                    className="px-8 py-3 rounded-lg font-bold border-2 border-primary text-primary hover:bg-primary/10 transition-all duration-300"
                  >
                    Analizi Kaydet
                  </motion.button>
                </motion.div>

                {fortuneData.readingId && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 1.7 }}
                    className="mt-8 text-center"
                  >
                    <p className="text-sm text-gray-500">
                      Fal ID: <code className="text-gray-400">{fortuneData.readingId}</code>
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
