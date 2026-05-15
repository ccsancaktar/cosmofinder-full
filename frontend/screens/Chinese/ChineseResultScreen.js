import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import LazyImage from '../../components/LazyImage';
import { usePremium } from '../../context/PremiumContext';

const SECTION_ICONS = {
  '🌿': 'leaf',
  '⚖️': 'git-compare',
  '💼': 'briefcase',
  '❤️': 'heart',
  '📅': 'calendar',
  '💡': 'bulb',
  '🛤️': 'trail-sign',
  '💫': 'sparkles',
};

const TEN_GOD_LABELS = {
  tr: {
    wealth: 'Varlık',
    power: 'Güç',
    resource: 'Kaynak',
    output: 'Üretim',
  },
  en: {
    wealth: 'Wealth',
    power: 'Power',
    resource: 'Resource',
    output: 'Output',
  },
  de: {
    wealth: 'Wohlstand',
    power: 'Macht',
    resource: 'Ressource',
    output: 'Ausdruck',
  },
};

const TIER_BADGE = {
  free: {
    label: 'Kısa Kader Özeti',
    colors: ['rgba(255,255,255,0.16)', 'rgba(255,255,255,0.08)'],
    icon: 'moon',
  },
  premium: {
    label: 'Detaylı Ba Zi Analizi',
    colors: ['#D29A17', '#C65A1E'],
    icon: 'diamond',
  },
};

const ELEMENT_COLORS = {
  Metal: '#D2D8E2',
  Water: '#69A9FF',
  Wood: '#5ABF79',
  Fire: '#FF7B52',
  Earth: '#D4A561',
};

const cleanLine = (line) =>
  line
    .replace(/\*\*/g, '')
    .replace(/^#+\s*/, '')
    .replace(/^[-•]\s*/, '')
    .trim();

const isSectionHeading = (line) => /^(🌿|⚖️|💼|❤️|📅|💡|🛤️|💫)/.test(cleanLine(line));

const parseBaziContent = (content, fallbackTitle = 'ANALYSIS') => {
  if (!content) {
    return { sections: [], cta: '' };
  }

  const lines = content.split('\n');
  const sections = [];
  let currentSection = null;
  let cta = '';

  lines.forEach((rawLine) => {
    const line = cleanLine(rawLine);
    if (!line) return;

    if (
      /detaylı analizde/i.test(line) ||
      /detailed analysis/i.test(line) ||
      /detaillierte analyse/i.test(line)
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
  const match = heading.match(/^(🌿|⚖️|💼|❤️|📅|💡|🛤️|💫)\s*(.*)$/);
  if (!match) return { emoji: '✨', text: heading };
  return { emoji: match[1], text: match[2] };
};

const getSectionIcon = (heading) => {
  const match = heading.match(/^(🌿|⚖️|💼|❤️|📅|💡|🛤️|💫)/);
  return match ? SECTION_ICONS[match[1]] : 'document-text';
};

const formatElements = (elements) => {
  if (!elements || typeof elements !== 'object') return [];
  return Object.entries(elements).map(([element, count]) => ({ element, count }));
};

export default function ChineseResultScreen({ route, navigation }) {
  const { t, i18n } = useTranslation();
  const { hasPremium } = usePremium();
  const params = route?.params || {};
  const { yorum, interpretation, baZi = {}, elements = {}, analysis = {}, readingTier = 'free' } = params;
  const locale = i18n.language?.startsWith('de') ? 'de' : i18n.language?.startsWith('en') ? 'en' : 'tr';
  const ui = {
    tr: {
      summaryTitle: 'Day Master ve Element Yapısı',
      dayMasterHint: 'Ba Zi yorumunun merkezi kişinin gün elementidir.',
      dominant: 'Baskın Element',
      missing: 'Eksik Alan',
      noMissing: 'Belirgin eksik yok',
      elementDistribution: 'Element Dağılımı',
      destinyAxes: 'Kader Eksenleri',
      freeBadge: 'Kısa Kader Özeti',
      premiumBadge: 'Detaylı Ba Zi Analizi',
      premiumEyebrow: 'Derin Katman Kapalı',
      premiumTitle: 'Bu yorum kısa Ba Zi özetidir',
      premiumDescription: 'Premium analizde kader döngülerin, para ve ilişki eksenlerin, güç alanların ve 1-3 yıllık zamanlama etkileri daha net ortaya konur.',
      premiumPoint1: 'Day Master üzerinden daha net kader yapısı',
      premiumPoint2: 'Para, kariyer ve ilişki eksenlerinin güçlü analizi',
      premiumPoint3: '1-3 yıl için fırsat ve risk dönemleri',
      premiumButton: 'Detaylı Ba Zi Analizini Aç',
      analysisFallback: 'ANALİZ',
    },
    en: {
      summaryTitle: 'Day Master and Element Structure',
      dayMasterHint: 'The center of a Ba Zi reading is the person’s day element.',
      dominant: 'Dominant Element',
      missing: 'Missing Area',
      noMissing: 'No obvious missing element',
      elementDistribution: 'Element Distribution',
      destinyAxes: 'Destiny Axes',
      freeBadge: 'Short Destiny Summary',
      premiumBadge: 'Detailed Ba Zi Analysis',
      premiumEyebrow: 'Deep Layer Locked',
      premiumTitle: 'This is the short Ba Zi summary',
      premiumDescription: 'In the premium analysis, your destiny cycles, money and relationship axes, power patterns, and 1-3 year timing effects are explained much more clearly.',
      premiumPoint1: 'Sharper destiny structure through the Day Master',
      premiumPoint2: 'Stronger analysis of money, career, and relationship axes',
      premiumPoint3: 'Opportunity and risk periods for the next 1-3 years',
      premiumButton: 'Unlock Detailed Ba Zi Analysis',
      analysisFallback: 'ANALYSIS',
    },
    de: {
      summaryTitle: 'Day Master und Elementstruktur',
      dayMasterHint: 'Das Zentrum einer Ba Zi-Deutung ist das Tageselement der Person.',
      dominant: 'Dominantes Element',
      missing: 'Fehlender Bereich',
      noMissing: 'Kein klar fehlendes Element',
      elementDistribution: 'Elementverteilung',
      destinyAxes: 'Schicksalsachsen',
      freeBadge: 'Kurze Schicksalsübersicht',
      premiumBadge: 'Detaillierte Ba Zi-Analyse',
      premiumEyebrow: 'Tiefe Ebene Gesperrt',
      premiumTitle: 'Dies ist die kurze Ba Zi-Zusammenfassung',
      premiumDescription: 'In der Premium-Analyse werden deine Schicksalszyklen, Geld- und Beziehungsachsen, Machtmuster und Zeitwirkungen der nächsten 1-3 Jahre deutlich klarer erklärt.',
      premiumPoint1: 'Klarere Schicksalsstruktur über den Day Master',
      premiumPoint2: 'Stärkere Analyse von Geld-, Karriere- und Beziehungslinien',
      premiumPoint3: 'Chancen- und Risikoperioden für die nächsten 1-3 Jahre',
      premiumButton: 'Detaillierte Ba Zi-Analyse Öffnen',
      analysisFallback: 'ANALYSE',
    },
  }[locale];
  const content = yorum || interpretation;
  const { sections, cta } = parseBaziContent(content, ui.analysisFallback);
  const badgeConfig = TIER_BADGE[readingTier] || TIER_BADGE.free;
  const elementItems = formatElements(elements);
  const missingElements = analysis.missing_elements || [];
  const tenGods = analysis.ten_gods || {};
  const localizeElement = (element) => {
    const key = String(element || '').toLowerCase();
    return key ? t(`elements.${key}`) : '-';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0B1F" translucent={false} hidden={false} />

      <LinearGradient colors={['#0D0B1F', '#1B1B2F', '#2A2A3F']} style={styles.gradientBg}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.headerSection}>
            <LazyImage
              source={require('../../assets/backgrounds/ba-zi.jpg')}
              style={styles.headerBackgroundImage}
              resizeMode="cover"
              showPlaceholder={false}
              fadeInDuration={500}
            />
            <LinearGradient colors={['rgba(0,0,0,0.58)', 'rgba(0,0,0,0.92)']} style={styles.headerGradient}>
              <Text style={styles.title}>{t('chinese.chineseResultTitle')}</Text>
              <Text style={styles.subtitle}>{t('chinese.chineseResultSubtitle')}</Text>

              <LinearGradient colors={badgeConfig.colors} style={styles.tierBadge}>
                <Ionicons name={badgeConfig.icon} size={16} color="#FFFFFF" />
                <Text style={styles.tierBadgeText}>{readingTier === 'premium' ? ui.premiumBadge : ui.freeBadge}</Text>
              </LinearGradient>
            </LinearGradient>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>{ui.summaryTitle}</Text>

            <View style={styles.dayMasterCard}>
              <Text style={styles.dayMasterEyebrow}>DAY MASTER</Text>
              <Text style={[styles.dayMasterValue, { color: ELEMENT_COLORS[analysis.day_master] || '#FFFFFF' }]}>
                {localizeElement(analysis.day_master || baZi.day_element)}
              </Text>
              <Text style={styles.dayMasterHint}>{ui.dayMasterHint}</Text>
            </View>

            <View style={styles.quickGrid}>
              <View style={styles.quickItem}>
                <Text style={styles.quickLabel}>{ui.dominant}</Text>
                <Text style={styles.quickValue}>{localizeElement(analysis.dominant_element)}</Text>
              </View>
              <View style={styles.quickItem}>
                <Text style={styles.quickLabel}>{ui.missing}</Text>
                <Text style={styles.quickValue}>
                  {missingElements.length ? missingElements.map(localizeElement).join(', ') : ui.noMissing}
                </Text>
              </View>
            </View>

            {!!analysis.life_phase_hint && (
              <View style={styles.phasePill}>
                <Ionicons name="time" size={15} color="#C5A100" />
                <Text style={styles.phaseText}>{analysis.life_phase_hint}</Text>
              </View>
            )}
          </View>

          <View style={styles.elementCard}>
            <Text style={styles.cardTitle}>{ui.elementDistribution}</Text>
            <View style={styles.elementGrid}>
              {elementItems.map(({ element, count }) => (
                <View key={element} style={styles.elementItem}>
                  <View style={[styles.elementBadge, { backgroundColor: `${ELEMENT_COLORS[element] || '#FFFFFF'}22` }]}>
                    <Text style={[styles.elementBadgeText, { color: ELEMENT_COLORS[element] || '#FFFFFF' }]}>
                      {localizeElement(element)}
                    </Text>
                  </View>
                  <Text style={styles.elementCount}>{count}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.tenGodsCard}>
            <Text style={styles.cardTitle}>{ui.destinyAxes}</Text>
            <View style={styles.tenGodsGrid}>
              <View style={styles.tenGodItem}>
                  <Text style={styles.tenGodLabel}>{TEN_GOD_LABELS[locale].wealth}</Text>
                  <Text style={styles.tenGodValue}>{localizeElement(tenGods.wealth) || '-'}</Text>
                </View>
              <View style={styles.tenGodItem}>
                <Text style={styles.tenGodLabel}>{TEN_GOD_LABELS[locale].power}</Text>
                <Text style={styles.tenGodValue}>{localizeElement(tenGods.power) || '-'}</Text>
              </View>
              <View style={styles.tenGodItem}>
                <Text style={styles.tenGodLabel}>{TEN_GOD_LABELS[locale].resource}</Text>
                <Text style={styles.tenGodValue}>{localizeElement(tenGods.resource) || '-'}</Text>
              </View>
              <View style={styles.tenGodItem}>
                <Text style={styles.tenGodLabel}>{TEN_GOD_LABELS[locale].output}</Text>
                <Text style={styles.tenGodValue}>{localizeElement(tenGods.output) || '-'}</Text>
              </View>
            </View>
          </View>

          {sections.map((section, index) => {
            const heading = splitHeading(section.title);
            return (
              <View key={`${section.title}-${index}`} style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIconWrap}>
                    <Ionicons name={getSectionIcon(section.title)} size={18} color="#D9A34A" />
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

          {!hasPremium && readingTier === 'free' && (
            <LinearGradient colors={['rgba(210,154,23,0.18)', 'rgba(198,90,30,0.20)']} style={styles.premiumCard}>
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
                <LinearGradient colors={['#D29A17', '#C65A1E']} style={styles.premiumButtonGradient}>
                  <Ionicons name="sparkles" size={18} color="#FFFFFF" />
                  <Text style={styles.premiumButtonText}>{ui.premiumButton}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          )}

          {!!cta && readingTier === 'free' && (
            <View style={styles.ctaCard}>
              <Ionicons name="lock-closed" size={18} color="#FFD76B" />
              <Text style={styles.ctaText}>{cta}</Text>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={() => navigation.navigate('Chinese')} style={styles.newFortuneButton}>
              <Ionicons name="refresh" size={22} color="#FFFFFF" />
              <Text style={styles.newFortuneButtonText}>{t('chinese.newFortune')}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Ana Sayfa')} style={styles.homeButton}>
              <Ionicons name="home" size={22} color="#FFFFFF" />
              <Text style={styles.homeButtonText}>{t('chinese.homePage')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.disclaimer}>
            <Ionicons name="information-circle" size={16} color="#C5A100" />
            <Text style={styles.disclaimerText}>{t('chinese.disclaimerText')}</Text>
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
  summaryCard: {
    marginHorizontal: 20,
    marginTop: -24,
    marginBottom: 16,
    backgroundColor: 'rgba(20,18,40,0.96)',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(210,154,23,0.18)',
  },
  summaryTitle: { color: '#F2D186', fontSize: 18, fontWeight: '700', marginBottom: 14 },
  dayMasterCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  dayMasterEyebrow: { color: '#BFA870', fontSize: 12, fontWeight: '700', letterSpacing: 0.5, marginBottom: 6 },
  dayMasterValue: { fontSize: 28, fontWeight: '800', marginBottom: 6 },
  dayMasterHint: { color: '#C9C7D9', fontSize: 13, lineHeight: 20 },
  quickGrid: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  quickItem: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 18,
    padding: 14,
  },
  quickLabel: { color: '#A8A7BF', fontSize: 12, marginBottom: 8 },
  quickValue: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', lineHeight: 20 },
  phasePill: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: 'rgba(210,154,23,0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(210,154,23,0.14)',
  },
  phaseText: { flex: 1, color: '#F2E6B0', fontSize: 13, lineHeight: 20, marginLeft: 8 },
  elementCard: {
    marginHorizontal: 20,
    marginBottom: 14,
    backgroundColor: 'rgba(27,27,47,0.96)',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardTitle: { color: '#E6C57E', fontSize: 17, fontWeight: '700', marginBottom: 14 },
  elementGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  elementItem: {
    width: '47%',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 18,
    padding: 14,
  },
  elementBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, marginBottom: 10 },
  elementBadgeText: { fontSize: 12, fontWeight: '700' },
  elementCount: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  tenGodsCard: {
    marginHorizontal: 20,
    marginBottom: 14,
    backgroundColor: 'rgba(27,27,47,0.96)',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  tenGodsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tenGodItem: {
    width: '47%',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 18,
    padding: 14,
  },
  tenGodLabel: { color: '#A8A7BF', fontSize: 12, marginBottom: 8 },
  tenGodValue: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
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
    backgroundColor: 'rgba(210,154,23,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionTitleWrap: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  sectionEmoji: { fontSize: 16, marginRight: 8 },
  sectionTitle: { flex: 1, color: '#E6C57E', fontSize: 16, fontWeight: '700', lineHeight: 22 },
  pointRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  pointDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#D29A17', marginTop: 8, marginRight: 10 },
  pointText: { flex: 1, color: '#F6F4FF', fontSize: 15, lineHeight: 24 },
  premiumCard: {
    marginHorizontal: 20,
    marginBottom: 18,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(210,154,23,0.20)',
  },
  premiumCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  premiumIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,215,107,0.12)',
    marginRight: 12,
  },
  premiumHeaderText: { flex: 1 },
  premiumEyebrow: {
    color: '#FFD76B',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  premiumTitle: { color: '#FFFFFF', fontSize: 18, lineHeight: 24, fontWeight: '700' },
  premiumDescription: { color: '#E9E7F4', fontSize: 14, lineHeight: 22, marginBottom: 14 },
  premiumPoints: { gap: 10, marginBottom: 16 },
  premiumPointRow: { flexDirection: 'row', alignItems: 'flex-start' },
  premiumPointText: { flex: 1, color: '#F6F4FF', fontSize: 14, lineHeight: 21, marginLeft: 10 },
  premiumButton: { borderRadius: 16, overflow: 'hidden' },
  premiumButtonGradient: {
    minHeight: 52,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', marginLeft: 10 },
  ctaCard: {
    marginHorizontal: 20,
    marginBottom: 18,
    borderRadius: 18,
    padding: 16,
    backgroundColor: 'rgba(210,154,23,0.10)',
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(210,154,23,0.14)',
  },
  ctaText: { flex: 1, color: '#F8E9A6', fontSize: 14, lineHeight: 22, marginLeft: 10, fontWeight: '600' },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 6,
    marginBottom: 24,
  },
  newFortuneButton: {
    backgroundColor: '#C65A1E',
    padding: 16,
    borderRadius: 18,
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    marginRight: 8,
    justifyContent: 'center',
  },
  newFortuneButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', marginLeft: 8 },
  homeButton: {
    backgroundColor: '#2A2A3F',
    padding: 16,
    borderRadius: 18,
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    marginLeft: 8,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  homeButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', marginLeft: 8 },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginHorizontal: 20,
    borderRadius: 16,
  },
  disclaimerText: { fontSize: 13, color: '#9B9AAF', marginLeft: 8, flex: 1, lineHeight: 19 },
});
