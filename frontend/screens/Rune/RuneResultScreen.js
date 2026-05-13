import React from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, StatusBar, SafeAreaView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import LazyImage from '../../components/LazyImage';
import { usePremium } from '../../context/PremiumContext';

const RUNE_SYMBOLS = {
  Fehu: 'ᚠ',
  Uruz: 'ᚢ',
  Thurisaz: 'ᚦ',
  Ansuz: 'ᚨ',
  Raidho: 'ᚱ',
  Kenaz: 'ᚲ',
  Gebo: 'ᚷ',
  Wunjo: 'ᚹ',
  Hagalaz: 'ᚺ',
  Nauthiz: 'ᚾ',
  Isa: 'ᛁ',
  Jera: 'ᛃ',
  Eihwaz: 'ᛇ',
  Perthro: 'ᛈ',
  Algiz: 'ᛉ',
  Sowilo: 'ᛊ',
  Tiwaz: 'ᛏ',
  Berkana: 'ᛒ',
  Ehwaz: 'ᛖ',
  Mannaz: 'ᛗ',
  Laguz: 'ᛚ',
  Ingwaz: 'ᛜ',
  Dagaz: 'ᛞ',
  Othala: 'ᛟ',
};

const SECTION_ICONS = {
  'ᚱ': 'albums',
  '⚡': 'flash',
  '⏳': 'hourglass',
  '🛡️': 'shield-checkmark',
  'ᛟ': 'compass',
  '✨': 'sparkles',
};

const RUNE_ALIASES = {
  berkano: 'Berkana',
  othila: 'Othala',
  othilla: 'Othala',
  inguz: 'Ingwaz',
  raido: 'Raidho',
  pertho: 'Perthro',
  sowelo: 'Sowilo',
  sowilu: 'Sowilo',
};

const cleanLine = (line) =>
  line
    .replace(/\*\*/g, '')
    .replace(/^#+\s*/, '')
    .replace(/^[-•]\s*/, '')
    .trim();

const isSectionHeading = (line) => /^(ᚱ|⚡|⏳|🛡️|ᛟ|✨)/.test(cleanLine(line));

const parseRuneContent = (content, fallbackTitle = 'READING') => {
  if (!content) return { sections: [], cta: '' };

  const lines = content.split('\n');
  const sections = [];
  let currentSection = null;
  let cta = '';

  lines.forEach((rawLine) => {
    const line = cleanLine(rawLine);
    if (!line) return;

    if (
      line.startsWith('👉') ||
      /detaylı rune yorumunda/i.test(line) ||
      /detailed rune reading/i.test(line) ||
      /detaillierte runen-deutung/i.test(line)
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
  const match = heading.match(/^(ᚱ|⚡|⏳|🛡️|ᛟ|✨)\s*(.*)$/);
  if (!match) return { emoji: '✨', text: heading };
  return { emoji: match[1], text: match[2] };
};

const getSectionIcon = (heading) => {
  const match = heading.match(/^(ᚱ|⚡|⏳|🛡️|ᛟ|✨)/);
  return match ? SECTION_ICONS[match[1]] : 'document-text';
};

const normalizeRuneName = (name) => {
  if (!name || typeof name !== 'string') return '';
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
};

const toCanonicalRuneName = (name) => {
  const n = normalizeRuneName(name);
  if (!n) return '';
  const directKey = Object.keys(RUNE_SYMBOLS).find((k) => normalizeRuneName(k) === n);
  if (directKey) return directKey;
  if (RUNE_ALIASES[n]) return RUNE_ALIASES[n];
  return name;
};

const buildDisplayRunes = (runesArray, runeData) => {
  const candidates =
    runesArray ||
    (Array.isArray(runeData)
      ? runeData
      : runeData?.selected || runeData?.runes || runeData?.symbols || runeData?.items || []);

  if (!Array.isArray(candidates)) return [];

  return candidates
    .map((item) => {
      if (typeof item === 'string') {
        const canonical = toCanonicalRuneName(item);
        return { name: canonical, symbol: RUNE_SYMBOLS[canonical] || '', reversed: false, meaning: '' };
      }
      const rawName = item.name || item.name_tr || item.title || item.label || item.rune || '';
      const canonical = toCanonicalRuneName(rawName);
      return {
        name: canonical || rawName,
        symbol: item.symbol || item.glyph || (canonical ? RUNE_SYMBOLS[canonical] || '' : ''),
        reversed: !!item.reversed,
        meaning: item.reversed ? item.reversed_meaning || item.meaning : item.meaning,
      };
    })
    .filter((r) => r.name);
};

const summarizeMeaning = (rune) => {
  const base = rune?.meaning || '';
  return String(base).split(',')[0]?.trim() || base;
};

export default function RuneResultScreen({ route, navigation }) {
  const { t, i18n } = useTranslation();
  const { hasPremium } = usePremium();
  const params = route?.params || {};
  const { runes, interpretation, yorum, rune_data, question = '', readingTier = 'free' } = params;
  const locale = i18n.language?.startsWith('de') ? 'de' : i18n.language?.startsWith('en') ? 'en' : 'tr';
  const ui = {
    tr: {
      freeBadge: 'Kısa İşaret',
      premiumBadge: 'Detaylı Rune Mesajı',
      fallbackTitle: 'YORUM',
      questionTitle: 'Sorunun Kader Noktası',
      runesTitle: 'Seçilen Runeler',
      uprightBadge: 'Düz',
      reversedBadge: 'Ters',
      premiumEyebrow: 'Derin Katman Açık Değil',
      premiumTitle: 'Bu yorum kısa rune işaretidir',
      premiumDescription:
        'Premium rune yorumunda runelerin ortak kader yönü, gizli çatışma ve hangi seçimin neyi açacağı çok daha net görünür.',
      premiumPoint1: 'Runeler arası gizli çatışma ve ortak mesaj',
      premiumPoint2: 'Yaklaşan değişimin daha keskin çözümü',
      premiumPoint3: 'Korunma hattı ve kader yönü için daha net uyarılar',
      premiumButton: 'Detaylı Rune Yorumunu Aç',
    },
    en: {
      freeBadge: 'Short Sign',
      premiumBadge: 'Detailed Rune Message',
      fallbackTitle: 'READING',
      questionTitle: 'The Fateful Point of Your Question',
      runesTitle: 'Selected Runes',
      uprightBadge: 'Upright',
      reversedBadge: 'Reversed',
      premiumEyebrow: 'Deep Layer Locked',
      premiumTitle: 'This is the short rune sign',
      premiumDescription:
        'In the premium rune reading, the shared direction of fate, the hidden conflict, and which choice opens which path become much clearer.',
      premiumPoint1: 'Hidden conflict and shared message between the runes',
      premiumPoint2: 'Sharper reading of the approaching change',
      premiumPoint3: 'Clearer warnings for protection and direction',
      premiumButton: 'Unlock Detailed Rune Reading',
    },
    de: {
      freeBadge: 'Kurzes Zeichen',
      premiumBadge: 'Detaillierte Runenbotschaft',
      fallbackTitle: 'DEUTUNG',
      questionTitle: 'Der Schicksalspunkt Deiner Frage',
      runesTitle: 'Gewählte Runen',
      uprightBadge: 'Aufrecht',
      reversedBadge: 'Umgekehrt',
      premiumEyebrow: 'Tiefe Ebene Gesperrt',
      premiumTitle: 'Dies ist das kurze Runenzeichen',
      premiumDescription:
        'In der Premium-Runen-Deutung werden die gemeinsame Schicksalsrichtung, der verborgene Konflikt und die Wirkung möglicher Entscheidungen deutlich klarer.',
      premiumPoint1: 'Verborgener Konflikt und gemeinsame Botschaft der Runen',
      premiumPoint2: 'Schärfere Deutung der nahenden Veränderung',
      premiumPoint3: 'Klarere Warnungen für Schutz und Richtung',
      premiumButton: 'Detaillierte Runen-Deutung Öffnen',
    },
  }[locale];

  const content = interpretation || yorum;
  const { sections, cta } = parseRuneContent(content, ui.fallbackTitle);
  const displayRunes = buildDisplayRunes(runes, rune_data);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0B1F" translucent={false} hidden={false} />

      <LinearGradient colors={['#0D0B1F', '#1B1B2F', '#2A2A3F']} style={styles.gradientBg}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.headerSection}>
            <LazyImage
              source={require('../../assets/backgrounds/rune.jpg')}
              style={styles.headerBackgroundImage}
              resizeMode="cover"
              showPlaceholder={false}
              fadeInDuration={500}
            />
            <LinearGradient colors={['rgba(0,0,0,0.58)', 'rgba(0,0,0,0.92)']} style={styles.headerGradient}>
              <Text style={styles.title}>{t('rune.runeResultTitle')}</Text>
              <Text style={styles.subtitle}>{t('rune.runeResultSubtitle')}</Text>
              <LinearGradient
                colors={readingTier === 'premium' ? ['#C5A100', '#3B7A57'] : ['rgba(255,255,255,0.16)', 'rgba(255,255,255,0.08)']}
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

          {displayRunes.length > 0 && (
            <View style={styles.runesSection}>
              <Text style={styles.runesTitle}>{ui.runesTitle}</Text>
              <View style={styles.runesContainer}>
                {displayRunes.map((rune, index) => (
                  <View
                    key={`${rune.name}-${index}`}
                    style={[styles.runeItem, rune.reversed ? styles.reversedRuneItem : styles.uprightRuneItem]}
                  >
                    <View style={[styles.orientationBadge, rune.reversed ? styles.reversedBadge : styles.uprightBadge]}>
                      <Text style={styles.orientationBadgeText}>{rune.reversed ? ui.reversedBadge : ui.uprightBadge}</Text>
                    </View>
                    <Text style={styles.runeSymbol}>{rune.symbol || RUNE_SYMBOLS[rune.name] || '?'}</Text>
                    <Text style={styles.runeName}>{rune.name}</Text>
                    <Text style={styles.runeMeaning}>{summarizeMeaning(rune)}</Text>
                  </View>
                ))}
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
                    <Text style={styles.sectionEmoji}>{heading.emoji}</Text>
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
            <LinearGradient colors={['rgba(197,161,0,0.20)', 'rgba(59,122,87,0.18)']} style={styles.ctaCard}>
              <Ionicons name="lock-closed" size={18} color="#FFD76B" />
              <Text style={styles.ctaText}>{cta}</Text>
            </LinearGradient>
          )}

          {!hasPremium && readingTier === 'free' && (
            <LinearGradient colors={['rgba(197,161,0,0.18)', 'rgba(59,122,87,0.20)']} style={styles.premiumCard}>
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
                <LinearGradient colors={['#C5A100', '#3B7A57']} style={styles.premiumButtonGradient}>
                  <Ionicons name="sparkles" size={18} color="#FFFFFF" />
                  <Text style={styles.premiumButtonText}>{ui.premiumButton}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={() => navigation.navigate('Rune')} style={styles.newFortuneButton}>
              <Ionicons name="refresh" size={22} color="#FFFFFF" />
              <Text style={styles.newFortuneButtonText}>{t('rune.newFortune')}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Ana Sayfa')} style={styles.homeButton}>
              <Ionicons name="home" size={22} color="#FFFFFF" />
              <Text style={styles.homeButtonText}>{t('rune.homePage')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.disclaimer}>
            <Ionicons name="information-circle" size={16} color="#C5A100" />
            <Text style={styles.disclaimerText}>{t('rune.disclaimerText')}</Text>
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
  runesSection: {
    marginHorizontal: 20,
    marginBottom: 14,
    backgroundColor: 'rgba(27,27,47,0.96)',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  runesTitle: { color: '#E6C57E', fontSize: 17, fontWeight: '700', marginBottom: 14 },
  runesContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  runeItem: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  uprightRuneItem: { borderColor: 'rgba(197,161,0,0.20)' },
  reversedRuneItem: { borderColor: 'rgba(59,122,87,0.82)' },
  orientationBadge: {
    alignSelf: 'stretch',
    marginBottom: 12,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  uprightBadge: {
    backgroundColor: 'rgba(197,161,0,0.18)',
    borderColor: 'rgba(242,209,134,0.35)',
  },
  reversedBadge: {
    backgroundColor: 'rgba(59,122,87,0.20)',
    borderColor: 'rgba(113,184,138,0.38)',
  },
  orientationBadgeText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  runeSymbol: { fontSize: 44, color: '#F2D186', marginBottom: 10 },
  runeName: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', textAlign: 'center', marginBottom: 6 },
  runeMeaning: { color: '#B9B7C8', fontSize: 12, textAlign: 'center', lineHeight: 18 },
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
  sectionEmoji: { fontSize: 16, marginRight: 8 },
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
