import API from "./api";

const authService = {
  // Kayıt
  register: async (userData) => {
    return API.post("/auth/register", userData);
  },

  // Giriş
  login: async (email, password) => {
    const response = await API.post("/auth/login", { username: email, password });
    if (response.data.token) {
      localStorage.setItem("jwt_token", response.data.token);
    }
    return response;
  },

  // Google OAuth
  googleLogin: async (code) => {
    const response = await API.post("/auth/google/login", { code });
    if (response.data.token) {
      localStorage.setItem("jwt_token", response.data.token);
    }
    return response;
  },

  // Profil al
  getProfile: async () => {
    return API.get("/auth/profile");
  },

  // Token balance al
  getTokenBalance: async () => {
    return API.get("/tokens/balance");
  },

  // Profil güncelle
  updateProfile: async (profileData) => {
    return API.put("/auth/profile", profileData);
  },

  // Çıkış
  logout: () => {
    localStorage.removeItem("jwt_token");
  },

  // Token kontrol
  getToken: () => localStorage.getItem("jwt_token"),

  // Giriş yapmış mı
  isAuthenticated: () => !!localStorage.getItem("jwt_token"),
};

export default authService;
