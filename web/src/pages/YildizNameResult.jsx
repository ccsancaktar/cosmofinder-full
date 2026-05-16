import { useLocation, useNavigate } from "react-router-dom";
import FortunePageShell from "../components/layout/FortunePageShell";
import Button from "../components/common/Button";
import ReadingResultBlocks from "../components/readings/ReadingResultBlocks";
import { ResultHero, ResultInfoPanel, ResultStatCard } from "../components/readings/ResultChrome";

export default function YildizNameResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state;

  if (!data) {
    navigate("/yildizname");
    return null;
  }

  const profile = data.data || {};
  const motherName = profile.mother_name || profile.motherName;

  return (
    <FortunePageShell backTo="/yildizname">
      <ResultHero
        eyebrow="Yıldızname"
        title="Yıldızname Yorumun"
        subtitle={`${profile.name || "Kayıtlı isim"} için yıldızların taşıdığı kişisel akış çözümlendi.`}
      />

      <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
        <ResultStatCard label="İsim" value={profile.name} />
        <ResultStatCard label="Anne Adı" value={motherName} accent="text-pink-300" />
        <ResultStatCard label="Doğum Tarihi" value={profile.birth_date || profile.birthDate} accent="text-cyan-300" />
        <ResultStatCard label="Doğum Saati" value={profile.birth_time || profile.birthTime} accent="text-amber-300" />
        <ResultStatCard label="Doğum Yeri" value={profile.birth_place || profile.birthPlace} accent="text-violet-300" />
      </div>

      <ReadingResultBlocks content={data.fortune} fallbackTitle="Yıldızname Yorumu" />

      <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
        <Button onClick={() => navigate("/yildizname")}>Yeni Yıldızname</Button>
        <Button variant="outline" onClick={() => navigate("/readings")}>Diğer Fallara Dön</Button>
      </div>
    </FortunePageShell>
  );
}
