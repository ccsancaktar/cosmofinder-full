import { useNavigate } from "react-router-dom";
import ReadingCard from "../components/cards/ReadingCard";
import StarField from "../components/home/StarField";
import { Sparkles } from "lucide-react";
import tarotImg from "../assets/tarot.jpg";
import yildiznameImg from "../assets/yildizname.jpg";
import kahveImg from "../assets/kahve-fali.jpg";
import kablImg from "../assets/kabala.jpg";
import runeImg from "../assets/rune.jpg";
import cinImg from "../assets/cin-fali.jpg";

const allReadings = [
  {
    id: "yildizname",
    name: "Yıldızname",
    description: "Doğum bilgilerinizle detaylı astroloji yorumu. Gezegenlerin konumu, burçlar ve yükselen burç analizleri.",
    tokenCost: 50,
    backgroundImage: yildiznameImg,
  },
  {
    id: "tarot",
    name: "Tarot",
    description: "78 kartlık tarot destesiyle detaylı gelecek yorumu. Çeşitli açılış yöntemleri ile kişiye özel analiz.",
    tokenCost: 35,
    backgroundImage: tarotImg,
  },
  {
    id: "coffee",
    name: "Kahve Falı",
    description: "Kahve fincanı fotografı ile geleneksel Türk kahve falı. 3 adet fotoğraf yükleyerek detaylı analiz alın.",
    tokenCost: 25,
    backgroundImage: kahveImg,
  },
  {
    id: "rune",
    name: "Rune",
    description: "Eski Viking runeleriyle gelecek çekimi. Antik İskandinav sembolleriyle kişiye özel yorum.",
    tokenCost: 30,
    backgroundImage: runeImg,
  },
  {
    id: "chinese",
    name: "Çin Falı",
    description: "Ba Zi analizi ile element analizi. Doğum tarihiniz ve saatinize göre Çin astrolojisi.",
    tokenCost: 40,
    backgroundImage: cinImg,
  },
  {
    id: "daily",
    name: "Günlük Burç Yorumu",
    description: "Burcunuza göre günlük astroloji yorumu. Her gün yeni ve güncel yorum ile başlayın.",
    tokenCost: 15,
    backgroundImage: tarotImg,
  },
  {
    id: "kabala",
    name: "Kabala",
    description: "İbrani mistik geleceği ile ruhsal yorum. Numeroloji ve mistik sembolleriyle detaylı analiz.",
    tokenCost: 45,
    backgroundImage: kablImg,
  },
];

export default function Readings() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen text-white relative pt-24 md:pt-32 overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <StarField count={60} />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="text-primary" size={32} />
          </div>
          <h1 className="text-5xl font-black font-decorative gradient-text mb-4">
            Tüm Fal Türleri
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Farklı fal yöntemleriyle geleceğine bakış at ve kaderini keşfet
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allReadings.map((reading) => (
            <ReadingCard
              key={reading.id}
              reading={reading}
              onClick={() => navigate(`/readings/${reading.id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
