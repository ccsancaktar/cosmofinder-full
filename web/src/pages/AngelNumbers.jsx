import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import FortunePageShell from "../components/layout/FortunePageShell";
import Button from "../components/common/Button";
import API from "../services/api";
import authService from "../services/authService";
import { setBalance } from "../store/tokensSlice";
import { Toast } from "../components/common/Toast";
import { useAuth } from "../hooks/useAuth";

function AngelNumbersContent() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const tokenBalance = useSelector((state) => state.tokens.balance);
  const { user } = useAuth();
  const [sayi, setSayi] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const language = user?.language || "tr";
  const todayNumber = useMemo(() => {
    const now = new Date();
    const seed = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
    const options = ["111", "222", "333", "444", "555", "777", "888", "999", "1111"];
    const index = Array.from(seed).reduce((sum, char) => sum + char.charCodeAt(0), 0) % options.length;
    return options[index];
  }, []);

  const submitNumber = async (numberValue) => {
    setSubmitting(true);
    try {
      const response = await API.post("/angel-numbers", { sayi: numberValue, language });
      const balanceRes = await authService.getTokenBalance().catch(() => null);
      if (balanceRes?.data?.balance !== undefined) {
        dispatch(setBalance(balanceRes.data.balance));
      }
      navigate("/reading/angel-numbers", { state: response.data });
    } catch (error) {
      Toast.error(error.response?.data?.error || "Melek sayıları yorumu oluşturulamadı.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await submitNumber(sayi);
  };

  return (
    <FortunePageShell
      title="Melek Sayıları"
      subtitle="Sık gördüğün sayı dizisinin taşıdığı kısa ama güçlü mesajı çöz."
      tokenBalance={tokenBalance}
    >
      <form onSubmit={handleSubmit} className="glass rounded-3xl border border-white/10 p-8 md:p-10 space-y-6">
        <button
          type="button"
          onClick={() => submitNumber(todayNumber)}
          className="w-full rounded-3xl border border-primary/25 bg-primary/10 p-6 text-left hover:bg-primary/15 transition"
        >
          <p className="text-xs uppercase tracking-[0.28em] text-primary/80 mb-3">Günün Sinyali</p>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-4xl font-black text-white tracking-[0.25em]">{todayNumber}</p>
              <p className="text-sm text-gray-300 mt-2">Bugün en çok karşılaşabileceğin sayı dizisini tek dokunuşla yorumla.</p>
            </div>
            <div className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-[#0D0B1F]">
              Yorumu Aç
            </div>
          </div>
        </button>
        <div>
          <label className="block text-sm text-gray-300 mb-2">Sayı Dizisi</label>
          <input
            value={sayi}
            onChange={(event) => setSayi(event.target.value)}
            required
            placeholder="111, 222, 1234..."
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary"
          />
        </div>
        <div className="flex items-center justify-between gap-4 pt-4">
          <p className="text-sm text-gray-400">Kısa, paylaşılabilir ve kişisel bir yorum alırsın.</p>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Yorumlanıyor..." : "Mesajı Aç"}
          </Button>
        </div>
      </form>
    </FortunePageShell>
  );
}

export default function AngelNumbers() {
  return (
    <ProtectedRoute>
      <AngelNumbersContent />
    </ProtectedRoute>
  );
}
