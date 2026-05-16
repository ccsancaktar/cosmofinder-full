import { Cpu, Database, HardDrive, MemoryStick, Server, TimerReset } from "lucide-react";

function ServiceCard({ title, children }) {
  return (
    <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-5">
      <h3 className="text-lg font-bold text-white mb-4">{title}</h3>
      {children}
    </div>
  );
}

export default function SystemPage({ data }) {
  const runtime = data?.runtime || {};
  const services = data?.services || {};
  const redis = services.redis || {};
  const disk = runtime.disk || {};
  const logs = data?.logs || {};
  const load = runtime.load_average || {};
  const jobs = services.scheduler_jobs || [];

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.32em] text-primary/75 mb-3">System</p>
        <h1 className="text-4xl md:text-5xl font-black gradient-text mb-4">Altyapı ve Runtime</h1>
        <p className="text-lg text-gray-300 max-w-3xl leading-8">Redis, scheduler, process memory, disk kullanımı ve son hata logları tek ekranda.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ServiceCard title="Runtime">
          <div className="space-y-2 text-sm text-gray-300">
            <p className="flex items-center gap-2"><Server size={14} className="text-primary" /> {runtime.platform || "-"}</p>
            <p className="flex items-center gap-2"><TimerReset size={14} className="text-primary" /> Uptime: {data?.uptime_seconds ?? 0}s</p>
          </div>
        </ServiceCard>
        <ServiceCard title="CPU">
          <div className="space-y-2 text-sm text-gray-300">
            <p className="flex items-center gap-2"><Cpu size={14} className="text-primary" /> 1m: {load["1m"] ?? "-"}</p>
            <p>5m: {load["5m"] ?? "-"}</p>
            <p>15m: {load["15m"] ?? "-"}</p>
          </div>
        </ServiceCard>
        <ServiceCard title="Memory">
          <div className="space-y-2 text-sm text-gray-300">
            <p className="flex items-center gap-2"><MemoryStick size={14} className="text-primary" /> Process: {runtime.process_memory_mb ?? "-"} MB</p>
            <p>Python: {runtime.python_version || "-"}</p>
          </div>
        </ServiceCard>
        <ServiceCard title="Disk">
          <div className="space-y-2 text-sm text-gray-300">
            <p className="flex items-center gap-2"><HardDrive size={14} className="text-primary" /> Kullanım: %{disk.used_pct ?? "-"}</p>
            <p>Boş: {disk.free_gb ?? "-"} GB</p>
            <p>Toplam: {disk.total_gb ?? "-"} GB</p>
          </div>
        </ServiceCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <ServiceCard title="Servisler">
          <div className="space-y-4 text-sm text-gray-300">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><p className="font-semibold text-white mb-2 flex items-center gap-2"><Database size={15} className="text-primary" /> MongoDB</p><p>Durum: {services.database_connected ? "Bağlı" : "Sorunlu"}</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><p className="font-semibold text-white mb-2">Redis</p><p>Durum: {redis.status || "-"}</p><p>Versiyon: {redis.version || "-"}</p><p>Bellek: {redis.used_memory || "-"}</p><p>Client: {redis.connected_clients ?? "-"}</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><p className="font-semibold text-white mb-2">Scheduler</p><p>Durum: {services.scheduler_running ? "Çalışıyor" : "Durdu"}</p><p>Job sayısı: {jobs.length}</p></div>
          </div>
        </ServiceCard>
        <ServiceCard title="Scheduler Job'ları">
          <div className="space-y-3">
            {jobs.map((job) => (
              <div key={job.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm">
                <p className="text-white font-semibold">{job.id}</p>
                <p className="text-gray-400 mt-1">{job.trigger}</p>
                <p className="text-primary mt-2">{job.next_run_time ? new Date(job.next_run_time).toLocaleString("tr-TR") : "Planlı değil"}</p>
              </div>
            ))}
            {!jobs.length && <p className="text-sm text-gray-500">Scheduler job bulunamadı.</p>}
          </div>
        </ServiceCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <ServiceCard title="Son Hatalar">
          <div className="space-y-2 max-h-[360px] overflow-auto">
            {(logs.recent_errors || []).map((line, index) => (
              <pre key={`${index}-${line.slice(0, 24)}`} className="whitespace-pre-wrap rounded-xl border border-red-400/10 bg-red-500/5 p-3 text-xs text-red-100">{line}</pre>
            ))}
          </div>
        </ServiceCard>
        <ServiceCard title="Son Uyarılar">
          <div className="space-y-2 max-h-[360px] overflow-auto">
            {(logs.recent_warnings || []).map((line, index) => (
              <pre key={`${index}-${line.slice(0, 24)}`} className="whitespace-pre-wrap rounded-xl border border-amber-400/10 bg-amber-500/5 p-3 text-xs text-amber-100">{line}</pre>
            ))}
          </div>
        </ServiceCard>
      </section>
    </div>
  );
}
