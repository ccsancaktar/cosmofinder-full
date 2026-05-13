import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Star, ArrowLeft, Zap, Shield } from "lucide-react";
import StarField from "../components/home/StarField";

export default function RuneResult() {
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
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
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
                  Rünler Çözülüyor...
                </motion.p>
                <p className="text-gray-400 mt-2">
                  Eski Viking Bilgeliği Okunuyor
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
                    Rün Falı Sonucu
                  </h1>
                  <p className="text-gray-400">
                    Elder Futhark - Antik Viking Runaları
                  </p>
                </motion.div>

                {/* Seçilen Rünler - Grid */}
                {fortuneData.runes && Array.isArray(fortuneData.runes) && (
                  <motion.div variants={itemVariants} className="mb-16">
                    <h2 className="text-2xl font-bold text-center mb-8 text-primary">Seçilen Rünler</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {fortuneData.runes.map((rune, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, rotateY: 180, scale: 0.8 }}
                          animate={showContent ? { opacity: 1, rotateY: 0, scale: 1 } : {}}
                          transition={{ duration: 0.8, delay: index * 0.2 }}
                          whileHover={{ scale: 1.05, rotateZ: 2 }}
                          className="group"
                        >
                          <div className={`bg-gradient-to-br ${
                            rune.reversed 
                              ? "from-red-500/20 to-orange-500/20 border-red-400/40" 
                              : "from-amber-500/20 to-yellow-500/20 border-amber-400/40"
                          } border-2 rounded-2xl p-8 backdrop-blur-md text-center relative overflow-hidden`}>
                            {/* Arka plan efekti */}
                            <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            
                            <motion.div
                              animate={rune.reversed ? { rotate: 180 } : { rotate: 0 }}
                              className="text-8xl font-serif mb-4 inline-block drop-shadow-lg"
                            >
                              {rune.symbol}
                            </motion.div>
                            
                            <div className="relative z-10">
                              <h3 className="text-2xl font-bold text-amber-200 mb-2">
                                {rune.name}
                              </h3>
                              
                              <div className={`text-xs font-bold uppercase tracking-wider mb-4 px-3 py-1 rounded-full inline-block ${
                                rune.reversed
                                  ? "bg-red-500/30 text-red-300 border border-red-400/50"
                                  : "bg-amber-500/30 text-amber-300 border border-amber-400/50"
                              }`}>
                                {rune.reversed ? "⚡ TERS" : "✓ DÜZ"}
                              </div>
                              
                              <p className="text-gray-300 text-sm leading-relaxed mt-4">
                                {rune.reversed ? rune.reversed_meaning : rune.meaning}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Detaylı Rün Yorumları */}
                {fortuneData.runes && Array.isArray(fortuneData.runes) && (
                  <motion.div variants={itemVariants} className="mb-16">
                    <h2 className="text-2xl font-bold text-center mb-8 text-primary">Rünlerin Derinlemesine Anlamı</h2>
                    <div className="space-y-6">
                      {fortuneData.runes.map((rune, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
                          animate={showContent ? { opacity: 1, x: 0 } : {}}
                          transition={{ duration: 0.6, delay: 0.8 + index * 0.15 }}
                          whileHover={{ x: index % 2 === 0 ? 10 : -10 }}
                          className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border-2 border-orange-400/30 rounded-xl p-6 backdrop-blur-sm hover:border-orange-400/50 transition-all"
                        >
                          <div className="flex items-start gap-4">
                            {/* Rün Sembolü */}
                            <div className={`flex-shrink-0 w-20 h-20 rounded-lg flex items-center justify-center font-serif text-5xl ${
                              rune.reversed 
                                ? "bg-red-500/20 border-2 border-red-400/50" 
                                : "bg-amber-500/20 border-2 border-amber-400/50"
                            }`}>
                              <motion.div animate={rune.reversed ? { rotate: 180 } : { rotate: 0 }}>
                                {rune.symbol}
                              </motion.div>
                            </div>
                            
                            {/* İçerik */}
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-bold text-amber-200">
                                  {index + 1}. {rune.name}
                                </h3>
                                <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${
                                  rune.reversed
                                    ? "bg-red-500/30 text-red-300"
                                    : "bg-amber-500/30 text-amber-300"
                                }`}>
                                  {rune.reversed ? "Ters" : "Düz"}
                                </span>
                              </div>
                              
                              <p className="text-gray-300 mb-3 leading-relaxed">
                                {rune.reversed ? rune.reversed_meaning : rune.meaning}
                              </p>
                              
                              {rune.reversed && (
                                <motion.div
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  className="bg-red-500/20 border-l-2 border-red-400 rounded pl-4 py-3"
                                >
                                  <p className="text-red-300 text-sm font-semibold flex items-center gap-2">
                                    <Zap className="w-4 h-4" />
                                    Dikkat: Bu rün ters pozisyondadır. Enerji blokajı veya engeller olabileceği anlamına gelir.
                                  </p>
                                </motion.div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Rün Falı Bilgisi */}
                <motion.div
                  variants={itemVariants}
                  className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border-2 border-purple-400/30 rounded-2xl p-8 backdrop-blur-sm text-center mb-8"
                >
                  <h2 className="text-xl font-bold text-purple-200 mb-4 flex items-center justify-center gap-2">
                    <Shield className="w-5 h-5" />
                    Elder Futhark Sistemi
                  </h2>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Rünler, Vikingler ve Germanlar tarafından 2000 yıl önce kullanılan antik alfabenin sembolüdür. 
                    Her rün kosmik güçler, doğa kuvvetleri ve insan hayatı hakkında derin bilgelik taşır. 
                    Rün falı, seçilen rünler aracılığıyla hayatınızdaki gizli mesajları ortaya koyar. 
                    Eski Viking inanışına göre, rünlerin kendileri konuşan varlıklardır ve bize rehberlik ederler.
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
                    Falı Kaydet
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
