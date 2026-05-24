import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark-bg border-t border-light-bg mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <img 
              src="/assets/icons/CosmoFinder-long.png" 
              alt="CosmoFinder"
              className="h-10 object-contain mb-4"
            />
            <p className="text-gray-400 text-sm">
              Kaderini keşfet, geleceğini aydınlat. En güvenilir fal platformu.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Hızlı Bağlantılar</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link to="/" className="hover:text-primary transition">
                  Anasayfa
                </Link>
              </li>
              <li>
                <Link to="/support" className="hover:text-primary transition">
                  Destek
                </Link>
              </li>
              <li>
                <a href="#download" className="hover:text-primary transition">Uygulamayı İndir</a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Yasal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link to="/privacy-policy" className="hover:text-primary transition">
                  Gizlilik Politikası
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-primary transition">
                  Kullanım Şartları
                </Link>
              </li>
              <li>
                <Link to="/support" className="hover:text-primary transition">
                  Destek
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">İletişim</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>info@cosmofinder.com</li>
              <li>Cihan Sancak</li>
              <li>Bandırma / Balıkesir</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-light-bg pt-8 text-center text-gray-500">
          <p className="text-xs">
            © {currentYear} COSMO FINDER. Tüm hakları saklıdır. | Eğlence amaçlıdır.
          </p>
        </div>
      </div>
    </footer>
  );
}
