import * as Sentry from '@sentry/react-native';

// Sentry'yi başlat
export const initSentry = () => {
  // Production'da Sentry'yi aktif et
  if (__DEV__) {
    console.log('Sentry development modunda devre dışı');
    return;
  }
  
  // Production'da Sentry DSN kontrolü
  const sentryDsn = process.env.SENTRY_DSN;
  if (!sentryDsn || sentryDsn.includes('your-production-sentry-dsn')) {
    console.warn('Sentry DSN bulunamadı veya placeholder kullanılıyor');
    return;
  }

  try {
    Sentry.init({
      // DSN key'i buraya eklenecek (production'da)
      dsn: process.env.SENTRY_DSN || 'https://your-production-sentry-dsn@your-instance.ingest.sentry.io/your-project-id',
      
      // Environment
      environment: process.env.NODE_ENV || 'production',
      
      // Release version
      release: '1.0.0',
      
      // Debug mode
      debug: false,
      
      // Performance monitoring
      tracesSampleRate: 0.2,
      
      // Error sampling
      sampleRate: 1.0,
      
      // Breadcrumbs
      beforeBreadcrumb: (breadcrumb) => {
        // Hassas bilgileri filtrele
        if (breadcrumb.category === 'http') {
          delete breadcrumb.data?.request_body;
          delete breadcrumb.data?.response_body;
        }
        return breadcrumb;
      },
      
      // Error filtering
      beforeSend: (event) => {
        // Network hatalarını filtrele
        if (event.exception && event.exception.values) {
          const isNetworkError = event.exception.values.some(
            (exception) => exception.value?.includes('Network Error')
          );
          if (isNetworkError) {
            return null; // Bu hatayı gönderme
          }
        }
        
        // Kullanıcı bilgilerini ekle
        if (event.user) {
          event.user.ip_address = '{{auto}}';
        }
        
        return event;
      },
      
      // Integrations
      integrations: [
        // React Navigation integration
        new Sentry.ReactNavigationInstrumentation({
          routingInstrumentation: Sentry.routingInstrumentation,
        }),
      ],
      
      // Auto session tracking
      autoSessionTracking: true,
      
      // Session timeout
      sessionTrackingTimeoutMillis: 30000,
    });

    console.log('Sentry başarıyla başlatıldı');
  } catch (error) {
    console.error('Sentry başlatma hatası:', error);
  }
};

// Hata yakalama
export const captureException = (error, context = {}) => {
  if (__DEV__) {
    console.error('Error (Development):', error, context);
    return;
  }
  
  try {
    Sentry.captureException(error, {
      extra: context,
      tags: {
        component: context.component || 'unknown',
        action: context.action || 'unknown'
      }
    });
  } catch (sentryError) {
    console.error('Sentry error capture failed:', sentryError);
  }
};

// Message yakalama
export const captureMessage = (message, level = 'info', context = {}) => {
  if (__DEV__) {
    console.log(`Message (${level}):`, message, context);
    return;
  }
  
  try {
    Sentry.captureMessage(message, {
      level: level,
      extra: context,
      tags: {
        component: context.component || 'unknown',
        action: context.action || 'unknown'
      }
    });
  } catch (sentryError) {
    console.error('Sentry message capture failed:', sentryError);
  }
};

// Performance monitoring
export const startTransaction = (name, operation) => {
  if (__DEV__) return null;
  
  try {
    return Sentry.startTransaction({
      name,
      op: operation
    });
  } catch (error) {
    console.error('Sentry transaction start failed:', error);
    return null;
  }
};

// User context
export const setUser = (user) => {
  if (__DEV__) return;
  
  try {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
      premium: user.premium || false
    });
  } catch (error) {
    console.error('Sentry setUser failed:', error);
  }
};

// Clear user context
export const clearUser = () => {
  if (__DEV__) return;
  
  try {
    Sentry.setUser(null);
  } catch (error) {
    console.error('Sentry clearUser failed:', error);
  }
};

// Tag ekleme
export const setTag = (key, value) => {
  if (__DEV__) return;
  
  try {
    Sentry.setTag(key, value);
  } catch (error) {
    console.error('Sentry setTag failed:', error);
  }
};

// Context ekleme
export const setContext = (name, context) => {
  if (__DEV__) return;
  
  try {
    Sentry.setContext(name, context);
  } catch (error) {
    console.error('Sentry setContext failed:', error);
  }
};
