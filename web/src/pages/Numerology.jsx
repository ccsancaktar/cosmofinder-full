import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import FortunePageShell from "../components/layout/FortunePageShell";
import Button from "../components/common/Button";
import ReadingModePanel from "../components/readings/ReadingModePanel";
import API from "../services/api";
import authService from "../services/authService";
import { setBalance } from "../store/tokensSlice";
import { Toast } from "../components/common/Toast";
import { useAuth } from "../hooks/useAuth";

function NumerologyContent() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const tokenBalance = useSelector((state) => state.tokens.balance);
  const { user } = useAuth();
  const [readingMode, setReadingMode] = useState("self");
  const [formData, setFormData] = useState({ isim: "", dogumTarihi: "" });
  const [submitting, setSubmitting] = useState(false);
  const profileName = user?.name || [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim();
  const profileBirthDate = user?.birth_date || "";
  const canUseProfile = Boolean(profileName && profileBirthDate);
  const language = user?.language || "tr";

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        isim: readingMode === "self" ? profileName : formData.isim,
        dogumTarihi: readingMode === "self" ? profileBirthDate : formData.dogumTarihi,
        language,
        reading_for: readingMode,
      };

      if (!payload.isim?.trim()) {
        Toast.warning(readingMode === "self" ? "Profilinde isim eksik." : "İsim alanını doldur.");
        setSubmitting(false);
        return;
      }

      if (!payload.dogumTarihi) {
        Toast.warning(readingMode === "self" ? "Profilinde doğum tarihi eksik." : "Doğum tarihini seç.");
        setSubmitting(false);
        return;
      }

      const response = await API.post("/numerology", payload);
      const balanceRes = await authService.getTokenBalance().catch(() => null);
      if (balanceRes?.data?.balance !== undefined) {
        dispatch(setBalance(balanceRes.data.balance));
      }
      navigate("/reading/numerology", { state: response.data });
    } catch (error) {
      Toast.error(error.response?.data?.error || "Numeroloji yorumu oluşturulamadı.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FortunePageShell
      title="Numeroloji"
      subtitle="İsminin ve doğum tarihinin taşıdığı titreşimleri çözümle."
      tokenBalance={tokenBalance}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <ReadingModePanel
          mode={readingMode}
          onChangeMode={setReadingMode}
          canUseProfile={canUseProfile}
          summaryLines={[
            profileName ? `İsim: ${profileName}` : null,
            profileBirthDate ? `Doğum tarihi: ${profileBirthDate}` : null,
          ].filter(Boolean)}
        />

        <div className="glass rounded-3xl border border-white/10 p-8 md:p-10 space-y-6">
          {readingMode === "self" && !canUseProfile ? (
            <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
              Profilinde isim veya doğum tarihi eksik. Bu falı `kendim için` almak istersen önce profilini tamamlaman gerekir.
            </div>
          ) : null}

          {readingMode === "other" ? (
            <>
        <div>
          <label className="block text-sm text-gray-300 mb-2">İsim</label>
          <input
            name="isim"
            value={formData.isim}
            onChange={handleChange}
            required
            placeholder="Tam adınızı yazın"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-2">Doğum Tarihi</label>
          <input
            type="date"
            name="dogumTarihi"
            value={formData.dogumTarihi}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary"
          />
        </div>
            </>
          ) : (
            <div className="rounded-2xl border border-primary/20 bg-primary/10 p-5 space-y-2">
              <p className="text-sm font-semibold text-white">Profilindeki bilgilerle yorumlanacak</p>
              <p className="text-sm text-gray-300">{profileName || "İsim eksik"}</p>
              <p className="text-sm text-gray-400">{profileBirthDate || "Doğum tarihi eksik"}</p>
            </div>
          )}
        <div className="flex items-center justify-between gap-4 pt-4">
          <p className="text-sm text-gray-400">Bu yorum web’de tam desteklenir ve mobille aynı backend’i kullanır.</p>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Yorumlanıyor..." : "Numeroloji Yorumu Al"}
          </Button>
        </div>
        </div>
      </form>
    </FortunePageShell>
  );
}

export default function Numerology() {
  return (
    <ProtectedRoute>
      <NumerologyContent />
    </ProtectedRoute>
  );
}
