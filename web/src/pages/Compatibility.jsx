import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import FortunePageShell from "../components/layout/FortunePageShell";
import Button from "../components/common/Button";
import API from "../services/api";
import authService from "../services/authService";
import { setBalance } from "../store/tokensSlice";
import { Toast } from "../components/common/Toast";
import { useAuth } from "../hooks/useAuth";

function CompatibilityContent() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const tokenBalance = useSelector((state) => state.tokens.balance);
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    kisi1Isim: "",
    kisi1DogumTarihi: "",
    kisi2Isim: "",
    kisi2DogumTarihi: "",
    iliskiTuru: "ask",
  });
  const [submitting, setSubmitting] = useState(false);
  const language = user?.language || "tr";
  const profileName = user?.name || [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim();
  const profileBirthDate = user?.birth_date || "";

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const useMyProfile = () => {
    setFormData((prev) => ({
      ...prev,
      kisi1Isim: profileName || prev.kisi1Isim,
      kisi1DogumTarihi: profileBirthDate || prev.kisi1DogumTarihi,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const response = await API.post("/compatibility", { ...formData, language });
      const balanceRes = await authService.getTokenBalance().catch(() => null);
      if (balanceRes?.data?.balance !== undefined) {
        dispatch(setBalance(balanceRes.data.balance));
      }
      navigate("/reading/compatibility", { state: response.data });
    } catch (error) {
      Toast.error(error.response?.data?.error || "Uyum analizi oluşturulamadı.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FortunePageShell
      title="Uyum Analizi"
      subtitle="İki kişi arasındaki çekim, iletişim akışı ve zorlu alanları keşfet."
      tokenBalance={tokenBalance}
    >
      <form onSubmit={handleSubmit} className="glass rounded-3xl border border-white/10 p-8 md:p-10 space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between gap-3 mb-2">
              <label className="block text-sm text-gray-300">1. Kişi İsim</label>
              <button
                type="button"
                onClick={useMyProfile}
                className="text-xs rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-primary hover:bg-primary/20 transition"
              >
                Profilimi Kullan
              </button>
            </div>
            <input name="kisi1Isim" value={formData.kisi1Isim} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-2">1. Kişi Doğum Tarihi</label>
            <input type="date" name="kisi1DogumTarihi" value={formData.kisi1DogumTarihi} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-2">2. Kişi İsim</label>
            <input name="kisi2Isim" value={formData.kisi2Isim} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-2">2. Kişi Doğum Tarihi</label>
            <input type="date" name="kisi2DogumTarihi" value={formData.kisi2DogumTarihi} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary" />
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-2">İlişki Türü</label>
          <select
            name="iliskiTuru"
            value={formData.iliskiTuru}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary"
          >
            <option value="ask">Aşk</option>
            <option value="arkadaslik">Arkadaşlık</option>
            <option value="genel">Genel</option>
          </select>
        </div>
        <div className="flex items-center justify-between gap-4 pt-4">
          <p className="text-sm text-gray-400">İki doğum tarihine göre enerji uyumu ve ilişki dinamiği yorumlanır.</p>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Yorumlanıyor..." : "Uyum Analizi Başlat"}
          </Button>
        </div>
      </form>
    </FortunePageShell>
  );
}

export default function Compatibility() {
  return (
    <ProtectedRoute>
      <CompatibilityContent />
    </ProtectedRoute>
  );
}
