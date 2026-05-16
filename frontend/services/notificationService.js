import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Notification handler'ı ayarla
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  constructor() {
    this.expoPushToken = null;
    this.serverManagedTypes = ['daily_reminder', 'weekly_summary'];
    this.legacyReminderTitleMarkers = [
      'Günlük Falınız Hazır',
      'Günlük falın hazır',
      'Daily reading is ready',
      'Haftalık Fal Özeti',
      'Weekly summary',
    ];
    this.legacyReminderBodyMarkers = [
      'Bugünkü falınızı çekmeyi unutmayın',
      "take a look at your reading",
      'Kontrol edin',
    ];
  }

  getDefaultChannelId() {
    return Platform.OS === 'android' ? 'default' : undefined;
  }

  async registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
      // Android için notification channel oluştur
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
        enableVibrate: true,
        showBadge: false,
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Push notification izni verilmedi!');
        return;
      }
      
      try {
        // ProjectId'yi al
        const projectId = Constants.expoConfig?.extra?.eas?.projectId;
        console.log('Project ID:', projectId);
        
        if (!projectId) {
          console.log('Project ID bulunamadı, fallback kullanılıyor...');
          // Fallback: slug kullan
          token = await Notifications.getExpoPushTokenAsync({
            projectId: 'fal-app',
          });
        } else {
          token = await Notifications.getExpoPushTokenAsync({
            projectId: projectId,
          });
        }
        
        console.log('Push token alındı:', token?.data);
      } catch (error) {
        console.error('Push token alma hatası:', error);
        return null;
      }
    } else {
      console.log('Fiziksel cihaz gerekli');
    }

    this.expoPushToken = token?.data;
    return token?.data;
  }

  async scheduleDailyReminder() {
    await this.cancelScheduledNotificationsByTypes(['daily_reminder']);

    const notificationConfig = {
      content: {
        title: Platform.OS === 'ios' ? "🔮 Günlük Falınız Hazır!" : "🔮 Günlük Falınız Hazır!",
        body: Platform.OS === 'ios' ? "Bugünkü falınızı çekmeyi unutmayın!" : "Bugünkü falınızı çekmeyi unutmayın!",
        data: { type: 'daily_reminder' },
        sound: Platform.OS === 'ios' ? 'default' : true,
        priority: Platform.OS === 'android' ? 'high' : undefined,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 9,
        minute: 0,
        channelId: this.getDefaultChannelId(),
      },
    };

    await Notifications.scheduleNotificationAsync(notificationConfig);
  }

  async scheduleWeeklyReminder() {
    await this.cancelScheduledNotificationsByTypes(['weekly_summary']);

    const notificationConfig = {
      content: {
        title: Platform.OS === 'ios' ? "📊 Haftalık Fal Özeti" : "📊 Haftalık Fal Özeti",
        body: Platform.OS === 'ios' ? "Bu hafta hangi falları çektiniz? Kontrol edin!" : "Bu hafta hangi falları çektiniz? Kontrol edin!",
        data: { type: 'weekly_summary' },
        sound: Platform.OS === 'ios' ? 'default' : true,
        priority: Platform.OS === 'android' ? 'high' : undefined,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        hour: 18,
        minute: 0,
        weekday: 1, // Pazartesi
        channelId: this.getDefaultChannelId(),
      },
    };

    await Notifications.scheduleNotificationAsync(notificationConfig);
  }

  async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  async cancelScheduledNotificationsByTypes(types = []) {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const typeSet = new Set(types);

    await Promise.all(
      scheduled
        .filter((item) => typeSet.has(item?.content?.data?.type))
        .map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier))
    );
  }

  isLegacyServerManagedReminder(notification) {
    const title = notification?.content?.title || '';
    const body = notification?.content?.body || '';
    const type = notification?.content?.data?.type;

    if (type && this.serverManagedTypes.includes(type)) {
      return true;
    }

    return (
      this.legacyReminderTitleMarkers.some((marker) => title.includes(marker)) ||
      this.legacyReminderBodyMarkers.some((marker) => body.includes(marker))
    );
  }

  async clearServerManagedReminderNotifications() {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();

    await Promise.all(
      scheduled
        .filter((item) => this.isLegacyServerManagedReminder(item))
        .map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier))
    );

    if (typeof Notifications.dismissAllNotificationsAsync === 'function') {
      await Notifications.dismissAllNotificationsAsync();
    }
  }

  async getNotificationSettings() {
    const settings = await Notifications.getPermissionsAsync();
    return settings;
  }

  async requestPermissions() {
    const { status } = await Notifications.requestPermissionsAsync();
    return status;
  }

  async scheduleNotificationAsync(notificationConfig) {
    // Local notification gönder
    try {
      const notificationId = await Notifications.scheduleNotificationAsync(notificationConfig);
      console.log('Local notification gönderildi:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Local notification hatası:', error);
      throw error;
    }
  }
}

export default new NotificationService();
