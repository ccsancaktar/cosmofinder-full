import React from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import LazyImage from '../../components/LazyImage';
import { usePremium } from '../../context/PremiumContext';

// Tarot kartı imajlarını import et
const tarotImages = {
  // Major Arcana
  'major_00_Fool.jpg': require('../../assets/tarot/major_00_Fool.jpg'),
  'major_01_Magician.jpg': require('../../assets/tarot/major_01_Magician.jpg'),
  'major_02_High_Priestess.jpg': require('../../assets/tarot/major_02_High_Priestess.jpg'),
  'major_03_Empress.jpg': require('../../assets/tarot/major_03_Empress.jpg'),
  'major_05_Hierophant.jpg': require('../../assets/tarot/major_05_Hierophant.jpg'),
  'major_06_Lovers.jpg': require('../../assets/tarot/major_06_Lovers.jpg'),
  'major_07_Chariot.jpg': require('../../assets/tarot/major_07_Chariot.jpg'),
  'major_08_Strength.jpg': require('../../assets/tarot/major_08_Strength.jpg'),
  'major_09_Hermit.jpg': require('../../assets/tarot/major_09_Hermit.jpg'),
  'major_10_Wheel_of_Fortune.jpg': require('../../assets/tarot/major_10_Wheel_of_Fortune.jpg'),
  'major_11_Justice.jpg': require('../../assets/tarot/major_11_Justice.jpg'),
  'major_12_Hanged_Man.jpg': require('../../assets/tarot/major_12_Hanged_Man.jpg'),
  'major_14_Temperance.jpg': require('../../assets/tarot/major_14_Temperance.jpg'),
  'major_15_Devil.jpg': require('../../assets/tarot/major_15_Devil.jpg'),
  'major_16_Tower.jpg': require('../../assets/tarot/major_16_Tower.jpg'),
  'major_17_Star.jpg': require('../../assets/tarot/major_17_Star.jpg'),
  'major_18_Moon.jpg': require('../../assets/tarot/major_18_Moon.jpg'),
  'major_19_Sun.jpg': require('../../assets/tarot/major_19_Sun.jpg'),
  'major_20_Judgement.jpg': require('../../assets/tarot/major_20_Judgement.jpg'),
  'major_21_World.jpg': require('../../assets/tarot/major_21_World.jpg'),
  
  // Cups
  'cups01.jpg': require('../../assets/tarot/cups01.jpg'),
  'cups02.jpg': require('../../assets/tarot/cups02.jpg'),
  'cups03.jpg': require('../../assets/tarot/cups03.jpg'),
  'cups04.jpg': require('../../assets/tarot/cups04.jpg'),
  'cups05.jpg': require('../../assets/tarot/cups05.jpg'),
  'cups06.jpg': require('../../assets/tarot/cups06.jpg'),
  'cups07.jpg': require('../../assets/tarot/cups07.jpg'),
  'cups08.jpg': require('../../assets/tarot/cups08.jpg'),
  'cups09.jpg': require('../../assets/tarot/cups09.jpg'),
  'cups10.jpg': require('../../assets/tarot/cups10.jpg'),
  'cups11.jpg': require('../../assets/tarot/cups11.jpg'),
  'cups12.jpg': require('../../assets/tarot/cups12.jpg'),
  'cups13.jpg': require('../../assets/tarot/cups13.jpg'),
  'cups14.jpg': require('../../assets/tarot/cups14.jpg'),
  
  // Swords
  'swords01.jpg': require('../../assets/tarot/swords01.jpg'),
  'swords02.jpg': require('../../assets/tarot/swords02.jpg'),
  'swords03.jpg': require('../../assets/tarot/swords03.jpg'),
  'swords04.jpg': require('../../assets/tarot/swords04.jpg'),
  'swords05.jpg': require('../../assets/tarot/swords05.jpg'),
  'swords06.jpg': require('../../assets/tarot/swords06.jpg'),
  'swords07.jpg': require('../../assets/tarot/swords07.jpg'),
  'swords08.jpg': require('../../assets/tarot/swords08.jpg'),
  'swords09.jpg': require('../../assets/tarot/swords09.jpg'),
  'swords10.jpg': require('../../assets/tarot/swords10.jpg'),
  'swords11.jpg': require('../../assets/tarot/swords11.jpg'),
  'swords12.jpg': require('../../assets/tarot/swords12.jpg'),
  'swords13.jpg': require('../../assets/tarot/swords13.jpg'),
  'swords14.jpg': require('../../assets/tarot/swords14.jpg'),
  
  // Wands
  'wands01.jpg': require('../../assets/tarot/wands01.jpg'),
  'wands02.jpg': require('../../assets/tarot/wands02.jpg'),
  'wands03.jpg': require('../../assets/tarot/wands03.jpg'),
  'wands04.jpg': require('../../assets/tarot/wands04.jpg'),
  'wands05.jpg': require('../../assets/tarot/wands05.jpg'),
  'wands06.jpg': require('../../assets/tarot/wands06.jpg'),
  'wands07.jpg': require('../../assets/tarot/wands07.jpg'),
  'wands08.jpg': require('../../assets/tarot/wands08.jpg'),
  'wands09.jpg': require('../../assets/tarot/wands09.jpg'),
  'wands10.jpg': require('../../assets/tarot/wands10.jpg'),
  'wands11.jpg': require('../../assets/tarot/wands11.jpg'),
  'wands12.jpg': require('../../assets/tarot/wands12.jpg'),
  'wands13.jpg': require('../../assets/tarot/wands13.jpg'),
  'wands14.jpg': require('../../assets/tarot/wands14.jpg'),
  
  // Pentacles
  'pents01.jpg': require('../../assets/tarot/pents01.jpg'),
  'pents02.jpg': require('../../assets/tarot/pents02.jpg'),
  'pents03.jpg': require('../../assets/tarot/pents03.jpg'),
  'pents04.jpg': require('../../assets/tarot/pents04.jpg'),
  'pents05.jpg': require('../../assets/tarot/pents05.jpg'),
  'pents06.jpg': require('../../assets/tarot/pents06.jpg'),
  'pents07.jpg': require('../../assets/tarot/pents07.jpg'),
  'pents08.jpg': require('../../assets/tarot/pents08.jpg'),
  'pents09.jpg': require('../../assets/tarot/pents09.jpg'),
  'pents10.jpg': require('../../assets/tarot/pents10.jpg'),
  'pents11.jpg': require('../../assets/tarot/pents11.jpg'),
  'pents12.jpg': require('../../assets/tarot/pents12.jpg'),
  'pents13.jpg': require('../../assets/tarot/pents13.jpg'),
  'pents14.jpg': require('../../assets/tarot/pents14.jpg'),
  
  // Fallback
  'tarot-back.jpg': require('../../assets/tarot/tarot-back.jpg'),
};

const SECTION_ICONS = {
  '🃏': 'albums',
  '🧩': 'extension-puzzle',
  '⏳': 'hourglass',
  '❤️': 'heart',
  '💼': 'briefcase',
  '🔮': 'sparkles',
  '🕯️': 'flame',
  '✨': 'sparkles',
};

const POSITION_LABELS = {
  tr: ['Geçmiş', 'Şimdi', 'Gelecek'],
  en: ['Past', 'Present', 'Future'],
  de: ['Vergangenheit', 'Gegenwart', 'Zukunft'],
};

const HEADING_ALIASES = [
  { emoji: '🃏', patterns: [/^the shared theme of the cards$/i, /^the main message of the spread$/i, /^das gemeinsame thema der karten$/i, /^die hauptbotschaft der legung$/i, /^kartların ortak teması$/i, /^açılımın ana mesajı$/i] },
  { emoji: '🧩', patterns: [/^the hidden knot of the question$/i, /^the hidden inner knot$/i, /^der verborgene knoten der frage$/i, /^der verborgene innere knoten$/i, /^sorunun gizli düğümü$/i, /^içsel düğüm ve görünmeyen etki$/i] },
  { emoji: '⏳', patterns: [/^past, present, and future flow$/i, /^influence coming from the past$/i, /^vergangenheit, gegenwart und zukunftsfluss$/i, /^der einfluss aus der vergangenheit$/i, /^geçmiş, şimdi ve gelecek akışı$/i, /^geçmişten gelen etki$/i] },
  { emoji: '❤️', patterns: [/^emotional and relational field$/i, /^emotionales und beziehungsfeld$/i, /^duygusal ve ilişkisel alan$/i] },
  { emoji: '💼', patterns: [/^decisions, work, and material direction$/i, /^entscheidungen, beruf und materielle richtung$/i, /^kararlar, iş ve maddi yön$/i] },
  { emoji: '🔮', patterns: [/^likely development and timing flow$/i, /^the near-future tendency$/i, /^wahrscheinliche entwicklung und zeitfluss$/i, /^die tendenz der nahen zukunft$/i, /^olası gelişme ve zaman akışı$/i, /^yakın gelecek eğilimi$/i] },
  { emoji: '🕯️', patterns: [/^clear advice from the cards$/i, /^the cards'? advice$/i, /^klarer rat der karten$/i, /^der rat der karten$/i, /^kartlardan net tavsiye$/i, /^kartların tavsiyesi$/i] },
];

const cleanLine = (line) =>
  line
    .replace(/\*\*/g, '')
    .replace(/^#+\s*/, '')
    .replace(/^[-•]\s*/, '')
    .trim();

const normalizeHeading = (line) => {
  const cleaned = cleanLine(line);
  if (/^(🃏|🧩|⏳|❤️|💼|🔮|🕯️|✨)/.test(cleaned)) return cleaned;
  const match = HEADING_ALIASES.find((item) => item.patterns.some((pattern) => pattern.test(cleaned)));
  return match ? `${match.emoji} ${cleaned}` : cleaned;
};

const isSectionHeading = (line) => /^(🃏|🧩|⏳|❤️|💼|🔮|🕯️|✨)/.test(normalizeHeading(line));

const parseTarotContent = (content, fallbackTitle = 'READING') => {
  if (!content) return { sections: [], cta: '' };

  const lines = content.split('\n');
  const sections = [];
  let currentSection = null;
  let cta = '';

  lines.forEach((rawLine) => {
    const line = normalizeHeading(rawLine);
    if (!line) return;

    if (
      line.startsWith('👉') ||
      /detaylı tarot yorumunda/i.test(line) ||
      /detailed tarot reading/i.test(line) ||
      /detaillierte tarot-deutung/i.test(line)
    ) {
      cta = line.replace(/^👉\s*/, '');
      return;
    }

    if (isSectionHeading(line)) {
      if (currentSection) sections.push(currentSection);
      currentSection = { title: line, points: [] };
      return;
    }

    if (!currentSection) {
      currentSection = { title: `✨ ${fallbackTitle}`, points: [] };
    }

    currentSection.points.push(line);
  });

  if (currentSection) sections.push(currentSection);
  return { sections, cta };
};

const splitHeading = (heading) => {
  const match = heading.match(/^(🃏|🧩|⏳|❤️|💼|🔮|🕯️|✨)\s*(.*)$/);
  if (!match) return { emoji: '✨', text: heading };
  return { emoji: match[1], text: match[2] };
};

const getSectionIcon = (heading) => {
  const match = heading.match(/^(🃏|🧩|⏳|❤️|💼|🔮|🕯️|✨)/);
  return match ? SECTION_ICONS[match[1]] : 'document-text';
};

const summarizeMeaning = (card) => {
  const base = card?.reversed ? card?.reversed_meaning : card?.meaning;
  if (!base) return '';
  return String(base).split(',')[0]?.trim() || base;
};

export default function TarotResultScreen({ route, navigation }) {
  const { t, i18n } = useTranslation();
  const { hasPremium } = usePremium();
  const params = route?.params || {};
  const { cards = [], interpretation, question = '', readingTier = 'free' } = params;
  const locale = i18n.language?.startsWith('de') ? 'de' : i18n.language?.startsWith('en') ? 'en' : 'tr';
  const ui = {
    tr: {
      freeBadge: 'Kısa Açılım',
      premiumBadge: 'Detaylı Tarot Açılımı',
      fallbackTitle: 'YORUM',
      questionTitle: 'Sorunun Merkezinde',
      cardsTitle: 'Seçilen Kartlar',
      uprightBadge: 'Düz',
      reversedBadge: 'Ters',
      premiumEyebrow: 'Derin Katman Açık Değil',
      premiumTitle: 'Bu yorum kısa tarot açılımıdır',
      premiumDescription:
        'Premium tarot yorumunda kartların birbirleriyle bağı, sorunun gerçek düğümü ve daha net zaman akışı çok daha açık şekilde çözülür.',
      premiumPoint1: 'Kartlar arası gizli bağ ve açılımın ana düğümü',
      premiumPoint2: 'Duygusal alan, kararlar ve iş yönü için daha derin çözümleme',
      premiumPoint3: 'Yakın gelecek akışı ve daha net yönlendirme',
      premiumButton: 'Detaylı Tarot Açılımını Aç',
    },
    en: {
      freeBadge: 'Short Spread',
      premiumBadge: 'Detailed Tarot Spread',
      fallbackTitle: 'READING',
      questionTitle: 'At the Center of Your Question',
      cardsTitle: 'Selected Cards',
      uprightBadge: 'Upright',
      reversedBadge: 'Reversed',
      premiumEyebrow: 'Deep Layer Locked',
      premiumTitle: 'This is the short tarot spread',
      premiumDescription:
        'In the premium tarot reading, the hidden bond between the cards, the real knot of the question, and a clearer time flow are revealed much more deeply.',
      premiumPoint1: 'Hidden connection between the cards and the core knot of the spread',
      premiumPoint2: 'Deeper reading for emotions, decisions, and work direction',
      premiumPoint3: 'Clearer near-future flow and guidance',
      premiumButton: 'Unlock Detailed Tarot Spread',
    },
    de: {
      freeBadge: 'Kurze Legung',
      premiumBadge: 'Detaillierte Tarot-Legung',
      fallbackTitle: 'DEUTUNG',
      questionTitle: 'Im Zentrum Deiner Frage',
      cardsTitle: 'Gewählte Karten',
      uprightBadge: 'Aufrecht',
      reversedBadge: 'Umgekehrt',
      premiumEyebrow: 'Tiefe Ebene Gesperrt',
      premiumTitle: 'Dies ist die kurze Tarot-Legung',
      premiumDescription:
        'In der Premium-Tarot-Deutung werden die verborgene Verbindung der Karten, der wahre Knoten der Frage und ein klarerer Zeitfluss deutlich tiefer sichtbar.',
      premiumPoint1: 'Verborgene Verbindung der Karten und Kernknoten der Legung',
      premiumPoint2: 'Tiefere Deutung für Emotionen, Entscheidungen und berufliche Richtung',
      premiumPoint3: 'Klarerer Zukunftsfluss und stärkere Orientierung',
      premiumButton: 'Detaillierte Tarot-Legung Öffnen',
    },
  }[locale];

  const positions = POSITION_LABELS[locale];
  const { sections, cta } = parseTarotContent(interpretation, ui.fallbackTitle);

  const getCardName = (card) => (locale === 'tr' ? card?.name_tr || card?.name : card?.name || card?.name_tr);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0B1F" translucent={false} hidden={false} />

      <LinearGradient colors={['#0D0B1F', '#1B1B2F', '#2A2A3F']} style={styles.gradientBg}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.headerSection}>
            <LazyImage
              source={require('../../assets/backgrounds/tarot.jpg')}
              style={styles.headerBackgroundImage}
              resizeMode="cover"
              showPlaceholder={false}
              fadeInDuration={500}
            />
            <LinearGradient colors={['rgba(0,0,0,0.58)', 'rgba(0,0,0,0.92)']} style={styles.headerGradient}>
              <Text style={styles.title}>{t('tarot.tarotResultTitle')}</Text>
              <Text style={styles.subtitle}>{t('tarot.tarotResultSubtitle')}</Text>
              <LinearGradient
                colors={readingTier === 'premium' ? ['#C5A100', '#8A4FFF'] : ['rgba(255,255,255,0.16)', 'rgba(255,255,255,0.08)']}
                style={styles.tierBadge}
              >
                <Ionicons name={readingTier === 'premium' ? 'diamond' : 'moon'} size={16} color="#FFFFFF" />
                <Text style={styles.tierBadgeText}>{readingTier === 'premium' ? ui.premiumBadge : ui.freeBadge}</Text>
              </LinearGradient>
            </LinearGradient>
          </View>

          {!!question && (
            <View style={styles.questionCard}>
              <Text style={styles.questionTitle}>{ui.questionTitle}</Text>
              <Text style={styles.questionText}>{question}</Text>
            </View>
          )}

          {cards.length > 0 && (
            <View style={styles.cardsSection}>
              <Text style={styles.cardsTitle}>{ui.cardsTitle}</Text>
              <View style={styles.cardsContainer}>
                {cards.map((card, index) => {
                  const imageSource = tarotImages[card.image] || tarotImages['tarot-back.jpg'];
                  return (
                    <View key={`${card.key || card.image}-${index}`} style={styles.cardItem}>
                      <Text style={styles.positionLabel}>{positions[index] || `${index + 1}`}</Text>
                      <View
                        style={[
                          styles.cardImageContainer,
                          card.reversed ? styles.reversedCardFrame : styles.uprightCardFrame,
                        ]}
                      >
                        <View style={[styles.orientationBadge, card.reversed ? styles.reversedBadge : styles.uprightBadge]}>
                          <Text style={styles.orientationBadgeText}>
                            {card.reversed ? ui.reversedBadge : ui.uprightBadge}
                          </Text>
                        </View>
                        <View style={card.reversed && styles.reversedCardContainer}>
                        <LazyImage
                          source={imageSource}
                          style={styles.cardImage}
                          resizeMode="contain"
                          showPlaceholder={true}
                          fadeInDuration={300}
                        />
                        </View>
                      </View>
                      <Text style={styles.cardName}>
                        {getCardName(card)}
                      </Text>
                      <Text style={styles.cardKeyword}>{summarizeMeaning(card)}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {sections.map((section, index) => {
            const heading = splitHeading(section.title);
            return (
              <View key={`${section.title}-${index}`} style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIconWrap}>
                    <Ionicons name={getSectionIcon(section.title)} size={18} color="#C5A100" />
                  </View>
                  <View style={styles.sectionTitleWrap}>
                    <Text style={styles.sectionTitle}>{heading.text}</Text>
                  </View>
                </View>

                {section.points.map((point, pointIndex) => (
                  <View key={`${section.title}-${pointIndex}`} style={styles.pointRow}>
                    <View style={styles.pointDot} />
                    <Text style={styles.pointText}>{point}</Text>
                  </View>
                ))}
              </View>
            );
          })}

          {!!cta && readingTier === 'free' && (
            <LinearGradient colors={['rgba(197,161,0,0.20)', 'rgba(138,79,255,0.18)']} style={styles.ctaCard}>
              <Ionicons name="lock-closed" size={18} color="#FFD76B" />
              <Text style={styles.ctaText}>{cta}</Text>
            </LinearGradient>
          )}

          {!hasPremium && readingTier === 'free' && (
            <LinearGradient colors={['rgba(197,161,0,0.18)', 'rgba(138,79,255,0.20)']} style={styles.premiumCard}>
              <View style={styles.premiumCardHeader}>
                <View style={styles.premiumIconWrap}>
                  <Ionicons name="diamond" size={18} color="#FFD76B" />
                </View>
                <View style={styles.premiumHeaderText}>
                  <Text style={styles.premiumEyebrow}>{ui.premiumEyebrow}</Text>
                  <Text style={styles.premiumTitle}>{ui.premiumTitle}</Text>
                </View>
              </View>

              <Text style={styles.premiumDescription}>{ui.premiumDescription}</Text>

              <View style={styles.premiumPoints}>
                <View style={styles.premiumPointRow}>
                  <Ionicons name="checkmark-circle" size={16} color="#FFD76B" />
                  <Text style={styles.premiumPointText}>{ui.premiumPoint1}</Text>
                </View>
                <View style={styles.premiumPointRow}>
                  <Ionicons name="checkmark-circle" size={16} color="#FFD76B" />
                  <Text style={styles.premiumPointText}>{ui.premiumPoint2}</Text>
                </View>
                <View style={styles.premiumPointRow}>
                  <Ionicons name="checkmark-circle" size={16} color="#FFD76B" />
                  <Text style={styles.premiumPointText}>{ui.premiumPoint3}</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.premiumButton} onPress={() => navigation.navigate('Premium')}>
                <LinearGradient colors={['#D4A91F', '#8A4FFF']} style={styles.premiumButtonGradient}>
                  <Ionicons name="sparkles" size={18} color="#FFFFFF" />
                  <Text style={styles.premiumButtonText}>{ui.premiumButton}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={() => navigation.navigate('TarotForm')} style={styles.newFortuneButton}>
              <Ionicons name="refresh" size={22} color="#FFFFFF" />
              <Text style={styles.newFortuneButtonText}>{t('tarot.newFortune')}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Ana Sayfa')} style={styles.homeButton}>
              <Ionicons name="home" size={22} color="#FFFFFF" />
              <Text style={styles.homeButtonText}>{t('tarot.homePage')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.disclaimer}>
            <Ionicons name="information-circle" size={16} color="#C5A100" />
            <Text style={styles.disclaimerText}>{t('tarot.disclaimerText')}</Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0B1F' },
  gradientBg: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  headerSection: { height: 220, position: 'relative' },
  headerBackgroundImage: { position: 'absolute', width: '100%', height: '100%' },
  headerGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 0 : 20,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.92)',
    textAlign: 'center',
    lineHeight: 22,
  },
  tierBadge: {
    marginTop: 18,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tierBadgeText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  questionCard: {
    marginHorizontal: 20,
    marginTop: -24,
    marginBottom: 16,
    backgroundColor: 'rgba(20,18,40,0.96)',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(197,161,0,0.18)',
  },
  questionTitle: { color: '#F2D186', fontSize: 17, fontWeight: '700', marginBottom: 10 },
  questionText: { color: '#FFFFFF', fontSize: 16, lineHeight: 24 },
  cardsSection: {
    marginHorizontal: 20,
    marginBottom: 14,
    backgroundColor: 'rgba(27,27,47,0.96)',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardsTitle: { color: '#E6C57E', fontSize: 17, fontWeight: '700', marginBottom: 14 },
  cardsContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  cardItem: { flex: 1, alignItems: 'center' },
  positionLabel: {
    color: '#BFA870',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  cardImageContainer: {
    width: '100%',
    aspectRatio: 0.7,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.04)',
    marginBottom: 10,
    borderWidth: 2,
  },
  uprightCardFrame: { borderColor: 'rgba(197,161,0,0.22)' },
  reversedCardFrame: { borderColor: 'rgba(138,79,255,0.88)' },
  orientationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 2,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  uprightBadge: {
    backgroundColor: 'rgba(197,161,0,0.18)',
    borderColor: 'rgba(242,209,134,0.35)',
  },
  reversedBadge: {
    backgroundColor: 'rgba(138,79,255,0.22)',
    borderColor: 'rgba(173,132,255,0.45)',
  },
  orientationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  cardImage: { width: '100%', height: '100%' },
  reversedCardContainer: { transform: [{ rotate: '180deg' }] },
  cardName: { color: '#FFFFFF', fontSize: 13, fontWeight: '700', textAlign: 'center', marginBottom: 6 },
  cardKeyword: { color: '#B9B7C8', fontSize: 12, textAlign: 'center', lineHeight: 18 },
  sectionCard: {
    marginHorizontal: 20,
    marginBottom: 14,
    backgroundColor: 'rgba(27,27,47,0.96)',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  sectionIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(197,161,0,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionTitleWrap: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  sectionTitle: { flex: 1, color: '#E6C57E', fontSize: 16, fontWeight: '700', lineHeight: 22 },
  pointRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  pointDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#C5A100', marginTop: 8, marginRight: 10 },
  pointText: { flex: 1, color: '#F6F4FF', fontSize: 15, lineHeight: 24 },
  ctaCard: {
    marginHorizontal: 20,
    marginBottom: 18,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255,215,107,0.16)',
  },
  ctaText: { flex: 1, color: '#F6E8B1', fontSize: 14, lineHeight: 22, marginLeft: 10 },
  premiumCard: {
    marginHorizontal: 20,
    marginBottom: 18,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(197,161,0,0.20)',
  },
  premiumCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  premiumIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,215,107,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  premiumHeaderText: { flex: 1 },
  premiumEyebrow: { color: '#FFD76B', fontSize: 12, fontWeight: '700', marginBottom: 4 },
  premiumTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  premiumDescription: { color: '#DDD9EF', fontSize: 14, lineHeight: 22, marginBottom: 14 },
  premiumPoints: { marginBottom: 16 },
  premiumPointRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  premiumPointText: { flex: 1, color: '#F6F4FF', fontSize: 14, lineHeight: 21, marginLeft: 8 },
  premiumButton: { borderRadius: 16, overflow: 'hidden' },
  premiumButtonGradient: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  premiumButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  newFortuneButton: {
    backgroundColor: '#8A4FFF',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'center',
  },
  newFortuneButtonText: { color: '#fff', fontSize: 16, fontWeight: '700', marginLeft: 8 },
  homeButton: {
    backgroundColor: '#2A2A3F',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  homeButtonText: { color: '#fff', fontSize: 16, fontWeight: '700', marginLeft: 8 },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 20,
    borderRadius: 16,
  },
  disclaimerText: { fontSize: 14, color: '#999', marginLeft: 8, flex: 1, lineHeight: 20 },
});
