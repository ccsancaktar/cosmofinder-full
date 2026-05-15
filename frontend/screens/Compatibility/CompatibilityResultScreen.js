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

const cleanLine = (line) => line.replace(/\*\*/g, '').replace(/^#+\s*/, '').replace(/^[-•]\s*/, '').trim();
const isSectionHeading = (line) => /^(❤️|🗣️|⚡|🌗|🔮|✨)/.test(cleanLine(line));

const parseContent = (content, fallbackTitle = 'YORUM') => {
  if (!content) return { sections: [], cta: '' };
  const lines = content.split('\n');
  const sections = [];
  let currentSection = null;
  let cta = '';
  lines.forEach((rawLine) => {
    const line = cleanLine(rawLine);
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
            <LazyImage source={require('../../assets/backgrounds/yildizname.jpg')} style={styles.headerBackgroundImage} resizeMode="cover" showPlaceholder={false} fadeInDuration={500} />
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
  headerGradient: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 22, paddingTop: 18 },
  title: { fontSize: 34, fontWeight: '700', color: '#FFFFFF', marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 16, lineHeight: 24, color: 'rgba(255,255,255,0.82)', textAlign: 'center' },
  tierBadge: { flexDirection: 'row', alignItems: 'center', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10, marginTop: 16 },
  tierBadgeText: { color: '#FFFFFF', marginLeft: 8, fontSize: 13, fontWeight: '600' },
  scoreCard: { marginHorizontal: 18, marginBottom: 16, backgroundColor: 'rgba(197,161,0,0.10)', borderRadius: 24, padding: 18, borderWidth: 1, borderColor: 'rgba(197,161,0,0.14)', alignItems: 'center' },
  scoreTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginBottom: 8 },
  scoreValue: { color: '#FFD76B', fontSize: 44, fontWeight: '800', lineHeight: 50 },
  scoreLabel: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  peopleRow: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 18, marginBottom: 16 },
  personCard: { width: '48%', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  personEyebrow: { color: '#C5A100', fontSize: 12, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase' },
  personName: { color: '#FFFFFF', fontSize: 17, fontWeight: '700', marginBottom: 6 },
  personMeta: { color: 'rgba(255,255,255,0.60)', fontSize: 13, marginBottom: 12 },
  personStatRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  personStatLabel: { color: 'rgba(255,255,255,0.62)', fontSize: 13 },
  personStatValue: { color: '#FFFFFF', fontWeight: '700' },
  sectionCard: { marginHorizontal: 18, marginBottom: 14, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 22, padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  sectionIconWrap: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(197,161,0,0.12)' },
  sectionTitleWrap: { flexDirection: 'row', alignItems: 'center', marginLeft: 10, flex: 1 },
  sectionEmoji: { fontSize: 18, marginRight: 8 },
  sectionTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', flex: 1 },
  pointRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  pointDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#C5A100', marginTop: 8, marginRight: 10 },
  pointText: { flex: 1, color: 'rgba(255,255,255,0.78)', fontSize: 14, lineHeight: 23 },
  ctaCard: { marginHorizontal: 18, marginTop: 2, marginBottom: 14, borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center' },
  ctaText: { color: '#FFFFFF', marginLeft: 10, flex: 1, lineHeight: 21 },
  premiumCard: { marginHorizontal: 18, borderRadius: 22, padding: 18 },
  premiumTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', marginBottom: 10 },
  premiumDescription: { color: 'rgba(255,255,255,0.74)', fontSize: 14, lineHeight: 22, marginBottom: 16 },
  premiumButton: { alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14, backgroundColor: '#C5A100' },
  premiumButtonText: { color: '#0D0B1F', fontWeight: '800' },
});
