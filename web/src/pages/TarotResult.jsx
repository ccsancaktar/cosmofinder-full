import { useLocation, useNavigate } from "react-router-dom";
import FortunePageShell from "../components/layout/FortunePageShell";
import Button from "../components/common/Button";
import ReadingResultBlocks from "../components/readings/ReadingResultBlocks";
import { ResultHero, ResultInfoPanel, ResultStatCard } from "../components/readings/ResultChrome";

export default function TarotResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state;

  if (!data) {
    navigate("/tarot");
    return null;
  }

  const cards = data.cards || [];
  const name = data.formData?.name || "Sevgili";

  return (
    <FortunePageShell backTo="/tarot">
      <ResultHero
        eyebrow="Tarot Açılımı"
        title={`Falın Hazır, ${name}`}
        subtitle={data.question ? `"${data.question}" sorusu için seçilen kartların enerjisi yorumlandı.` : "Seçtiğin kartlar şimdi ortak bir hikaye anlatıyor."}
      />

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <ResultStatCard label="Seçilen Kart" value={`${cards.length || 0} kart`} />
        <ResultStatCard label="Açılım Türü" value="3 Kartlık Açılım" accent="text-yellow-300" />
        <ResultStatCard label="Soru Modu" value={data.question ? "Niyetli" : "Genel"} accent="text-cyan-300" />
      </div>

      {data.question ? (
        <ResultInfoPanel title="Niyetin">
          <p className="text-lg italic text-gray-200 leading-8">“{data.question}”</p>
        </ResultInfoPanel>
      ) : null}

      {cards.length ? (
        <ResultInfoPanel title="Seçilen Kartlar">
          <div className="grid md:grid-cols-3 gap-4">
            {cards.map((card, index) => (
              <div key={`${card.name}-${index}`} className="rounded-[1.5rem] border border-primary/20 bg-primary/5 px-5 py-6 text-center">
                <p className="text-xs uppercase tracking-[0.28em] text-primary/70 mb-4">{index + 1}. Kart</p>
                <div className="h-14 w-14 mx-auto rounded-2xl border border-primary/25 bg-primary/10 flex items-center justify-center text-primary text-2xl mb-4">
                  ✦
                </div>
                <p className="text-lg font-bold text-white">{card.name_tr || card.name}</p>
                <p className="text-sm text-gray-400 mt-2 leading-6">{card.reversed ? card.reversed_meaning : card.meaning}</p>
              </div>
            ))}
          </div>
        </ResultInfoPanel>
      ) : null}

      <ReadingResultBlocks content={data.fortune} fallbackTitle="Tarot Yorumu" />

      <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
        <Button onClick={() => navigate("/tarot")}>Yeni Tarot Açılımı</Button>
        <Button variant="outline" onClick={() => navigate("/readings")}>Diğer Fallara Dön</Button>
      </div>
    </FortunePageShell>
  );
}
