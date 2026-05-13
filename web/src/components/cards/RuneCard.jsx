import { RotateCw } from "lucide-react";

export default function RuneCard({ rune, isReversed = false, onClick }) {
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer h-full"
    >
      <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-cyan-900/50 to-blue-900/50 border border-cyan-500/30 transition-all duration-300 hover:border-secondary hover:shadow-lg hover:shadow-secondary/20">
        {/* Rune Symbol Display */}
        <div className="relative w-40 h-48 bg-dark-bg/50 flex items-center justify-center overflow-hidden mx-auto pt-2">
          <div className="flex flex-col items-center justify-center">
            <span 
              className="text-8xl font-bold text-secondary" 
              style={{ 
                lineHeight: '1',
                transform: isReversed ? 'scaleY(-1)' : 'none'
              }}
            >
              {rune.symbol}
            </span>
          </div>

          {/* Reversed Indicator */}
          {isReversed && (
            <div className="absolute top-2 right-2 bg-red-500/80 rounded-full p-1">
              <RotateCw size={14} className="text-white" />
            </div>
          )}
        </div>

        {/* Rune Info */}
        <div className="p-4 bg-gradient-to-t from-dark-bg/80 to-transparent">
          <h3 className="font-semibold text-secondary text-center mb-2">
            {rune.name}
          </h3>

          {rune.meaning && (
            <p className="text-xs text-gray-400 text-center line-clamp-3">
              {rune.meaning}
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
