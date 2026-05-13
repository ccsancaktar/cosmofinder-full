import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Star, ArrowLeft, Heart, Briefcase, Users } from "lucide-react";
import StarField from "../components/home/StarField";

export default function DailyZodiacResult() {
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
                  Günlük Harita Oluşturuluyor...
                </motion.p>
                <p className="text-gray-400 mt-2">
                  Kozmik enerjiler taranıyor
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
                    Günlük Burç Falı Sonucu
                  </h1>
                  <p className="text-gray-400">
                    {fortuneData.formData?.name || "Sevgili"}, bugün senin için ne getiriyor?
                  </p>
                </motion.div>

                {fortuneData.dailyZodiacData && (
                  <>
                    {/* Genel Enerji */}
                    <motion.div variants={itemVariants} className="mb-12">
                      <h2 className="text-2xl font-bold text-primary text-center mb-8">Bugünün Genel Enerjisi</h2>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={showContent ? { opacity: 1, scale: 1 } : {}}
                        transition={{ duration: 0.8 }}
                        className="bg-gradient-to-br from-yellow-500/30 to-orange-500/30 border-2 border-yellow-400/50 rounded-2xl p-8 backdrop-blur-md text-center"
                      >
                        <div className="mb-4">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                            className="inline-block text-6xl"
                          >
                            ☀️
                          </motion.div>
                        </div>
                        <h3 className="text-2xl font-bold text-yellow-200 mb-4">
                          {fortuneData.dailyZodiacData.overall_energy_title || "Parlak Gün"}
                        </h3>
                        <p className="text-gray-200 leading-relaxed">
                          {fortuneData.dailyZodiacData.overall_energy || "Bugünün enerjisi hakkında bilgi mevcuttur."}
                        </p>
                      </motion.div>
                    </motion.div>

                    {/* Aşk - Kariyer - Aile */}
                    <motion.div variants={itemVariants} className="mb-12">
                      <h2 className="text-2xl font-bold text-primary text-center mb-8">Yaşam Alanları</h2>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Aşk */}
                        <motion.div
                          initial={{ opacity: 0, y: 30 }}
                          animate={showContent ? { opacity: 1, y: 0 } : {}}
                          transition={{ duration: 0.6, delay: 0.2 }}
                          whileHover={{ scale: 1.05 }}
                          className="group bg-gradient-to-br from-red-500/20 to-pink-500/20 border-2 border-red-400/30 rounded-xl p-6 backdrop-blur-sm hover:shadow-lg hover:shadow-red-500/20 transition-all"
                        >
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-lg bg-red-500/30 group-hover:bg-red-500/40 transition">
                              <Heart className="w-5 h-5 text-red-300" />
                            </div>
                            <h3 className="text-lg font-bold text-red-200">Aşk</h3>
                          </div>
                          <p className="text-gray-300 text-sm leading-relaxed">
                            {fortuneData.dailyZodiacData.love || "Aşk hayatınız hakkında bilgi mevcuttur."}
                          </p>
                        </motion.div>

                        {/* Kariyer */}
                        <motion.div
                          initial={{ opacity: 0, y: 30 }}
                          animate={showContent ? { opacity: 1, y: 0 } : {}}
                          transition={{ duration: 0.6, delay: 0.4 }}
                          whileHover={{ scale: 1.05 }}
                          className="group bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border-2 border-blue-400/30 rounded-xl p-6 backdrop-blur-sm hover:shadow-lg hover:shadow-blue-500/20 transition-all"
                        >
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-lg bg-blue-500/30 group-hover:bg-blue-500/40 transition">
                              <Briefcase className="w-5 h-5 text-blue-300" />
                            </div>
                            <h3 className="text-lg font-bold text-blue-200">Kariyer</h3>
                          </div>
                          <p className="text-gray-300 text-sm leading-relaxed">
                            {fortuneData.dailyZodiacData.career || "Kariyer hayatınız hakkında bilgi mevcuttur."}
                          </p>
                        </motion.div>

                        {/* Aile */}
                        <motion.div
                          initial={{ opacity: 0, y: 30 }}
                          animate={showContent ? { opacity: 1, y: 0 } : {}}
                          transition={{ duration: 0.6, delay: 0.6 }}
                          whileHover={{ scale: 1.05 }}
                          className="group bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-400/30 rounded-xl p-6 backdrop-blur-sm hover:shadow-lg hover:shadow-green-500/20 transition-all"
                        >
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-lg bg-green-500/30 group-hover:bg-green-500/40 transition">
                              <Users className="w-5 h-5 text-green-300" />
                            </div>
                            <h3 className="text-lg font-bold text-green-200">Aile</h3>
                          </div>
                          <p className="text-gray-300 text-sm leading-relaxed">
                            {fortuneData.dailyZodiacData.family || "Aile hayatınız hakkında bilgi mevcuttur."}
                          </p>
                        </motion.div>
                      </div>
                    </motion.div>

                    {/* Tavsiyeler ve İpuçları */}
                    <motion.div variants={itemVariants} className="mb-12">
                      <h2 className="text-2xl font-bold text-primary text-center mb-8">Günün Tavsiyesi</h2>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={showContent ? { opacity: 1 } : {}}
                        transition={{ duration: 0.6, delay: 1 }}
                        className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-400/30 rounded-xl p-6 backdrop-blur-sm"
                      >
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          {/* Şanslı Renk */}
                          <div className="text-center p-4 rounded-lg bg-white/5 border border-white/10">
                            <p className="text-sm text-gray-400 mb-2">Şanslı Renk</p>
                            <div className="w-12 h-12 mx-auto rounded-lg mb-2" 
                              style={{ backgroundColor: fortuneData.dailyZodiacData.lucky_color || "#fbbf24" }}>
                            </div>
                            <p className="text-sm font-semibold text-gray-300">
                              {fortuneData.dailyZodiacData.lucky_color_name || "Sarı"}
                            </p>
                          </div>

                          {/* Şanslı Saati */}
                          <div className="text-center p-4 rounded-lg bg-white/5 border border-white/10">
                            <p className="text-sm text-gray-400 mb-2">Şanslı Saati</p>
                            <p className="text-2xl font-bold text-yellow-300">
                              {fortuneData.dailyZodiacData.lucky_hour || "14:00"}
                            </p>
                            <p className="text-xs text-gray-400">Öğleden sonra</p>
                          </div>

                          {/* Şanslı Sayı */}
                          <div className="text-center p-4 rounded-lg bg-white/5 border border-white/10">
                            <p className="text-sm text-gray-400 mb-2">Şanslı Sayı</p>
                            <p className="text-3xl font-bold text-primary">
                              {fortuneData.dailyZodiacData.lucky_number || "7"}
                            </p>
                          </div>

                          {/* Uyarı */}
                          <div className="text-center p-4 rounded-lg bg-white/5 border border-white/10">
                            <p className="text-sm text-gray-400 mb-2">Kaçınılacak</p>
                            <p className="text-sm font-semibold text-yellow-300">
                              {fortuneData.dailyZodiacData.avoid || "İmpulsif Davranış"}
                            </p>
                          </div>
                        </div>

                        {/* Günün Mesajı */}
                        <div className="bg-white/5 rounded-lg p-4 border-l-2 border-purple-400">
                          <p className="text-sm text-gray-400 mb-2">Günün Mesajı</p>
                          <p className="text-gray-300 leading-relaxed">
                            {fortuneData.dailyZodiacData.daily_message || "Bugün, yaşamın güzelliğini fark etmek için bir gün olacaktır."}
                          </p>
                        </div>
                      </motion.div>
                    </motion.div>

                    {/* Burç Enerjisi */}
                    <motion.div
                      variants={itemVariants}
                      className="bg-gradient-to-br from-orange-500/20 to-yellow-500/20 border-2 border-orange-400/30 rounded-2xl p-8 backdrop-blur-sm text-center mb-8"
                    >
                      <h2 className="text-xl font-bold text-orange-200 mb-4">Burçlar Dansı</h2>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        Günlük burç falı, gezegensel hareketler ve kozmik titreşimleri temel alır. Sizin doğum haritalı kombinasyonuyla, 
                        bugün özel bir anlamı vardır. Bu tavsiyeler, sizi hayatın dengesini bulmanıza ve günlük zorlukları aşmanıza yardımcı olmak için sunulmuştur.
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
