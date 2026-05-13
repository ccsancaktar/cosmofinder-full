import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { notificationAPI } from '../../services/api';
import notificationService from '../../services/notificationService';

export default function NotificationSettingsScreen({ navigation }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { showError, showSuccess } = useNotification();
  const [settings, setSettings] = useState({
    daily_reminders: true,
    angel_number_notifications: true,
    premium_notifications: true,
    birthday_notifications: true,
    special_day_notifications: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const syncSettings = async () => {
      try {
        const response = await notificationAPI.getSettings();
        if (response.data?.notification_settings) {
          setSettings((current) => ({ ...current, ...response.data.notification_settings }));
          return;
        }
      } catch (error) {
        console.error('Notification ayarları alınamadı:', error);
      }

      if (user?.notification_settings) {
        setSettings((current) => ({ ...current, ...user.notification_settings }));
      }
    };

    syncSettings();
  }, [user]);

  const handleToggle = async (key, value) => {
    try {
      setLoading(true);
      
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      
      // Backend'e gönder
      await notificationAPI.updateSettings(newSettings);
      
      // Daily/weekly reminder'lar sunucu tarafında yönetiliyor.
      // Cihazda daha önce planlanmış local kopyalar varsa temizle.
      if (key === 'daily_reminders') {
        await notificationService.clearServerManagedReminderNotifications();
      }

      showSuccess(t('notifications.updateSuccess'));
      
    } catch (error) {
      console.error('Notification ayar güncelleme hatası:', error);
      showError(t('notifications.updateError'));
      
      // Hata durumunda eski değere geri dön
      setSettings(settings);
    } finally {
      setLoading(false);
    }
  };



  const renderSettingItem = (key, title, description, icon) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <View style={styles.settingIconWrap}>
          <Ionicons name={icon} size={20} color="#C5A100" style={styles.settingIcon} />
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingDescription}>{description}</Text>
        </View>
      </View>
      <Switch
        value={settings[key]}
        onValueChange={(value) => handleToggle(key, value)}
        disabled={loading}
        trackColor={{ false: '#767577', true: '#C5A100' }}
        thumbColor={settings[key] ? '#fff' : '#f4f3f4'}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#0D0B1F', '#1B1B2F', '#2A2A3F']} style={styles.gradientBg}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#C5A100" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('notifications.title')}</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainer}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('notifications.fortuneReminders')}</Text>
            {renderSettingItem(
              'daily_reminders',
              t('notifications.dailyReminder'),
              t('notifications.dailyReminderDesc'),
              'calendar'
            )}
            {renderSettingItem(
              'angel_number_notifications',
              t('notifications.angelNumberNotifications'),
              t('notifications.angelNumberNotificationsDesc'),
              'sparkles'
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('notifications.membershipNotifications')}</Text>
            {renderSettingItem(
              'premium_notifications',
              t('notifications.premiumNotifications'),
              t('notifications.premiumNotificationsDesc'),
              'star'
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('notifications.specialDayNotifications')}</Text>
            {renderSettingItem(
              'birthday_notifications',
              t('notifications.birthdayNotifications'),
              t('notifications.birthdayNotificationsDesc'),
              'gift'
            )}
            {renderSettingItem(
              'special_day_notifications',
              t('notifications.specialDayNotifications'),
              t('notifications.specialDayNotificationsDesc'),
              'calendar-outline'
            )}
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color="#C5A100" />
            <Text style={styles.infoText}>
              {t('notifications.settingsInfo')}
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0B1F',
  },
  gradientBg: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'ios' ? 16 : 20,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(197,161,0,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'CinzelDecorative-Bold',
    color: '#C5A100',
  },
  placeholder: {
    width: 42,
    height: 42,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  section: {
    marginTop: 12,
    marginBottom: 6,
    padding: 18,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#C5A100',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 18,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  settingIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(197,161,0,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  settingIcon: {
    marginRight: 0,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.60)',
    lineHeight: 19,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 18,
    marginTop: 12,
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  infoText: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 10,
    flex: 1,
  },
});
