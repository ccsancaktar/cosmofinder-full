import axios from "axios";
import { API_BASE_URL } from "../config/env";

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// JWT token interceptor
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("jwt_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("jwt_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default API;
