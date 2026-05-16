import { useLocation, useNavigate } from "react-router-dom";
import FortunePageShell from "../components/layout/FortunePageShell";
import Button from "../components/common/Button";
import ReadingResultBlocks from "../components/readings/ReadingResultBlocks";
import { ResultChipList, ResultHero, ResultInfoPanel, ResultStatCard } from "../components/readings/ResultChrome";

export default function KabalaResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state;

  if (!data) {
    navigate("/kabala");
    return null;
  }

  const kabala = data.kabalaData || {};
  const sephirot = kabala.selected_sefirot || kabala.selected_sephiroth || [];

  return (
    <FortunePageShell backTo="/kabala">
      <ResultHero
        eyebrow="Kabala"
        title="Kabala Analizin"
        subtitle="İsminin titreşimi, indirgenmiş sayın ve seçilen sefirotlar birlikte yorumlandı."
      />

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <ResultStatCard label="Orijinal İsim" value={kabala.original_name} />
        <ResultStatCard label="İbrani Karşılığı" value={kabala.hebrew_name} accent="text-violet-300" />
        <ResultStatCard label="İsim Değeri" value={kabala.name_value} accent="text-cyan-300" />
        <ResultStatCard label="İndirgenmiş Sayı" value={kabala.reduced_value || kabala.reduced_number} accent="text-amber-300" />
      </div>

      {sephirot.length ? (
        <ResultInfoPanel title="Seçilen Sefirot">
          <ResultChipList
            items={sephirot.map((item) => {
              if (typeof item === "string") return item;
              return [item.hebrew_name, item.english_name].filter(Boolean).join(" • ");
            })}
          />
        </ResultInfoPanel>
      ) : null}

      <ReadingResultBlocks content={data.fortune} fallbackTitle="Kabala Yorumu" />

      <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
        <Button onClick={() => navigate("/kabala")}>Yeni Kabala Analizi</Button>
        <Button variant="outline" onClick={() => navigate("/readings")}>Diğer Fallara Dön</Button>
      </div>
    </FortunePageShell>
  );
}
