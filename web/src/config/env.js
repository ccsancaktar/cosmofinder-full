const DEFAULT_BACKEND_BASE_URL = "https://cosmofinder.com";

function trimTrailingSlash(value) {
  return value?.replace(/\/+$/, "") ?? "";
}

function normalizeApiBaseUrl(value) {
  const trimmed = trimTrailingSlash(value);
  if (!trimmed) {
    return `${DEFAULT_BACKEND_BASE_URL}/api`;
  }
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
}

export const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_URL);
export const BACKEND_BASE_URL = API_BASE_URL.replace(/\/api$/, "");
export const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || "";
