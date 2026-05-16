import { useState } from "react";
import { Pencil, Search, ShieldCheck, UserRound, X } from "lucide-react";

function buildFormState(user) {
  if (!user) return null;
  return {
    username: user.username || "",
    email: user.email || "",
    password: "",
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    phone: user.phone || "",
    birth_date: user.birth_date ? String(user.birth_date).slice(0, 10) : "",
    birth_time: user.birth_time || "",
    birth_place: user.birth_place || "",
    language: user.language || "tr",
    token_balance: user.token_balance ?? 0,
    has_premium: !!user.has_premium,
    is_active: !!user.is_active,
    email_verified: !!user.email_verified,
    onboarding_completed: !!user.onboarding_completed,
  };
}

function UserEditModal({ user, loading, saving, error, onClose, onSave }) {
  const [form, setForm] = useState(() => buildFormState(user));
  const [statusMessage, setStatusMessage] = useState("");

  if (!user && !loading) return null;

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await onSave({
      ...form,
      token_balance: Number(form.token_balance),
    });
    if (result?.ok) {
      setStatusMessage("Kullanıcı başarıyla güncellendi.");
    }
  };

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-black/70 p-3 backdrop-blur-sm md:p-4">
      <div className="flex min-h-full items-start justify-center py-4 md:py-8">
      <div className="flex w-full max-w-4xl max-h-[min(92vh,980px)] flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#0f0b1d] shadow-2xl">
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-white/10 px-5 py-4 md:px-6 md:py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-primary/70 mb-2">User Control</p>
            <h2 className="text-2xl font-black gradient-text md:text-3xl">Kullanıcıyı Düzenle</h2>
            <p className="text-sm text-gray-400 mt-2">
              Profil bilgileri, parola, token ve premium durumu tek yerden yönetilir.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-gray-300 transition hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {loading || !form ? (
          <div className="px-6 py-16 text-center text-gray-400">Kullanıcı detayları yükleniyor...</div>
        ) : (
          <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5 md:px-6 md:py-6">
            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <section className="space-y-5 rounded-[1.7rem] border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-center gap-3">
                  <UserRound className="text-primary" size={18} />
                  <h3 className="text-lg font-bold text-white">Profil ve Erişim</h3>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Kullanıcı adı" value={form.username} onChange={(value) => updateField("username", value)} />
                  <Field label="Email" type="email" value={form.email} onChange={(value) => updateField("email", value)} />
                  <Field label="Ad" value={form.first_name} onChange={(value) => updateField("first_name", value)} />
                  <Field label="Soyad" value={form.last_name} onChange={(value) => updateField("last_name", value)} />
                  <Field label="Telefon" value={form.phone} onChange={(value) => updateField("phone", value)} />
                  <Field label="Yeni parola" type="password" placeholder="Boş bırakırsan değişmez" value={form.password} onChange={(value) => updateField("password", value)} />
                  <Field label="Doğum tarihi" type="date" value={form.birth_date} onChange={(value) => updateField("birth_date", value)} />
                  <Field label="Doğum saati" type="time" value={form.birth_time} onChange={(value) => updateField("birth_time", value)} />
                  <Field label="Doğum yeri" value={form.birth_place} onChange={(value) => updateField("birth_place", value)} />
                  <SelectField
                    label="Dil"
                    value={form.language}
                    onChange={(value) => updateField("language", value)}
                    options={[
                      { value: "tr", label: "Türkçe" },
                      { value: "en", label: "English" },
                      { value: "de", label: "Deutsch" },
                    ]}
                  />
                </div>
              </section>

              <section className="space-y-5 rounded-[1.7rem] border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="text-primary" size={18} />
                  <h3 className="text-lg font-bold text-white">Admin Kontrolleri</h3>
                </div>

                <Field
                  label="Token bakiyesi"
                  type="number"
                  value={form.token_balance}
                  onChange={(value) => updateField("token_balance", value)}
                />

                <div className="grid gap-3">
                  <ToggleField label="Premium aktif" checked={form.has_premium} onChange={(checked) => updateField("has_premium", checked)} />
                  <ToggleField label="Hesap aktif" checked={form.is_active} onChange={(checked) => updateField("is_active", checked)} />
                  <ToggleField label="Email doğrulandı" checked={form.email_verified} onChange={(checked) => updateField("email_verified", checked)} />
                  <ToggleField label="Onboarding tamamlandı" checked={form.onboarding_completed} onChange={(checked) => updateField("onboarding_completed", checked)} />
                </div>

                <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4 text-sm text-gray-300">
                  <p className="font-semibold text-primary mb-2">Not</p>
                  <p>
                    Token alanı hedef bakiyedir. Kaydettiğinde fark kadar transaction oluşturulur; premium kapatılırsa aktif abonelikler sona erdirilir.
                  </p>
                </div>
              </section>
            </div>

            {(error || statusMessage) && (
              <div
                className={`rounded-2xl border px-4 py-3 text-sm ${
                  error
                    ? "border-red-400/20 bg-red-500/10 text-red-100"
                    : "border-emerald-400/20 bg-emerald-500/10 text-emerald-100"
                }`}
              >
                {error || statusMessage}
              </div>
            )}
            </div>

            <div className="shrink-0 border-t border-white/10 px-5 py-4 md:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm text-gray-300 transition hover:text-white"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-[#120f1f] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
              </button>
            </div>
            </div>
          </form>
        )}
      </div>
      </div>
    </div>
  );
}

function Field({ label, type = "text", value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-gray-400">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-white/10 bg-[#100d1d] px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-primary focus:outline-none"
      />
    </label>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-gray-400">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-[#100d1d] px-4 py-3 text-sm text-white focus:border-primary focus:outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ToggleField({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#100d1d] px-4 py-3">
      <span className="text-sm text-white">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-14 rounded-full transition ${checked ? "bg-primary" : "bg-white/10"}`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${checked ? "left-8" : "left-1"}`}
        />
      </button>
    </label>
  );
}

export default function UsersPage({
  users,
  search,
  setSearch,
  usersLoading,
  selectedUser,
  userDetailLoading,
  userSaving,
  userActionError,
  onEditUser,
  onCloseEditor,
  onSaveUser,
}) {
  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.32em] text-primary/75 mb-3">Users</p>
        <h1 className="text-4xl md:text-5xl font-black gradient-text mb-4">Kullanıcılar</h1>
        <p className="text-lg text-gray-300 max-w-3xl leading-8">
          Kullanıcıları ara, bakiyelerini ve premium durumlarını gör; ardından parola, profil ve erişim ayarlarını düzenle.
        </p>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
        <div className="relative w-full md:w-[420px] mb-6">
          <Search className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Email, kullanıcı adı veya isim ara..."
            className="w-full rounded-full border border-white/10 bg-[#100d1d] pl-11 pr-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-primary"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-[0.22em] text-gray-500">
                <th className="py-3 pr-4">Kullanıcı</th>
                <th className="py-3 pr-4">Token</th>
                <th className="py-3 pr-4">Premium</th>
                <th className="py-3 pr-4">Onboarding</th>
                <th className="py-3 pr-4">Durum</th>
                <th className="py-3 pr-4">Kayıt</th>
                <th className="py-3 pr-4">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-white/5 text-sm">
                  <td className="py-4 pr-4">
                    <div>
                      <p className="font-semibold text-white">{user.name || user.username || "İsimsiz kullanıcı"}</p>
                      <p className="mt-1 text-xs text-gray-500">{user.email}</p>
                    </div>
                  </td>
                  <td className="py-4 pr-4 font-semibold text-primary">{user.token_balance}</td>
                  <td className="py-4 pr-4">{user.has_premium ? "Aktif" : "Free"}</td>
                  <td className="py-4 pr-4">{user.onboarding_completed ? "Tamam" : "Eksik"}</td>
                  <td className="py-4 pr-4">{user.is_active ? "Aktif" : "Pasif"}</td>
                  <td className="py-4 pr-4 text-gray-400">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString("tr-TR") : "-"}
                  </td>
                  <td className="py-4 pr-4">
                    <button
                      type="button"
                      onClick={() => onEditUser(user.id)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-gray-200 transition hover:border-primary/20 hover:text-primary"
                    >
                      <Pencil size={14} />
                      Düzenle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!users.length && !usersLoading && <p className="py-6 text-sm text-gray-500">Aramaya uygun kullanıcı bulunamadı.</p>}
          {usersLoading && <p className="py-6 text-sm text-gray-500">Kullanıcılar yükleniyor...</p>}
        </div>
      </section>

      {(selectedUser || userDetailLoading) && (
        <UserEditModal
          key={selectedUser?.id || "loading-user"}
          user={selectedUser}
          loading={userDetailLoading}
          saving={userSaving}
          error={userActionError}
          onClose={onCloseEditor}
          onSave={onSaveUser}
        />
      )}
    </div>
  );
}
