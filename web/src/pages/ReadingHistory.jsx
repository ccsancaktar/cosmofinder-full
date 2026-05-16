import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import FortunePageShell from "../components/layout/FortunePageShell";
import readingsService from "../services/readingsService";
import { Toast } from "../components/common/Toast";
import { useSelector } from "react-redux";

function ReadingHistoryContent() {
  const tokenBalance = useSelector((state) => state.tokens.balance);
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await readingsService.getReadingHistory();
        setReadings(response.data?.readings || []);
      } catch (error) {
        Toast.error(error.response?.data?.error || "Fal geçmişi yüklenemedi.");
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  return (
    <FortunePageShell title="Fal Geçmişi" subtitle="Daha önce aldığın yorumları yeniden gözden geçir." tokenBalance={tokenBalance} backTo="/dashboard">
      <div className="space-y-4">
        {loading ? <div className="glass rounded-2xl border border-white/10 p-6 text-gray-300">Yükleniyor...</div> : null}
        {!loading && readings.length === 0 ? (
          <div className="glass rounded-2xl border border-white/10 p-6 text-gray-300">Henüz fal geçmişin oluşmamış.</div>
        ) : null}
        {readings.map((reading) => (
          <Link
            key={reading.id}
            to={`/reading-history/${reading.id}`}
            className="block glass rounded-2xl border border-white/10 p-6 hover:border-primary/30 transition"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-primary">{reading.type_display}</h3>
                <p className="text-sm text-gray-400 mt-1">{reading.created_at_display}</p>
              </div>
              <span className="text-sm text-white/70">Detayı Gör</span>
            </div>
          </Link>
        ))}
      </div>
    </FortunePageShell>
  );
}

export default function ReadingHistory() {
  return (
    <ProtectedRoute>
      <ReadingHistoryContent />
    </ProtectedRoute>
  );
}
