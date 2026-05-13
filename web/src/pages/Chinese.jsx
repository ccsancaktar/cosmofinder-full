import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ChineseForm from "../components/readings/ChineseForm";
import StarField from "../components/home/StarField";
import ProtectedRoute from "../components/auth/ProtectedRoute";

function ChineseContent() {
  const navigate = useNavigate();
  const tokenBalance = useSelector((state) => state.tokens.balance);

  return (
    <div className="min-h-screen relative overflow-hidden text-white">
      {/* Animated Star Background */}
      <StarField />
      
      {/* Gradient Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(ellipse at top, transparent 0%, hsl(230 25% 8%) 70%),
            radial-gradient(ellipse at bottom, hsl(280 30% 10% / 0.5) 0%, transparent 60%)
          `,
        }}
      />
      
      {/* Main Content */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="w-full py-6 px-6 md:px-12">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition" onClick={() => navigate("/")}>
              <span className="text-primary text-2xl">✦</span>
              <span className="font-bold text-xl md:text-2xl text-transparent bg-gradient-to-r from-yellow-300 via-primary to-yellow-500 bg-clip-text">
                FORTUNE FINDER
              </span>
            </div>
            {tokenBalance !== undefined && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-primary/30">
                <span className="text-gray-300">Token:</span>
                <span className="font-bold text-primary">{tokenBalance}</span>
              </div>
            )}
          </div>
        </nav>

        {/* Fortune Form */}
        <main className="pb-16">
          <ChineseForm />
        </main>
        
        {/* Footer */}
        <footer className="w-full py-8 border-t border-primary/20">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-gray-500 text-xs">
              © 2026 Fortune Finder. Tüm hakları saklıdır.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function Chinese() {
  return (
    <ProtectedRoute>
      <ChineseContent />
    </ProtectedRoute>
  );
}
