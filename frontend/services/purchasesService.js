import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL, PRODUCT_CATEGORY } from 'react-native-purchases';
import {
  REVENUECAT_ANDROID_PUBLIC_KEY,
  REVENUECAT_IOS_PUBLIC_KEY,
} from '../config/env';

const TOKEN_PRODUCT_IDS = [
  'token_pack_small',
  'token_pack_medium',
  'token_pack_large',
];

class PurchasesService {
  constructor() {
    this.initialized = false;
    this.currentAppUserId = null;
  }

  getApiKey() {
    return Platform.OS === 'ios'
      ? REVENUECAT_IOS_PUBLIC_KEY
      : REVENUECAT_ANDROID_PUBLIC_KEY;
  }

  isConfigured() {
    return Boolean(this.getApiKey());
  }

  async initialize(appUserId = null) {
    if (!this.isConfigured()) {
      console.warn('RevenueCat public key bulunamadı; store billing pasif kalacak.');
      return false;
    }

    if (this.initialized) {
      if (appUserId && this.currentAppUserId !== appUserId) {
        await this.logIn(appUserId);
      }
      return true;
    }

    Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.INFO);

    await Purchases.configure({
      apiKey: this.getApiKey(),
      appUserID: appUserId || undefined,
    });

    this.initialized = true;
    this.currentAppUserId = appUserId || null;
    return true;
  }

  async logIn(appUserId) {
    if (!appUserId) {
      return false;
    }

    await this.initialize();

    if (!this.initialized) {
      return false;
    }

    if (this.currentAppUserId === appUserId) {
      return true;
    }

    await Purchases.logIn(String(appUserId));
    this.currentAppUserId = String(appUserId);
    return true;
  }

  async logOut() {
    if (!this.initialized) {
      return;
    }

    await Purchases.logOut();
    this.currentAppUserId = null;
  }

  async getCurrentOffering() {
    await this.initialize();
    if (!this.initialized) {
      return null;
    }

    const offerings = await Purchases.getOfferings();
    return offerings?.current ?? null;
  }

  async getTokenProducts() {
    await this.initialize();
    if (!this.initialized) {
      return [];
    }

    const products = await Purchases.getProducts(
      TOKEN_PRODUCT_IDS,
      PRODUCT_CATEGORY.NON_SUBSCRIPTION
    );
    return Array.isArray(products) ? products : [];
  }

  async purchasePackage(pkg) {
    await this.initialize();
    if (!this.initialized) {
      throw new Error('Store billing yapılandırılmadı');
    }

    return Purchases.purchasePackage(pkg);
  }

  async purchaseProduct(product) {
    await this.initialize();
    if (!this.initialized) {
      throw new Error('Store billing yapılandırılmadı');
    }

    return Purchases.purchaseStoreProduct(product);
  }

  async restorePurchases() {
    await this.initialize();
    if (!this.initialized) {
      throw new Error('Store billing yapılandırılmadı');
    }

    return Purchases.restorePurchases();
  }

  getTokenProductIds() {
    return [...TOKEN_PRODUCT_IDS];
  }
}

const purchasesService = new PurchasesService();

export default purchasesService;
