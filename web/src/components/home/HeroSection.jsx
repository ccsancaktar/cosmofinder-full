import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import Button from "../common/Button";

export default function HeroSection() {
  const phoneImg = "/assets/images/mockup.png";
  return (
    <section id="hero" className="relative min-h-screen flex items-center pt-20 md:pt-0 overflow-hidden">
      {/* Background Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-primary/15 to-transparent blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-4 lg:gap-0 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 mb-6 glass rounded-full border border-primary/30"
            >
              <Sparkles className="w-4 h-4 text-primary fill-primary" size={16} />
              <span className="text-sm font-medium text-primary">500.000+ Kullanıcı</span>
            </motion.div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black font-decorative text-white mb-6 leading-tight">
              Geleceğini
              <span className="block gradient-text">Yapay Zeka</span>
              ile Keşfet
            </h1>

            {/* Description */}
            <p className="text-base md:text-lg lg:text-xl text-gray-300 mb-8 max-w-xl mx-auto lg:mx-0">
              Tarot, Kahve Falı, Rune ve daha fazlası... AI destekli kişiselleştirilmiş 
              mistik yorumlarla hayatına yön ver.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <motion.div
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button variant="primary" size="lg" className="w-full sm:w-auto">
                  <span className="flex items-center justify-center gap-2">
                    🍎 App Store'den İndir
                  </span>
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  <span className="flex items-center justify-center gap-2">
                    ▶️ Google Play'den İndir
                  </span>
                </Button>
              </motion.div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center lg:justify-start gap-6 sm:gap-8 flex-wrap">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary">4.9</div>
                <div className="flex items-center gap-0.5 justify-center mt-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-primary">⭐</span>
                  ))}
                </div>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white">2M+</div>
                <div className="text-xs text-gray-400 mt-1">Fal Yorumu</div>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white">7+</div>
                <div className="text-xs text-gray-400 mt-1">Fal Türü</div>
              </div>
            </div>
          </motion.div>

          {/* Right Content - Phone Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative flex justify-center lg:justify-end"
          >
            {/* Glow Effect */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.4, 0.6, 0.4],
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="w-64 h-64 md:w-80 md:h-80 rounded-full bg-gradient-to-br from-primary/30 to-primary/5 blur-3xl"
              />
            </div>

            {/* Phone Mockup */}
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10"
            >
              <img
                src={phoneImg}
                alt="Phone mockup"
                className="w-40 md:w-52 h-auto drop-shadow-2xl"
              />

              {/* Floating Notification - Tarot */}
              <motion.div
                animate={{ y: [-5, 5, -5], rotate: [0, 5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -right-4 md:-right-8 px-4 py-2 glass rounded-xl border border-white/20 shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🔮</span>
                  <div>
                    <div className="text-xs text-gray-400">Tarot</div>
                    <div className="text-sm font-semibold text-white">Yeni Yorum!</div>
                  </div>
                </div>
              </motion.div>

              {/* Floating Notification - Kahve Falı */}
              <motion.div
                animate={{ y: [5, -5, 5], rotate: [0, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -bottom-4 -left-4 md:-left-8 px-4 py-2 glass rounded-xl border border-white/20 shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">☕</span>
                  <div>
                    <div className="text-xs text-gray-400">Kahve Falı</div>
                    <div className="text-sm font-semibold text-primary">Hazır</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
