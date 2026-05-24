import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const navItems = [
  { label: "Ana Sayfa", href: "#hero" },
  { label: "Özellikler", href: "#features" },
  { label: "İndir", href: "#download" },
  { label: "Destek", to: "/support" },
  { label: "Gizlilik", to: "/privacy-policy" },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/60 to-black/40 backdrop-blur-xl border-b border-white/20 shadow-2xl shadow-black/50"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16 md:h-20 px-4 md:px-8">
        <Link to="/">
          <motion.div className="flex items-center gap-2" whileHover={{ scale: 1.02 }}>
            <img
              src="/assets/icons/CosmoFinder-long.png"
              alt="CosmoFinder"
              className="h-8 md:h-10 object-contain"
            />
          </motion.div>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) =>
            item.to ? (
              <motion.div key={item.label} whileHover={{ y: -2 }}>
                <Link
                  to={item.to}
                  className="text-sm font-medium text-gray-300 hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
              </motion.div>
            ) : (
              <motion.a
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-gray-300 hover:text-primary transition-colors"
                whileHover={{ y: -2 }}
              >
                {item.label}
              </motion.a>
            )
          )}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="#download"
            className="px-5 py-2.5 text-sm font-semibold bg-primary text-white rounded-lg"
          >
            Uygulamayı Keşfet
          </motion.a>
        </div>

        <motion.button
          whileTap={{ scale: 0.9 }}
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-white/10"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </motion.button>
      </div>

      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-gradient-to-b from-black/60 to-black/40 backdrop-blur-xl border-b border-white/20"
        >
          <nav className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-2">
            {navItems.map((item) =>
              item.to ? (
                <Link
                  key={item.label}
                  to={item.to}
                  className="px-4 py-3 text-sm font-medium text-gray-300 hover:text-primary hover:bg-white/5 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  key={item.label}
                  href={item.href}
                  className="px-4 py-3 text-sm font-medium text-gray-300 hover:text-primary hover:bg-white/5 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              )
            )}

            <div className="mt-2 pt-2 border-t border-white/10">
              <a
                href="#download"
                onClick={() => setIsMenuOpen(false)}
                className="block w-full px-4 py-2.5 text-center text-sm font-semibold bg-primary text-white rounded-lg"
              >
                Uygulamayı Keşfet
              </a>
            </div>
          </nav>
        </motion.div>
      )}
    </motion.header>
  );
}
