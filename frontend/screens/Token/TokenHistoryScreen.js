import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useToken } from '../../context/TokenContext';

const INITIAL_VISIBLE_COUNT = 18;

const FILTERS = ['all', 'earned', 'spent', 'purchases'];

const startOfToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

const startOfYesterday = () => {
  const date = startOfToday();
  date.setDate(date.getDate() - 1);
  return date;
};

const startOfWeek = () => {
  const date = startOfToday();
  const day = date.getDay();
  const diff = day === 0 ? 6 : day - 1;
  date.setDate(date.getDate() - diff);
  return date;
};

export default function TokenHistoryScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const { loading, getHistory, balance } = useToken();
  const [transactions, setTransactions] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setHistoryLoading(true);
      const history = await getHistory();
      setTransactions(history || []);
      setVisibleCount(INITIAL_VISIBLE_COUNT);
    } catch (error) {
      console.error('Token geçmişi yüklenemedi:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'purchase':
        return { name: 'card', color: '#6DDC8B', bg: 'rgba(109,220,139,0.14)' };
      case 'spend':
        return { name: 'arrow-down-circle', color: '#FF8B72', bg: 'rgba(255,139,114,0.14)' };
      case 'bonus':
      case 'daily_bonus':
      case 'registration_bonus':
        return { name: 'gift', color: '#F5C04F', bg: 'rgba(245,192,79,0.14)' };
      case 'video_reward':
        return { name: 'play-circle', color: '#7CB7FF', bg: 'rgba(124,183,255,0.14)' };
      default:
        return { name: 'sparkles', color: '#C5A100', bg: 'rgba(197,161,0,0.14)' };
    }
  };

  const getTransactionTitle = (type) => {
    switch (type) {
      case 'purchase':
        return t('common.tokenTarih.transactionTypes.purchase');
      case 'spend':
        return t('common.tokenTarih.transactionTypes.spend');
      case 'bonus':
        return t('common.tokenTarih.transactionTypes.bonus');
      case 'daily_bonus':
        return t('common.tokenTarih.transactionTypes.dailyBonus');
      case 'registration_bonus':
        return t('common.tokenTarih.transactionTypes.registrationBonus');
      case 'video_reward':
        return t('common.tokenTarih.transactionTypes.videoReward');
      default:
        return t('common.tokenTarih.transactionTypes.other');
    }
  };

  const formatCompactDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language || 'tr-TR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const normalizeDescription = (transaction) => {
    if (!transaction.description) return t('common.tokenTarih.defaultDescription');
    return transaction.description
      .replace(' token harcandı', '')
      .replace(' için', '')
      .replace(' paketi satın alındı', '')
      .trim();
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      if (activeFilter === 'earned') return transaction.amount > 0 && transaction.transaction_type !== 'purchase';
      if (activeFilter === 'spent') return transaction.amount < 0 || transaction.transaction_type === 'spend';
      if (activeFilter === 'purchases') return transaction.transaction_type === 'purchase';
      return true;
    });
  }, [activeFilter, transactions]);

  const visibleTransactions = useMemo(
    () => filteredTransactions.slice(0, visibleCount),
    [filteredTransactions, visibleCount]
  );

  const groupedTransactions = useMemo(() => {
    const today = startOfToday();
    const yesterday = startOfYesterday();
    const weekStart = startOfWeek();

    const groups = {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: [],
    };

    visibleTransactions.forEach((transaction) => {
      const createdAt = new Date(transaction.created_at);
      if (createdAt >= today) {
        groups.today.push(transaction);
      } else if (createdAt >= yesterday) {
        groups.yesterday.push(transaction);
      } else if (createdAt >= weekStart) {
        groups.thisWeek.push(transaction);
      } else {
        groups.older.push(transaction);
      }
    });

    return groups;
  }, [visibleTransactions]);

  const summary = useMemo(() => {
    const earned = transactions
      .filter((item) => item.amount > 0)
      .reduce((sum, item) => sum + item.amount, 0);

    const spent = Math.abs(
      transactions
        .filter((item) => item.amount < 0)
        .reduce((sum, item) => sum + item.amount, 0)
    );

    return { earned, spent };
  }, [transactions]);

  if (loading || historyLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#C5A100" />
        <Text style={styles.loadingText}>{t('common.tokenTarih.loadingHistory')}</Text>
      </View>
    );
  }

  const groupMeta = [
    { key: 'today', title: t('common.tokenTarih.today') },
    { key: 'yesterday', title: t('common.tokenTarih.yesterday') },
    { key: 'thisWeek', title: t('common.tokenTarih.thisWeek') },
    { key: 'older', title: t('common.tokenTarih.older') },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <LinearGradient colors={['#0D0B1F', '#1B1B2F', '#2A2A3F']} style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#C5A100" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('common.tokenTarih.title')}</Text>
            <TouchableOpacity onPress={loadHistory} style={styles.refreshIconButton}>
              <Ionicons name="refresh" size={20} color="#C5A100" />
            </TouchableOpacity>
          </View>

          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, styles.balanceCard]}>
              <Text style={styles.summaryEyebrow}>{t('common.tokenTarih.currentBalance')}</Text>
              <Text style={styles.balanceValue}>{balance}</Text>
              <Text style={styles.balanceUnit}>{t('common.tokens')}</Text>
            </View>

            <View style={styles.summaryColumn}>
              <View style={styles.metricCard}>
                <View style={styles.metricHeader}>
                  <Ionicons name="trending-up" size={18} color="#6DDC8B" />
                  <Text style={styles.metricLabel}>{t('common.tokenTarih.totalEarned')}</Text>
                </View>
                <Text style={styles.metricValue}>+{summary.earned}</Text>
              </View>

              <View style={styles.metricCard}>
                <View style={styles.metricHeader}>
                  <Ionicons name="trending-down" size={18} color="#FF8B72" />
                  <Text style={styles.metricLabel}>{t('common.tokenTarih.totalSpent')}</Text>
                </View>
                <Text style={styles.metricValue}>-{summary.spent}</Text>
              </View>
            </View>
          </View>

          <View style={styles.filterWrap}>
            {FILTERS.map((filter) => {
              const active = activeFilter === filter;
              return (
                <TouchableOpacity
                  key={filter}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                  onPress={() => {
                    setActiveFilter(filter);
                    setVisibleCount(INITIAL_VISIBLE_COUNT);
                  }}
                >
                  <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                    {t(`common.tokenTarih.filters.${filter}`)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.countText}>
            {t('common.tokenTarih.showingCount', {
              count: visibleTransactions.length,
              total: filteredTransactions.length,
            })}
          </Text>

          {filteredTransactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-text" size={48} color="#666" />
              <Text style={styles.emptyText}>{t('common.tokenTarih.noHistory')}</Text>
              <Text style={styles.emptySubtext}>{t('common.tokenTarih.noHistorySubtext')}</Text>
            </View>
          ) : (
            <View style={styles.groupsWrap}>
              {groupMeta.map((group) => {
                const items = groupedTransactions[group.key];
                if (!items.length) return null;

                return (
                  <View key={group.key} style={styles.groupSection}>
                    <Text style={styles.groupTitle}>{group.title}</Text>

                    <View style={styles.groupCard}>
                      {items.map((transaction, index) => {
                        const icon = getTransactionIcon(transaction.transaction_type);
                        const title = getTransactionTitle(transaction.transaction_type);
                        const isPositive = transaction.amount > 0;

                        return (
                          <View
                            key={transaction.id || `${group.key}-${index}`}
                            style={[
                              styles.transactionRow,
                              index !== items.length - 1 && styles.transactionRowBorder,
                            ]}
                          >
                            <View style={[styles.transactionIcon, { backgroundColor: icon.bg }]}>
                              <Ionicons name={icon.name} size={18} color={icon.color} />
                            </View>

                            <View style={styles.transactionInfo}>
                              <Text style={styles.transactionTitle}>{title}</Text>
                              <Text style={styles.transactionDescription} numberOfLines={1}>
                                {normalizeDescription(transaction)}
                              </Text>
                            </View>

                            <View style={styles.transactionRight}>
                              <Text
                                style={[
                                  styles.amountText,
                                  isPositive ? styles.positiveAmount : styles.negativeAmount,
                                ]}
                              >
                                {isPositive ? '+' : ''}
                                {transaction.amount}
                              </Text>
                              <Text style={styles.transactionDate}>
                                {formatCompactDate(transaction.created_at)}
                              </Text>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {visibleCount < filteredTransactions.length ? (
            <TouchableOpacity
              style={styles.loadMoreButton}
              onPress={() => setVisibleCount((prev) => prev + INITIAL_VISIBLE_COUNT)}
            >
              <Ionicons name="chevron-down-circle" size={18} color="#C5A100" />
              <Text style={styles.loadMoreText}>{t('common.tokenTarih.loadMore')}</Text>
            </TouchableOpacity>
          ) : null}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0D0B1F',
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 28,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(197, 161, 0, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshIconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'CinzelDecorative-Bold',
    color: '#FFFFFF',
  },
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 18,
  },
  summaryCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  balanceCard: {
    flex: 1.05,
    padding: 18,
    marginRight: 12,
    justifyContent: 'center',
  },
  summaryColumn: {
    flex: 1,
    justifyContent: 'space-between',
  },
  metricCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 14,
    minHeight: 76,
    justifyContent: 'center',
  },
  summaryEyebrow: {
    color: 'rgba(255,255,255,0.60)',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  balanceValue: {
    color: '#FFD76B',
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 36,
  },
  balanceUnit: {
    color: '#FFFFFF',
    opacity: 0.72,
    marginTop: 4,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricLabel: {
    marginLeft: 8,
    color: 'rgba(255,255,255,0.74)',
    fontSize: 12,
    flex: 1,
  },
  metricValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  filterWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginRight: 10,
    marginBottom: 10,
  },
  filterChipActive: {
    backgroundColor: 'rgba(197,161,0,0.14)',
    borderColor: 'rgba(197,161,0,0.22)',
  },
  filterChipText: {
    color: 'rgba(255,255,255,0.70)',
    fontSize: 13,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#FFD76B',
  },
  countText: {
    paddingHorizontal: 20,
    color: 'rgba(255,255,255,0.58)',
    fontSize: 12,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 54,
  },
  emptyText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.60)',
    textAlign: 'center',
    lineHeight: 22,
  },
  groupsWrap: {
    paddingHorizontal: 20,
  },
  groupSection: {
    marginBottom: 18,
  },
  groupTitle: {
    color: '#C5A100',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
    marginLeft: 2,
  },
  groupCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  transactionRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  transactionIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
    paddingRight: 10,
  },
  transactionTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 3,
  },
  transactionDescription: {
    color: 'rgba(255,255,255,0.58)',
    fontSize: 12,
  },
  transactionRight: {
    alignItems: 'flex-end',
    minWidth: 76,
  },
  amountText: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  positiveAmount: {
    color: '#6DDC8B',
  },
  negativeAmount: {
    color: '#FF8B72',
  },
  transactionDate: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
  },
  loadMoreButton: {
    marginHorizontal: 20,
    marginTop: 6,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(197,161,0,0.18)',
    backgroundColor: 'rgba(197,161,0,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  loadMoreText: {
    color: '#FFD76B',
    fontWeight: '700',
    marginLeft: 8,
  },
});
