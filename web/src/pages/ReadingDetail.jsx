import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import FortunePageShell from "../components/layout/FortunePageShell";
import ReadingResultBlocks from "../components/readings/ReadingResultBlocks";
import readingsService from "../services/readingsService";
import Button from "../components/common/Button";
import { Toast } from "../components/common/Toast";
import { useSelector } from "react-redux";

function ReadingDetailContent() {
  const tokenBalance = useSelector((state) => state.tokens.balance);
  const { id } = useParams();
  const navigate = useNavigate();
  const [reading, setReading] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDetail = async () => {
      try {
        const response = await readingsService.getReadingDetail(id);
        setReading(response.data?.reading || null);
      } catch (error) {
        Toast.error(error.response?.data?.error || "Fal detayı alınamadı.");
        navigate("/reading-history");
      } finally {
        setLoading(false);
      }
    };

    loadDetail();
  }, [id, navigate]);

  return (
    <FortunePageShell title={reading?.type_display || "Fal Detayı"} subtitle={reading?.created_at_display || "Önceki yorumunun tam görünümü"} tokenBalance={tokenBalance} backTo="/reading-history">
      {loading ? <div className="glass rounded-2xl border border-white/10 p-6 text-gray-300">Yükleniyor...</div> : null}
      {!loading && reading ? (
        <>
          <div className="glass rounded-2xl border border-white/10 p-6 mb-6">
            <p className="text-sm text-gray-400 mb-2">Fal Türü</p>
            <p className="text-xl font-bold text-primary">{reading.type_display}</p>
          </div>
          <ReadingResultBlocks content={reading.result} fallbackTitle={reading.type_display} />
          <div className="flex justify-center mt-8">
            <Button onClick={() => navigate("/reading-history")} variant="outline">
              Geçmişe Dön
            </Button>
          </div>
        </>
      ) : null}
    </FortunePageShell>
  );
}

export default function ReadingDetail() {
  return (
    <ProtectedRoute>
      <ReadingDetailContent />
    </ProtectedRoute>
  );
}
