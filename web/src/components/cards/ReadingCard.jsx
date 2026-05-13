import { Info, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ReadingCard({ reading, onClick }) {
  const navigate = useNavigate();

  const handleClick = () => {
    // Tarot, Yildizname, Rune, Chinese, Kabala ve Daily için doğrudan sayfaya git
    if (reading.id === "tarot") {
      navigate("/tarot");
    } else if (reading.id === "yildizname") {
      navigate("/yildizname");
    } else if (reading.id === "rune") {
      navigate("/rune");
    } else if (reading.id === "chinese") {
      navigate("/chinese");
    } else if (reading.id === "kabala") {
      navigate("/kabala");
    } else if (reading.id === "daily") {
      navigate("/daily");
    } else if (onClick) {
      onClick();
    } else {
      // Diğer fallar için henüz sayfalar yoksa Readings'e git
      navigate(`/readings/${reading.id}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="group glass overflow-hidden cursor-pointer transition-all duration-300 hover:border-primary/50 border border-white/10 hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-1 rounded-xl"
    >
      {/* Image Section */}
      <div className="relative h-48 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 overflow-hidden">
        {reading.backgroundImage && (
          <img
            src={reading.backgroundImage}
            alt={reading.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        )}
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        
        {/* Info Button */}
        <button
          className="absolute top-3 right-3 glass rounded-full p-2.5 transition hover:bg-primary/20 border border-white/20 hover:border-primary/50"
          title="Bilgi"
        >
          <Info size={18} className="text-primary" />
        </button>

        {/* Badge */}
        <div className="absolute top-3 left-3">
          <div className="flex items-center gap-1 glass px-3 py-1 rounded-full border border-primary/30">
            <Sparkles size={14} className="text-primary" />
            <span className="text-xs font-semibold text-primary">{reading.tokenCost} Token</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5">
        <h3 className="text-lg font-bold gradient-text mb-2">{reading.name}</h3>
        <p className="text-sm text-gray-400 line-clamp-2 mb-4 leading-relaxed">
          {reading.description}
        </p>
        
        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <span className="text-xs text-primary/80 font-medium">Hemen Çek</span>
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/60"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-secondary/60"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-accent/60"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
