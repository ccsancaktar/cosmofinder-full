import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Crown, TrendingUp, AlertCircle, Check, Loader, Sparkles, Gift, Flame, Target } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { setBalance } from "../store/tokensSlice";
import Button from "../components/common/Button";
import StarField from "../components/home/StarField";
import tokensService from "../services/tokensService";

function AddBalanceContent() {
  const navigate = useNavigate();
  const { balance } = useSelector((state) => state.tokens);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [packages, setPackages] = useState([]);
  const [packagesLoading, setPackagesLoading] = useState(true);

  // Packages'ı backend'den yükle
  useEffect(() => {
    const loadPackages = async () => {
      try {
        const response = await tokensService.getPackages();
        if (response.data && response.data.packages) {
          // Geçersiz paketleri filtrele
          const validPackages = response.data.packages.filter(pkg => 
            pkg.name && pkg.token_amount && pkg.price !== undefined
          );
          setPackages(validPackages);
        }
      } catch (err) {
        console.error("Paketler yüklenemedi:", err);
        setError("Paketler yüklenemedi");
      } finally {
        setPackagesLoading(false);
      }
    };

    loadPackages();
  }, []);

  const handleSelectPackage = async (pkg) => {
    // Paket ID kontrolü
    if (!pkg || !pkg.id) {
      setError('Geçersiz paket seçimi. Lütfen tekrar deneyin.');
      return;
    }

    setSelectedPackage(pkg.id);
    setError(null);
    setLoading(true);

    try {
      // Ödeme intent'i oluştur
      const response = await tokensService.createTokenPayment({
        package_id: pkg.id
      });

      // Response ve client_secret kontrolü
      if (!response || !response.data) {
        console.error('Payment API response hatası:', response);
        setError('Ödeme sistemi yanıt vermedi. Lütfen tekrar deneyin.');
        setLoading(false);
        setSelectedPackage(null);
        return;
      }

      if (!response.data.client_secret) {
        console.error('Client secret hatası:', response.data);
        const errorMsg = response.data.error || response.data.details || 'Ödeme intent oluşturulamadı. Lütfen daha sonra tekrar deneyin.';
        setError(errorMsg);
        setLoading(false);
        setSelectedPackage(null);
        return;
      }

      // Payment sayfasına yönlendir
      navigate("/payment", { 
        state: { 
          paymentData: response.data,
          packageInfo: {
            name: pkg.name,
            tokens: pkg.token_amount,
            price: pkg.price
          }
        } 
      });
    } catch (err) {
      // Daha detaylı hata mesajı
      console.error('Ödeme hatası detayları:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        fullError: err
      });
      
      let errorMessage = 'Ödeme başlatılamadı';
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.details) {
        errorMessage = `${err.response.data.error}: ${err.response.data.details}`;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setLoading(false);
      setSelectedPackage(null);
    }
  };

  return (
    <div className="min-h-screen text-white relative py-12 px-4 overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <StarField count={60} />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10 mt-12 pt-8">

        {/* Premium Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-12 w-full"
        >
          <div className="glass rounded-2xl border-2 border-amber-400/50 p-6 backdrop-blur-xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 shadow-lg shadow-amber-400/20">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Left Side */}
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-500/30 rounded-xl">
                  <Crown size={28} className="text-amber-300" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-amber-300">PREMIUM ÜYELİK</h3>
                  <p className="text-sm text-amber-100">Fal çekişlerinde 2x token kazanın</p>
                </div>
              </div>

              {/* Features */}
              <div className="hidden lg:flex items-center gap-6 flex-1 pl-6 border-l border-amber-400/20">
                <div className="flex items-center gap-2">
                  <Check size={16} className="text-green-400" />
                  <span className="text-xs text-amber-100">2x Token</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={16} className="text-green-400" />
                  <span className="text-xs text-amber-100">Sınırsız Fal</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={16} className="text-green-400" />
                  <span className="text-xs text-amber-100">Reklamsız</span>
                </div>
              </div>

              {/* Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/premium")}
                className="px-8 py-3 bg-gradient-to-r from-amber-400 to-orange-400 text-gray-900 font-bold rounded-xl hover:shadow-lg hover:shadow-amber-400/50 transition-all flex items-center gap-2 whitespace-nowrap"
              >
                <Sparkles size={18} />
                Şimdi Yükselt
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 glass rounded-xl border border-red-500/30 bg-red-500/10 flex items-start gap-3"
          >
            <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-1" />
            <div>
              <p className="font-semibold text-red-400">Hata</p>
              <p className="text-sm text-red-300">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Packages Grid */}
        {packagesLoading ? (
          <div className="flex justify-center items-center py-16">
            <Loader className="animate-spin text-primary" size={32} />
          </div>
        ) : packages.length > 0 ? (
          <>
            <div className="mb-6">
              <p className="text-center text-gray-400 text-sm">
                <Flame size={16} className="inline mr-2 text-orange-400" />
                Her paket için en iyi fiyat garantisi
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-16">
              {packages.map((pkg, idx) => {
                // En düşük fiyat/token oranına sahip paket
                const bestValue = packages.reduce((best, current) => {
                  const bestRatio = best.price / (best.token_amount / 100);
                  const currentRatio = current.price / (current.token_amount / 100);
                  return currentRatio < bestRatio ? current : best;
                });
                
                const isBestValue = pkg.id === bestValue.id;
                const pricePerHundred = pkg.price / (pkg.token_amount / 100);
                const bestValuePrice = bestValue.price / (bestValue.token_amount / 100);
                const savings = Math.round(((bestValuePrice - pricePerHundred) / bestValuePrice) * 100);
                
                return (
                  <motion.div
                    key={pkg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: idx * 0.08 }}
                    className="h-full"
                  >
                    <div
                      className={`h-full glass rounded-2xl border-2 overflow-hidden transition-all duration-300 hover:shadow-2xl flex flex-col group relative ${
                        isBestValue
                          ? 'border-amber-400/50 shadow-lg shadow-amber-400/20 md:scale-105 md:z-10'
                          : 'border-white/10 hover:border-primary/50'
                      }`}
                    >
                      {/* Best Value Badge */}
                      {isBestValue && (
                        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Crown size={16} className="animate-bounce" />
                            <span className="text-xs font-black tracking-wider">EN İYİ FİYAT</span>
                          </div>
                        </div>
                      )}

                      {/* Package Content */}
                      <div className={`p-5 flex flex-col flex-1 ${isBestValue ? 'pt-12' : ''}`}>
                        {/* Package Name */}
                        <h3 className="text-lg font-bold text-white mb-3">{pkg.name}</h3>

                        {/* Token Amount */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-3xl font-black gradient-text">{pkg.token_amount.toLocaleString()}</span>
                            {isBestValue && savings > 0 && (
                              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded">
                                %{savings} en iyi
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400">Token</p>
                        </div>

                        {/* Price */}
                        <div className={`mb-4 pb-4 border-b ${isBestValue ? 'border-amber-400/20' : 'border-white/10'}`}>
                          <p className="text-3xl font-black text-white">₺{pkg.price}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            ₺{pricePerHundred.toFixed(2)}/100 Token
                          </p>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-gray-400 mb-4 flex-1 line-clamp-2">
                          {pkg.description}
                        </p>

                        {/* Button */}
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSelectPackage(pkg)}
                          disabled={loading && selectedPackage === pkg.id}
                          className={`w-full py-2.5 rounded-lg font-bold transition-all duration-300 flex items-center justify-center gap-2 text-sm ${
                            isBestValue
                              ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-gray-900 hover:shadow-lg hover:shadow-amber-400/50 disabled:opacity-70'
                              : 'glass border border-white/20 hover:border-primary/50 hover:bg-primary/5 disabled:opacity-70'
                          }`}
                        >
                          {loading && selectedPackage === pkg.id ? (
                            <>
                              <Loader size={16} className="animate-spin" />
                              İşleniyor...
                            </>
                          ) : (
                            <>
                              <Zap size={16} />
                              Satın Al
                            </>
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-400">Paketler yüklenemedi</p>
          </div>
        )}


        {/* FAQ & Support Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-3">Sık Sorulan Sorular</h3>
            <p className="text-gray-400">Token satın alma hakkında merak ettikleriniz</p>
          </div>

          <div className="space-y-4">
            {[
              {
                icon: '⏰',
                q: 'Tokenler ne kadar süre geçerli?',
                a: 'Satın aldığınız tokenler kalıcı olarak hesabınızda kalır. Hiçbir zaman sona ermez!'
              },
              {
                icon: '💳',
                q: 'Hangi ödeme yöntemlerini kabul ediyorsunuz?',
                a: 'Visa, Mastercard, American Express, Apple Pay ve Google Pay ile ödeme yapabilirsiniz.'
              },
              {
                icon: '🔄',
                q: 'Para iadesine hakette miyim?',
                a: '30 gün içinde para iade politikamız bulunmaktadır. Destek ekibimizle iletişime geçin.'
              },
              {
                icon: '🔒',
                q: 'Ödemelerim güvenli mi?',
                a: 'Evet! Tüm ödemeler 256-bit SSL şifrelemesi ile korunuyor. Stripe tarafından işleniyor.'
              },
              {
                icon: '👑',
                q: 'Premium üyelik ne kazandırıyor?',
                a: 'Premium ile her fal çekişinde 2x token kazanırsınız, sınırsız fal çeker ve reklamsız deneyim elde edersiniz.'
              }
            ].map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.65 + idx * 0.05 }}
                className="glass rounded-xl border border-white/10 p-6 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <span className="text-2xl flex-shrink-0">{faq.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-bold text-white mb-2">{faq.q}</h4>
                    <p className="text-gray-400 text-sm">{faq.a}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function AddBalance() {
  return <AddBalanceContent />;
}

