import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function navigateFromNotification(screen, params = {}) {
  if (!screen || !navigationRef.isReady()) {
    return false;
  }

  try {
    navigationRef.navigate(screen, params);
    return true;
  } catch (error) {
    console.error('Notification navigation error:', error);
    return false;
  }
}
