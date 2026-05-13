import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Star, ArrowLeft } from "lucide-react";
import StarField from "../components/home/StarField";

export default function KabalaResult() {
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
                  Kabala Ağacı Analiz Ediliyor...
                </motion.p>
                <p className="text-gray-400 mt-2">
                  Yüce Sefirotlar İnceleniyor
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
                    Kabala Falı Sonucu
                  </h1>
                  <p className="text-gray-400">
                    Sefirot Ağacı ve Sayısal Analiz
                  </p>
                </motion.div>

                {fortuneData.kabalaData && (
                  <>
                    {/* İbrani Adı Başlığı */}
                    <motion.div variants={itemVariants} className="text-center mb-10">
                      <div className="bg-gradient-to-r from-indigo-500/30 to-purple-500/30 border-2 border-indigo-400/50 rounded-2xl p-8 backdrop-blur-md">
                        <p className="text-sm text-indigo-300 font-bold mb-2">İbrani Adı (Gematria)</p>
                        <h2 className="text-4xl md:text-5xl font-bold text-indigo-200 mb-4" style={{ fontFamily: 'Georgia, serif' }}>
                          {fortuneData.kabalaData.hebrew_name || "N/A"}
                        </h2>
                        <div className="flex justify-center gap-8 text-center">
                          <div>
                            <p className="text-sm text-gray-400 mb-2">Orijinal Sayı</p>
                            <p className="text-3xl font-bold text-indigo-300">
                              {fortuneData.kabalaData.original_number || "—"}
                            </p>
                          </div>
                          <div className="border-l border-indigo-400/30"></div>
                          <div>
                            <p className="text-sm text-gray-400 mb-2">İndirgenmiş Sayı</p>
                            <p className="text-3xl font-bold text-indigo-200">
                              {fortuneData.kabalaData.reduced_number || "—"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Seçilen Sefirot */}
                    {fortuneData.kabalaData.selected_sephiroth && Array.isArray(fortuneData.kabalaData.selected_sephiroth) && (
                      <motion.div variants={itemVariants} className="mb-12">
                        <h2 className="text-2xl font-bold text-primary text-center mb-8">Seçilen Sefirot</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {fortuneData.kabalaData.selected_sephiroth.map((sephirah, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.5 }}
                              animate={showContent ? { opacity: 1, scale: 1 } : {}}
                              transition={{ duration: 0.5, delay: index * 0.1 }}
                              whileHover={{ scale: 1.05 }}
                              className="bg-gradient-to-br from-indigo-500/40 to-purple-500/40 border-2 border-indigo-400/60 rounded-lg p-4 text-center backdrop-blur-md hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
                            >
                              <p className="text-sm font-bold text-indigo-300 mb-1">
                                #{sephirah.position}
                              </p>
                              <p className="text-lg font-bold text-indigo-100 mb-2">
                                {sephirah.hebrew_name}
                              </p>
                              <p className="text-xs text-gray-300 leading-tight">
                                {sephirah.english_name}
                              </p>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Sefirot Anlamları */}
                    <motion.div variants={itemVariants} className="space-y-4 mb-12">
                      <h2 className="text-2xl font-bold text-primary text-center mb-8">Sefirot Detayları ve Anlamları</h2>
                      {fortuneData.kabalaData.selected_sephiroth && fortuneData.kabalaData.selected_sephiroth.map((sephirah, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -30 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 0.5 + index * 0.2 }}
                          className="bg-gradient-to-r from-indigo-500/20 via-transparent to-purple-500/20 border-2 border-indigo-400/30 rounded-xl p-6 backdrop-blur-sm"
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-14 h-14 rounded-full bg-indigo-500/40 border-2 border-indigo-400/60 flex items-center justify-center">
                              <span className="text-xl font-bold text-indigo-200">
                                {sephirah.position}
                              </span>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-indigo-200 mb-2">
                                {sephirah.hebrew_name} - {sephirah.english_name}
                              </h3>
                              <p className="text-gray-300 leading-relaxed mb-3">
                                {sephirah.meaning || "Anlamı hakkında bilgi mevcuttur."}
                              </p>
                              <div className="text-sm text-gray-400">
                                <p>
                                  <span className="text-indigo-300 font-semibold">Ruh Kalitesi:</span> {sephirah.spiritual_quality || "—"}
                                </p>
                                <p className="mt-1">
                                  <span className="text-indigo-300 font-semibold">Arketip:</span> {sephirah.arche_type || "—"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>

                    {/* Kabala Yolu Analizi */}
                    <motion.div
                      variants={itemVariants}
                      className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border-2 border-purple-400/30 rounded-2xl p-8 backdrop-blur-sm text-center mb-8"
                    >
                      <h2 className="text-xl font-bold text-purple-200 mb-4">Kabala Ağacı Mesajı</h2>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        Kabala, İbrani mistisizmin yüce bilgeliğidir. Sefirot Ağacı, evrenin yapısını ve ruhsal yolculuğunuzu temsil eder. 
                        Seçtiğiniz Sefirot'lar, sizin kozmik durumunuzu ve içsel potansiyelinizi gösterir. Her Sefirah, tanrısal gücün 
                        farklı bir yönünü ve yaşamın kutsal boyutlarını açığa koymaktadır.
                      </p>
                    </motion.div>
                  </>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.5 }}
                  className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/30 rounded-2xl p-8 mb-8 backdrop-blur-sm"
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
