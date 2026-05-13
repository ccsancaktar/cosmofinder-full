import * as ImageManipulator from 'expo-image-manipulator';

// Resim boyutlarını optimize et
export const optimizeImageSize = async (uri, maxWidth = 800, maxHeight = 800, quality = 0.8) => {
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: maxWidth, height: maxHeight } }],
      {
        compress: quality,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );
    return result.uri;
  } catch (error) {
    console.error('Resim boyutlandırma hatası:', error);
    return uri; // Hata durumunda orijinal URI'yi döndür
  }
};

// Resim formatını dönüştür
export const convertImageFormat = async (uri, format = 'JPEG', quality = 0.8) => {
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [],
      {
        compress: quality,
        format: ImageManipulator.SaveFormat[format.toUpperCase()],
      }
    );
    return result.uri;
  } catch (error) {
    console.error('Resim format dönüştürme hatası:', error);
    return uri;
  }
};

// Resim kalitesini ayarla
export const adjustImageQuality = async (uri, quality = 0.8) => {
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [],
      {
        compress: quality,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );
    return result.uri;
  } catch (error) {
    console.error('Resim kalite ayarlama hatası:', error);
    return uri;
  }
};

// Resim boyutlarını al
export const getImageDimensions = async (uri) => {
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [],
      { format: ImageManipulator.SaveFormat.JPEG }
    );
    return { width: result.width, height: result.height };
  } catch (error) {
    console.error('Resim boyutları alınamadı:', error);
    return null;
  }
};

// Resim cache key'i oluştur
export const generateImageCacheKey = (uri, width, height, quality) => {
  const url = new URL(uri);
  const params = new URLSearchParams({
    w: width || 'auto',
    h: height || 'auto',
    q: quality || '80',
    t: Date.now() // Cache busting için timestamp
  });
  return `${url.origin}${url.pathname}?${params.toString()}`;
};

// Resim yükleme önceliği belirle
export const getImagePriority = (imageType) => {
  const priorities = {
    'profile': 'high',
    'background': 'low',
    'tarot': 'medium',
    'icon': 'high',
    'default': 'medium'
  };
  return priorities[imageType] || priorities.default;
};

// Resim boyutunu ekran boyutuna göre ayarla
export const getResponsiveImageSize = (baseSize, screenWidth) => {
  if (screenWidth < 375) return baseSize * 0.8; // iPhone SE
  if (screenWidth < 414) return baseSize; // iPhone 6/7/8/11/12/13
  if (screenWidth < 768) return baseSize * 1.2; // iPad
  return baseSize * 1.5; // iPad Pro
};

// Resim yükleme stratejisi
export const getImageLoadingStrategy = (imageType, isVisible) => {
  if (imageType === 'profile' || imageType === 'icon') {
    return 'eager'; // Hemen yükle
  }
  
  if (imageType === 'background') {
    return isVisible ? 'lazy' : 'none'; // Sadece görünür olduğunda yükle
  }
  
  return 'lazy'; // Varsayılan olarak lazy loading
};
