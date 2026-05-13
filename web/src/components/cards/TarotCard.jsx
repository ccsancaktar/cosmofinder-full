import { RotateCw } from "lucide-react";
import { BACKEND_BASE_URL } from "../../config/env";

export default function TarotCard({ card, isReversed = false, onClick }) {
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer h-full"
    >
      <div className={`relative rounded-lg overflow-hidden bg-gradient-to-br from-purple-900/50 to-indigo-900/50 border border-purple-500/30 transition-all duration-300 hover:border-primary hover:shadow-lg hover:shadow-primary/20 ${isReversed ? 'scale-y-[-1]' : ''}`}>
        {/* Card Image */}
        <div className="relative w-40 h-48 bg-dark-bg/50 flex items-center justify-center overflow-hidden mx-auto pt-2">
          {card.image ? (
            <img
              src={`${BACKEND_BASE_URL}/assets/tarot/${card.image}`}
              alt={card.name_tr || card.name}
              className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/300x500?text=No+Image";
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
              <span className="text-gray-500 text-sm">Görsel yok</span>
            </div>
          )}

          {/* Reversed Indicator */}
          {isReversed && (
            <div className="absolute top-2 right-2 bg-red-500/80 rounded-full p-1">
              <RotateCw size={14} className="text-white" />
            </div>
          )}
        </div>

        {/* Card Info */}
        <div className="p-4 bg-gradient-to-t from-dark-bg/80 to-transparent">
          <h3 className="font-semibold text-primary text-center mb-2">
            {card.name_tr || card.name}
          </h3>

          {card.meaning && (
            <p className="text-xs text-gray-400 text-center line-clamp-3">
              {card.meaning}
            </p>
          )}

          {isReversed && (
            <p className="text-xs text-red-400/80 text-center mt-2 font-medium">
              Ters Çıkış
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
