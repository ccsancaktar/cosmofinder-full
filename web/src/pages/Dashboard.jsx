import { useAuth } from "../hooks/useAuth";
import { useSelector } from "react-redux";
import Button from "../components/common/Button";
import StarField from "../components/home/StarField";
import { Zap, Crown, Clock, TrendingUp, ArrowRight, Settings } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import readingsService from "../services/readingsService";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { balance } = useSelector((state) => state.tokens);
  const { isPremium, plan } = useSelector((state) => state.premium);
  const [recentReadings, setRecentReadings] = useState([]);
  const [totalReadings, setTotalReadings] = useState(0);
  const [lastReadingTime, setLastReadingTime] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReadingHistory = async () => {
      try {
        setLoading(true);
        console.log("📖 Fal geçmişi çekiliyor...");
        const response = await readingsService.getReadingHistory();
        console.log("📖 Response:", response.data);
        
        if (response.data && response.data.readings) {
          // Son 3 falı al
          const recent = response.data.readings.slice(0, 3);
          console.log("📖 Son fallar:", recent);
          setRecentReadings(recent);
          setTotalReadings(response.data.readings.length);
          
          // Son falın zamanını hesapla
          if (recent.length > 0) {
            const lastTime = new Date(recent[0].created_at);
            const now = new Date();
            const diffMs = now - lastTime;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);
            
            if (diffMins < 1) {
              setLastReadingTime("Az önce");
            } else if (diffMins < 60) {
              setLastReadingTime(`${diffMins} dakika önce`);
            } else if (diffHours < 24) {
              setLastReadingTime(`${diffHours} saat önce`);
            } else if (diffDays < 7) {
              setLastReadingTime(`${diffDays} gün önce`);
            } else {
              setLastReadingTime(new Date(recent[0].created_at).toLocaleDateString('tr-TR'));
            }
          }
        } else {
          console.log("📖 Readings array bulunamadı");
        }
      } catch (error) {
        console.error("❌ Fal geçmişi alınamadı:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReadingHistory();
  }, []);

  const stats = [
    { label: "Bu Ay Token", value: "200" },
    { label: "Toplam Fal", value: totalReadings },
    { label: "En Popüler", value: recentReadings.length > 0 ? (recentReadings[0].type_display || recentReadings[0].reading_type) : "-" },
  ];

  return (
    <div className="min-h-screen text-white relative pt-24 md:pt-32 py-12 px-4 overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <StarField count={60} />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-black font-decorative gradient-text mb-3">
            Hoşgeldin, {user?.name || user?.username}! ✨
          </h1>
          <p className="text-gray-400 text-lg">
            Kader yolculuğuna devam et, fal çekmeye başla
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {/* Token Balance */}
          <div className="glass rounded-xl p-6 border border-primary/20 hover:border-primary/40 transition hover:shadow-lg hover:shadow-primary/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Token Bakiyesi</p>
                <p className="text-3xl font-bold text-primary mt-1">{balance}</p>
              </div>
              <div className="p-3 glass rounded-lg border border-primary/30">
                <Zap size={24} className="text-primary" />
              </div>
            </div>
          </div>

          {/* Plan Status */}
          <div className="glass rounded-xl p-6 border border-secondary/20 hover:border-secondary/40 transition hover:shadow-lg hover:shadow-secondary/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Mevcut Plan</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {isPremium ? plan || "Premium" : "Temel"}
                </p>
              </div>
              <div className={`p-3 glass rounded-lg border ${isPremium ? 'border-accent/30' : 'border-gray-500/30'}`}>
                <Crown size={24} className={isPremium ? "text-accent" : "text-gray-400"} />
              </div>
            </div>
          </div>

          {/* Readings Count */}
          <div className="glass rounded-xl p-6 border border-accent/20 hover:border-accent/40 transition hover:shadow-lg hover:shadow-accent/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Çekilen Fal</p>
                <p className="text-3xl font-bold text-white mt-1">24</p>
              </div>
              <div className="p-3 glass rounded-lg border border-accent/30">
                <TrendingUp size={24} className="text-accent" />
              </div>
            </div>
          </div>

          {/* Last Reading */}
          <div className="glass rounded-xl p-6 border border-cyan-400/20 hover:border-cyan-400/40 transition hover:shadow-lg hover:shadow-cyan-400/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Son Fal</p>
                <p className="text-2xl font-bold text-white mt-1">{lastReadingTime || "-"}</p>
              </div>
              <div className="p-3 glass rounded-lg border border-cyan-400/30">
                <Clock size={24} className="text-cyan-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="glass rounded-xl p-8 border border-white/10 hover:border-primary/20 transition">
              <h2 className="text-2xl font-bold gradient-text mb-6">Hızlı İşlemler</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link to="/readings">
                  <Button className="w-full" variant="primary">
                    Fal Çek
                  </Button>
                </Link>
                <Link to="/add-balance">
                  <Button variant="secondary" className="w-full">
                    Token Al
                  </Button>
                </Link>
                <Link to="/reading-history">
                  <Button variant="ghost" className="w-full">
                    Geçmişi Gör
                  </Button>
                </Link>
                <Link to="/edit-profile" className="w-full">
                  <Button variant="outline" className="w-full">
                    Profili Düzenle
                  </Button>
                </Link>
              </div>
            </div>

            {/* Recent Readings */}
            <div className="glass rounded-xl p-8 border border-white/10 hover:border-primary/20 transition">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold gradient-text">Son Fallarınız</h2>
                <Link to="/reading-history">
                  <ArrowRight size={20} className="text-primary hover:translate-x-1 transition" />
                </Link>
              </div>
              <div className="space-y-3">
                {loading ? (
                  <div className="py-8 flex justify-center">
                    <div className="w-12 h-12 border-4 border-light-bg rounded-full border-t-primary animate-spin"></div>
                  </div>
                ) : recentReadings.length > 0 ? (
                  recentReadings.map((reading, idx) => (
                    <Link
                      key={reading.id || idx}
                      to={`/reading-history/${reading.id}`}
                      className="block"
                    >
                      <div className="flex items-center justify-between p-4 glass rounded-lg border border-white/10 hover:border-primary/30 hover:bg-white/5 transition cursor-pointer group">
                      <div>
                        <p className="font-semibold text-white group-hover:text-primary transition">
                          {reading.type_display || reading.reading_type}
                        </p>
                        <p className="text-sm text-gray-400">{reading.created_at_display}</p>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 glass rounded-full border border-primary/30 bg-primary/10">
                        <Zap size={16} className="text-primary" />
                        <span className="text-primary font-bold text-sm">{reading.tokens || '-'}</span>
                      </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400">Henüz fal çekilmemiş</p>
                    <Link to="/readings">
                      <Button className="mt-4">Fal Çek</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Premium Upgrade Card */}
            {!isPremium && (
              <div className="glass rounded-xl p-8 border border-gradient-to-r from-accent/50 to-secondary/50 hover:border-accent/70 transition relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-secondary/10 opacity-0 group-hover:opacity-100 transition"></div>
                <div className="relative">
                  <h3 className="text-xl font-bold gradient-text mb-2">Premium'a Yükselt</h3>
                  <p className="text-gray-300 mb-6 text-sm leading-relaxed">
                    Sınırsız fal çekmek, reklamsız deneyim ve daha pek çok özel özelliğin keyfini çıkar.
                  </p>
                  <Link to="/premium">
                    <Button className="w-full" variant="accent">
                      Premium'a Geç
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Profile Card */}
            <div className="glass rounded-xl p-6 border border-white/10 hover:border-primary/20 transition">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Profil Bilgileri</h3>
                <button 
                  onClick={() => navigate("/edit-profile")}
                  className="text-gray-400 hover:text-primary transition cursor-pointer"
                >
                  <Settings size={18} />
                </button>
              </div>
              <div className="space-y-4">
                <div className="p-3 glass rounded-lg border border-white/10">
                  <p className="text-gray-400 text-xs font-medium mb-1">Adı Soyadı</p>
                  <p className="text-white font-semibold">{user?.name || (user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : user?.username)}</p>
                </div>
                <div className="p-3 glass rounded-lg border border-white/10">
                  <p className="text-gray-400 text-xs font-medium mb-1">Email</p>
                  <p className="text-white font-semibold text-sm break-all">{user?.email}</p>
                </div>
                <div className="p-3 glass rounded-lg border border-white/10">
                  <p className="text-gray-400 text-xs font-medium mb-1">Burç</p>
                  <p className="text-white font-semibold">{user?.zodiac_sign || user?.zodiacSign || "-"}</p>
                </div>
                <Link to="/edit-profile">
                  <Button variant="outline" className="w-full text-sm">
                    Profili Düzenle
                  </Button>
                </Link>
                <Link to="/change-password">
                  <Button variant="ghost" className="w-full text-sm">
                    Şifre Değiştir
                  </Button>
                </Link>
              </div>
            </div>

            {/* Statistics */}
            <div className="glass rounded-xl p-6 border border-white/10 hover:border-primary/20 transition">
              <h3 className="text-lg font-bold text-white mb-4">İstatistikler</h3>
              <div className="space-y-3">
                {stats.map((stat, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-3 glass rounded-lg border border-white/10 hover:border-primary/30 transition"
                  >
                    <span className="text-gray-400 text-sm">{stat.label}</span>
                    <span className="text-white font-bold text-primary">{stat.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3">
                <Link to="/token-history">
                  <Button variant="ghost" className="w-full text-sm">
                    Token Geçmişi
                  </Button>
                </Link>
                <Link to="/reading-history">
                  <Button variant="outline" className="w-full text-sm">
                    Tüm Falları Gör
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
