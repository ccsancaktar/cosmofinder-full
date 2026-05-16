import { useLocation, useNavigate } from "react-router-dom";
import FortunePageShell from "../components/layout/FortunePageShell";
import ReadingResultBlocks from "../components/readings/ReadingResultBlocks";
import Button from "../components/common/Button";

export default function NumerologyResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state;

  if (!data) {
    navigate("/numerology");
    return null;
  }

  const analysis = data.analysis || {};

  return (
    <FortunePageShell title="Numeroloji Sonucu" subtitle="Sayıların kişisel ritmine dair çözümleme." backTo="/numerology">
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {[
          ["Yaşam Yolu", analysis.life_path],
          ["Kader", analysis.destiny_number],
          ["Ruh Arzusu", analysis.soul_urge],
          ["Kişilik", analysis.personality_number],
        ].map(([label, value]) => (
          <div key={label} className="glass rounded-2xl border border-primary/20 p-5 text-center">
            <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">{label}</p>
            <p className="text-3xl font-bold text-primary">{value ?? "-"}</p>
          </div>
        ))}
      </div>

      <ReadingResultBlocks content={data.yorum} fallbackTitle="Numeroloji Yorumu" />

      <div className="flex justify-center mt-8">
        <Button onClick={() => navigate("/numerology")}>Yeni Numeroloji Yorumu</Button>
      </div>
    </FortunePageShell>
  );
}
