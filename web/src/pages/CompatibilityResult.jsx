import { useLocation, useNavigate } from "react-router-dom";
import FortunePageShell from "../components/layout/FortunePageShell";
import ReadingResultBlocks from "../components/readings/ReadingResultBlocks";
import Button from "../components/common/Button";

export default function CompatibilityResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state;

  if (!data) {
    navigate("/compatibility");
    return null;
  }

  const analysis = data.analysis || {};

  return (
    <FortunePageShell title="Uyum Analizi Sonucu" subtitle="Bağ, sürtünme ve ortak ritim üzerine net bir okuma." backTo="/compatibility">
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {[
          ["Uyum Skoru", analysis.score ? `${analysis.score}/100` : "-"],
          ["Seviye", analysis.score_label],
          ["Ortak Tema", analysis.core_theme],
          ["Rehber Tema", analysis.guidance_theme],
        ].map(([label, value]) => (
          <div key={label} className="glass rounded-2xl border border-primary/20 p-5 text-center">
            <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">{label}</p>
            <p className="text-lg font-bold text-primary">{value || "-"}</p>
          </div>
        ))}
      </div>

      <ReadingResultBlocks content={data.yorum} fallbackTitle="Uyum Yorumu" />

      <div className="flex justify-center mt-8">
        <Button onClick={() => navigate("/compatibility")}>Yeni Uyum Analizi</Button>
      </div>
    </FortunePageShell>
  );
}
