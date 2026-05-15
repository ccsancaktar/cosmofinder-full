import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { useNotification } from '../../context/NotificationContext';
import { readingsAPI } from '../../services/api';
import { fontStyles } from '../../utils/fontStyles';

const PAGE_SIZE = 12;

export default function ReadingHistoryScreen({ navigation }) {
  const { t } = useTranslation();
  const { showError, showSuccess, showConfirm } = useNotification();
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [audienceFilter, setAudienceFilter] = useState('self');
  const [pagination, setPagination] = useState({ total: 0, per_page: PAGE_SIZE });

  const loadReadings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await readingsAPI.getHistory({
        audience: audienceFilter,
        per_page: PAGE_SIZE,
        page: 1,
      });
      setReadings(response.data.readings || []);
      setPagination(response.data.pagination || { total: 0, per_page: PAGE_SIZE });
    } catch (error) {
      console.error('Fal geçmişi yüklenirken hata:', error);
      showError(t('fortuneHistory.loadError'));
    } finally {
      setLoading(false);
    }
  }, [audienceFilter, showError, t]);

  useFocusEffect(
    useCallback(() => {
      loadReadings();
    }, [loadReadings])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadReadings();
    setRefreshing(false);
  };

  const handleDeleteReading = async (readingId) => {
    showConfirm(
      t('fortuneHistory.deleteTitle'),
      t('fortuneHistory.deleteMessage'),
      async () => {
        try {
          await readingsAPI.deleteReading(readingId);
          setReadings((prev) => prev.filter((reading) => reading.id !== readingId));
          setPagination((prev) => ({
            ...prev,
            total: Math.max(0, (prev.total || 0) - 1),
          }));
          showSuccess(t('fortuneHistory.deleteSuccess'));
        } catch (error) {
          showError(t('fortuneHistory.deleteError'));
        }
      },
      null,
      'warning'
    );
  };

  const handleToggleVisibility = async (readingId, isPublic) => {
    try {
      await readingsAPI.toggleVisibility(readingId, isPublic);
      setReadings((prev) =>
        prev.map((reading) =>
          reading.id === readingId ? { ...reading, is_public: isPublic } : reading
        )
      );
      showSuccess(
        t('fortuneHistory.visibilitySuccess', {
          status: isPublic ? t('fortuneHistory.public') : t('fortuneHistory.private'),
        })
      );
    } catch (error) {
      showError(t('fortuneHistory.visibilityError'));
    }
  };

  const getReadingIcon = (type) => {
    switch (type) {
      case 'yildizname':
        return 'star';
      case 'tarot':
        return 'card';
      case 'rune':
        return 'shield';
      case 'chinese':
        return 'leaf';
      case 'coffee':
        return 'cafe';
      case 'kabala':
        return 'sparkles';
      case 'daily':
        return 'sunny';
      case 'numerology':
        return 'grid';
      case 'compatibility':
        return 'heart-half';
      case 'angel_numbers':
        return 'sparkles';
      default:
        return 'book';
    }
  };

  const getReadingTitle = (type) => {
    switch (type) {
      case 'yildizname':
        return t('fortune.yildizname');
      case 'tarot':
        return t('fortune.tarot');
      case 'rune':
        return t('fortune.rune');
      case 'chinese':
        return t('fortune.chinese');
      case 'coffee':
        return t('fortune.coffee');
      case 'kabala':
        return t('fortune.kabala');
      case 'daily':
        return t('fortune.daily');
      case 'numerology':
        return t('fortune.numerology');
      case 'compatibility':
        return t('fortune.compatibility');
      case 'angel_numbers':
        return t('fortune.angelNumbers');
      default:
        return t('fortune.general');
    }
  };

  const getAudienceLabel = (audience) =>
    audience === 'other' ? t('common.forSomeoneElse') : t('common.forMe');

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderReadingItem = ({ item }) => (
    <View style={styles.readingCard}>
      <View style={styles.readingHeader}>
        <View style={styles.readingTypeWrap}>
          <View style={styles.readingType}>
            <Ionicons name={getReadingIcon(item.reading_type)} size={22} color="#C5A100" />
            <Text style={styles.readingTypeText}>{getReadingTitle(item.reading_type)}</Text>
          </View>
          <View style={styles.audienceBadge}>
            <Text style={styles.audienceBadgeText}>{getAudienceLabel(item.audience)}</Text>
          </View>
        </View>

        <View style={styles.readingActions}>
          <TouchableOpacity
            onPress={() => handleToggleVisibility(item.id, !item.is_public)}
            style={styles.actionButton}
          >
            <Ionicons
              name={item.is_public ? 'eye' : 'eye-off'}
              size={20}
              color="#C5A100"
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDeleteReading(item.id)}
            style={[styles.actionButton, styles.deleteButton]}
          >
            <Ionicons name="trash" size={20} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.readingDate}>{formatDate(item.created_at)}</Text>

      <View style={styles.readingPreview}>
        <Text style={styles.readingPreviewText} numberOfLines={3}>
          {item.result}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.viewDetailsButton}
        onPress={() => navigation.navigate('ReadingDetail', { readingId: item.id })}
      >
        <Text style={styles.viewDetailsText}>{t('fortuneHistory.viewDetails')}</Text>
        <Ionicons name="chevron-forward" size={16} color="#C5A100" />
      </TouchableOpacity>
    </View>
  );

  const renderListHeader = () => (
    <View style={styles.listHeader}>
      <View style={styles.filterCard}>
        <Text style={styles.filterTitle}>{t('fortuneHistory.filterTitle')}</Text>
        <Text style={styles.filterSubtitle}>{t('fortuneHistory.filterSubtitle')}</Text>

        <View style={styles.segmentWrap}>
          <TouchableOpacity
            style={[styles.segmentButton, audienceFilter === 'self' && styles.segmentButtonActive]}
            onPress={() => setAudienceFilter('self')}
          >
            <Text style={[styles.segmentText, audienceFilter === 'self' && styles.segmentTextActive]}>
              {t('common.forMe')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentButton, audienceFilter === 'other' && styles.segmentButtonActive]}
            onPress={() => setAudienceFilter('other')}
          >
            <Text style={[styles.segmentText, audienceFilter === 'other' && styles.segmentTextActive]}>
              {t('common.forSomeoneElse')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.limitInfoText}>
        {t('fortuneHistory.showingCount', {
          count: readings.length,
          total: pagination.total || readings.length,
        })}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top']}>
        <ActivityIndicator size="large" color="#C5A100" />
        <Text style={styles.loadingText}>{t('fortuneHistory.loading')}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#0D0B1F', '#1B1B2F', '#2A2A3F']} style={styles.gradientBg}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#C5A100" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('fortuneHistory.title')}</Text>
          <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
            <Ionicons name="refresh" size={24} color="#C5A100" />
          </TouchableOpacity>
        </View>

        {readings.length === 0 ? (
          <View style={styles.emptyStateWrap}>
            {renderListHeader()}
            <View style={styles.emptyContainer}>
              <Ionicons name="book-outline" size={64} color="#C5A100" />
              <Text style={styles.emptyTitle}>{t('fortuneHistory.emptyTitle')}</Text>
              <Text style={styles.emptyText}>{t('fortuneHistory.emptyText')}</Text>
              <TouchableOpacity
                style={styles.goHomeButton}
                onPress={() => navigation.navigate('Ana Sayfa')}
              >
                <Text style={styles.goHomeButtonText}>{t('fortuneHistory.goHomeButton')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <FlatList
            data={readings}
            renderItem={renderReadingItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            ListHeaderComponent={renderListHeader}
          />
        )}
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
    ...fontStyles.body,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'ios' ? 16 : 20,
    marginTop: 8,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    color: '#C5A100',
    ...fontStyles.headingBold,
  },
  refreshButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateWrap: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  emptyTitle: {
    fontSize: 24,
    color: '#C5A100',
    marginTop: 16,
    marginBottom: 8,
    ...fontStyles.headingBold,
  },
  emptyText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    ...fontStyles.body,
  },
  goHomeButton: {
    backgroundColor: '#C5A100',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  goHomeButtonText: {
    color: '#000000',
    fontSize: 16,
    ...fontStyles.bodyBold,
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  listHeader: {
    paddingTop: 8,
    paddingBottom: 18,
  },
  filterCard: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(197,161,0,0.12)',
    marginBottom: 14,
  },
  filterTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    marginBottom: 4,
    ...fontStyles.headingBold,
  },
  filterSubtitle: {
    color: 'rgba(255,255,255,0.66)',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 14,
    ...fontStyles.body,
  },
  segmentWrap: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    padding: 4,
  },
  segmentButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentButtonActive: {
    backgroundColor: '#C5A100',
  },
  segmentText: {
    color: '#FFFFFF',
    fontSize: 14,
    ...fontStyles.bodyBold,
  },
  segmentTextActive: {
    color: '#0D0B1F',
  },
  limitInfoText: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: 12,
    ...fontStyles.body,
  },
  readingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(197,161,0,0.1)',
  },
  readingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  readingTypeWrap: {
    flex: 1,
    marginRight: 12,
  },
  readingType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readingTypeText: {
    fontSize: 18,
    color: '#FFFFFF',
    marginLeft: 8,
    ...fontStyles.headingBold,
  },
  audienceBadge: {
    alignSelf: 'flex-start',
    marginTop: 10,
    backgroundColor: 'rgba(197,161,0,0.12)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(197,161,0,0.16)',
  },
  audienceBadgeText: {
    color: '#C5A100',
    fontSize: 12,
    ...fontStyles.bodyBold,
  },
  readingActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  deleteButton: {
    marginLeft: 4,
  },
  readingDate: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.7,
    marginBottom: 12,
    ...fontStyles.body,
  },
  readingPreview: {
    marginBottom: 16,
  },
  readingPreviewText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
    ...fontStyles.body,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(197, 161, 0, 0.14)',
    paddingVertical: 10,
    borderRadius: 12,
  },
  viewDetailsText: {
    color: '#C5A100',
    fontSize: 14,
    marginRight: 4,
    ...fontStyles.bodyBold,
  },
});
