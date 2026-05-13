import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Star, ArrowLeft } from "lucide-react";
import StarField from "../components/home/StarField";

export default function TarotResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  
  const fortuneData = location.state;

  useEffect(() => {
    if (!fortuneData) {
      navigate("/tarot");
      return;
    }

    const timer = setTimeout(() => {
      setIsLoading(false);
      setTimeout(() => setShowContent(true), 500);
    }, 3000);

    return () => clearTimeout(timer);
  }, [fortuneData, navigate]);

  useEffect(() => {
    if (showContent && currentCardIndex < (fortuneData?.cards?.length || 0)) {
      const timer = setTimeout(() => {
        setCurrentCardIndex((prev) => prev + 1);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [showContent, currentCardIndex, fortuneData?.cards?.length]);

  if (!fortuneData) {
    return null;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
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
              onClick={() => navigate("/tarot")}
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
                  Kartlarınız Yorumlanıyor...
                </motion.p>
                <p className="text-gray-400 mt-2">
                  Kozmik enerjiler okunuyor
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="max-w-5xl mx-auto"
              >
                <motion.div variants={itemVariants} className="text-center mb-12">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="inline-block mb-4"
                  >
                    <Star className="w-12 h-12 text-primary fill-primary" />
                  </motion.div>
                  <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-gradient-to-r from-yellow-300 via-primary to-yellow-500 bg-clip-text mb-4">
                    Falınız Hazır, {fortuneData.formData?.name || "Sevgili"}
                  </h1>
                  <p className="text-gray-400">
                    Seçtiğiniz kartlar kaderin mesajlarını taşıyor
                  </p>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 border border-primary/20 rounded-2xl p-6 mb-8 text-center backdrop-blur-sm"
                >
                  <p className="text-gray-400 text-sm mb-2">Sorduğunuz Soru</p>
                  <p className="text-gray-100 text-lg italic">"{fortuneData.question}"</p>
                </motion.div>

                {fortuneData.cards && fortuneData.cards.length > 0 && (
                  <motion.div variants={itemVariants} className="mb-12">
                    <h2 className="text-2xl font-bold text-primary text-center mb-8">
                      Seçilen Kartlar
                    </h2>
                    <div className="flex flex-wrap justify-center gap-6 md:gap-10">
                      {fortuneData.cards.map((card, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.5, rotateY: 180 }}
                          animate={
                            showContent && currentCardIndex > index
                              ? { opacity: 1, scale: 1, rotateY: 0 }
                              : {}
                          }
                          transition={{ duration: 0.8, delay: 0.2 }}
                          className="perspective-1000"
                        >
                          <div className="w-28 h-44 md:w-36 md:h-56 bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary rounded-xl flex flex-col items-center justify-center p-4 shadow-lg shadow-primary/30">
                            <span className="text-3xl md:text-4xl text-primary mb-3">✦</span>
                            <span className="text-primary font-bold text-sm md:text-base text-center">
                              {card.name_tr || card.name}
                            </span>
                            <span className="text-gray-400 text-xs text-center mt-1">
                              {card.meaning}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {fortuneData.cards && fortuneData.cards.length > 0 && (
                  <motion.div variants={itemVariants} className="space-y-6 mb-12">
                    <h2 className="text-2xl font-bold text-primary text-center mb-8">
                      Kart Yorumları
                    </h2>
                    {fortuneData.cards.map((card, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 + index * 0.3 }}
                        className="bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 border border-primary/20 rounded-2xl p-6 md:p-8 backdrop-blur-sm"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-14 h-14 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                            <span className="text-2xl text-primary">✦</span>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-primary mb-2">
                              {index + 1}. Kart: {card.name_tr || card.name}
                            </h3>
                            <p className="text-gray-200 mb-4 leading-relaxed">
                              {card.meaning}
                            </p>
                            <div className="bg-primary/5 rounded-lg p-4 border-l-2 border-primary">
                              <p className="text-gray-300 text-sm">
                                <span className="text-primary font-semibold">
                                  {card.reversed ? "(TERS) " : ""}
                                </span>
                                {card.reversed ? card.reversed_meaning : card.meaning}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.5 }}
                  className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/30 rounded-2xl p-8 mt-12 mb-8 backdrop-blur-sm"
                >
                  <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-yellow-300 via-primary to-yellow-500 bg-clip-text mb-6">
                    Yapay Zeka Tarafından Detaylı Analiz
                  </h2>
                  {fortuneData.fortune ? (
                    <p className="text-gray-300 leading-relaxed whitespace-pre-line text-base md:text-lg">
                      {fortuneData.fortune}
                    </p>
                  ) : (
                    <p className="text-gray-400 text-sm">Analiz yükleniyor...</p>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.8 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/tarot")}
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
                    Falımı Kaydet
                  </motion.button>
                </motion.div>

                {fortuneData.readingId && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 2 }}
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
