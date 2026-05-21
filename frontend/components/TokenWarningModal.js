import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { TOKEN_COSTS } from '../context/TokenContext';
import TokenIcon from './TokenIcon';

const { width, height } = Dimensions.get('window');

export default function TokenWarningModal({ 
  visible, 
  onClose, 
  onPurchaseTokens, 
  onWatchVideo,
  currentBalance = 0,
  requiredTokens = 0,
  readingType = 'fal'
}) {
  const { t } = useTranslation();
  const getReadingTypeInfo = () => {
    const readingKeyMap = {
      tarot: 'tarot',
      yildizname: 'yildizname',
      rune: 'rune',
      chinese: 'chinese',
      coffee: 'coffee',
      kabala: 'kabala',
      daily: 'daily',
      numerology: 'numerology',
      compatibility: 'compatibility',
      angel_numbers: 'angelNumbers',
      fal: 'general',
    };

    const contentMap = {
      tarot: { icon: 'card', tokenCost: TOKEN_COSTS.TAROT, descriptionKey: 'tarot' },
      yildizname: { icon: 'star', tokenCost: TOKEN_COSTS.YILDIZNAME, descriptionKey: 'yildizname' },
      rune: { icon: 'diamond', tokenCost: TOKEN_COSTS.RUNE, descriptionKey: 'rune' },
      chinese: { icon: 'calendar', tokenCost: TOKEN_COSTS.CHINESE, descriptionKey: 'chinese' },
      coffee: { icon: 'cafe', tokenCost: TOKEN_COSTS.COFFEE, descriptionKey: 'coffee' },
      kabala: { icon: 'flower', tokenCost: TOKEN_COSTS.KABALA, descriptionKey: 'kabala' },
      daily: { icon: 'sunny', tokenCost: TOKEN_COSTS.DAILY, descriptionKey: 'daily' },
      numerology: { icon: 'grid', tokenCost: TOKEN_COSTS.NUMEROLOGY, descriptionKey: 'numerology' },
      compatibility: { icon: 'heart-half', tokenCost: TOKEN_COSTS.COMPATIBILITY, descriptionKey: 'compatibility' },
      angel_numbers: { icon: 'sparkles', tokenCost: TOKEN_COSTS.ANGEL, descriptionKey: 'angelNumbers' },
      fal: { icon: 'sparkles', tokenCost: TOKEN_COSTS.DAILY, descriptionKey: 'general' },
    };

    const config = contentMap[readingType] || contentMap.fal;
    const readingKey = readingKeyMap[readingType] || 'general';

    switch (readingType) {
      case 'tarot':
      case 'yildizname':
      case 'rune':
      case 'chinese':
      case 'coffee':
      case 'kabala':
      case 'daily':
      case 'numerology':
      case 'compatibility':
      case 'angel_numbers':
      default:
        return {
          icon: config.icon,
          title: t(`reading.${readingKey}`),
          description: t(`tokenWarning.readingDescriptions.${config.descriptionKey}`),
          tokenCost: config.tokenCost
        };
    }
  };

  const readingInfo = getReadingTypeInfo();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#0D0B1F', '#1B1B2F', '#2A2A3F']}
            style={styles.modalContent}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Ionicons name={readingInfo.icon} size={48} color="#C5A100" />
              </View>
              <Text style={styles.title}>{t('tokenWarning.title')}</Text>
              <Text style={styles.subtitle}>
                {t('tokenWarning.subtitle', { title: readingInfo.title })}
              </Text>
            </View>

            {/* Token Info */}
            <View style={styles.tokenInfoContainer}>
              <View style={styles.tokenRow}>
                <TokenIcon size={20} />
                <Text style={styles.tokenLabel}>{t('tokenWarning.currentTokens')}</Text>
                <Text style={styles.tokenValue}>{currentBalance}</Text>
              </View>
              <View style={styles.tokenRow}>
                <Ionicons name="card" size={20} color="#FF6B6B" />
                <Text style={styles.tokenLabel}>{t('tokenWarning.requiredTokens')}</Text>
                <Text style={styles.tokenValue}>{readingInfo.tokenCost}</Text>
              </View>
              <View style={styles.tokenRow}>
                <Ionicons name="trending-down" size={20} color="#FF6B6B" />
                <Text style={styles.tokenLabel}>{t('tokenWarning.missingTokens')}</Text>
                <Text style={styles.tokenValue}>{Math.max(0, readingInfo.tokenCost - currentBalance)}</Text>
              </View>
            </View>

            {/* Content */}
            <View style={styles.content}>
              <View style={styles.featureItem}>
                <Ionicons name="star" size={20} color="#C5A100" />
                <Text style={styles.featureText}>{t('tokenWarning.featureBuy')}</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="play-circle" size={20} color="#C5A100" />
                <Text style={styles.featureText}>{t('tokenWarning.featureVideo')}</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="diamond" size={20} color="#C5A100" />
                <Text style={styles.featureText}>{t('tokenWarning.featurePremium')}</Text>
              </View>
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.purchaseButton}
                onPress={onPurchaseTokens}
              >
                <Ionicons name="card" size={20} color="#000000" />
                <Text style={styles.purchaseButtonText}>{t('tokenWarning.buyTokens')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.videoButton}
                onPress={onWatchVideo}
              >
                <Ionicons name="play-circle" size={20} color="#C5A100" />
                <Text style={styles.videoButtonText}>{t('tokenWarning.watchVideo')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
              >
                <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.9,
    maxWidth: 400,
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalContent: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(197, 161, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 22,
  },
  tokenInfoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  tokenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tokenLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    flex: 1,
    marginLeft: 8,
  },
  tokenValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  content: {
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  featureText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 12,
    flex: 1,
  },
  buttonContainer: {
    gap: 12,
  },
  purchaseButton: {
    backgroundColor: '#C5A100',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  purchaseButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  videoButton: {
    backgroundColor: 'rgba(197, 161, 0, 0.2)',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#C5A100',
  },
  videoButtonText: {
    color: '#C5A100',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    opacity: 0.7,
  },
}); 
