import { useLocation, useNavigate } from "react-router-dom";
import FortunePageShell from "../components/layout/FortunePageShell";
import Button from "../components/common/Button";
import ReadingResultBlocks from "../components/readings/ReadingResultBlocks";
import { ResultHero, ResultStatCard } from "../components/readings/ResultChrome";

export default function DailyZodiacResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state;

  if (!data) {
    navigate("/daily");
    return null;
  }

  return (
    <FortunePageShell backTo="/daily">
      <ResultHero
        eyebrow="Günlük Burç"
        title="Bugünün Mesajı Hazır"
        subtitle={data.zodiacSign ? `${data.zodiacSign} burcu için günün enerjisi yorumlandı.` : "Seçtiğin burç için günlük akış çözümlendi."}
      />

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <ResultStatCard label="Burç" value={data.zodiacSign || "-"} />
        <ResultStatCard label="Yorum Türü" value="Günlük Akış" accent="text-orange-300" />
        <ResultStatCard label="Zaman" value="Bugün" accent="text-cyan-300" />
      </div>

      <ReadingResultBlocks content={data.fortune} fallbackTitle="Günlük Burç Yorumu" />

      <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
        <Button onClick={() => navigate("/daily")}>Başka Burç Seç</Button>
        <Button variant="outline" onClick={() => navigate("/readings")}>Diğer Fallara Dön</Button>
      </div>
    </FortunePageShell>
  );
}
