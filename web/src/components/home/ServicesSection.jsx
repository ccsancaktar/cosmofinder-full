import { motion } from "framer-motion";
import tarotImg from "../../assets/tarot.jpg";
import yildiznameImg from "../../assets/yildizname.jpg";
import kahveImg from "../../assets/kahve-fali.jpg";
import kablImg from "../../assets/kabala.jpg";
import runeImg from "../../assets/rune.jpg";
import cinImg from "../../assets/cin-fali.jpg";

const fortuneServices = [
  {
    id: "gunluk",
    title: "Günlük Fal",
    description: "Burcuna göre günlük astroloji yorumun",
    image: tarotImg,
    featured: true,
  },
  {
    id: "yildizname",
    title: "Yıldızname",
    description: "Doğum bilgilerinizle detaylı astroloji yorumu",
    image: yildiznameImg,
    featured: false,
  },
  {
    id: "kahve",
    title: "Kahve Falı",
    description: "Kahve fincanı fotoğrafı ile geleneksel fal",
    image: kahveImg,
    featured: false,
  },
  {
    id: "tarot",
    title: "Tarot",
    description: "78 kartlık tarot destesi ile gelecek yorumu",
    image: tarotImg,
    featured: false,
  },
  {
    id: "kabala",
    title: "Kabala",
    description: "İbrani mistik geleneği ile ruhsal yorum",
    image: kablImg,
    featured: false,
  },
  {
    id: "rune",
    title: "Rune",
    description: "Eski Viking rünleriyle gelecek yorumu",
    image: runeImg,
    featured: false,
  },
  {
    id: "cin",
    title: "Çin Falı",
    description: "Çin astrolojisi ile element analizi",
    image: cinImg,
    featured: false,
  },
];

function FortuneCard({ title, description, image, featured = false, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.03, y: -5 }}
      className={`relative overflow-hidden rounded-2xl border border-white/10 glass cursor-pointer group transition-all duration-300 hover:border-primary/30 ${
        featured ? "md:col-span-2 md:row-span-2" : "col-span-1"
      }`}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-300"
        />
      </div>

      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-dark-bg/60 to-secondary/20 opacity-80 group-hover:opacity-90 transition-opacity duration-300" />

      {/* Content */}
      <div className={`relative z-10 flex flex-col justify-between p-5 md:p-6 ${
        featured ? "h-52 md:h-64" : "h-44 md:h-52"
      }`}>
        {/* Top Content */}
        <div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: delay + 0.1 }}
            className="mb-3"
          >
            <span className="inline-block px-2.5 py-1 text-[10px] font-semibold tracking-wider text-primary bg-primary/20 rounded-full">
              AI DESTEKLİ
            </span>
          </motion.div>

          <h3 className="text-xl md:text-2xl font-bold text-white mb-1.5">
            {title}
          </h3>
          <p className="text-sm text-gray-400 line-clamp-2">
            {description}
          </p>
        </div>

        {/* Arrow on Hover */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          whileHover={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-primary text-sm font-semibold"
        >
          <span>Keşfet</span>
          <span>→</span>
        </motion.div>
      </div>

      {/* Hover Border Glow */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none border-2 border-primary/30" />
    </motion.div>
  );
}

export default function ServicesSection() {
  return (
    <section id="services" className="py-16 md:py-24 relative">
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
            FAL TÜRLERİ
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Kozmik Rehberliğiniz
          </h2>
          <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto">
            7 farklı mistik gelenekten yapay zeka destekli kişiselleştirilmiş yorumlar
          </p>
        </motion.div>

        {/* Fortune Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto">
          {fortuneServices.map((service, index) => (
            <FortuneCard
              key={service.id}
              title={service.title}
              description={service.description}
              image={service.image}
              featured={service.featured}
              delay={index * 0.08}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
