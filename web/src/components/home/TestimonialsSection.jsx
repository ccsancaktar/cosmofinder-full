import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Ayşe K.",
    role: "Premium Üye",
    avatar: "👩‍💼",
    content: "Kahve falı yorumları inanılmaz detaylı. Sanki karşımda gerçek bir falcı varmış gibi hissettirdi.",
    rating: 5,
  },
  {
    id: 2,
    name: "Mehmet Y.",
    role: "2 Yıllık Üye",
    avatar: "👨‍💻",
    content: "Tarot yorumları her zaman tutarlı ve anlamlı. Günlük hayatımda bana rehberlik ediyor.",
    rating: 5,
  },
  {
    id: 3,
    name: "Zeynep A.",
    role: "Premium Üye",
    avatar: "👩‍🎨",
    content: "Yıldızname özelliği muhteşem! Doğum haritam hakkında çok şey öğrendim.",
    rating: 5,
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-16 md:py-24 relative bg-white/5">
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
            KULLANICI YORUMLARI
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Kullanıcılarımız Ne Diyor?
          </h2>
          <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto">
            500.000+ kullanıcının güvendiği CosmoFinder ile mistik yolculuğunuza başlayın
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="relative p-6 md:p-8 glass rounded-2xl border border-white/10 hover:border-primary/30 transition-all duration-300"
            >
              {/* Quote Icon */}
              <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Quote className="w-5 h-5 text-primary" />
              </div>

              {/* Rating */}
              <div className="flex items-center gap-0.5 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-primary fill-primary" size={16} />
                ))}
              </div>

              {/* Content */}
              <p className="text-white text-sm md:text-base mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center text-2xl">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-white">{testimonial.name}</div>
                  <div className="text-xs text-gray-400">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mt-12"
        >
          <div className="flex items-center gap-2 text-gray-400">
            <span className="text-2xl">🔒</span>
            <span className="text-sm">SSL Güvenlik</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <span className="text-2xl">🛡️</span>
            <span className="text-sm">KVKK Uyumlu</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <span className="text-2xl">⭐</span>
            <span className="text-sm">4.9 App Store</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <span className="text-2xl">✅</span>
            <span className="text-sm">500K+ İndirme</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
