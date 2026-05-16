import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import authService from "../services/authService";
import Button from "../components/common/Button";
import FortunePageShell from "../components/layout/FortunePageShell";
import { Toast } from "../components/common/Toast";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password !== confirm) {
      Toast.error("Şifreler eşleşmiyor.");
      return;
    }
    setSubmitting(true);
    try {
      await authService.resetPassword(token, password);
      Toast.success("Şifren başarıyla sıfırlandı.");
      navigate("/login");
    } catch (error) {
      Toast.error(error.response?.data?.error || "Şifre sıfırlanamadı.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FortunePageShell title="Yeni Şifre Belirle" subtitle="Hesabın için yeni bir şifre oluştur.">
      <form onSubmit={handleSubmit} className="max-w-xl mx-auto glass rounded-3xl border border-white/10 p-8 space-y-6">
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Yeni şifre"
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary"
          required
        />
        <input
          type="password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          placeholder="Yeni şifre tekrar"
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary"
          required
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={submitting || !token}>
            {submitting ? "Kaydediliyor..." : "Şifreyi Güncelle"}
          </Button>
        </div>
      </form>
    </FortunePageShell>
  );
}
