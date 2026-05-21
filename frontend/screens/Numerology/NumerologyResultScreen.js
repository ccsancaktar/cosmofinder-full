import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { usePremium } from '../../context/PremiumContext';
import LazyImage from '../../components/LazyImage';

const SECTION_ICONS = {
  '🔢': 'grid',
  '🌙': 'moon',
  '✨': 'sparkles',
  '💼': 'briefcase',
  '❤️': 'heart',
  '🔮': 'planet',
};

const HEADING_ALIASES = [
  { emoji: '🔢', patterns: [/^life path number$/i, /^lebenswegzahl$/i, /^yaşam yolu sayısı$/i] },
  { emoji: '🌙', patterns: [/^soul urge$/i, /^seelenimpuls$/i, /^ruh arzusu$/i] },
  { emoji: '✨', patterns: [/^character and talents$/i, /^charakter und talente$/i, /^karakter ve yetenekler$/i] },
  { emoji: '💼', patterns: [/^career flow$/i, /^beruflicher fluss$/i, /^kariyer akışı$/i] },
  { emoji: '❤️', patterns: [/^relationship energy$/i, /^beziehungsenergie$/i, /^ilişki enerjisi$/i] },
  { emoji: '🔮', patterns: [/^this period'?s message$/i, /^botschaft dieser phase$/i, /^bu dönemin mesajı$/i] },
];

const cleanLine = (line) =>
  line
    .replace(/\*\*/g, '')
    .replace(/^#+\s*/, '')
    .replace(/^[-•]\s*/, '')
    .trim();

const normalizeHeading = (line) => {
  const cleaned = cleanLine(line);
  if (/^(🔢|🌙|✨|💼|❤️|🔮)/.test(cleaned)) return cleaned;
  const match = HEADING_ALIASES.find((item) => item.patterns.some((pattern) => pattern.test(cleaned)));
  return match ? `${match.emoji} ${cleaned}` : cleaned;
};

const isSectionHeading = (line) => /^(🔢|🌙|✨|💼|❤️|🔮)/.test(normalizeHeading(line));

const parseNumerologyContent = (content, fallbackTitle = 'YORUM') => {
  if (!content) return { sections: [], cta: '' };
  const lines = content.split('\n');
  const sections = [];
  let currentSection = null;
  let cta = '';

  lines.forEach((rawLine) => {
    const line = normalizeHeading(rawLine);
    if (!line) return;

    if (line.startsWith('👉')) {
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
  const match = heading.match(/^(🔢|🌙|✨|💼|❤️|🔮)\s*(.*)$/);
  if (!match) return { emoji: '✨', text: heading };
  return { emoji: match[1], text: match[2] };
};

export default function NumerologyResultScreen({ route, navigation }) {
  const { t, i18n } = useTranslation();
  const { hasPremium } = usePremium();
  const locale = i18n.language?.startsWith('de') ? 'de' : i18n.language?.startsWith('en') ? 'en' : 'tr';
  const { yorum, analysis = {}, original_name, birth_date, readingTier = 'free' } = route.params || {};
  const ui = {
    tr: {
      freeBadge: 'Kısa Sayı Katmanı',
      premiumBadge: 'Detaylı Numeroloji Yorumu',
      fallbackTitle: 'YORUM',
      numbersTitle: 'Çekirdek Sayıların',
      nameLabel: 'İsim',
      birthDateLabel: 'Doğum Tarihi',
      lifePath: 'Yaşam Yolu',
      destiny: 'Kader',
      soul: 'Ruh Arzusu',
      personality: 'Kişilik',
      premiumTitle: 'Bu yorum kısa numeroloji katmanıdır',
      premiumDescription:
        'Premium sürümde sayıların tekrar eden temaları, içsel döngülerin ve ilişki enerjinin daha derin katmanları çok daha net açılır.',
      premiumButton: 'Detaylı Numeroloji Yorumunu Aç',
      disclaimer: 'Bu yorum eğlence amaçlıdır ve gerçek hayat kararlarınızı etkilememelidir.',
    },
    en: {
      freeBadge: 'Short Number Layer',
      premiumBadge: 'Detailed Numerology Reading',
      fallbackTitle: 'READING',
      numbersTitle: 'Your Core Numbers',
      nameLabel: 'Name',
      birthDateLabel: 'Birth Date',
      lifePath: 'Life Path',
      destiny: 'Destiny',
      soul: 'Soul Urge',
      personality: 'Personality',
      premiumTitle: 'This is the short numerology layer',
      premiumDescription:
        'In the premium version, recurring number themes, inner cycles, and relationship energy open up in much more detail.',
      premiumButton: 'Unlock Detailed Numerology Reading',
      disclaimer: 'This reading is for entertainment purposes and should not direct major life decisions.',
    },
    de: {
      freeBadge: 'Kurze Zahlenebene',
      premiumBadge: 'Detaillierte Numerologie-Deutung',
      fallbackTitle: 'DEUTUNG',
      numbersTitle: 'Deine Kernzahlen',
      nameLabel: 'Name',
      birthDateLabel: 'Geburtsdatum',
      lifePath: 'Lebensweg',
      destiny: 'Schicksal',
      soul: 'Seelenimpuls',
      personality: 'Persönlichkeit',
      premiumTitle: 'Dies ist die kurze Numerologie-Ebene',
      premiumDescription:
        'In der Premium-Version werden wiederkehrende Zahlenthemen, innere Zyklen und Beziehungsenergie deutlich tiefer sichtbar.',
      premiumButton: 'Detaillierte Numerologie-Deutung Öffnen',
      disclaimer: 'Diese Deutung dient nur der Unterhaltung und sollte keine wichtigen Lebensentscheidungen bestimmen.',
    },
  }[locale];

  const { sections, cta } = parseNumerologyContent(yorum, ui.fallbackTitle);

  const numberTiles = [
    { label: ui.lifePath, value: analysis.life_path },
    { label: ui.destiny, value: analysis.destiny_number },
    { label: ui.soul, value: analysis.soul_urge },
    { label: ui.personality, value: analysis.personality_number },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0B1F" translucent={false} />

      <LinearGradient colors={['#0D0B1F', '#1B1B2F', '#2A2A3F']} style={styles.gradientBg}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.headerSection}>
            <LazyImage
              source={require('../../assets/backgrounds/kabala.jpg')}
              style={styles.headerBackgroundImage}
              resizeMode="cover"
              showPlaceholder={false}
              fadeInDuration={500}
            />
            <LinearGradient colors={['rgba(0,0,0,0.58)', 'rgba(0,0,0,0.92)']} style={styles.headerGradient}>
              <Text style={styles.title}>{t('numerology.title')}</Text>
              <Text style={styles.subtitle}>{t('numerology.subtitle')}</Text>
              <LinearGradient
                colors={readingTier === 'premium' ? ['#C5A100', '#4A4A8A'] : ['rgba(255,255,255,0.14)', 'rgba(255,255,255,0.08)']}
                style={styles.tierBadge}
              >
                <Ionicons name={readingTier === 'premium' ? 'diamond' : 'moon'} size={16} color="#FFFFFF" />
                <Text style={styles.tierBadgeText}>{readingTier === 'premium' ? ui.premiumBadge : ui.freeBadge}</Text>
              </LinearGradient>
            </LinearGradient>
          </View>

          <View style={styles.identityCard}>
            <Text style={styles.cardTitle}>{ui.numbersTitle}</Text>
            <Text style={styles.identityLine}>
              <Text style={styles.identityLabel}>{ui.nameLabel}: </Text>
              <Text style={styles.identityValue}>{original_name}</Text>
            </Text>
            <Text style={styles.identityLine}>
              <Text style={styles.identityLabel}>{ui.birthDateLabel}: </Text>
              <Text style={styles.identityValue}>{birth_date}</Text>
            </Text>

            <View style={styles.numberGrid}>
              {numberTiles.map((item) => (
                <View key={item.label} style={styles.numberTile}>
                  <Text style={styles.numberValue}>{item.value || '-'}</Text>
                  <Text style={styles.numberLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {sections.map((section, index) => {
            const heading = splitHeading(section.title);
            const iconName = SECTION_ICONS[heading.emoji] || 'sparkles';
            return (
              <View key={`${section.title}-${index}`} style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIconWrap}>
                    <Ionicons name={iconName} size={18} color="#C5A100" />
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

          {!!cta && readingTier === 'free' ? (
            <LinearGradient colors={['rgba(197,161,0,0.18)', 'rgba(74,74,138,0.18)']} style={styles.ctaCard}>
              <Ionicons name="lock-closed" size={18} color="#FFD76B" />
              <Text style={styles.ctaText}>{cta}</Text>
            </LinearGradient>
          ) : null}

          {!hasPremium && readingTier === 'free' ? (
            <LinearGradient colors={['rgba(197,161,0,0.18)', 'rgba(74,74,138,0.18)']} style={styles.premiumCard}>
              <Text style={styles.premiumTitle}>{ui.premiumTitle}</Text>
              <Text style={styles.premiumDescription}>{ui.premiumDescription}</Text>
              <TouchableOpacity style={styles.premiumButton} onPress={() => navigation.navigate('Premium')}>
                <Text style={styles.premiumButtonText}>{ui.premiumButton}</Text>
              </TouchableOpacity>
            </LinearGradient>
          ) : null}

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('Numerology')}>
              <Ionicons name="refresh" size={18} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>{t('common.newFortuneAction')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('Ana Sayfa')}>
              <Ionicons name="home" size={18} color="#FFFFFF" />
              <Text style={styles.secondaryButtonText}>{t('common.homeAction')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.disclaimerCard}>
            <Ionicons name="information-circle" size={18} color="#C5A100" />
            <Text style={styles.disclaimerText}>{ui.disclaimer}</Text>
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
  scrollContent: {
    paddingBottom: 32,
  },
  headerSection: {
    height: 210,
    position: 'relative',
    marginBottom: 18,
  },
  headerBackgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  headerGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 18,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(255,255,255,0.82)',
    textAlign: 'center',
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 16,
  },
  tierBadgeText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontSize: 13,
    fontWeight: '600',
  },
  identityCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  identityLine: {
    marginBottom: 6,
  },
  identityLabel: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: 14,
  },
  identityValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  numberGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 14,
    justifyContent: 'space-between',
  },
  numberTile: {
    width: '47.5%',
    backgroundColor: 'rgba(197,161,0,0.10)',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(197,161,0,0.14)',
    marginBottom: 10,
  },
  numberValue: {
    color: '#FFD76B',
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 6,
  },
  numberLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 18,
  },
  sectionCard: {
    marginHorizontal: 20,
    marginBottom: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(197,161,0,0.12)',
  },
  sectionTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    flex: 1,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  pointDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#C5A100',
    marginTop: 8,
    marginRight: 10,
  },
  pointText: {
    flex: 1,
    color: 'rgba(255,255,255,0.78)',
    fontSize: 14,
    lineHeight: 23,
  },
  ctaCard: {
    marginHorizontal: 20,
    marginTop: 2,
    marginBottom: 14,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ctaText: {
    color: '#FFFFFF',
    marginLeft: 10,
    flex: 1,
    lineHeight: 21,
  },
  premiumCard: {
    marginHorizontal: 20,
    borderRadius: 22,
    padding: 18,
  },
  premiumTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  premiumDescription: {
    color: 'rgba(255,255,255,0.74)',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
  },
  premiumButton: {
    alignSelf: 'stretch',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#C5A100',
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumButtonText: {
    color: '#0D0B1F',
    fontWeight: '800',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 20,
    marginTop: 22,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 18,
    backgroundColor: '#8A4FFF',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
  disclaimerCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: 20,
    marginTop: 18,
    padding: 16,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  disclaimerText: {
    flex: 1,
    marginLeft: 10,
    color: 'rgba(255,255,255,0.64)',
    fontSize: 13,
    lineHeight: 20,
  },
});
