import { motion } from "framer-motion";
import Button from "../common/Button";

export default function CTASection() {
  const scrollToDownload = () => {
    document.getElementById("download")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
        <motion.div
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-radial from-primary/20 to-transparent blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Emoji */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-6xl md:text-7xl mb-6"
          >
            🔮
          </motion.div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black font-decorative text-white mb-4">
            Kozmik Yolculuğuna
            <span className="gradient-text"> Bugün Başla</span>
          </h2>

          <p className="text-gray-400 text-base md:text-lg max-w-xl mx-auto mb-8">
            CosmoFinder’ı telefonuna indir, hesabını uygulama içinde oluştur ve
            yapay zeka destekli spiritüel yorumlarla tanış.
          </p>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant="primary"
              size="lg"
              onClick={scrollToDownload}
              className="inline-flex items-center gap-2"
            >
              İndirmeye Git
              <span>→</span>
            </Button>
          </motion.div>

          <p className="text-xs text-gray-400 mt-4">
            Mobil uygulama üzerinden erişim • Yakında mağazalarda
          </p>
        </motion.div>
      </div>
    </section>
  );
}
