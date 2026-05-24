import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { usePremium } from '../../context/PremiumContext';
import ZodiacIcon from '../../components/ZodiacIcon';
import LanguageSelector from '../../components/LanguageSelector';
import { fontStyles } from '../../utils/fontStyles';
import { useNotification } from '../../context/NotificationContext';

// Element ikonları için Ionicons
const elementIcons = {
  'Metal': 'diamond',
  'Su': 'water',
  'Ağaç': 'leaf',
  'Ateş': 'flame',
  'Toprak': 'earth'
};

// Türkçe burç isimlerini İngilizce anahtarlara eşleyen mapping
const zodiacMapping = {
  'Koç': 'aries',
  'Boğa': 'taurus',
  'İkizler': 'gemini',
  'Yengeç': 'cancer',
  'Aslan': 'leo',
  'Başak': 'virgo',
  'Terazi': 'libra',
  'Akrep': 'scorpio',
  'Yay': 'sagittarius',
  'Oğlak': 'capricorn',
  'Kova': 'aquarius',
  'Balık': 'pisces'
};

// Türkçe element isimlerini İngilizce anahtarlara eşleyen mapping
const elementMapping = {
  'Metal': 'metal',
  'Su': 'water',
  'Ağaç': 'wood',
  'Ateş': 'fire',
  'Toprak': 'earth'
};

export default function ProfileScreen({ navigation }) {
  const { t } = useTranslation();
  const { user, statistics, logout, deleteAccount, loading, refreshProfile } = useAuth();
  const { hasPremium } = usePremium();
  const { showConfirm, showAlert, hideAlert, showError, showSuccess } = useNotification();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const displayName = user?.first_name?.trim() || t('profile.noName');
  const localizedZodiac = user?.zodiac_sign && zodiacMapping[user.zodiac_sign]
    ? t(`zodiac.${zodiacMapping[user.zodiac_sign]}`)
    : user?.zodiac_sign;
  const localizedElement = user?.chinese_element && elementMapping[user.chinese_element]
    ? t(`elements.${elementMapping[user.chinese_element]}`)
    : user?.chinese_element;

  // Profil ekranı açıldığında istatistikleri güncelle
  useEffect(() => {
    const updateStats = async () => {
      try {
        await refreshProfile();
      } catch (error) {
        console.error('İstatistik güncelleme hatası:', error);
      }
    };
    
    updateStats();
  }, []); // Sadece component mount olduğunda çalışsın

  // Premium sayfasına yönlendir
  const handleUpgrade = () => {
    navigation.navigate('Premium');
  };

  const handleLogout = () => {
    showConfirm(
      t('profile.logout.title'),
      t('profile.logout.message'),
      logout,
      null,
      'warning'
    );
  };

  const handleDeleteAccount = () => {
    showAlert(
      t('profile.deleteAccountTitle'),
      t('profile.deleteAccountMessage'),
      'warning',
      {
        onConfirm: async () => {
          hideAlert();
          const result = await deleteAccount();
          if (result.success) {
            showSuccess(t('profile.deleteAccountSuccess'));
          } else {
            showError(result.error || t('profile.deleteAccountError'));
          }
        },
        showCancel: true,
        confirmText: t('profile.deleteAccountConfirm'),
        cancelText: t('common.cancel'),
      }
    );
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const handleChangePassword = () => {
    navigation.navigate('ChangePassword');
  };

  const handleReadingHistory = () => {
    navigation.navigate('ReadingHistory');
  };

  const handleNotificationSettings = () => {
    navigation.navigate('NotificationSettings');
  };

  const handleLanguageChange = () => {
    setShowLanguageModal(true);
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    
    try {
      let year, month, day;
      
      // ISO string formatındaki tarihi parse et (YYYY-MM-DD veya YYYY-MM-DDTHH:MM:SS)
      if (dateString.includes('T')) {
        // Timestamp format: 1993-06-09T00:00:00
        const datePart = dateString.split('T')[0];
        [year, month, day] = datePart.split('-');
      } else {
        // Sadece tarih format: 1993-06-09
        [year, month, day] = dateString.split('-');
      }
      
      if (!year || !month || !day) return dateString;
      
      // Türkçe formatında göster (GG.AA.YYYY) - iki haneli gün ve ay
      const formattedDay = day.padStart(2, '0');
      const formattedMonth = month.padStart(2, '0');
      
      return `${formattedDay}.${formattedMonth}.${year}`;
    } catch (error) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top']}>
        <ActivityIndicator size="large" color="#C5A100" />
        <Text style={[styles.loadingText, fontStyles.body]}>{t('common.loading')}</Text>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.errorContainer} edges={['top']}>
        <Ionicons name="alert-circle" size={64} color="#C5A100" />
        <Text style={[styles.errorText, fontStyles.body]}>{t('profile.userInfoError')}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
          <Text style={[styles.retryButtonText, fontStyles.bodyBold]}>{t('common.back')}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={['#0D0B1F', '#1B1B2F', '#2A2A3F']}
        style={styles.gradientBg}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#C5A100" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, fontStyles.headingBold]}>{t('profile.title')}</Text>
          <TouchableOpacity onPress={handleEditProfile} style={styles.logoutButton}>
            <Ionicons name="create-outline" size={24} color="#C5A100" />
          </TouchableOpacity>
        </View>

        <View style={styles.profileHeroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={38} color="#FFFFFF" />
              </View>
            </View>
            <View style={styles.heroIdentity}>
              <View style={styles.membershipBadge}>
                <Ionicons name={hasPremium ? 'diamond' : 'sparkles'} size={14} color={hasPremium ? '#FFE082' : '#C5A100'} />
                <Text style={styles.membershipBadgeText}>
                  {hasPremium ? t('profile.premiumMember') : t('profile.freeMember')}
                </Text>
              </View>
              <Text style={[styles.userName, fontStyles.headingBold]}>{displayName}</Text>
              <Text style={[styles.userEmail, fontStyles.body]}>{user?.email || t('profile.noEmail')}</Text>
            </View>
          </View>

          <View style={styles.heroMetaRow}>
            {user.birth_date ? (
              <View style={styles.metaPill}>
                <Ionicons name="calendar-outline" size={16} color="#C5A100" />
                <Text style={styles.metaPillText}>{formatDateForDisplay(user.birth_date)}</Text>
              </View>
            ) : null}
            {localizedZodiac ? (
              <View style={styles.metaPill}>
                <ZodiacIcon zodiacSign={user.zodiac_sign} size={18} color="#C5A100" />
                <Text style={styles.metaPillText}>{localizedZodiac}</Text>
              </View>
            ) : null}
            {localizedElement ? (
              <View style={styles.metaPill}>
                <Ionicons name={elementIcons[user.chinese_element] || 'star'} size={16} color="#C5A100" />
                <Text style={styles.metaPillText}>{localizedElement}</Text>
              </View>
            ) : null}
          </View>

          {(user.birth_time || user.birth_place) ? (
            <View style={styles.detailList}>
              {user.birth_time ? (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t('profile.birthTime')}</Text>
                  <Text style={styles.detailValue}>{user.birth_time}</Text>
                </View>
              ) : null}
              {user.birth_place ? (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t('profile.birthPlace')}</Text>
                  <Text style={styles.detailValue}>{user.birth_place}</Text>
                </View>
              ) : null}
            </View>
          ) : null}
        </View>

        <TouchableOpacity style={styles.historyHighlightCard} onPress={handleReadingHistory} activeOpacity={0.86}>
          <View style={styles.historyHighlightLeft}>
            <View style={styles.historyIconWrap}>
              <Ionicons name="time-outline" size={22} color="#C5A100" />
            </View>
            <View style={styles.historyCopy}>
              <Text style={styles.historyTitle}>{t('profile.readingHistory')}</Text>
              <Text style={styles.historySubtitle}>
                {statistics?.total_readings || 0} {t('profile.totalReadings').toLowerCase()}
                {statistics?.days_registered ? ` • ${statistics.days_registered} ${t('common.days')}` : ''}
              </Text>
            </View>
          </View>
          <View style={styles.historyCountWrap}>
            <Text style={styles.historyCount}>{statistics?.total_readings || 0}</Text>
            <Ionicons name="chevron-forward" size={18} color="#C5A100" />
          </View>
        </TouchableOpacity>

        {!hasPremium ? (
          <TouchableOpacity style={styles.premiumShowcaseCard} onPress={handleUpgrade} activeOpacity={0.86}>
            <View style={styles.premiumShowcaseLeft}>
              <View style={styles.premiumIconContainer}>
                <Ionicons name="diamond" size={22} color="#FFD700" />
              </View>
              <View style={styles.premiumInfo}>
                <Text style={[styles.premiumTitle, fontStyles.headingBold]}>{t('profile.freeMember')}</Text>
                <Text style={[styles.premiumSubtitle, fontStyles.body]}>{t('profile.freeMemberSubtitle')}</Text>
              </View>
            </View>
            <View style={styles.upgradeButton}>
              <Text style={[styles.upgradeButtonText, fontStyles.bodyBold]}>{t('profile.upgrade')}</Text>
            </View>
          </TouchableOpacity>
        ) : null}

        <View style={styles.menuSection}>
          <Text style={styles.sectionHeading}>{t('profile.accountSettings')}</Text>

          <TouchableOpacity style={styles.menuItem} onPress={handleNotificationSettings}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="notifications-outline" size={20} color="#C5A100" />
              <Text style={[styles.menuItemText, fontStyles.body]}>{t('profile.notificationSettings')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#C5A100" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleLanguageChange}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="language" size={20} color="#C5A100" />
              <Text style={[styles.menuItemText, fontStyles.body]}>{t('profile.changeLanguage')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#C5A100" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleChangePassword}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="lock-closed-outline" size={20} color="#C5A100" />
              <Text style={[styles.menuItemText, fontStyles.body]}>{t('profile.changePassword')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#C5A100" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="log-out-outline" size={20} color="#C5A100" />
              <Text style={[styles.menuItemText, fontStyles.body]}>{t('profile.logout')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#C5A100" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleDeleteAccount}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="trash-outline" size={20} color="#E57373" />
              <Text style={[styles.menuItemText, styles.deleteMenuText, fontStyles.body]}>
                {t('profile.deleteAccount')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#E57373" />
          </TouchableOpacity>
        </View>
        </ScrollView>
      </LinearGradient>
      
      {/* Dil Seçici Modal */}
      <LanguageSelector
        visible={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
      />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0D0B1F',
  },
  loadingText: {
    color: '#C5A100',
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0D0B1F',
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#C5A100',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingTop: Platform.OS === 'ios' ? 16 : 20,
    marginTop: 0,
  },
  backButton: {
    padding: 8,
    marginLeft: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'CinzelDecorative-Bold',
    color: '#C5A100',
  },
  logoutButton: {
    padding: 8,
    marginRight: 10,
  },
  profileHeroCard: {
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 16,
    padding: 18,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  menuSection: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  menuItemText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 12,
  },
  deleteMenuText: {
    color: '#F3A6A6',
  },
  sectionHeading: {
    fontSize: 16,
    color: '#C5A100',
    fontWeight: '700',
    marginBottom: 12,
    marginLeft: 2,
  },
  detailList: {
    marginTop: 2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  detailLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.60)',
  },
  detailValue: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  heroMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
    justifyContent: 'center',
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    marginRight: 8,
    marginBottom: 8,
  },
  metaPillText: {
    color: '#FFFFFF',
    marginLeft: 7,
    fontSize: 12,
    fontWeight: '500',
  },
  avatarContainer: {
    marginRight: 14,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(197,161,0,0.88)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroIdentity: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.62)',
  },
  membershipBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 10,
  },
  membershipBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 8,
  },
  historyHighlightCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 18,
    borderRadius: 24,
    backgroundColor: 'rgba(197,161,0,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(197,161,0,0.18)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  historyHighlightLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 10,
  },
  historyIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(197,161,0,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  historyCopy: {
    flex: 1,
  },
  historyTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  historySubtitle: {
    color: 'rgba(255,255,255,0.66)',
    fontSize: 13,
  },
  historyCountWrap: {
    alignItems: 'flex-end',
  },
  historyCount: {
    color: '#FFD76B',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  premiumShowcaseCard: {
    marginHorizontal: 20,
    marginBottom: 18,
    padding: 18,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.18)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  premiumShowcaseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 12,
  },
  premiumIconContainer: {
    marginRight: 16,
  },
  premiumInfo: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  premiumSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.72,
  },
  upgradeButton: {
    backgroundColor: '#C5A100',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  upgradeButtonText: {
    color: '#000000',
    fontWeight: '700',
    fontSize: 14,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
}); 
