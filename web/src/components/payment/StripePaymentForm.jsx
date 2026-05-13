import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { motion } from "framer-motion";
import { Zap, Loader, X } from "lucide-react";
import { increaseBalance } from "../../store/tokensSlice";
import paymentService from "../../services/paymentService";

export default function StripePaymentForm({ selectedPackage, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cardholderName, setCardholderName] = useState("");

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setError("Stripe yüklenmedi");
      return;
    }

    if (!cardholderName.trim()) {
      setError("Lütfen adınızı girin");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Payment intent'i backend'den al
      const response = await paymentService.createTokenPaymentIntent(selectedPackage.id);

      if (!response.data || !response.data.client_secret) {
        setError("Ödeme işlemi başlatılamadı");
        setIsLoading(false);
        return;
      }

      // Stripe ile ödeme işlemini tamamla
      const result = await stripe.confirmCardPayment(
        response.data.client_secret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: cardholderName,
            },
          },
        }
      );

      if (result.error) {
        setError(result.error.message || "Ödeme başarısız oldu");
        setIsLoading(false);
      } else if (result.paymentIntent.status === "succeeded") {
        // Ödeme başarılı - token ekle (webhook da yapacak ama frontend de de güncelleyelim)
        const tokenAmount = selectedPackage.token_amount || selectedPackage.tokens;
        dispatch(increaseBalance(tokenAmount));

        // Success mesajı göster ve yönlendir
        setTimeout(() => {
          navigate("/readings");
        }, 2000);
      } else {
        setError("Ödeme tamamlanamadı");
        setIsLoading(false);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Ödeme hatası oluştu");
      setIsLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#ffffff",
        "::placeholder": {
          color: "#a0aec0",
        },
      },
      invalid: {
        color: "#ef4444",
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-md mx-auto"
    >
      <div className="glass rounded-xl p-8 border border-primary/20">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {selectedPackage.name}
            </h2>
            <p className="text-primary text-lg font-semibold">
              ₺{selectedPackage.price}
            </p>
          </div>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="bg-white/5 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-400 mb-2">Alacağınız Token</p>
          <p className="text-3xl font-bold text-primary flex items-center gap-2">
            <Zap size={28} />
            {selectedPackage.token_amount || selectedPackage.tokens}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 glass rounded-lg border border-red-500/30 bg-red-500/10">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        <form onSubmit={handlePayment} className="space-y-4">
          {/* Cardholder Name */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Kart Sahibinin Adı
            </label>
            <input
              type="text"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-2.5 glass rounded-lg border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition disabled:opacity-50"
              placeholder="Adınız ve Soyadınız"
            />
          </div>

          {/* Card Element */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Kart Bilgileri
            </label>
            <div className="px-4 py-3 glass rounded-lg border border-white/10">
              <CardElement
                options={cardElementOptions}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Payment Button */}
          <button
            type="submit"
            disabled={isLoading || !stripe || !elements}
            className="w-full px-4 py-3 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader size={18} className="animate-spin" />
                İşleniyor...
              </>
            ) : (
              <>
                <Zap size={18} />
                ₺{selectedPackage.price} Öde
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="w-full px-4 py-3 bg-white/5 text-white font-semibold rounded-lg hover:bg-white/10 transition disabled:opacity-50"
          >
            İptal
          </button>
        </form>

        {/* Security Badge */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            🔒 Tüm işlemler Stripe tarafından güvenli hale getirilir
          </p>
        </div>
      </div>
    </motion.div>
  );
}
