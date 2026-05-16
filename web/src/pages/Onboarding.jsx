import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, CheckCircle2, Clock3, MapPin, Sparkles, User2 } from "lucide-react";
import StarField from "../components/home/StarField";
import Button from "../components/common/Button";
import authService from "../services/authService";
import { useAuth } from "../hooks/useAuth";
import { setUser } from "../store/authSlice";
import { Toast } from "../components/common/Toast";

function OnboardingContent() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, loading } = useAuth();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    birth_date: "",
    birth_time: "",
    birth_place: "",
  });

  useEffect(() => {
    if (!user) return;
    if (user.onboarding_completed) {
      navigate("/readings", { replace: true });
      return;
    }

    setFormData({
      first_name: user.first_name || "",
      birth_date: user.birth_date || "",
      birth_time: user.birth_time || "",
      birth_place: user.birth_place || "",
    });
  }, [navigate, user]);

  const highlights = useMemo(
    () => [
      { icon: User2, label: "Adın" },
      { icon: Calendar, label: "Doğum tarihin" },
      { icon: Clock3, label: "Doğum saatin" },
      { icon: MapPin, label: "Doğum yerin" },
    ],
    []
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSkip = async () => {
    setSaving(true);
    try {
      const response = await authService.updateProfile({ onboarding_completed: true });
      dispatch(setUser(response.data.user));
      Toast.success("Onboarding atlandı. Daha sonra profilinden tamamlayabilirsin.");
      navigate("/readings", { replace: true });
    } catch (error) {
      Toast.error(error.response?.data?.error || "Onboarding atlanamadı.");
    } finally {
      setSaving(false);
    }
  };

  const handleContinue = () => {
    if (!formData.first_name.trim()) {
      Toast.warning("İlerlemek için adını girmelisin.");
      return;
    }
    if (!formData.birth_date) {
      Toast.warning("İlerlemek için doğum tarihini seçmelisin.");
      return;
    }
    setStep(2);
  };

  const handleComplete = async () => {
    setSaving(true);
    try {
      const payload = {
        ...formData,
        onboarding_completed: true,
      };
      const response = await authService.updateProfile(payload);
      dispatch(setUser(response.data.user));
      Toast.success("Profilin hazır. Fal keşfine başlayabilirsin.");
      navigate("/readings", { replace: true });
    } catch (error) {
      Toast.error(error.response?.data?.error || "Onboarding tamamlanamadı.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return <div className="min-h-screen bg-[#0D0B1F]" />;
  }

  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none -z-10">
        <StarField count={70} />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl opacity-30" />
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10 md:py-16">
        <div className="flex justify-end mb-4">
          <button
            type="button"
            onClick={handleSkip}
            disabled={saving}
            className="text-sm text-gray-400 hover:text-primary transition"
          >
            Şimdilik geç
          </button>
        </div>

        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-6 items-start">
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-[2rem] border border-white/10 p-8 md:p-10"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 mb-6">
              <Sparkles size={16} className="text-primary" />
              <span className="text-sm font-medium text-primary">İlk kurulum</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black font-decorative gradient-text mb-4">
              Hoş geldin, {user.first_name || user.username}
            </h1>
            <p className="text-lg text-gray-300 max-w-xl leading-8">
              Fallarını daha kişisel ve daha doğru hale getirmek için birkaç temel bilgini ekleyelim.
              İstersen şimdi tamamla, istersen sonra profilinden düzenle.
            </p>

            <div className="grid sm:grid-cols-2 gap-3 mt-8">
              {highlights.map(({ icon: Icon, label }) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
                    <Icon size={18} className="text-primary" />
                  </div>
                  <span className="text-gray-100">{label}</span>
                </div>
              ))}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="glass rounded-[2rem] border border-white/10 p-8 md:p-10 space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-primary/80 mb-2">Adım {step} / 2</p>
                <h2 className="text-2xl font-bold text-white">
                  {step === 1 ? "Temel bilgilerin" : "Doğum detayların"}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {[1, 2].map((value) => (
                  <span
                    key={value}
                    className={`h-2.5 w-10 rounded-full ${step >= value ? "bg-primary" : "bg-white/10"}`}
                  />
                ))}
              </div>
            </div>

            {step === 1 ? (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Adın</label>
                  <input
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="Nasıl hitap edelim?"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Doğum tarihin</label>
                  <input
                    type="date"
                    name="birth_date"
                    value={formData.birth_date}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <Button onClick={handleContinue} className="w-full">
                  Devam Et
                </Button>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Doğum saatin <span className="text-gray-500">(isteğe bağlı)</span></label>
                  <input
                    type="time"
                    name="birth_time"
                    value={formData.birth_time}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Doğum yerin <span className="text-gray-500">(isteğe bağlı)</span></label>
                  <input
                    name="birth_place"
                    value={formData.birth_place}
                    onChange={handleChange}
                    placeholder="Şehir, ülke"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>
                    Geri
                  </Button>
                  <Button type="button" className="flex-1" onClick={handleComplete} disabled={saving}>
                    {saving ? "Tamamlanıyor..." : "Onboarding'i Bitir"}
                  </Button>
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4 flex gap-3">
              <CheckCircle2 className="text-primary mt-0.5" size={18} />
              <p className="text-sm text-gray-300">
                Bu bilgiler özellikle `Yıldızname`, `Numeroloji` ve `Çin Falı` gibi kişisel yorumlarda otomatik kullanılacak.
              </p>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}

export default function Onboarding() {
  return <OnboardingContent />;
}
