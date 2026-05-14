import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Platform, Animated, Image, Dimensions, Vibration } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTarotCache } from '../../hooks/useFortuneCache';
import { useToken, TOKEN_COSTS } from '../../context/TokenContext';
import { usePremium } from '../../context/PremiumContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNotification } from '../../context/NotificationContext';
import { showInterstitialAd, preloadInterstitialAd } from '../../utils/interstitialAd';
import TokenWarningModal from '../../components/TokenWarningModal';
import FortuneLoadingOverlay from '../../components/FortuneLoadingOverlay';
import AdMobBanner from '../../components/AdMobBanner';
import { fontStyles } from '../../utils/fontStyles';

const REQUIRED_CARDS = 3;
const SLOT_KEYS = ['past', 'present', 'future'];
const tarotBackSource = require('../../assets/tarot-back-mobile.jpg');
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDER_CARD_WIDTH = 142;
const SLIDER_CARD_HEIGHT = 214;
const SLIDER_OVERLAP = 76;
const SLIDER_STRIDE = SLIDER_CARD_WIDTH - SLIDER_OVERLAP;
const SLIDER_PADDING = Math.max(28, (SCREEN_WIDTH - SLIDER_CARD_WIDTH) / 2);
const PREVIEW_CARD_COUNT = 17;
const LOOP_MULTIPLIER = 3;
const CONTENT_HORIZONTAL_PADDING = 22;
const SLOT_GAP = 10;

function createShuffledDeck() {
  const deck = Array.from({ length: 78 }, (_, index) => index);
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

const TarotSelectionScreen = React.memo(() => {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();
  const { showError, showWarning, showInfo } = useNotification();
  const { balance, fetchBalance } = useToken();
  const { hasPremium, fetchStatus } = usePremium();
  const { getFortune, checkDuplicateRequest, isLoading: fortuneLoading } = useTarotCache();
  const { currentLanguage } = useLanguage();
  const niyet = route.params?.niyet?.trim?.() || '';

  const initialDeck = useMemo(() => createShuffledDeck(), []);
  const [availableCards, setAvailableCards] = useState(initialDeck);
  const [selectedCards, setSelectedCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);

  const deckPulse = useRef(new Animated.Value(1)).current;
  const deckGlow = useRef(new Animated.Value(0.35)).current;
  const slotPulseAnims = useRef(Array.from({ length: REQUIRED_CARDS }, () => new Animated.Value(1))).current;
  const sliderScrollX = useRef(new Animated.Value(0)).current;
  const sliderRef = useRef(null);
  const sliderOffsetRef = useRef(0);
  const previousAvailableCountRef = useRef(initialDeck.length);
  const [sliderHintPlayed, setSliderHintPlayed] = useState(false);
  const [showSwipeHint, setShowSwipeHint] = useState(true);
  const swipeHintX = useRef(new Animated.Value(0)).current;
  const swipeHintOpacity = useRef(new Animated.Value(0.55)).current;
  const flyTranslateX = useRef(new Animated.Value(0)).current;
  const flyTranslateY = useRef(new Animated.Value(0)).current;
  const flyScale = useRef(new Animated.Value(1)).current;
  const flyOpacity = useRef(new Animated.Value(0)).current;
  const [flyVisible, setFlyVisible] = useState(false);
  const slotRowYRef = useRef(0);

  useEffect(() => {
    fetchBalance();
    fetchStatus();
    preloadInterstitialAd();

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(deckGlow, {
          toValue: 0.7,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.timing(deckGlow, {
          toValue: 0.35,
          duration: 1600,
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();
    return () => loop.stop();
  }, []);

  useEffect(() => {
    const hintLoop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(swipeHintX, {
            toValue: 14,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(swipeHintOpacity, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(swipeHintX, {
            toValue: -14,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(swipeHintOpacity, {
            toValue: 0.45,
            duration: 700,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(swipeHintX, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(swipeHintOpacity, {
            toValue: 0.7,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    hintLoop.start();
    return () => hintLoop.stop();
  }, []);

  const previewCards = useMemo(
    () => availableCards.slice(0, Math.min(PREVIEW_CARD_COUNT, availableCards.length)),
    [availableCards]
  );
  const loopedCards = useMemo(
    () => Array.from({ length: LOOP_MULTIPLIER }, () => previewCards).flat(),
    [previewCards]
  );
  const loopedPreviewSlots = useMemo(
    () => loopedCards.map((cardIndex, index) => ({ slotId: index, cardIndex })),
    [loopedCards]
  );

  useEffect(() => {
    if (sliderHintPlayed || previewCards.length === 0) {
      return;
    }

    const centerIndex = previewCards.length + Math.max(0, Math.floor((previewCards.length - 1) / 2));
    const startOffset = centerIndex * SLIDER_STRIDE;

    const timer = setTimeout(() => {
      sliderRef.current?.scrollTo({ x: startOffset, animated: false });
      setTimeout(() => {
        sliderRef.current?.scrollTo({ x: startOffset + 34, animated: true });
        setTimeout(() => {
          sliderRef.current?.scrollTo({ x: startOffset, animated: true });
          setSliderHintPlayed(true);
        }, 380);
      }, 140);
    }, 220);

    return () => clearTimeout(timer);
  }, [previewCards.length, sliderHintPlayed]);

  useEffect(() => {
    const previousCount = previousAvailableCountRef.current;
    if (availableCards.length < previousCount && previewCards.length > 0) {
      const total = previewCards.length;
      const currentIndex = Math.round(sliderOffsetRef.current / SLIDER_STRIDE);
      const nextIndex = currentIndex + 1;
      const safeIndex = nextIndex >= total * 2 ? total + (nextIndex % total) : nextIndex;

      requestAnimationFrame(() => {
        sliderRef.current?.scrollTo({
          x: safeIndex * SLIDER_STRIDE,
          animated: true,
        });
      });
    }

    previousAvailableCountRef.current = availableCards.length;
  }, [availableCards.length, previewCards.length]);

  const dismissSwipeHint = useCallback(() => {
    if (!showSwipeHint) return;
    setShowSwipeHint(false);
    Animated.timing(swipeHintOpacity, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [showSwipeHint, swipeHintOpacity]);

  const handleSliderMomentumEnd = useCallback((event) => {
    if (previewCards.length === 0) return;

    const offsetX = event.nativeEvent.contentOffset.x;
    const total = previewCards.length;
    const itemIndex = Math.round(offsetX / SLIDER_STRIDE);

    if (itemIndex < total || itemIndex >= total * 2) {
      const normalizedIndex = ((itemIndex % total) + total) % total;
      const centeredIndex = total + normalizedIndex;
      sliderRef.current?.scrollTo({
        x: centeredIndex * SLIDER_STRIDE,
        animated: false,
      });
    }
  }, [previewCards.length]);

  const selectionMessage = useMemo(() => {
    if (selectedCards.length === 0) return t('tarot.firstCardPrompt');
    if (selectedCards.length === 1) return t('tarot.secondCardPrompt');
    if (selectedCards.length === 2) return t('tarot.thirdCardPrompt');
    return t('tarot.cardsReadyPrompt');
  }, [selectedCards.length, t]);

  const handleDrawCard = useCallback((cardIndex) => {
    if (selectedCards.length >= REQUIRED_CARDS) {
      showWarning(t('tarot.max3CardsWarning'));
      return;
    }

    if (cardIndex === undefined || !availableCards.includes(cardIndex)) {
      showWarning(t('errors.general'));
      return;
    }

    const nextOrder = selectedCards.length;
    const rest = availableCards.filter(card => card !== cardIndex);

    setAvailableCards(rest);
    setSelectedCards(prev => [...prev, cardIndex]);
    Vibration.vibrate(10);

    if (slotRowYRef.current) {
      const slotWidth = (SCREEN_WIDTH - CONTENT_HORIZONTAL_PADDING * 2 - SLOT_GAP * 2) / 3;
      const sourceX = SCREEN_WIDTH / 2 - SLIDER_CARD_WIDTH / 2;
      const sourceY = 520;
      const targetLeft = CONTENT_HORIZONTAL_PADDING + nextOrder * (slotWidth + SLOT_GAP) + (slotWidth - SLIDER_CARD_WIDTH * 0.72) / 2;
      const targetTop = slotRowYRef.current + 34;
      const targetX = targetLeft - sourceX;
      const targetY = targetTop - sourceY;

      flyTranslateX.setValue(0);
      flyTranslateY.setValue(0);
      flyScale.setValue(1);
      flyOpacity.setValue(0.96);
      setFlyVisible(true);

      Animated.parallel([
        Animated.timing(flyTranslateX, {
          toValue: targetX,
          duration: 360,
          useNativeDriver: true,
        }),
        Animated.timing(flyTranslateY, {
          toValue: targetY,
          duration: 360,
          useNativeDriver: true,
        }),
        Animated.timing(flyScale, {
          toValue: 0.72,
          duration: 360,
          useNativeDriver: true,
        }),
        Animated.timing(flyOpacity, {
          toValue: 0.18,
          duration: 360,
          useNativeDriver: true,
        }),
      ]).start(() => setFlyVisible(false));
    }

    Animated.sequence([
      Animated.spring(deckPulse, {
        toValue: 0.94,
        friction: 7,
        tension: 160,
        useNativeDriver: true,
      }),
      Animated.spring(deckPulse, {
        toValue: 1,
        friction: 6,
        tension: 170,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.sequence([
      Animated.spring(slotPulseAnims[nextOrder], {
        toValue: 1.06,
        friction: 6,
        tension: 170,
        useNativeDriver: true,
      }),
      Animated.spring(slotPulseAnims[nextOrder], {
        toValue: 1,
        friction: 7,
        tension: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [availableCards, deckPulse, flyOpacity, flyScale, flyTranslateX, flyTranslateY, selectedCards.length, showWarning, slotPulseAnims, t]);

  const handleSlotPress = useCallback((slotIndex) => {
    const card = selectedCards[slotIndex];
    if (card === undefined) return;

    setSelectedCards(prev => prev.filter((_, index) => index !== slotIndex));
    setAvailableCards(prev => [card, ...prev]);
  }, [selectedCards]);

  const handleSubmit = useCallback(async () => {
    if (selectedCards.length !== REQUIRED_CARDS) {
      showError(t('tarot.selectExactCards', { count: REQUIRED_CARDS }));
      return;
    }

    if (!hasPremium && balance < TOKEN_COSTS.TAROT) {
      setShowTokenModal(true);
      return;
    }

    setLoading(true);

    try {
      const fortuneData = {
        soru: niyet,
        selectedCards: [...selectedCards].sort(),
        language: currentLanguage,
        readingTier: hasPremium ? 'premium' : 'free',
      };

      if (checkDuplicateRequest(fortuneData)) {
        showInfo(t('tarot.duplicateRequestInfo'));
        setLoading(false);
        return;
      }

      const result = await getFortune.mutateAsync(fortuneData);
      await fetchBalance();

      if (result.data.success) {
        if (!hasPremium) {
          try {
            await showInterstitialAd();
          } catch (adError) {
            console.log('Reklam gösterilemedi:', adError);
          }
        }

        navigation.navigate('TarotResult', {
          cards: result.data.cards,
          interpretation: result.data.yorum,
          fallback: result.data.fallback || false,
          question: niyet,
          readingTier: result.data.reading_tier || (hasPremium ? 'premium' : 'free'),
        });
      } else {
        showError(result.data.error || t('errors.general'));
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error.response?.data?.error || error.message || t('errors.general');

      if (errorMessage.includes('Yetersiz token')) {
        setShowTokenModal(true);
      } else if (error.name === 'AbortError') {
        showError(t('errors.timeout'));
      } else if (error.message.includes('Network request failed')) {
        showError(t('errors.network'));
      } else {
        showError(t('errors.general'));
      }
    } finally {
      setLoading(false);
    }
  }, [balance, checkDuplicateRequest, currentLanguage, fetchBalance, getFortune, hasPremium, navigation, niyet, selectedCards, showError, showInfo, t]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0D0B1F" />

        <LinearGradient colors={['#0D0B1F', '#1B1B2F', '#2A2A3F']} style={styles.gradientBg}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.eyebrow}>{t('tarot.selectYourCards')}</Text>
              <Text style={styles.title}>{t('tarot.chooseYourSpread')}</Text>
            </View>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.content}>
            {niyet ? (
              <View style={styles.intentPill}>
                <Ionicons name="sparkles-outline" size={14} color="#F5D06A" />
                <Text numberOfLines={2} style={styles.intentPillText}>
                  {niyet}
                </Text>
              </View>
            ) : null}

            <Text style={styles.selectionDescription}>{t('tarot.selectionShortSubtitle')}</Text>

            <View style={styles.selectionStatus}>
              <View style={styles.selectionPill}>
                <Ionicons name="sparkles" size={14} color="#F5D06A" />
                <Text style={styles.selectionPillText}>{selectionMessage}</Text>
              </View>
              <Text style={styles.cardCount}>{selectedCards.length}/{REQUIRED_CARDS}</Text>
            </View>

            <View
              style={styles.slotsRow}
              onLayout={({ nativeEvent }) => {
                slotRowYRef.current = nativeEvent.layout.y + 26;
              }}
            >
              {SLOT_KEYS.map((slotKey, index) => {
                const selectedCardIndex = selectedCards[index];
                const hasCard = selectedCardIndex !== undefined;

                return (
                  <Animated.View
                    key={slotKey}
                    style={[
                      styles.slotWrap,
                      { transform: [{ scale: slotPulseAnims[index] }] },
                    ]}
                  >
                    <Text style={styles.slotLabel}>{t(`tarot.${slotKey}`)}</Text>
                    <TouchableOpacity
                      activeOpacity={0.88}
                      onPress={() => handleSlotPress(index)}
                      style={[styles.slotCard, hasCard && styles.slotCardFilled]}
                    >
                      {hasCard ? (
                        <>
                          <Image source={tarotBackSource} style={styles.slotCardImage} resizeMode="cover" />
                          <View style={styles.slotCardOverlay}>
                            <View style={styles.slotBadge}>
                              <Text style={styles.slotBadgeText}>{index + 1}</Text>
                            </View>
                          </View>
                        </>
                      ) : (
                        <View style={styles.slotPlaceholder}>
                          <Ionicons name="albums-outline" size={22} color="rgba(245, 208, 106, 0.5)" />
                        </View>
                      )}
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </View>

            <View style={styles.deckArea}>
              {showSwipeHint ? (
                <Animated.View
                  style={[
                    styles.swipeHintPill,
                    {
                      opacity: swipeHintOpacity,
                      transform: [{ translateX: swipeHintX }],
                    },
                  ]}
                >
                  <Ionicons name="chevron-back" size={16} color="#F5D06A" />
                  <Text style={styles.swipeHintText}>{t('tarot.swipeDeckHint')}</Text>
                  <Ionicons name="chevron-forward" size={16} color="#F5D06A" />
                </Animated.View>
              ) : null}
              <Animated.ScrollView
                ref={sliderRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                bounces={false}
                contentContainerStyle={styles.sliderContent}
                snapToInterval={SLIDER_STRIDE}
                decelerationRate="fast"
                scrollEventThrottle={16}
                onScrollBeginDrag={dismissSwipeHint}
                onMomentumScrollEnd={handleSliderMomentumEnd}
                onScroll={Animated.event(
                  [{ nativeEvent: { contentOffset: { x: sliderScrollX } } }],
                  {
                    useNativeDriver: true,
                    listener: (event) => {
                      sliderOffsetRef.current = event.nativeEvent.contentOffset.x;
                    },
                  }
                )}
              >
                {loopedPreviewSlots.map(({ cardIndex, slotId }, index) => {
                  const inputRange = [
                    (index - 1) * SLIDER_STRIDE,
                    index * SLIDER_STRIDE,
                    (index + 1) * SLIDER_STRIDE,
                  ];

                  const scale = sliderScrollX.interpolate({
                    inputRange,
                    outputRange: [0.9, 1.05, 0.9],
                    extrapolate: 'clamp',
                  });

                  const translateY = sliderScrollX.interpolate({
                    inputRange,
                    outputRange: [26, -6, 26],
                    extrapolate: 'clamp',
                  });

                  const rotate = sliderScrollX.interpolate({
                    inputRange,
                    outputRange: ['-9deg', '0deg', '9deg'],
                    extrapolate: 'clamp',
                  });

                  return (
                    <Animated.View
                      key={`deck-slot-${slotId}`}
                      style={[
                        styles.sliderCardWrap,
                        index === 0 && styles.sliderCardWrapFirst,
                        { transform: [{ translateY }, { scale }, { rotate }] },
                      ]}
                    >
                      <TouchableOpacity activeOpacity={0.92} onPress={() => handleDrawCard(cardIndex)} style={styles.sliderCard}>
                        <Animated.View style={{ transform: [{ scale: deckPulse }] }}>
                          <Image source={tarotBackSource} style={styles.sliderCardImage} resizeMode="cover" />
                        </Animated.View>
                      </TouchableOpacity>
                    </Animated.View>
                  );
                })}
              </Animated.ScrollView>
            </View>
          </View>

          {flyVisible ? (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.flyCard,
                {
                  opacity: flyOpacity,
                  transform: [
                    { translateX: flyTranslateX },
                    { translateY: flyTranslateY },
                    { scale: flyScale },
                  ],
                },
              ]}
            >
              <Image source={tarotBackSource} style={styles.sliderCardImage} resizeMode="cover" />
            </Animated.View>
          ) : null}

          <View style={styles.footerCtaWrap}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                (loading || fortuneLoading || selectedCards.length !== REQUIRED_CARDS) && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={loading || fortuneLoading || selectedCards.length !== REQUIRED_CARDS}
            >
              <Ionicons name="sparkles" size={22} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>
                {loading || fortuneLoading ? t('tarot.fortuneBeingInterpreted') : t('tarot.sendMyFortune')}
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <TokenWarningModal
          visible={showTokenModal}
          onClose={() => setShowTokenModal(false)}
          onPurchaseTokens={() => {
            setShowTokenModal(false);
            navigation.navigate('TokenPurchase');
          }}
          onWatchVideo={() => {
            setShowTokenModal(false);
            navigation.navigate('TokenBalance');
          }}
          currentBalance={balance}
          requiredTokens={35}
          readingType="tarot"
        />
        <FortuneLoadingOverlay visible={loading || fortuneLoading} readingType="tarot" />
        {!hasPremium ? (
          <View style={styles.bannerAdContainer}>
            <AdMobBanner />
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0D0B1F',
  },
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
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 6,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(197, 161, 0, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerSpacer: {
    width: 44,
  },
  eyebrow: {
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: '#F5D06A',
    ...fontStyles.bodyBold,
  },
  title: {
    fontSize: 28,
    color: '#FFFFFF',
    marginTop: 6,
    ...fontStyles.headingBold,
  },
  content: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 132,
  },
  intentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 208, 106, 0.08)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(245, 208, 106, 0.14)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
    gap: 8,
  },
  intentPillText: {
    flex: 1,
    color: '#E8E5F1',
    fontSize: 14,
    lineHeight: 20,
    ...fontStyles.body,
  },
  selectionDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: '#D5D3E0',
    marginBottom: 18,
    ...fontStyles.body,
  },
  selectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  selectionPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(245, 208, 106, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(245, 208, 106, 0.18)',
  },
  selectionPillText: {
    color: '#F5D06A',
    marginLeft: 8,
    fontSize: 13,
    ...fontStyles.bodyBold,
  },
  cardCount: {
    color: '#C5A100',
    fontSize: 14,
    minWidth: 36,
    textAlign: 'right',
    ...fontStyles.bodyBold,
  },
  slotsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  slotWrap: {
    flex: 1,
    alignItems: 'center',
  },
  slotLabel: {
    color: '#F5D06A',
    fontSize: 13,
    marginBottom: 10,
    ...fontStyles.bodyBold,
  },
  slotCard: {
    width: '100%',
    aspectRatio: 0.68,
    borderRadius: 18,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(245, 208, 106, 0.22)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    overflow: 'hidden',
  },
  slotCardFilled: {
    borderStyle: 'solid',
    borderColor: '#C5A100',
    shadowColor: '#C5A100',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.24,
    shadowRadius: 12,
    elevation: 4,
  },
  slotCardImage: {
    width: '100%',
    height: '100%',
  },
  slotCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 8, 26, 0.28)',
    justifyContent: 'space-between',
    padding: 10,
  },
  slotBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0D0B1F',
    borderWidth: 1,
    borderColor: '#F5D06A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotBadgeText: {
    color: '#F5D06A',
    fontSize: 12,
    ...fontStyles.bodyBold,
  },
  slotPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deckArea: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 84,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  swipeHintPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(245, 208, 106, 0.07)',
    borderWidth: 1,
    borderColor: 'rgba(245, 208, 106, 0.14)',
  },
  swipeHintText: {
    color: '#F5D06A',
    fontSize: 12,
    ...fontStyles.bodyBold,
  },
  sliderContent: {
    paddingHorizontal: SLIDER_PADDING,
    paddingTop: 16,
    paddingBottom: 0,
    alignItems: 'flex-end',
  },
  sliderCardWrap: {
    width: SLIDER_CARD_WIDTH,
    height: SLIDER_CARD_HEIGHT + 40,
    marginLeft: -SLIDER_OVERLAP,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  sliderCardWrapFirst: {
    marginLeft: 0,
  },
  sliderCard: {
    width: SLIDER_CARD_WIDTH,
    height: SLIDER_CARD_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(245, 208, 106, 0.22)',
    backgroundColor: '#162031',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 6,
  },
  sliderCardImage: {
    width: '100%',
    height: '100%',
  },
  flyCard: {
    position: 'absolute',
    left: SCREEN_WIDTH / 2 - SLIDER_CARD_WIDTH / 2,
    top: 520,
    width: SLIDER_CARD_WIDTH,
    height: SLIDER_CARD_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(245, 208, 106, 0.22)',
  },
  footerCtaWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: Platform.OS === 'ios' ? 58 : 52,
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 22 : 18,
    backgroundColor: 'rgba(13, 11, 31, 0.92)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(245, 208, 106, 0.10)',
  },
  submitButton: {
    backgroundColor: '#8A4FFF',
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#8A4FFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
  submitButtonDisabled: {
    opacity: 0.6,
    backgroundColor: '#554a65',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    marginLeft: 10,
    ...fontStyles.bodyBold,
  },
  bannerAdContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0D0B1F',
  },
});

export default TarotSelectionScreen;
