import { Activity, Crown, Database, RefreshCcw, Sparkles, Users, Zap } from "lucide-react";

function StatCard({ icon: Icon, label, value, helper }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs uppercase tracking-[0.26em] text-primary/75">{label}</p>
        <div className="h-10 w-10 rounded-2xl border border-primary/20 bg-primary/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" />
        </div>
      </div>
      <p className="text-3xl font-black text-white">{value}</p>
      <p className="text-sm text-gray-400 mt-2">{helper}</p>
    </div>
  );
}

function HealthBadge({ ok, label }) {
  return (
    <div className={`rounded-full px-3 py-1.5 text-sm font-semibold border ${ok ? "bg-emerald-500/10 border-emerald-400/20 text-emerald-300" : "bg-amber-500/10 border-amber-400/20 text-amber-300"}`}>
      {label}: {ok ? "Hazır" : "Sorunlu"}
    </div>
  );
}

export default function OverviewPage({ overview, loading, error, onRefresh }) {
  const metrics = overview?.metrics || {};
  const system = overview?.system || {};
  const readingTypes = overview?.readings_by_type || [];

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-primary/75 mb-3">Overview</p>
            <h1 className="text-4xl md:text-5xl font-black gradient-text mb-4">Operasyon Merkezi</h1>
            <p className="text-lg text-gray-300 max-w-3xl leading-8">Uygulamanın sağlık durumunu, dönüşüm sinyallerini ve fal üretim akışını üst seviyede izle.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <HealthBadge ok={Boolean(system.database_connected)} label="Database" />
            <HealthBadge ok={Boolean(system.scheduler_running)} label="Scheduler" />
            <button type="button" onClick={onRefresh} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white hover:border-primary/30 hover:text-primary transition">
              <RefreshCcw size={15} />
              Yenile
            </button>
          </div>
        </div>
      </section>

      {error ? <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-red-200 text-sm">{error}</div> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Toplam Kullanıcı" value={loading ? "..." : metrics.total_users ?? 0} helper={`Aktif: ${metrics.active_users ?? 0}`} />
        <StatCard icon={Crown} label="Premium Üye" value={loading ? "..." : metrics.premium_users ?? 0} helper={`Oran: %${metrics.premium_rate ?? 0}`} />
        <StatCard icon={Sparkles} label="Bugünkü Fal" value={loading ? "..." : metrics.readings_today ?? 0} helper={`7 gün: ${metrics.readings_last_7_days ?? 0}`} />
        <StatCard icon={Zap} label="Bugünkü Token Satış" value={loading ? "..." : metrics.token_purchase_total_today ?? 0} helper={`İşlem: ${metrics.token_purchase_count_today ?? 0}`} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-primary/75 mb-2">Fal Yoğunluğu</p>
              <h2 className="text-2xl font-bold text-white">Son 7 gün dağılımı</h2>
            </div>
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div className="space-y-4">
            {readingTypes.map((item) => {
              const max = readingTypes[0]?.count || 1;
              const width = Math.max(10, Math.round((item.count / max) * 100));
              return (
                <div key={item.type}>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-white font-medium capitalize">{item.type}</span>
                    <span className="text-gray-400">{item.count}</span>
                  </div>
                  <div className="h-3 rounded-full bg-white/[0.05] overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-primary via-amber-300 to-violet-500" style={{ width: `${width}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-primary/75 mb-2">Dönüşüm Sinyalleri</p>
              <h2 className="text-2xl font-bold text-white">Kullanıcı kalitesi</h2>
            </div>
            <Database className="w-5 h-5 text-primary" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4"><p className="text-sm text-gray-400">Onboarding Tamamlama</p><p className="text-3xl font-black text-white mt-2">%{metrics.onboarding_completion_rate ?? 0}</p></div>
            <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4"><p className="text-sm text-gray-400">Doğrulanmış E-mail</p><p className="text-3xl font-black text-white mt-2">%{metrics.verified_user_rate ?? 0}</p></div>
            <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4"><p className="text-sm text-gray-400">Token Harcama</p><p className="text-3xl font-black text-white mt-2">{metrics.token_spend_total_today ?? 0}</p></div>
            <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4"><p className="text-sm text-gray-400">Toplam Fal</p><p className="text-3xl font-black text-white mt-2">{metrics.total_readings ?? 0}</p></div>
          </div>
        </div>
      </section>
    </div>
  );
}
