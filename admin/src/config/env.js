const DEFAULT_BACKEND_BASE_URL = "http://localhost:5050";

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
