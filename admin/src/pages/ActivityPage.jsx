export default function ActivityPage({ overview }) {
  const recentReadings = overview?.recent_readings || [];
  const recentTransactions = overview?.recent_transactions || [];

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.32em] text-primary/75 mb-3">Activity</p>
        <h1 className="text-4xl md:text-5xl font-black gradient-text mb-4">Canlı Hareket</h1>
        <p className="text-lg text-gray-300 max-w-3xl leading-8">Son fal üretimlerini ve token hareketlerini tek bakışta izle.</p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
          <div className="mb-5">
            <p className="text-xs uppercase tracking-[0.28em] text-primary/75 mb-2">Son Fallar</p>
            <h2 className="text-2xl font-bold text-white">En yeni üretimler</h2>
          </div>
          <div className="space-y-4">
            {recentReadings.map((reading) => (
              <div key={reading.id} className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center justify-between gap-4 mb-2">
                  <div>
                    <p className="text-white font-semibold capitalize">{reading.reading_type}</p>
                    <p className="text-xs text-gray-400">{reading.user_name} · {reading.email}</p>
                  </div>
                  <span className="text-xs text-primary">{reading.created_at ? new Date(reading.created_at).toLocaleString("tr-TR") : "-"}</span>
                </div>
                <p className="text-sm text-gray-300 leading-6">{reading.preview || "Önizleme bulunmuyor."}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
          <div className="mb-5">
            <p className="text-xs uppercase tracking-[0.28em] text-primary/75 mb-2">Token Hareketleri</p>
            <h2 className="text-2xl font-bold text-white">Son işlemler</h2>
          </div>
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center justify-between gap-4 mb-2">
                  <div>
                    <p className="text-white font-semibold">{transaction.description || transaction.transaction_type}</p>
                    <p className="text-xs text-gray-400">{transaction.user_name} · {transaction.email}</p>
                  </div>
                  <span className={`text-sm font-bold ${transaction.amount >= 0 ? "text-emerald-300" : "text-rose-300"}`}>{transaction.amount >= 0 ? "+" : ""}{transaction.amount}</span>
                </div>
                <p className="text-xs text-gray-500">{transaction.created_at ? new Date(transaction.created_at).toLocaleString("tr-TR") : "-"}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
