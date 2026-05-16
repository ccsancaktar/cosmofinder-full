import { useState } from "react";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import FortunePageShell from "../components/layout/FortunePageShell";
import Button from "../components/common/Button";
import authService from "../services/authService";
import { Toast } from "../components/common/Toast";
import { useSelector } from "react-redux";

function ChangePasswordContent() {
  const tokenBalance = useSelector((state) => state.tokens.balance);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      Toast.error("Yeni şifreler eşleşmiyor.");
      return;
    }
    setSubmitting(true);
    try {
      await authService.changePassword(formData.currentPassword, formData.newPassword);
      Toast.success("Şifre başarıyla değiştirildi.");
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      Toast.error(error.response?.data?.error || "Şifre değiştirilemedi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FortunePageShell title="Şifre Değiştir" subtitle="Hesabını güvende tutmak için şifreni yenile." tokenBalance={tokenBalance} backTo="/dashboard">
      <form onSubmit={handleSubmit} className="max-w-xl mx-auto glass rounded-3xl border border-white/10 p-8 space-y-6">
        <input name="currentPassword" type="password" value={formData.currentPassword} onChange={handleChange} placeholder="Mevcut şifre" required className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary" />
        <input name="newPassword" type="password" value={formData.newPassword} onChange={handleChange} placeholder="Yeni şifre" required className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary" />
        <input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder="Yeni şifre tekrar" required className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary" />
        <div className="flex justify-end">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Kaydediliyor..." : "Şifreyi Güncelle"}
          </Button>
        </div>
      </form>
    </FortunePageShell>
  );
}

export default function ChangePassword() {
  return (
    <ProtectedRoute>
      <ChangePasswordContent />
    </ProtectedRoute>
  );
}
