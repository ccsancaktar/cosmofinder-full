import { useNavigate } from "react-router-dom";
import Button from "../components/common/Button";
import StarField from "../components/home/StarField";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen text-white relative pt-24 md:pt-32 overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <StarField count={60} />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      </div>

      <div className="text-center relative z-10">
        <h1 className="text-9xl font-black text-primary mb-4">404</h1>
        <h2 className="text-4xl font-bold text-white mb-4">
          Sayfa Bulunamadı
        </h2>
        <p className="text-xl text-gray-400 mb-8">
          Aradığınız sayfa mevcut değil. Lütfen ana sayfaya dönün.
        </p>
        <Button onClick={() => navigate("/")} size="lg">
          Anasayfaya Dön
        </Button>
      </div>
    </div>
  );
}
