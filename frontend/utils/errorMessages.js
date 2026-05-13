import i18n from '../locales/i18n';

const DIRECT_MESSAGE_MAP = {
  'Email adresi gereklidir': 'auth.emailRequired',
  'E-posta adresi gereklidir': 'auth.emailRequired',
  'Şifre gereklidir': 'auth.passwordRequired',
  'Şifreler eşleşmiyor': 'auth.passwordsDoNotMatch',
  'Geçersiz kullanıcı adı veya şifre': 'errors.invalidCredentials',
  'Kullanıcı adı ve şifre gereklidir': 'auth.usernamePasswordRequired',
  'Kullanıcı bulunamadı': 'errors.userNotFound',
  'Bu email adresi zaten kayıtlı': 'auth.emailAlreadyRegistered',
  'Geçersiz email formatı': 'errors.invalidEmail',
  'Günlük video limiti doldu': 'common.dailyVideoLimitReached',
  'Yetersiz token bakiyesi': 'errors.insufficientTokens',
  'Ödeme başarısız': 'paymentModal.paymentStartFailed',
};

function translate(key, fallback) {
  const translated = i18n.t(key);
  return translated === key ? fallback : translated;
}

export function normalizeErrorMessage(input, fallbackKey = 'errors.general') {
  const fallback = translate(fallbackKey, i18n.t('errors.general'));

  if (!input) {
    return fallback;
  }

  const axiosErrorMessage =
    input?.response?.data?.error ||
    input?.response?.data?.message ||
    input?.message ||
    (typeof input === 'string' ? input : '');

  const rawMessage = String(axiosErrorMessage || '').trim();

  if (!rawMessage) {
    return fallback;
  }

  if (input?.code === 'ECONNABORTED' || rawMessage.toLowerCase().includes('timeout')) {
    return translate('errors.timeout', rawMessage);
  }

  if (
    input?.code === 'ERR_NETWORK' ||
    rawMessage.toLowerCase() === 'network error' ||
    rawMessage.toLowerCase().includes('ağ hatası')
  ) {
    return translate('errors.network', rawMessage);
  }

  if (DIRECT_MESSAGE_MAP[rawMessage]) {
    return translate(DIRECT_MESSAGE_MAP[rawMessage], rawMessage);
  }

  if (rawMessage.includes('Şifre en az 8 karakter')) {
    return translate('auth.passwordRuleMinLength', rawMessage);
  }
  if (rawMessage.includes('en az bir büyük harf')) {
    return translate('auth.passwordRuleUppercase', rawMessage);
  }
  if (rawMessage.includes('en az bir küçük harf')) {
    return translate('auth.passwordRuleLowercase', rawMessage);
  }
  if (rawMessage.includes('en az bir rakam')) {
    return translate('auth.passwordRuleNumber', rawMessage);
  }
  if (rawMessage.includes('Doğum tarihiniz bulunamadı')) {
    return translate('daily.selectBirthDate', rawMessage);
  }
  if (rawMessage.includes('Burç bilginiz bulunamadı')) {
    return translate('daily.birthDateNeeded', rawMessage);
  }

  if (input?.response?.status === 401) {
    return translate('errors.unauthorized', rawMessage);
  }
  if (input?.response?.status === 403) {
    return translate('errors.forbidden', rawMessage);
  }
  if (input?.response?.status === 404) {
    return translate('errors.notFound', rawMessage);
  }
  if (input?.response?.status >= 500) {
    return translate('errors.server', rawMessage);
  }

  return rawMessage;
}
