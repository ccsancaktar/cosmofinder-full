import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { usePremium } from '../../context/PremiumContext';
import LazyImage from '../../components/LazyImage';

const SECTION_ICONS = {
  '❤️': 'heart',
  '🗣️': 'chatbubble-ellipses',
  '⚡': 'flash',
  '🌗': 'moon',
  '🔮': 'sparkles',
  '✨': 'sparkles',
};

const HEADING_ALIASES = [
  { emoji: '❤️', patterns: [/^emotional compatibility$/i, /^emotionale kompatibilität$/i, /^duygusal uyum$/i] },
  { emoji: '🗣️', patterns: [/^communication flow$/i, /^kommunikationsfluss$/i, /^iletişim akışı$/i] },
  { emoji: '⚡', patterns: [/^attraction and energy$/i, /^anziehung und energie$/i, /^çekim ve enerji$/i] },
  { emoji: '🌗', patterns: [/^challenging areas$/i, /^herausfordernde bereiche$/i, /^zorlayıcı alanlar$/i] },
  { emoji: '🔮', patterns: [/^relationship guidance$/i, /^beziehungsorientierung$/i, /^ilişki rehberliği$/i] },
];

const cleanLine = (line) => line.replace(/\*\*/g, '').replace(/^#+\s*/, '').replace(/^[-•]\s*/, '').trim();
const normalizeHeading = (line) => {
  const cleaned = cleanLine(line);
  if (/^(❤️|🗣️|⚡|🌗|🔮|✨)/.test(cleaned)) return cleaned;
  const match = HEADING_ALIASES.find((item) => item.patterns.some((pattern) => pattern.test(cleaned)));
  return match ? `${match.emoji} ${cleaned}` : cleaned;
};
const isSectionHeading = (line) => /^(❤️|🗣️|⚡|🌗|🔮|✨)/.test(normalizeHeading(line));

const parseContent = (content, fallbackTitle = 'YORUM') => {
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
    if (!currentSection) currentSection = { title: `✨ ${fallbackTitle}`, points: [] };
    currentSection.points.push(line);
  });
  if (currentSection) sections.push(currentSection);
  return { sections, cta };
};

const splitHeading = (heading) => {
  const match = heading.match(/^(❤️|🗣️|⚡|🌗|🔮|✨)\s*(.*)$/);
  if (!match) return { emoji: '✨', text: heading };
  return { emoji: match[1], text: match[2] };
};

export default function CompatibilityResultScreen({ route, navigation }) {
  const { t, i18n } = useTranslation();
  const { hasPremium } = usePremium();
  const locale = i18n.language?.startsWith('de') ? 'de' : i18n.language?.startsWith('en') ? 'en' : 'tr';
  const { yorum, analysis = {}, pair = {}, readingTier = 'free' } = route.params || {};
  const ui = {
    tr: {
      freeBadge: 'Kısa Bağ Okuması',
      premiumBadge: 'Detaylı Uyum Analizi',
      fallbackTitle: 'YORUM',
      scoreTitle: 'Uyum Skoru',
      firstPerson: '1. Kişi',
      secondPerson: '2. Kişi',
      lifePath: 'Yaşam Yolu',
      destiny: 'Kader',
      premiumTitle: 'Bu yorum kısa uyum katmanıdır',
      premiumDescription: 'Premium sürümde bağın gizli düğümleri, ilişki ritmi ve yaklaşan sınavları daha net görünür.',
      premiumButton: 'Detaylı Uyum Analizini Aç',
      disclaimer: 'Bu yorum eğlence amaçlıdır ve gerçek hayat kararlarınızı etkilememelidir.',
    },
    en: {
      freeBadge: 'Short Bond Reading',
      premiumBadge: 'Detailed Compatibility Reading',
      fallbackTitle: 'READING',
      scoreTitle: 'Compatibility Score',
      firstPerson: 'Person 1',
      secondPerson: 'Person 2',
      lifePath: 'Life Path',
      destiny: 'Destiny',
      premiumTitle: 'This is the short compatibility layer',
      premiumDescription: 'The premium version reveals hidden knots, rhythm, and upcoming relationship tests more clearly.',
      premiumButton: 'Unlock Detailed Compatibility Reading',
      disclaimer: 'This reading is for entertainment purposes and should not direct major life decisions.',
    },
    de: {
      freeBadge: 'Kurze Bindungslesung',
      premiumBadge: 'Detaillierte Kompatibilitäts-Deutung',
      fallbackTitle: 'DEUTUNG',
      scoreTitle: 'Kompatibilitätswert',
      firstPerson: 'Person 1',
      secondPerson: 'Person 2',
      lifePath: 'Lebensweg',
      destiny: 'Schicksal',
      premiumTitle: 'Dies ist die kurze Kompatibilitäts-Ebene',
      premiumDescription: 'Die Premium-Version zeigt verborgene Knoten, Rhythmus und kommende Beziehungstests deutlich klarer.',
      premiumButton: 'Detaillierte Kompatibilität Öffnen',
      disclaimer: 'Diese Deutung dient nur der Unterhaltung und sollte keine wichtigen Lebensentscheidungen bestimmen.',
    },
  }[locale];

  const { sections, cta } = parseContent(yorum, ui.fallbackTitle);
  const people = [
    { label: ui.firstPerson, name: pair.kisi1Isim, birthDate: pair.kisi1DogumTarihi, lifePath: analysis.person1_life_path, destiny: analysis.person1_destiny },
    { label: ui.secondPerson, name: pair.kisi2Isim, birthDate: pair.kisi2DogumTarihi, lifePath: analysis.person2_life_path, destiny: analysis.person2_destiny },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0B1F" translucent={false} />
      <LinearGradient colors={['#0D0B1F', '#1B1B2F', '#2A2A3F']} style={styles.gradientBg}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.headerSection}>
            <LazyImage source={require('../../assets/backgrounds/uyum.jpg')} style={styles.headerBackgroundImage} resizeMode="cover" showPlaceholder={false} fadeInDuration={500} />
            <LinearGradient colors={['rgba(0,0,0,0.58)', 'rgba(0,0,0,0.92)']} style={styles.headerGradient}>
              <Text style={styles.title}>{t('compatibility.title')}</Text>
              <Text style={styles.subtitle}>{t('compatibility.subtitle')}</Text>
              <LinearGradient colors={readingTier === 'premium' ? ['#C5A100', '#4A4A8A'] : ['rgba(255,255,255,0.14)', 'rgba(255,255,255,0.08)']} style={styles.tierBadge}>
                <Ionicons name={readingTier === 'premium' ? 'diamond' : 'moon'} size={16} color="#FFFFFF" />
                <Text style={styles.tierBadgeText}>{readingTier === 'premium' ? ui.premiumBadge : ui.freeBadge}</Text>
              </LinearGradient>
            </LinearGradient>
          </View>

          <View style={styles.scoreCard}>
            <Text style={styles.scoreTitle}>{ui.scoreTitle}</Text>
            <Text style={styles.scoreValue}>{analysis.score || '-'}</Text>
            <Text style={styles.scoreLabel}>{analysis.score_label || ''}</Text>
          </View>

          <View style={styles.peopleRow}>
            {people.map((person) => (
              <View key={person.label} style={styles.personCard}>
                <Text style={styles.personEyebrow}>{person.label}</Text>
                <Text style={styles.personName}>{person.name}</Text>
                <Text style={styles.personMeta}>{person.birthDate}</Text>
                <View style={styles.personStatRow}>
                  <Text style={styles.personStatLabel}>{ui.lifePath}</Text>
                  <Text style={styles.personStatValue}>{person.lifePath}</Text>
                </View>
                <View style={styles.personStatRow}>
                  <Text style={styles.personStatLabel}>{ui.destiny}</Text>
                  <Text style={styles.personStatValue}>{person.destiny}</Text>
                </View>
              </View>
            ))}
          </View>

          {sections.map((section, index) => {
            const heading = splitHeading(section.title);
            const icon = SECTION_ICONS[heading.emoji] || 'sparkles';
            return (
              <View key={`${section.title}-${index}`} style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIconWrap}>
                    <Ionicons name={icon} size={18} color="#C5A100" />
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
            <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('Compatibility')}>
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
  container: { flex: 1, backgroundColor: '#0D0B1F' },
  gradientBg: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  headerSection: { height: 210, position: 'relative', marginBottom: 18 },
  headerBackgroundImage: { position: 'absolute', width: '100%', height: '100%' },
  headerGradient: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingTop: 18 },
  title: { fontSize: 34, fontWeight: '700', color: '#FFFFFF', marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 16, lineHeight: 24, color: 'rgba(255,255,255,0.82)', textAlign: 'center' },
  tierBadge: { flexDirection: 'row', alignItems: 'center', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10, marginTop: 16 },
  tierBadgeText: { color: '#FFFFFF', marginLeft: 8, fontSize: 13, fontWeight: '600' },
  scoreCard: { marginHorizontal: 20, marginBottom: 16, backgroundColor: 'rgba(197,161,0,0.10)', borderRadius: 24, padding: 18, borderWidth: 1, borderColor: 'rgba(197,161,0,0.14)', alignItems: 'center' },
  scoreTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginBottom: 8 },
  scoreValue: { color: '#FFD76B', fontSize: 44, fontWeight: '800', lineHeight: 50 },
  scoreLabel: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  peopleRow: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 20, marginBottom: 16 },
  personCard: { width: '47.5%', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  personEyebrow: { color: '#C5A100', fontSize: 12, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase' },
  personName: { color: '#FFFFFF', fontSize: 17, fontWeight: '700', marginBottom: 6 },
  personMeta: { color: 'rgba(255,255,255,0.60)', fontSize: 13, marginBottom: 12 },
  personStatRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  personStatLabel: { color: 'rgba(255,255,255,0.62)', fontSize: 13 },
  personStatValue: { color: '#FFFFFF', fontWeight: '700' },
  sectionCard: { marginHorizontal: 20, marginBottom: 14, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 22, padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  sectionIconWrap: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(197,161,0,0.12)' },
  sectionTitleWrap: { flexDirection: 'row', alignItems: 'center', marginLeft: 10, flex: 1 },
  sectionTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', flex: 1 },
  pointRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  pointDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#C5A100', marginTop: 8, marginRight: 10 },
  pointText: { flex: 1, color: 'rgba(255,255,255,0.78)', fontSize: 14, lineHeight: 23 },
  ctaCard: { marginHorizontal: 20, marginTop: 2, marginBottom: 14, borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center' },
  ctaText: { color: '#FFFFFF', marginLeft: 10, flex: 1, lineHeight: 21 },
  premiumCard: { marginHorizontal: 20, borderRadius: 22, padding: 18 },
  premiumTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', marginBottom: 10 },
  premiumDescription: { color: 'rgba(255,255,255,0.74)', fontSize: 14, lineHeight: 22, marginBottom: 16 },
  premiumButton: { alignSelf: 'stretch', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 14, backgroundColor: '#C5A100', alignItems: 'center', justifyContent: 'center' },
  premiumButtonText: { color: '#0D0B1F', fontWeight: '800' },
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
