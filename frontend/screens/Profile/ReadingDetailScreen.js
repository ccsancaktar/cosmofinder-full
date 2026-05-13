import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  StatusBar,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../../context/NotificationContext';
import { readingsAPI } from '../../services/api';
import { fontStyles } from '../../utils/fontStyles';

export default function ReadingDetailScreen({ route, navigation }) {
  const { t } = useTranslation();
  const { showError } = useNotification();
  const { readingId } = route.params;
  const [reading, setReading] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReadingDetail();
  }, [readingId]);

  const loadReadingDetail = async () => {
    try {
      setLoading(true);
      const response = await readingsAPI.getReadingDetail(readingId);
      setReading(response.data.reading);
    } catch (error) {
      console.error('Fal detayı yüklenirken hata:', error);
      showError('Fal detayı yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
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
        return t('reading.yildizname');
      case 'tarot':
        return t('reading.tarot');
      case 'rune':
        return t('reading.rune');
      case 'chinese':
        return t('reading.chinese');
      case 'coffee':
        return t('reading.coffee');
      case 'kabala':
        return t('reading.kabala');
      case 'daily':
        return t('reading.daily');
      case 'numerology':
        return t('reading.numerology');
      case 'compatibility':
        return t('reading.compatibility');
      case 'angel_numbers':
        return t('reading.angelNumbers');
      default:
        return t('reading.general');
    }
  };

  const getAudienceLabel = (audience) =>
    audience === 'other' ? t('common.forSomeoneElse') : t('common.forMe');

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatInputData = (inputData) => {
    if (!inputData) return null;
    
    const formattedData = [];
    
    if (inputData.soru) {
      formattedData.push({ label: t('reading.question'), value: inputData.soru });
    }
    if (inputData.isim) {
      formattedData.push({ label: t('reading.name'), value: inputData.isim });
    }
    if (inputData.anneAdi) {
      formattedData.push({ label: t('reading.motherName'), value: inputData.anneAdi });
    }
    if (inputData.dogumTarihi) {
      formattedData.push({ label: t('reading.birthDate'), value: inputData.dogumTarihi });
    }
    if (inputData.dogumSaati) {
      formattedData.push({ label: t('reading.birthTime'), value: inputData.dogumSaati });
    }
    if (inputData.dogumYeri) {
      formattedData.push({ label: t('reading.birthPlace'), value: inputData.dogumYeri });
    }
    if (inputData.niyet) {
      formattedData.push({ label: t('reading.intention'), value: inputData.niyet });
    }
    if (inputData.kisi1Isim) {
      formattedData.push({ label: t('reading.firstPerson'), value: inputData.kisi1Isim });
    }
    if (inputData.kisi1DogumTarihi) {
      formattedData.push({ label: t('reading.firstBirthDate'), value: inputData.kisi1DogumTarihi });
    }
    if (inputData.kisi2Isim) {
      formattedData.push({ label: t('reading.secondPerson'), value: inputData.kisi2Isim });
    }
    if (inputData.kisi2DogumTarihi) {
      formattedData.push({ label: t('reading.secondBirthDate'), value: inputData.kisi2DogumTarihi });
    }
    if (inputData.iliskiTuru) {
      const relationshipTypeLabel =
        inputData.iliskiTuru === 'ask'
          ? t('compatibility.ask')
          : inputData.iliskiTuru === 'arkadaslik'
            ? t('compatibility.arkadaslik')
            : inputData.iliskiTuru === 'genel'
              ? t('compatibility.genel')
              : inputData.iliskiTuru;
      formattedData.push({
        label: t('reading.relationshipType'),
        value: relationshipTypeLabel,
      });
    }
    if (inputData.sayi) {
      formattedData.push({ label: t('reading.number'), value: inputData.sayi });
    }
    
    return formattedData;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#C5A100" />
        <Text style={[styles.loadingText, fontStyles.body]}>Fal detayı yükleniyor...</Text>
      </SafeAreaView>
    );
  }

  if (!reading) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color="#C5A100" />
        <Text style={[styles.errorText, fontStyles.body]}>Fal detayı bulunamadı</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadReadingDetail}>
          <Text style={[styles.retryButtonText, fontStyles.bodyBold]}>Tekrar Dene</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const inputData = formatInputData(reading.input_data);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0D0B1F', '#1B1B2F', '#2A2A3F']}
        style={styles.gradientBg}
      >
        <StatusBar barStyle="light-content" backgroundColor="#0D0B1F" />
        
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#C5A100" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, fontStyles.headingBold]}>{t('reading.detail')}</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Reading Type Card */}
        <View style={styles.typeCard}>
          <View style={styles.typeHeader}>
            <Ionicons 
              name={getReadingIcon(reading.reading_type)} 
              size={32} 
              color="#C5A100" 
            />
            <Text style={[styles.typeTitle, fontStyles.headingBold]}>
              {getReadingTitle(reading.reading_type)}
            </Text>
          </View>
          <Text style={[styles.typeDate, fontStyles.body]}>
            {formatDate(reading.created_at)}
          </Text>
          <View style={styles.audienceBadge}>
            <Text style={[styles.audienceBadgeText, fontStyles.bodyBold]}>
              {getAudienceLabel(reading.audience)}
            </Text>
          </View>
        </View>

        {/* Input Data */}
        {inputData && inputData.length > 0 && (
          <View style={styles.inputCard}>
            <Text style={[styles.cardTitle, fontStyles.headingBold]}>{t('reading.inputData')}</Text>
            {inputData.map((item, index) => (
              <View key={index} style={styles.inputItem}>
                <Text style={[styles.inputLabel, fontStyles.bodyBold]}>{item.label}:</Text>
                <Text style={[styles.inputValue, fontStyles.body]}>{item.value}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Result */}
        <View style={styles.resultCard}>
          <Text style={[styles.cardTitle, fontStyles.headingBold]}>{t('reading.result')}</Text>
          <View style={styles.resultContent}>
            <Text style={[styles.resultText, fontStyles.body]}>{reading.result}</Text>
          </View>
        </View>

        {/* Visibility Status */}
        <View style={styles.visibilityCard}>
          <View style={styles.visibilityHeader}>
            <Ionicons 
              name={reading.is_public ? "eye" : "eye-off"} 
              size={20} 
              color="#C5A100" 
            />
            <Text style={[styles.visibilityText, fontStyles.body]}>
              {reading.is_public ? t('reading.public') : t('reading.private')}
            </Text>
          </View>
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
    fontFamily: 'CinzelDecorative-Bold',
    color: '#C5A100',
  },
  headerSpacer: {
    width: 40,
  },
  typeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 24,
    marginBottom: 16,
  },
  typeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  typeDate: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.7,
  },
  audienceBadge: {
    alignSelf: 'flex-start',
    marginTop: 12,
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
  },
  inputCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 24,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#C5A100',
    marginBottom: 12,
  },
  inputItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.7,
    flex: 1,
  },
  inputValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: 'bold',
    flex: 2,
    textAlign: 'right',
  },
  resultCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 24,
    marginBottom: 16,
  },
  resultContent: {
    marginTop: 8,
  },
  resultText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
  },
  visibilityCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 24,
    marginBottom: 32,
  },
  visibilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  visibilityText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 8,
  },
}); 
