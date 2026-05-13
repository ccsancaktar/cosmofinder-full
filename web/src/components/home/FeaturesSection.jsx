import { motion } from "framer-motion";
import { Brain, Sparkles, Moon, Zap, Shield, Star } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Yapay Zeka Destekli",
    description: "Gelişmiş AI algoritmaları ile kişiselleştirilmiş yorumlar",
  },
  {
    icon: Sparkles,
    title: "7+ Fal Türü",
    description: "Tarot, Kahve, Rune, Kabala ve daha fazlası",
  },
  {
    icon: Moon,
    title: "Günlük Yorumlar",
    description: "Her gün yeni burç ve astroloji yorumları",
  },
  {
    icon: Zap,
    title: "Anında Sonuç",
    description: "Saniyeler içinde detaylı fal yorumları",
  },
  {
    icon: Shield,
    title: "Gizlilik Öncelikli",
    description: "Verileriniz şifrelenerek güvende tutulur",
  },
  {
    icon: Star,
    title: "Premium Deneyim",
    description: "Reklamsız, sınırsız fal bakma imkanı",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-16 md:py-24 relative">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <span className="inline-block px-4 py-1.5 mb-4 text-xs font-semibold tracking-wider text-primary bg-primary/10 rounded-full border border-primary/20">
            ÖZELLİKLER
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Neden CosmoFinder?
          </h2>
          <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto">
            Modern teknoloji ile kadim bilgeliğin buluştuğu benzersiz fal deneyimi
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="group relative p-6 md:p-8 glass rounded-2xl border border-white/10 hover:border-primary/40 transition-all duration-300"
            >
              {/* Icon */}
              <motion.div
                whileHover={{ rotate: 10 }}
                className="w-12 h-12 md:w-14 md:h-14 mb-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors"
              >
                <feature.icon className="w-6 h-6 md:w-7 md:h-7 text-primary" />
              </motion.div>

              <h3 className="text-lg md:text-xl font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm md:text-base text-gray-400">
                {feature.description}
              </p>

              {/* Hover Glow */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
