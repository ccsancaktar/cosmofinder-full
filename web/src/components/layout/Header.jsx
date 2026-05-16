import { motion } from "framer-motion";
import { Gem, Menu, X, Zap } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useDispatch, useSelector } from "react-redux";
import { logout as logoutAction } from "../../store/authSlice";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const { user } = useAuth();
  const { balance } = useSelector((state) => state.tokens);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem("jwt_token");

  const handleLogout = () => {
    localStorage.removeItem("jwt_token");
    dispatch(logoutAction());
    navigate("/login");
  };

  const navItems = [
    { label: "Ana Sayfa", href: "#hero" },
    { label: "Özellikler", href: "#features" },
    { label: "Fal Türleri", href: "#services" },
    { label: "İndir", href: "#download" },
  ];

  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/60 to-black/40 backdrop-blur-xl border-b border-white/20 shadow-2xl shadow-black/50"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16 md:h-20 px-4 md:px-8">
        {/* Logo */}
        <Link to={isAuthenticated ? "/readings" : "/"}>
          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
          >
            <img 
              src="/assets/icons/CosmoFinder-long.png" 
              alt="CosmoFinder"
              className="h-8 md:h-10 object-contain"
            />
          </motion.div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {!isAuthenticated && navItems.map((item) => (
            <motion.a
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-gray-300 hover:text-primary transition-colors"
              whileHover={{ y: -2 }}
            >
              {item.label}
            </motion.a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* Token Balance Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/add-balance")}
                className="flex items-center gap-2 px-4 py-2 glass rounded-lg border border-primary/30 hover:border-primary/50 transition-all"
              >
                <Zap size={18} className="text-primary" />
                <span className="font-semibold text-sm">{balance}</span>
              </motion.button>

              {/* User Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setIsUserDropdownOpen(true)}
                onMouseLeave={() => setIsUserDropdownOpen(false)}
              >
                <button className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/5 transition">
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Hoşgeldin</p>
                    <p className="font-semibold text-sm text-primary">{user?.name || user?.username || "Kullanıcı"}</p>
                  </div>
                  <svg className={`w-4 h-4 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </button>
                
                {isUserDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-56 bg-gradient-to-b from-black/60 to-black/40 backdrop-blur-xl rounded-lg border border-white/20 shadow-2xl shadow-black/50 py-2 z-50"
                  >
                  <button 
                    onClick={() => {
                      navigate("/add-balance");
                      setIsUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-primary hover:bg-white/5 transition flex items-center gap-2"
                  >
                    <span>💳</span> Bakiye Ekle
                  </button>
                  
                  <button 
                    onClick={() => {
                      navigate("/dashboard");
                      setIsUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-primary hover:bg-white/5 transition flex items-center gap-2"
                  >
                    <span>👤</span> Hesabım
                  </button>

                  {!user?.is_premium && (
                    <button 
                      onClick={() => {
                        navigate("/premium");
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-primary hover:bg-white/5 transition flex items-center gap-2 font-medium"
                    >
                      <span>⭐</span> Premium Yükselt
                    </button>
                  )}
                  
                  <div className="border-t border-white/10 my-1"></div>
                  
                  <button 
                    onClick={() => {
                      handleLogout();
                      setIsUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-red-400 hover:bg-white/5 transition flex items-center gap-2"
                  >
                    <span>🚪</span> Çıkış Yap
                  </button>
                  </motion.div>
                )}
              </div>
            </>
          ) : (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/login")}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-primary transition-colors"
              >
                Giriş Yap
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/register")}
                className="px-5 py-2.5 text-sm font-semibold bg-primary text-white rounded-lg"
              >
                Ücretsiz Dene
              </motion.button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-white/10"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </motion.button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-gradient-to-b from-black/60 to-black/40 backdrop-blur-xl border-b border-white/20"
        >
          <nav className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-2">
            {!isAuthenticated && navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="px-4 py-3 text-sm font-medium text-gray-300 hover:text-primary hover:bg-white/5 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            
            {isAuthenticated && (
              <>
                <div className="border-t border-white/10 pt-3 mt-3 pb-3">
                  <button 
                    onClick={() => {
                      navigate("/add-balance");
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-primary hover:bg-white/5 rounded transition flex items-center gap-2"
                  >
                    <Zap size={16} className="text-primary" /> <span className="font-semibold">{balance}</span> Token
                  </button>
                  
                  <button 
                    onClick={() => {
                      navigate("/add-balance");
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-primary hover:bg-white/5 rounded transition flex items-center gap-2"
                  >
                    <span>💳</span> Bakiye Ekle
                  </button>
                  
                  <button 
                    onClick={() => {
                      navigate("/dashboard");
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-primary hover:bg-white/5 rounded transition flex items-center gap-2"
                  >
                    <span>👤</span> Hesabım
                  </button>

                  {!user?.is_premium && (
                    <button 
                      onClick={() => {
                        navigate("/premium");
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-primary hover:bg-white/5 rounded transition flex items-center gap-2 font-medium"
                    >
                      <span>⭐</span> Premium Yükselt
                    </button>
                  )}
                </div>
              </>
            )}
            
            <div className="flex gap-2 mt-2 pt-2 border-t border-white/10">
              {isAuthenticated ? (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex-1 px-4 py-2.5 text-sm font-medium bg-white/5 text-gray-300 rounded-lg hover:text-primary transition-colors"
                >
                  Çıkış Yap
                </motion.button>
              ) : (
                <>
                  <button 
                    onClick={() => {
                      navigate("/login");
                      setIsMenuOpen(false);
                    }}
                    className="flex-1 px-4 py-2.5 text-sm font-medium bg-white/5 text-gray-300 rounded-lg hover:text-primary transition-colors"
                  >
                    Giriş Yap
                  </button>
                  <button 
                    onClick={() => {
                      navigate("/register");
                      setIsMenuOpen(false);
                    }}
                    className="flex-1 px-4 py-2.5 text-sm font-semibold bg-primary text-white rounded-lg"
                  >
                    Kayıt Ol
                  </button>
                </>
              )}
            </div>
          </nav>
        </motion.div>
      )}
    </motion.header>
  );
};

export default Header;
