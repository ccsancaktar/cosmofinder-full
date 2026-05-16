import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import LazyImage from '../../components/LazyImage';
import { usePremium } from '../../context/PremiumContext';

const SECTION_ICONS = {
  gematria: 'grid',
  sefirot: 'git-network',
  balance: 'scale',
  path: 'trail-sign',
  phase: 'sparkles',
  guidance: 'sparkles',
};

const stripTurkish = (value = '') =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'I');

const HEADING_ALIASES = [
  { key: 'gematria', titles: ['GEMATRIA VE ISIM ENERJISI', 'GEMATRIA AND NAME ENERGY', 'GEMATRIA UND NAMENSENERGIE'] },
  { key: 'sefirot', titles: ['SEFIROT VE RUHSAL ETKILER', 'SEFIROT AND SPIRITUAL INFLUENCES', 'SEFIROT UND SPIRITUELLE EINFLUSSE'] },
  { key: 'balance', titles: ['ICSEL DENGE VE RUHSAL BLOKAJLAR', 'ICSEL DENGE VE RUHSAL IPUCU', 'INNER BALANCE AND SPIRITUAL BLOCKAGES', 'INNER BALANCE AND SPIRITUAL HINT', 'INNERES GLEICHGEWICHT UND SPIRITUELLE BLOCKADEN', 'INNERES GLEICHGEWICHT UND SPIRITUELLER HINWEIS'] },
  { key: 'path', titles: ['RUHSAL YOL VE DONUSUM', 'SPIRITUAL PATH AND TRANSFORMATION', 'SPIRITUELLER WEG UND TRANSFORMATION'] },
  { key: 'phase', titles: ['YAKLASAN RUHSAL DONEM', 'YAKLASAN RUHSAL TEMA', 'THE APPROACHING SPIRITUAL PHASE', 'THE APPROACHING SPIRITUAL THEME', 'DIE NAHER RUCKENDE SPIRITUELLE PHASE', 'DAS NAHER RUCKENDE SPIRITUELLE THEMA'] },
  { key: 'guidance', titles: ['REHBERLIK VE FARKINDALIK', 'KISA REHBERLIK', 'GUIDANCE AND AWARENESS', 'BRIEF GUIDANCE', 'FUHRUNG UND BEWUSSTSEIN', 'KURZE FUHRUNG'] },
];

const cleanLine = (line) =>
  line
    .replace(/\*\*/g, '')
    .replace(/^#+\s*/, '')
    .replace(/^[•·●▪◦]\s*/, '')
    .replace(/^\-\s*/, '')
    .trim();

const normalizeComparable = (line) =>
  stripTurkish(cleanLine(line))
    .replace(/^(🔢|🌳|⚖️|🛤️|🔮|✨)\s*/u, '')
    .replace(/[:.;]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();

const resolveHeadingMeta = (line) => {
  const normalized = normalizeComparable(line);
  return HEADING_ALIASES.find((item) => item.titles.includes(normalized)) || null;
};

const parseKabalaContent = (content, fallbackTitle = 'READING') => {
  if (!content) return { sections: [], cta: '' };

  const lines = content.split('\n');
  const sections = [];
  let currentSection = null;
  let cta = '';

  lines.forEach((rawLine) => {
    const line = cleanLine(rawLine);
    if (!line) return;
    if (/^[-–—_=\s]{2,}$/.test(line)) return;

    if (
      line.startsWith('👉') ||
      /detaylı kabala yorumunda/i.test(line) ||
      /detailed kabala reading/i.test(line) ||
      /detaillierte kabala-deutung/i.test(line)
    ) {
      cta = line.replace(/^👉\s*/, '');
      return;
    }

    const headingMeta = resolveHeadingMeta(line);
    if (headingMeta) {
      if (currentSection) sections.push(currentSection);
      currentSection = { title: line.replace(/[:.;]+$/g, '').trim(), key: headingMeta.key, points: [] };
      return;
    }

    if (!currentSection) currentSection = { title: fallbackTitle, key: 'guidance', points: [] };
    currentSection.points.push(line);
  });

  if (currentSection) sections.push(currentSection);
  return { sections, cta };
};

const getSectionIcon = (sectionKey) => SECTION_ICONS[sectionKey] || 'document-text';

const KabalaResultScreen = () => {
  const { t, i18n } = useTranslation();
  const { hasPremium } = usePremium();
  const navigation = useNavigation();
  const route = useRoute();
  const locale = i18n.language?.startsWith('de') ? 'de' : i18n.language?.startsWith('en') ? 'en' : 'tr';
  const {
    hebrew_name,
    name_value,
    reduced_value,
    selected_sefirot = [],
    yorum,
    original_name,
    readingTier = 'free',
  } = route.params || {};

  const ui = {
    tr: {
      freeBadge: 'Kısa Ruhsal Katman',
      premiumBadge: 'Detaylı Kabala Deşifresi',
      fallbackTitle: 'YORUM',
      numerologyTitle: 'Gematria ve İsim Çekirdeği',
      originalName: 'Asıl İsim',
      nameValue: 'İsim Değeri',
      reducedValue: 'İndirgenmiş Değer',
      sefirotTitle: 'Seçilen Sefirot',
      spiritualPath: 'Ruhsal Yol',
      premiumEyebrow: 'Derin Katman Açık Değil',
      premiumTitle: 'Bu yorum kısa Kabala katmanıdır',
      premiumDescription:
        'Premium Kabala yorumunda ruhsal blokajların kökü, sefirotlar arası etki ve yaklaşan içsel dönem çok daha net biçimde açığa çıkar.',
      premiumPoint1: 'Gematria titreşiminin daha derin çözümü',
      premiumPoint2: 'Sefirotlar arası enerji akışının yorumu',
      premiumPoint3: 'Yaklaşan ruhsal dönemin daha net deşifresi',
      premiumButton: 'Detaylı Kabala Yorumunu Aç',
    },
    en: {
      freeBadge: 'Short Spiritual Layer',
      premiumBadge: 'Detailed Kabala Decoding',
      fallbackTitle: 'READING',
      numerologyTitle: 'Gematria and the Name Core',
      originalName: 'Original Name',
      nameValue: 'Name Value',
      reducedValue: 'Reduced Value',
      sefirotTitle: 'Selected Sefirot',
      spiritualPath: 'Spiritual Path',
      premiumEyebrow: 'Deep Layer Locked',
      premiumTitle: 'This is the short Kabala layer',
      premiumDescription:
        'In the premium Kabala reading, the roots of spiritual blockages, the interplay of the sefirot, and the approaching inner phase become much clearer.',
      premiumPoint1: 'Deeper decoding of the Gematria vibration',
      premiumPoint2: 'Interpretation of the energy flow between the sefirot',
      premiumPoint3: 'Clearer reading of the approaching spiritual phase',
      premiumButton: 'Unlock Detailed Kabala Reading',
    },
    de: {
      freeBadge: 'Kurze Spirituelle Ebene',
      premiumBadge: 'Detaillierte Kabala-Entschlüsselung',
      fallbackTitle: 'DEUTUNG',
      numerologyTitle: 'Gematria und der Namenskern',
      originalName: 'Ursprünglicher Name',
      nameValue: 'Namenswert',
      reducedValue: 'Reduzierter Wert',
      sefirotTitle: 'Gewählte Sefirot',
      spiritualPath: 'Spiritueller Weg',
      premiumEyebrow: 'Tiefe Ebene Gesperrt',
      premiumTitle: 'Dies ist die kurze Kabala-Ebene',
      premiumDescription:
        'In der Premium-Kabala-Deutung werden die Wurzeln spiritueller Blockaden, das Zusammenspiel der Sefirot und die nähere innere Phase deutlich klarer sichtbar.',
      premiumPoint1: 'Tiefere Entschlüsselung der Gematria-Schwingung',
      premiumPoint2: 'Deutung des Energieflusses zwischen den Sefirot',
      premiumPoint3: 'Klarere Lesung der nahenden spirituellen Phase',
      premiumButton: 'Detaillierte Kabala-Deutung Öffnen',
    },
  }[locale];

  const { sections, cta } = parseKabalaContent(yorum, ui.fallbackTitle);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0B1F" translucent={false} hidden={false} />

      <LinearGradient colors={['#0D0B1F', '#1B1B2F', '#2A2A3F']} style={styles.gradientBg}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.headerSection}>
            <LazyImage
              source={require('../../assets/backgrounds/kabala.jpg')}
              style={styles.headerBackgroundImage}
              resizeMode="cover"
              showPlaceholder={false}
              fadeInDuration={500}
            />
            <LinearGradient colors={['rgba(0,0,0,0.58)', 'rgba(0,0,0,0.92)']} style={styles.headerGradient}>
              <Text style={styles.title}>{t('kabala.kabalaFortune')}</Text>
              <Text style={styles.subtitle}>{t('kabala.kabalaSubtitle')}</Text>
              <LinearGradient
                colors={readingTier === 'premium' ? ['#C5A100', '#4A4A8A'] : ['rgba(255,255,255,0.16)', 'rgba(255,255,255,0.08)']}
                style={styles.tierBadge}
              >
                <Ionicons name={readingTier === 'premium' ? 'diamond' : 'moon'} size={16} color="#FFFFFF" />
                <Text style={styles.tierBadgeText}>{readingTier === 'premium' ? ui.premiumBadge : ui.freeBadge}</Text>
              </LinearGradient>
            </LinearGradient>
          </View>

          <View style={styles.numerologyCard}>
            <Text style={styles.cardTitle}>{ui.numerologyTitle}</Text>
            <View style={styles.nameSection}>
              <Text style={styles.originalNameLabel}>{ui.originalName}</Text>
              <Text style={styles.originalName}>{original_name || t('kabala.name')}</Text>
              <Text style={styles.nameArrow}>↓</Text>
              <Text style={styles.hebrewName} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5}>
                {hebrew_name}
              </Text>
            </View>
            <View style={styles.valueGrid}>
              <View style={styles.valueItem}>
                <Text style={styles.valueLabel}>{ui.nameValue}</Text>
                <Text style={styles.valueText}>{name_value}</Text>
              </View>
              <View style={styles.valueItem}>
                <Text style={styles.valueLabel}>{ui.reducedValue}</Text>
                <Text style={styles.valueText}>{reduced_value}</Text>
              </View>
            </View>
          </View>

          <View style={styles.sefirotCard}>
            <Text style={styles.cardTitle}>{ui.sefirotTitle}</Text>
            {selected_sefirot.map((sefirah, index) => (
              <View key={`${sefirah.key || sefirah.name}-${index}`} style={styles.sefirahItem}>
                <View style={styles.sefirahHeader}>
                  <Text style={styles.hebrewLetter}>{sefirah.hebrew}</Text>
                  <Text style={styles.sefirahName}>{sefirah.name}</Text>
                </View>
                <Text style={styles.sefirahMeaning}>{sefirah.meaning}</Text>
              </View>
            ))}
          </View>

          {sections.map((section, index) => {
            return (
              <View key={`${section.title}-${index}`} style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIconWrap}>
                    <Ionicons name={getSectionIcon(section.key)} size={18} color="#C5A100" />
                  </View>
                  <View style={styles.sectionTitleWrap}>
                    <Text style={styles.sectionTitle}>{section.title}</Text>
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
            <LinearGradient colors={['rgba(197,161,0,0.20)', 'rgba(74,74,138,0.18)']} style={styles.ctaCard}>
              <Ionicons name="lock-closed" size={18} color="#FFD76B" />
              <Text style={styles.ctaText}>{cta}</Text>
            </LinearGradient>
          )}

          {!hasPremium && readingTier === 'free' && (
            <LinearGradient colors={['rgba(197,161,0,0.18)', 'rgba(74,74,138,0.20)']} style={styles.premiumCard}>
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
                <LinearGradient colors={['#C5A100', '#4A4A8A']} style={styles.premiumButtonGradient}>
                  <Ionicons name="sparkles" size={18} color="#FFFFFF" />
                  <Text style={styles.premiumButtonText}>{ui.premiumButton}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          )}

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Kabala')}>
              <Ionicons name="refresh" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>{t('common.new')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Ana Sayfa')}>
              <Ionicons name="home" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>{t('navigation.home')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.disclaimer}>
            <Ionicons name="information-circle" size={16} color="#C5A100" />
            <Text style={styles.disclaimerText}>{t('kabala.disclaimer')}</Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

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
  numerologyCard: {
    marginHorizontal: 20,
    marginTop: -24,
    marginBottom: 14,
    backgroundColor: 'rgba(20,18,40,0.96)',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(197,161,0,0.18)',
  },
  cardTitle: { color: '#F2D186', fontSize: 17, fontWeight: '700', marginBottom: 14 },
  nameSection: { alignItems: 'center', marginBottom: 14 },
  originalNameLabel: { color: '#BFA870', fontSize: 12, fontWeight: '700', marginBottom: 4, textTransform: 'uppercase' },
  originalName: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 8, textAlign: 'center' },
  nameArrow: { fontSize: 24, color: '#C5A100', marginBottom: 8 },
  hebrewName: {
    fontSize: 44,
    fontWeight: '700',
    color: '#C5A100',
    textAlign: 'center',
    textShadowColor: '#0D0B1F',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  valueGrid: { flexDirection: 'row', gap: 12 },
  valueItem: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 18,
    padding: 14,
  },
  valueLabel: { color: '#A8A7BF', fontSize: 12, marginBottom: 8 },
  valueText: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  sefirotCard: {
    marginHorizontal: 20,
    marginBottom: 14,
    backgroundColor: 'rgba(27,27,47,0.96)',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  sefirahItem: {
    marginBottom: 12,
    padding: 14,
    backgroundColor: 'rgba(197,161,0,0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(197,161,0,0.12)',
  },
  sefirahHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  hebrewLetter: { fontSize: 26, color: '#C5A100', marginRight: 10, width: 28, textAlign: 'center' },
  sefirahName: { flex: 1, fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  sefirahMeaning: { fontSize: 14, color: '#DDD9EF', lineHeight: 21 },
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
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  actionButton: {
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
  actionButtonText: { color: '#fff', fontSize: 16, fontWeight: '700', marginLeft: 8 },
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

export default KabalaResultScreen;
