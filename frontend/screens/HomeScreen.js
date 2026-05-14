import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Text, 
  Dimensions,
  StatusBar,
  StyleSheet,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useToken } from '../context/TokenContext';
import { usePremium } from '../context/PremiumContext';
import LanguageDropdown from '../components/LanguageDropdown';
import AuthModal from '../components/AuthModal';
import LazyImage from '../components/LazyImage';
import Logo from '../components/Logo';
import TokenIcon from '../components/TokenIcon';


const { width } = Dimensions.get('window');
export default function HomeScreen({ navigation }) {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const { balance, fetchBalance } = useToken();
  const { hasPremium, fetchStatus } = usePremium();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [readings, setReadings] = useState([]);



  // Çok dilli readings array'ini oluştur
  useEffect(() => {
    console.log('Readings array güncelleniyor');
    setReadings([
      {
        title: t('fortune.yildizname'),
        icon: 'star',
        colors: ['#667eea', '#764ba2'],
        description: t('fortune.yildiznameDescription'),
        key: 'yildizname',
        screen: 'Yıldızname',
        bilgiScreen: 'Yıldızname Bilgi',
        backgroundImage: require('../assets/backgrounds/yildizname.jpg')
      },
      {
        title: t('fortune.coffee'),
        icon: 'cafe',
        colors: ['#f093fb', '#f5576c'],
        description: t('fortune.coffeeDescription'),
        key: 'kahve',
        screen: 'Kahve',
        bilgiScreen: 'Kahve Bilgi',
        backgroundImage: require('../assets/backgrounds/turk-kahvesi.jpg')
      },
      {
        title: t('fortune.tarot'),
        icon: 'card',
        colors: ['#fa709a', '#fee140'],
        description: t('fortune.tarotDescription'),
        key: 'tarot',
        screen: 'TarotForm',
        bilgiScreen: 'TarotBilgi',
        backgroundImage: require('../assets/backgrounds/tarot.jpg')
      },
      {
        title: t('fortune.kabala'),
        icon: 'star',
        colors: ['#6A4C93', '#8B5CF6'],
        description: t('fortune.kabalaDescription'),
        key: 'kabala',
        screen: 'Kabala',
        bilgiScreen: 'Kabala Bilgi',
        backgroundImage: require('../assets/backgrounds/kabala.jpg')
      },
      {
        title: t('fortune.rune'),
        icon: 'shield',
        colors: ['#4facfe', '#00f2fe'],
        description: t('fortune.runeDescription'),
        key: 'rune',
        screen: 'Rune',
        bilgiScreen: 'Rün Bilgi',
        backgroundImage: require('../assets/backgrounds/rune.jpg')
      },
      {
        title: t('fortune.chinese'),
        icon: 'leaf',
        colors: ['#43e97b', '#38f9d7'],
        description: t('fortune.chineseDescription'),
        key: 'bazi',
        screen: 'Chinese',
        bilgiScreen: 'Çin Bilgi',
        backgroundImage: require('../assets/backgrounds/ba-zi.jpg')
      },
      {
        title: t('fortune.daily'),
        icon: 'calendar',
        colors: ['#ff9a9e', '#fecfef'],
        description: t('fortune.dailyDescription'),
        key: 'daily',
        screen: 'Daily',
        bilgiScreen: 'DailyBilgi',
        backgroundImage: require('../assets/backgrounds/gunluk-fal.jpg')
      },
      {
        title: t('fortune.numerology'),
        icon: 'grid',
        colors: ['#C5A100', '#8B5CF6'],
        description: t('fortune.numerologyDescription'),
        key: 'numerology',
        screen: 'Numerology',
        bilgiScreen: 'Numerology Bilgi',
        backgroundImage: require('../assets/backgrounds/numerology.jpg')
      },
      {
        title: t('fortune.compatibility'),
        icon: 'heart-half',
        colors: ['#C5A100', '#B85CF6'],
        description: t('fortune.compatibilityDescription'),
        key: 'compatibility',
        screen: 'Compatibility',
        bilgiScreen: 'Compatibility Bilgi',
        backgroundImage: require('../assets/backgrounds/yildizname.jpg')
      },
      {
        title: t('fortune.angelNumbers'),
        icon: 'sparkles',
        colors: ['#F5D77B', '#8B5CF6'],
        description: t('fortune.angelNumbersDescription'),
        key: 'angel_numbers',
        screen: 'Angel Numbers',
        bilgiScreen: 'Angel Numbers Bilgi',
        backgroundImage: require('../assets/backgrounds/777.png')
      }
    ]);
  }, [t]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchBalance();
      fetchStatus();
    }
  }, [isAuthenticated]);

  const handleCardPress = useCallback((reading) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    
    // Daily falı için özel kontrol
    if (reading.key === 'daily') {
      navigation.navigate('Daily');
      return;
    }
    
    navigation.navigate(reading.screen);
  }, [isAuthenticated, navigation]);

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  const handleTokenPress = () => {
    if (isAuthenticated) {
      navigation.navigate('TokenBalance');
    } else {
      setShowAuthModal(true);
    }
  };

  const handlePremiumPress = () => {
    if (isAuthenticated) {
      navigation.navigate('Premium');
    } else {
      setShowAuthModal(true);
    }
  };

  const userProfileImage = user?.profile_image;
  const dailyReading = useMemo(
    () => readings.find((reading) => reading.key === 'daily'),
    [readings]
  );
  const angelReading = useMemo(
    () => readings.find((reading) => reading.key === 'angel_numbers'),
    [readings]
  );
  const nonDailyReadings = useMemo(
    () => readings.filter((reading) => !['daily', 'angel_numbers'].includes(reading.key)),
    [readings]
  );

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="#0D0B1F"
        translucent={Platform.OS === 'android'}
        hidden={false}
      />
      
      <LinearGradient
        colors={['#0D0B1F', '#1B1B2F', '#2A2A3F']}
        style={styles.gradientBg}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {/* Dil Seçici - Sadece giriş yapmamış kullanıcılar için */}
            {!isAuthenticated && (
              <LanguageDropdown style={styles.languageButton} />
            )}
            
            {isAuthenticated && (
              hasPremium ? (
                <TouchableOpacity 
                  style={styles.premiumTokenContainer}
                  onPress={() => navigation.navigate('Premium')}
                  activeOpacity={0.8}
                >
                  <Ionicons 
                    name="diamond" 
                    size={16} 
                    color="#FFD700" 
                  />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  onPress={handleTokenPress} 
                  style={styles.tokenContainer}
                >
                  <TokenIcon 
                    size={16}
                  />
                  <Text style={styles.coinCount}>
                    {balance}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>
          
          <View style={styles.headerCenter}>
            <Logo size="xLarge" />
          </View>
          
          <View style={styles.headerRight}>
            {isAuthenticated ? (
              <TouchableOpacity 
                onPress={() => navigation.navigate('Profile')}
                style={styles.profileButton}
              >
                {userProfileImage ? (
                  <LazyImage
                    source={{ uri: userProfileImage }}
                    style={styles.profilePhoto}
                    showPlaceholder={true}
                    fadeInDuration={300}
                  />
                ) : (
                  <View style={styles.profilePlaceholder}>
                    <Ionicons 
                      name="person" 
                      size={22} 
                      color="#C5A100" 
                    />
                  </View>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                onPress={handleLogin} 
                style={styles.loginIconButton}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name="person" 
                  size={20} 
                  color="#C5A100" 
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {dailyReading ? (
            <View style={styles.dailyCardContainer}>
              <View style={styles.dailyCardWrapper}>
                <TouchableOpacity
                  style={styles.dailyCard}
                  onPress={() => handleCardPress(dailyReading)}
                  activeOpacity={0.86}
                >
                  <LazyImage
                    source={dailyReading.backgroundImage}
                    style={styles.cardBackgroundImage}
                    resizeMode="cover"
                    showPlaceholder={false}
                    fadeInDuration={500}
                  />
                  <LinearGradient
                    colors={['rgba(0,0,0,0.16)', 'rgba(0,0,0,0.74)']}
                    style={styles.cardGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                  >
                    <View style={styles.featuredBadge}>
                      <Text style={styles.featuredBadgeText}>Günün Akışı</Text>
                    </View>
                    <View style={styles.cardOverlay}>
                      <Text style={styles.dailyCardTitle}>{dailyReading.title}</Text>
                      <Text style={styles.dailyCardDescription}>{dailyReading.description}</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          {angelReading ? (
            <View style={styles.angelCardContainer}>
              <View style={styles.angelCardWrapper}>
                <TouchableOpacity
                  style={styles.angelCard}
                  onPress={() => handleCardPress(angelReading)}
                  activeOpacity={0.86}
                >
                  <LazyImage
                    source={angelReading.backgroundImage}
                    style={styles.cardBackgroundImage}
                    resizeMode="cover"
                    showPlaceholder={false}
                    fadeInDuration={500}
                  />
                  <LinearGradient
                    colors={['rgba(14,12,28,0.24)', 'rgba(8,8,18,0.84)']}
                    style={styles.cardGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                  >
                    <View style={styles.angelBadge}>
                      <Text style={styles.angelBadgeText}>Hızlı Mesaj</Text>
                    </View>
                    <View style={styles.cardOverlay}>
                      <Text style={styles.angelCardTitle}>{angelReading.title}</Text>
                      <Text style={styles.angelCardDescription}>{angelReading.description}</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          <View style={styles.cardsGrid}>
            {nonDailyReadings.map((reading) => (
              <View key={reading.key} style={styles.cardContainer}>
                <TouchableOpacity
                  style={styles.card}
                  onPress={() => handleCardPress(reading)}
                  activeOpacity={0.86}
                >
                  <LazyImage
                    source={reading.backgroundImage}
                    style={styles.cardBackgroundImage}
                    resizeMode="cover"
                    showPlaceholder={false}
                    fadeInDuration={500}
                  />
                  <LinearGradient
                    colors={['rgba(0,0,0,0.16)', 'rgba(0,0,0,0.74)']}
                    style={styles.cardGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                  >
                    <View style={styles.cardOverlay}>
                      <Text style={styles.cardTitle} numberOfLines={2}>
                        {reading.title}
                      </Text>
                      <Text style={styles.cardDescription} numberOfLines={3}>
                        {reading.description}
                      </Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ))}
          </View>

        </ScrollView>
        </SafeAreaView>
      </LinearGradient>
      
      {/* Auth Modal */}
      <AuthModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={() => {
          setShowAuthModal(false);
          navigation.navigate('Login');
        }}
        onRegister={() => {
          setShowAuthModal(false);
          navigation.navigate('Register');
        }}
      />
      
    </View>
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
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: Platform.OS === 'android' ? 8 : 0,
    height: 68,
    width: '100%',
    zIndex: 9998,
    elevation: Platform.OS === 'android' ? 8 : 0,
    shadowColor: Platform.OS === 'ios' ? '#000' : 'transparent',
    shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 2 } : { width: 0, height: 0 },
    shadowOpacity: Platform.OS === 'ios' ? 0.1 : 0,
    shadowRadius: Platform.OS === 'ios' ? 4 : 0,
  },
  headerLeft: {
    flex: 0,
    alignItems: 'flex-start',
    minWidth: 50,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    flex: 0,
    alignItems: 'flex-end',
    minWidth: 50,
    justifyContent: 'center',
  },
  coinCount: {
    color: '#C5A100',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  premiumCoinCount: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
    letterSpacing: 0.5,
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 10, 
  },
  dailyCardContainer: {
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: 6,
  },
  dailyCardWrapper: {
    position: 'relative',
    width: '100%',
  },
  dailyCard: {
    width: '100%',
    height: 184,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    marginTop: 0,
  },
  angelCardContainer: {
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: -2,
  },
  angelCardWrapper: {
    position: 'relative',
    width: '100%',
  },
  angelCard: {
    width: '100%',
    height: 132,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  cardContainer: {
    position: 'relative',
    width: (width - 32) / 2, // Daha geniş kartlar
    marginBottom: 10,
  },
  card: {
    width: '100%',
    height: 200, // Kart yüksekliği düşürüldü
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    elevation: Platform.OS === 'android' ? 8 : 0,
    shadowColor: Platform.OS === 'ios' ? '#000' : 'transparent',
    shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 4 } : { width: 0, height: 0 },
    shadowOpacity: Platform.OS === 'ios' ? 0.3 : 0,
    shadowRadius: Platform.OS === 'ios' ? 8 : 0,
  },

  cardBackgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  cardGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },

  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16, // Padding düşürüldü
    paddingVertical: 12, // Padding düşürüldü
  },
  featuredBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: 'rgba(197,161,0,0.16)',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(197,161,0,0.26)',
  },
  featuredBadgeText: {
    color: '#FFD76B',
    fontSize: 11,
    fontWeight: '700',
  },
  angelBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: 'rgba(245,215,123,0.16)',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(245,215,123,0.24)',
  },
  angelBadgeText: {
    color: '#F5D77B',
    fontSize: 11,
    fontWeight: '700',
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 16, // Daha küçük font
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    fontFamily: 'CinzelDecorative-Bold',
  },
  cardDescription: {
    color: '#FFFFFF',
    fontSize: 12, // Font boyutu büyütüldü
    textAlign: 'center',
    marginTop: 6, // Daha fazla üst boşluk
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    fontFamily: 'Inter-Regular',
    lineHeight: 16, // Satır yüksekliği artırıldı
  },
  dailyCardTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    fontFamily: 'CinzelDecorative-Bold',
  },
  dailyCardDescription: {
    color: '#FFFFFF',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.92,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    fontFamily: 'Inter-Regular',
    lineHeight: 18,
  },
  angelCardTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    fontFamily: 'CinzelDecorative-Bold',
  },
  angelCardDescription: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 7,
    opacity: 0.92,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    fontFamily: 'Inter-Regular',
    lineHeight: 17,
  },

  tokenContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(197, 161, 0, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(197, 161, 0, 0.3)',
    shadowColor: Platform.OS === 'ios' ? '#C5A100' : 'transparent',
    shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 2 } : { width: 0, height: 0 },
    shadowOpacity: Platform.OS === 'ios' ? 0.2 : 0,
    shadowRadius: Platform.OS === 'ios' ? 3 : 0,
    elevation: Platform.OS === 'android' ? 2 : 0,
  },
  premiumTokenContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.5)',
  },
  loginIconButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(197, 161, 0, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(197, 161, 0, 0.3)',
    shadowColor: Platform.OS === 'ios' ? '#C5A100' : 'transparent',
    shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 2 } : { width: 0, height: 0 },
    shadowOpacity: Platform.OS === 'ios' ? 0.2 : 0,
    shadowRadius: Platform.OS === 'ios' ? 3 : 0,
    elevation: Platform.OS === 'android' ? 2 : 0,
  },
  profileButton: {
    marginLeft: 8,
  },
  miniCard: {
    marginHorizontal: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniCardCopy: {
    flex: 1,
    marginLeft: 12,
    marginRight: 10,
  },
  miniCardTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  miniCardDescription: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: 12,
    lineHeight: 18,
  },
  profilePhoto: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  profilePlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(197, 161, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerAdContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0D0B1F',
    paddingBottom: 10, // Safe area için padding
    borderTopWidth: 1,
    borderTopColor: 'rgba(197, 161, 0, 0.3)',
    minHeight: 70, // Banner için minimum yükseklik
  },
  languageButton: {
    marginRight: 12,
    alignSelf: 'center',
    zIndex: 9999,
  },
});
