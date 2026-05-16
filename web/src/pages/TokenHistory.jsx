import { useEffect, useState } from "react";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import FortunePageShell from "../components/layout/FortunePageShell";
import tokensService from "../services/tokensService";
import { Toast } from "../components/common/Toast";
import { useSelector } from "react-redux";

function TokenHistoryContent() {
  const tokenBalance = useSelector((state) => state.tokens.balance);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const response = await tokensService.getHistory();
        setTransactions(response.data?.transactions || []);
      } catch (error) {
        Toast.error(error.response?.data?.error || "Token geçmişi alınamadı.");
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, []);

  return (
    <FortunePageShell title="Token Geçmişi" subtitle="Kazandığın ve harcadığın token hareketleri." tokenBalance={tokenBalance} backTo="/dashboard">
      <div className="space-y-4">
        {loading ? <div className="glass rounded-2xl border border-white/10 p-6 text-gray-300">Yükleniyor...</div> : null}
        {!loading && transactions.length === 0 ? (
          <div className="glass rounded-2xl border border-white/10 p-6 text-gray-300">Henüz token hareketi bulunmuyor.</div>
        ) : null}
        {transactions.map((tx) => (
          <div key={tx.id || `${tx.created_at}-${tx.description}`} className="glass rounded-2xl border border-white/10 p-6 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-primary">{tx.description || tx.transaction_type}</h3>
              <p className="text-sm text-gray-400 mt-1">{tx.created_at_display || tx.created_at}</p>
            </div>
            <div className={`text-lg font-bold ${tx.amount >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {tx.amount >= 0 ? "+" : ""}
              {tx.amount}
            </div>
          </div>
        ))}
      </div>
    </FortunePageShell>
  );
}

export default function TokenHistory() {
  return (
    <ProtectedRoute>
      <TokenHistoryContent />
    </ProtectedRoute>
  );
}
