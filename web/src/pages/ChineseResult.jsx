import { useLocation, useNavigate } from "react-router-dom";
import FortunePageShell from "../components/layout/FortunePageShell";
import Button from "../components/common/Button";
import ReadingResultBlocks from "../components/readings/ReadingResultBlocks";
import { ResultHero, ResultInfoPanel, ResultStatCard } from "../components/readings/ResultChrome";

export default function ChineseResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state;

  if (!data) {
    navigate("/chinese");
    return null;
  }

  const bazi = data.baziData || {};
  const pillars = [
    ["Yıl", bazi.year_element],
    ["Ay", bazi.month_element],
    ["Gün", bazi.day_element],
    ["Saat", bazi.hour_element],
  ].filter(([, value]) => value);

  return (
    <FortunePageShell backTo="/chinese">
      <ResultHero
        eyebrow="Ba Zi"
        title="Çin Falı Sonucun"
        subtitle="Dört sütunun ve doğum anının elementi birlikte okunarak yaşam temaların çıkarıldı."
      />

      {pillars.length ? (
        <ResultInfoPanel title="Dört Sütun">
          <div className="grid md:grid-cols-4 gap-4">
            {pillars.map(([label, value]) => (
              <ResultStatCard key={label} label={label} value={value} accent="text-emerald-300" />
            ))}
          </div>
        </ResultInfoPanel>
      ) : null}

      <ReadingResultBlocks content={data.fortune} fallbackTitle="Ba Zi Yorumu" />

      <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
        <Button onClick={() => navigate("/chinese")}>Yeni Çin Falı</Button>
        <Button variant="outline" onClick={() => navigate("/readings")}>Diğer Fallara Dön</Button>
      </div>
    </FortunePageShell>
  );
}
