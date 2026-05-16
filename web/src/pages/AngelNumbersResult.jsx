import { useLocation, useNavigate } from "react-router-dom";
import FortunePageShell from "../components/layout/FortunePageShell";
import ReadingResultBlocks from "../components/readings/ReadingResultBlocks";
import Button from "../components/common/Button";

export default function AngelNumbersResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state;

  if (!data) {
    navigate("/angel-numbers");
    return null;
  }

  const analysis = data.analysis || {};

  return (
    <FortunePageShell title="Melek Sayıları Mesajı" subtitle="Tekrarlayan sayının ince ama net yönlendirmesi." backTo="/angel-numbers">
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {[
          ["Sayı", analysis.normalized_number],
          ["Rakam Toplamı", analysis.digit_sum],
          ["Ana Tema", analysis.base_theme],
        ].map(([label, value]) => (
          <div key={label} className="glass rounded-2xl border border-primary/20 p-5 text-center">
            <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">{label}</p>
            <p className="text-lg font-bold text-primary">{value || "-"}</p>
          </div>
        ))}
      </div>

      <ReadingResultBlocks content={data.yorum} fallbackTitle="Melek Sayıları Yorumu" />

      <div className="flex justify-center mt-8">
        <Button onClick={() => navigate("/angel-numbers")}>Başka Bir Sayı Yorumla</Button>
      </div>
    </FortunePageShell>
  );
}
