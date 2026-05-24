import { motion } from "framer-motion";
import { Apple, Play, QrCode, Smartphone } from "lucide-react";

export default function DownloadSection() {
  return (
    <section id="download" className="py-16 md:py-24 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-radial from-primary/20 to-transparent blur-3xl"
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
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 glass rounded-full border border-primary/30"
          >
            <Smartphone className="w-4 h-4 text-primary" size={16} />
            <span className="text-sm font-medium text-primary">Mobil Uygulama</span>
          </motion.div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Şimdi İndir,
            <span className="gradient-text"> Hemen Başla</span>
          </h2>

          <p className="text-gray-400 text-base md:text-lg max-w-xl mx-auto mb-10">
            CosmoFinder uygulamasını telefonuna indir, ücretsiz hesap oluştur 
            ve mistik yolculuğuna başla.
          </p>

          <div className="mb-8 inline-flex rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm text-primary">
            App Store ve Google Play bağlantıları yayınla birlikte eklenecek.
          </div>

          {/* Download Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <motion.a
              href="mailto:info@cosmofinder.com?subject=CosmoFinder%20App%20Store%20Link"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group relative flex items-center gap-4 px-8 py-5 bg-white text-dark-bg rounded-2xl font-semibold transition-all overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <Apple className="w-8 h-8 relative z-10" size={32} />
              <div className="text-left relative z-10">
                <div className="text-xs opacity-70 uppercase tracking-wider">İndir</div>
                <div className="text-lg font-bold">App Store</div>
              </div>
            </motion.a>

            <motion.a
              href="mailto:info@cosmofinder.com?subject=CosmoFinder%20Google%20Play%20Link"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group relative flex items-center gap-4 px-8 py-5 bg-white text-dark-bg rounded-2xl font-semibold transition-all overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <Play className="w-8 h-8 fill-current relative z-10" size={32} />
              <div className="text-left relative z-10">
                <div className="text-xs opacity-70 uppercase tracking-wider">Bilgi Al</div>
                <div className="text-lg font-bold">Google Play</div>
              </div>
            </motion.a>
          </div>

          {/* QR Code Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-4 px-6 py-4 glass rounded-2xl border border-white/10"
          >
            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center">
              <QrCode className="w-10 h-10 text-dark-bg" size={40} />
            </div>
            <div className="text-left">
              <div className="text-sm font-medium text-white">Bağlantı Talep Et</div>
              <div className="text-xs text-gray-400">Store bağlantıları için bize yaz</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
