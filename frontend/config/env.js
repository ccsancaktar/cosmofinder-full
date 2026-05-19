import {
  API_URL,
  STRIPE_PUBLISHABLE_KEY,
  REVENUECAT_IOS_API_KEY,
  REVENUECAT_ANDROID_API_KEY,
} from "@env";

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

export const API_BASE_URL = normalizeApiBaseUrl(API_URL);
export const BACKEND_BASE_URL = API_BASE_URL.replace(/\/api$/, "");
export const STRIPE_PUBLIC_KEY = STRIPE_PUBLISHABLE_KEY || "";
export const REVENUECAT_IOS_PUBLIC_KEY = REVENUECAT_IOS_API_KEY || "";
export const REVENUECAT_ANDROID_PUBLIC_KEY = REVENUECAT_ANDROID_API_KEY || "";
