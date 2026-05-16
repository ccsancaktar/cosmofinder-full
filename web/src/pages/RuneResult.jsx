import { useLocation, useNavigate } from "react-router-dom";
import FortunePageShell from "../components/layout/FortunePageShell";
import Button from "../components/common/Button";
import ReadingResultBlocks from "../components/readings/ReadingResultBlocks";
import { ResultHero, ResultInfoPanel, ResultStatCard } from "../components/readings/ResultChrome";

export default function RuneResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state;

  if (!data) {
    navigate("/rune");
    return null;
  }

  const runes = data.runes || [];

  return (
    <FortunePageShell backTo="/rune">
      <ResultHero
        eyebrow="Rune Açılımı"
        title="Runelerin Konuştu"
        subtitle={data.question ? `"${data.question}" sorusu için runelerin enerjisi yorumlandı.` : "Antik İskandinav sembolleri senin için bir mesaj taşıyor."}
      />

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <ResultStatCard label="Seçilen Rune" value={`${runes.length || 0} rune`} />
        <ResultStatCard label="Yorum Modu" value={data.question ? "Soru odaklı" : "Genel"} accent="text-orange-300" />
        <ResultStatCard label="Köken" value="Elder Futhark" accent="text-amber-300" />
      </div>

      {runes.length ? (
        <ResultInfoPanel title="Beliren Runeler">
          <div className="grid md:grid-cols-3 gap-4">
            {runes.map((rune, index) => (
              <div key={`${rune.name}-${index}`} className="rounded-[1.5rem] border border-white/10 bg-white/5 px-5 py-6 text-center">
                <div className="text-5xl text-primary mb-4">{rune.symbol}</div>
                <p className="text-lg font-bold text-white">{rune.name}</p>
                <p className="text-xs uppercase tracking-[0.24em] text-primary/70 mt-2">{rune.reversed ? "Ters" : "Düz"}</p>
                <p className="text-sm text-gray-400 mt-3 leading-6">{rune.reversed ? rune.reversed_meaning : rune.meaning}</p>
              </div>
            ))}
          </div>
        </ResultInfoPanel>
      ) : null}

      <ReadingResultBlocks content={data.fortune} fallbackTitle="Rune Yorumu" />

      <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
        <Button onClick={() => navigate("/rune")}>Yeni Rune Açılımı</Button>
        <Button variant="outline" onClick={() => navigate("/readings")}>Diğer Fallara Dön</Button>
      </div>
    </FortunePageShell>
  );
}
