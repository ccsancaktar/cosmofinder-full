import { ArrowLeft, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import StarField from "../home/StarField";

export default function FortunePageShell({
  title,
  subtitle,
  tokenBalance,
  children,
  backTo = "/",
}) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden text-white">
      <StarField />

      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(ellipse at top, transparent 0%, hsl(230 25% 8%) 70%),
            radial-gradient(ellipse at bottom, hsl(280 30% 10% / 0.5) 0%, transparent 60%)
          `,
        }}
      />

      <div className="relative z-10">
        <nav className="w-full py-6 px-6 md:px-12">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition"
              onClick={() => navigate("/")}
            >
              <span className="text-primary text-2xl">✦</span>
              <span className="font-bold text-xl md:text-2xl text-transparent bg-gradient-to-r from-yellow-300 via-primary to-yellow-500 bg-clip-text">
                FORTUNE FINDER
              </span>
            </div>

            <div className="flex items-center gap-3">
              {tokenBalance !== undefined ? (
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-primary/30">
                  <span className="text-gray-300">Token:</span>
                  <span className="font-bold text-primary">{tokenBalance}</span>
                </div>
              ) : null}

              <button
                onClick={() => navigate(backTo)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/30 hover:border-primary/50 text-primary hover:text-white transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4" />
                Geri Dön
              </button>
            </div>
          </div>
        </nav>

        <main className="pb-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <Sparkles className="w-10 h-10 text-primary mx-auto mb-4" />
              <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-gradient-to-r from-yellow-300 via-primary to-yellow-500 bg-clip-text mb-4">
                {title}
              </h1>
              {subtitle ? (
                <p className="text-gray-400 max-w-2xl mx-auto text-lg">{subtitle}</p>
              ) : null}
            </div>

            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
