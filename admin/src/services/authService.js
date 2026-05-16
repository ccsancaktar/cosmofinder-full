import API from "./api";

const authService = {
  login: async (username, password) => {
    const response = await API.post("/admin/auth/login", { username, password });
    if (response.data.token) {
      localStorage.setItem("admin_jwt_token", response.data.token);
    }
    return response;
  },
  getProfile: async () => API.get("/admin/auth/me"),
  logout: () => {
    localStorage.removeItem("admin_jwt_token");
  },
  isAuthenticated: () => !!localStorage.getItem("admin_jwt_token"),
};

export default authService;
