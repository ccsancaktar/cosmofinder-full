export default function ReadingModePanel({
  title = "Bu fal kimin için?",
  subtitle = "İstersen profil bilgilerini kullanabilir, istersen başka biri için yorum alabilirsin.",
  mode,
  onChangeMode,
  selfLabel = "Kendim için",
  otherLabel = "Başkası için",
  summaryTitle = "Profil bilgilerin kullanılacak",
  summaryDescription = "Kayıtlı ad ve doğum bilgilerin bu fal için otomatik doldurulur.",
  summaryLines = [],
  canUseProfile = false,
}) {
  return (
    <div className="glass rounded-3xl border border-white/10 p-6 md:p-8 space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-primary/80 mb-2">Okuma Modu</p>
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <p className="text-gray-400 mt-2 max-w-2xl">{subtitle}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onChangeMode("self")}
          className={`rounded-2xl border px-5 py-4 text-left transition ${
            mode === "self"
              ? "border-primary bg-primary/15 shadow-lg shadow-primary/10"
              : "border-white/10 bg-white/5 hover:border-primary/30"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white">{selfLabel}</p>
              <p className="text-xs text-gray-400 mt-1">Profilimdeki bilgilerle hızlı devam et</p>
            </div>
            <div
              className={`h-5 w-5 rounded-full border ${
                mode === "self" ? "border-primary bg-primary" : "border-white/25"
              }`}
            />
          </div>
        </button>

        <button
          type="button"
          onClick={() => onChangeMode("other")}
          className={`rounded-2xl border px-5 py-4 text-left transition ${
            mode === "other"
              ? "border-primary bg-primary/15 shadow-lg shadow-primary/10"
              : "border-white/10 bg-white/5 hover:border-primary/30"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white">{otherLabel}</p>
              <p className="text-xs text-gray-400 mt-1">Başka biri için bilgileri elle gir</p>
            </div>
            <div
              className={`h-5 w-5 rounded-full border ${
                mode === "other" ? "border-primary bg-primary" : "border-white/25"
              }`}
            />
          </div>
        </button>
      </div>

      {mode === "self" ? (
        <div
          className={`rounded-2xl border px-5 py-4 ${
            canUseProfile ? "border-primary/25 bg-primary/10" : "border-amber-400/20 bg-amber-400/10"
          }`}
        >
          <p className="text-sm font-semibold text-white">{summaryTitle}</p>
          <p className="text-sm text-gray-300 mt-2">{summaryDescription}</p>
          {summaryLines.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {summaryLines.map((line) => (
                <span
                  key={line}
                  className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-gray-200"
                >
                  {line}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
