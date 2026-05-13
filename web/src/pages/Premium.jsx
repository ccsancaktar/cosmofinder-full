import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Button from "../components/common/Button";
import StarField from "../components/home/StarField";
import { Check } from "lucide-react";
import { useState } from "react";
import API from "../services/api";

const plans = [
  {
    id: "free",
    name: "Temel Plan",
    price: "₺0",
    period: "Ücretsiz",
    popular: false,
    features: [
      "5 günlük video",
      "Token ile fal okuma",
      "Temel özellikler",
      "Reklam gösterimi",
    ],
    action: "Aktif Plan",
  },
  {
    id: "premium_monthly",
    name: "Premium",
    price: "₺39.99",
    period: "Aylık",
    popular: true,
    features: [
      "✓ Sınırsız fal çekme",
      "✓ Reklamsız deneyim",
      "✓ Detaylı yorumlar",
      "✓ Fal geçmişi",
      "✓ İstatistikler",
    ],
    action: "Premium'a Geç",
    yearlyId: "premium_yearly",
    yearlyPrice: "₺399.99",
  },
  {
    id: "premium_plus_monthly",
    name: "Premium+",
    price: "₺49.99",
    period: "Aylık",
    popular: false,
    features: [
      "✓ Premium özellikleri",
      "✓ Özel fal uzmanı",
      "✓ Video seansları",
      "✓ VIP içerikler",
      "✓ Öncelikli destek",
    ],
    action: "Premium+a Yükselt",
    yearlyId: "premium_plus_yearly",
    yearlyPrice: "₺499.99",
  },
];

const paymentService = {
  createPremiumPayment: async (planId) => {
    return API.post('/payment/create-premium-subscription', {
      plan_type: planId
    });
  }
};

export default function Premium() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [isYearly, setIsYearly] = useState(false);

  const handleUpgrade = async (planId) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (planId === "free") {
      return; // Free planı kapat
    }

    try {
      // Premium ödeme intent'i oluştur
      const response = await paymentService.createPremiumPayment(planId);
      const paymentData = response.data;
      
      if (paymentData.client_secret) {
        // Payment sayfasına yönlendir
        navigate("/payment", {
          state: {
            paymentData: paymentData,
            packageInfo: {
              name: `Premium - ${planId}`,
              price: paymentData.amount,
              plan_type: planId
            }
          }
        });
      } else {
        alert("Ödeme işlemi başlatılamadı");
      }
    } catch (error) {
      console.error("Premium upgrade hatası:", error);
      alert("Ödeme sistemi başlatılamadı: " + error.message);
    }
  };

  const getActivePlanId = (plan) => {
    if (plan.id === "free") return "free";
    return isYearly ? plan.yearlyId : plan.id;
  };

  return (
    <div className="min-h-screen text-white relative pt-24 md:pt-32 overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <StarField count={60} />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black font-decorative text-primary mb-4">
            Premium Planlarımız
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            Tüm fal türlerine sınırsız erişim ve ekstra özellikler
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex bg-light-bg p-1 rounded-lg mb-12">
            <button 
              onClick={() => setIsYearly(false)}
              className={`px-6 py-2 rounded font-semibold transition-all ${
                !isYearly 
                  ? "bg-primary/20 text-primary" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Aylık
            </button>
            <button 
              onClick={() => setIsYearly(true)}
              className={`px-6 py-2 rounded font-semibold transition-all ${
                isYearly 
                  ? "bg-primary/20 text-primary" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Yıllık <span className="text-primary">(-20%)</span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                plan.popular
                  ? "border-primary shadow-gold md:scale-105"
                  : "border-light-bg hover:border-primary"
              }`}
            >
              {plan.popular && (
                <div className="bg-gradient-to-r from-primary to-yellow-500 text-dark-bg text-center py-2 font-bold text-sm">
                  EN POPÜLER
                </div>
              )}

              <div className="bg-light-bg p-8 h-full flex flex-col">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {plan.name}
                </h3>

                <div className="mb-6">
                  <div className="text-4xl font-bold text-primary">
                    {isYearly ? plan.yearlyPrice : plan.price}
                  </div>
                  <div className="text-sm text-gray-400">
                    {isYearly ? "Yıllık" : "Aylık"}
                    {isYearly && plan.yearlyPrice && (
                      <div className="text-xs mt-2 text-primary">
                        Aylık {(parseFloat(plan.yearlyPrice.replace('₺', '').replace('.', ',').replace(',', '.')) / 12).toFixed(2)} ₺
                      </div>
                    )}
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-grow">
                  {plan.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className="text-gray-300 flex items-start gap-2"
                    >
                      <Check size={20} className="text-success flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleUpgrade(getActivePlanId(plan))}
                  variant={plan.popular ? "primary" : "secondary"}
                  className="w-full"
                  disabled={plan.id === "free"}
                >
                  {plan.action}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="bg-light-bg rounded-2xl p-8 mb-16">
          <h2 className="text-2xl font-bold text-primary mb-8 text-center">
            Özellikler Karşılaştırması
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-bg">
                  <th className="text-left py-4 px-4 text-white">Özellik</th>
                  <th className="text-center py-4 px-4 text-white">Temel</th>
                  <th className="text-center py-4 px-4 text-primary font-bold">
                    Premium
                  </th>
                  <th className="text-center py-4 px-4 text-white">Premium+</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: "Günlük Video Limit", basic: "5", premium: "∞", plus: "∞" },
                  { feature: "Token Yapımı", basic: "5 Bonus", premium: "∞ Sınırsız", plus: "∞ Sınırsız" },
                  { feature: "Reklam", basic: "Var", premium: "Yok", plus: "Yok" },
                  { feature: "Fal Geçmişi", basic: "30 gün", premium: "∞ Sınırsız", plus: "∞ Sınırsız" },
                  { feature: "Detaylı Yorumlar", basic: "Temel", premium: "Detaylı", plus: "Kapsamlı" },
                  { feature: "Video Seansları", basic: "-", premium: "-", plus: "✓" },
                  { feature: "Özel Uzman", basic: "-", premium: "-", plus: "✓" },
                  { feature: "VIP İçerikler", basic: "-", premium: "-", plus: "✓" },
                ].map((row, idx) => (
                  <tr key={idx} className="border-b border-dark-bg">
                    <td className="py-4 px-4 text-gray-300">{row.feature}</td>
                    <td className="py-4 px-4 text-center text-gray-400">
                      {row.basic}
                    </td>
                    <td className="py-4 px-4 text-center text-primary font-semibold">
                      {row.premium}
                    </td>
                    <td className="py-4 px-4 text-center text-gray-300">
                      {row.plus}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/50 rounded-2xl p-12">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">
            Sık Sorulan Sorular
          </h2>

          <div className="space-y-6">
            {[
              {
                q: "Premium'ı istediğim zaman iptal edebilir miyim?",
                a: "Evet, herhangi bir zaman iptal edebilirsiniz. İptal sonrası geri ödeme talep edebilirsiniz.",
              },
              {
                q: "Ödeme yöntemi nedir?",
                a: "Stripe üzerinden güvenli ödeme kabul ederiz. Kredi kartı ve diğer ödeme yöntemleri mevcuttur.",
              },
              {
                q: "Token nedir?",
                a: "Token, platforma giriş yaparak fal çekmek için kullanılan sanal paradır. Premium ile sınırsız kullanılır.",
              },
            ].map((item, idx) => (
              <div key={idx}>
                <h3 className="text-lg font-bold text-primary mb-2">{item.q}</h3>
                <p className="text-gray-300">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
