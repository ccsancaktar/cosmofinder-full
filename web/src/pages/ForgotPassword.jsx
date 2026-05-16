import { useState } from "react";
import { Link } from "react-router-dom";
import authService from "../services/authService";
import Button from "../components/common/Button";
import FortunePageShell from "../components/layout/FortunePageShell";
import { Toast } from "../components/common/Toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const response = await authService.forgotPassword(email);
      Toast.success(response.data?.message || "Şifre sıfırlama bağlantısı gönderildi.");
    } catch (error) {
      Toast.error(error.response?.data?.error || "Şifre sıfırlama isteği gönderilemedi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FortunePageShell title="Şifremi Unuttum" subtitle="E-posta adresini gir, sıfırlama bağlantısını gönderelim.">
      <form onSubmit={handleSubmit} className="max-w-xl mx-auto glass rounded-3xl border border-white/10 p-8 space-y-6">
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="E-posta adresiniz"
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary"
          required
        />
        <div className="flex items-center justify-between gap-4">
          <Link to="/login" className="text-sm text-primary hover:text-white transition">
            Giriş ekranına dön
          </Link>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Gönderiliyor..." : "Sıfırlama Bağlantısı Gönder"}
          </Button>
        </div>
      </form>
    </FortunePageShell>
  );
}
