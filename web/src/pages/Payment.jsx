import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useStripe, useElements, PaymentElement, Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { motion } from "framer-motion";
import { Zap, Check, AlertCircle, ArrowRight, Loader } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setBalance } from "../store/tokensSlice";
import StarField from "../components/home/StarField";
import tokensService from "../services/tokensService";
import API from "../services/api";
import { STRIPE_PUBLIC_KEY } from "../config/env";

const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

function PaymentContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const stripe = useStripe();
  const elements = useElements();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const paymentData = location.state?.paymentData;
  const packageInfo = location.state?.packageInfo;
  const { balance } = useSelector((state) => state.tokens);

  // Eğer payment data yoksa home'a yönlendir
  useEffect(() => {
    if (!paymentData || !packageInfo) {
      navigate("/add-balance");
    }
  }, [paymentData, packageInfo, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Ödemeyi onayla
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

      if (stripeError) {
        setError(stripeError.message || "Ödeme işlemi başarısız oldu");
        setIsLoading(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        setSuccess(true);
        
        // Ödeme türüne göre işlem yap
        if (packageInfo.plan_type) {
          // Premium subscription ödemesi
          try {
            const planType = packageInfo.plan_type;
            const paymentIntentId = paymentIntent.id;
            
            console.log('💎 Premium subscription aktivasyonu yapılıyor:', { planType, paymentIntentId });
            
            // Backend'e premium activation isteği gönder
            const response = await API.post('/payment/manual-premium-activate', {
              plan_type: planType,
              payment_intent_id: paymentIntentId
            });
            
            console.log('✅ Premium aktivasyonu başarılı:', response.data);
          } catch (err) {
            console.error("Premium activation hatası:", err);
          }
        } else {
          // Token satın alma ödemesi
          try {
            const packageInfo_data = location.state?.packageInfo;
            const paymentData_data = location.state?.paymentData;
            
            if (packageInfo_data && paymentData_data) {
              const tokenAmount = packageInfo_data.tokens || 0;
              const packageId = paymentData_data.package?.id || 'web_package';
              const paymentIntentId = paymentIntent.id;
              
              console.log('📦 Manuel token yükleme yapılıyor:', { packageId, tokenAmount, paymentIntentId });
              
              // Backend'e token yükleme isteği gönder (webhook'u bypass et)
              const response = await API.post('/payment/manual-token-load', {
                package_id: packageId,
                token_amount: tokenAmount,
                payment_intent_id: paymentIntentId
              });
              
              console.log('✅ Token yüklendi:', response.data);
              dispatch(setBalance(response.data.new_balance));
            }
          } catch (err) {
            console.error("Token yükleme hatası:", err);
            // Fallback: balance'ı kontrol et
            try {
              const tokenRes = await tokensService.getBalance();
              if (tokenRes?.data?.balance) {
                dispatch(setBalance(tokenRes.data.balance));
              }
            } catch (fallbackErr) {
              console.error("Fallback balance hatası:", fallbackErr);
            }
          }
        }

        // 2 saniye sonra dashboard'a yönlendir
        setTimeout(() => {
          if (packageInfo.plan_type) {
            navigate("/premium", { replace: true });
          } else {
            navigate("/dashboard", { replace: true });
          }
        }, 2000);
      }
    } catch (err) {
      setError(err.message || "Beklenmeyen bir hata oluştu");
      setIsLoading(false);
    }
  };

  if (!paymentData || !packageInfo) {
    return null;
  }

  return (
    <div className="min-h-screen text-white relative">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <StarField count={60} />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      </div>

      <div className="flex items-center justify-center py-12 px-4 min-h-screen pt-24 md:pt-32">
        <div className="max-w-md w-full">
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass rounded-2xl border border-primary/20 p-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Check size={32} className="text-green-400" />
              </motion.div>

              <h2 className="text-2xl font-bold mb-2">Ödeme Başarılı!</h2>
              <p className="text-gray-400 mb-4">
                {packageInfo.plan_type 
                  ? `Premium paketiniz aktivasyonu başarılı!`
                  : `${packageInfo.tokens} token hesabınıza eklendi.`
                }
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Paket:</span>
                  <span className="font-semibold">{packageInfo.name}</span>
                </div>
                {!packageInfo.plan_type && (
                  <>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Token:</span>
                      <span className="font-semibold text-primary flex items-center gap-1">
                        <Zap size={16} />
                        {packageInfo.tokens}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Toplam Bakiye:</span>
                      <span className="font-semibold text-primary">
                        {balance}
                      </span>
                    </div>
                  </>
                )}
              </div>

              <p className="text-sm text-gray-400 mb-4">
                Anında Dashboard'a yönlendiriliyorsunuz...
              </p>
            </motion.div>
          ) : (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* Paket Özeti */}
              <motion.div
                className="glass rounded-xl border border-primary/20 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{packageInfo.name}</h3>
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Zap size={20} className="text-primary" />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Token:</span>
                    <span className="font-semibold">{packageInfo.tokens}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Fiyat:</span>
                    <span className="font-semibold text-primary">
                      ₺{packageInfo.price}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Hata Mesajı */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-xl border border-red-500/30 bg-red-500/10 p-4 flex items-start gap-3"
                >
                  <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-400">Hata</p>
                    <p className="text-sm text-red-300/80">{error}</p>
                  </div>
                </motion.div>
              )}

              {/* Stripe Payment Form */}
              <motion.div
                className="glass rounded-xl border border-primary/20 p-6"
              >
                <h4 className="font-semibold mb-4">Ödeme Bilgileri</h4>
                <PaymentElement />
              </motion.div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading || !stripe || !elements}
                type="submit"
                className="w-full py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "linear-gradient(135deg, rgb(139, 92, 246) 0%, rgb(168, 85, 247) 100%)",
                }}
              >
                {isLoading ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    İşleniyor...
                  </>
                ) : (
                  <>
                    ₺{packageInfo.price} Öde
                    <ArrowRight size={20} />
                  </>
                )}
              </motion.button>

              {/* Güvenlik Notu */}
              <p className="text-xs text-gray-400 text-center">
                Ödemeniz Stripe tarafından güvenli bir şekilde işlenir.
              </p>

              {/* Geri Buton */}
              <button
                type="button"
                onClick={() => navigate("/add-balance")}
                disabled={isLoading}
                className="w-full py-2 border border-gray-600 text-gray-400 hover:text-white rounded-lg transition-colors disabled:opacity-50"
              >
                Geri Dön
              </button>
            </motion.form>
          )}
        </div>
      </div>
    </div>
  );
}

function Payment() {
  const location = useLocation();
  const paymentData = location.state?.paymentData;

  if (!paymentData || !paymentData.client_secret) {
    return null;
  }

  const options = {
    clientSecret: paymentData.client_secret,
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentContent />
    </Elements>
  );
}

export default Payment;
