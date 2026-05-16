import API from "./api";

const adminService = {
  getOverview: async () => API.get("/admin/overview"),
  getSystem: async () => API.get("/admin/system"),
  searchUsers: async (query = "", limit = 12) => API.get("/admin/users", { params: { q: query, limit } }),
  getUser: async (userId) => API.get(`/admin/users/${userId}`),
  updateUser: async (userId, payload) => API.patch(`/admin/users/${userId}`, payload),
};

export default adminService;
