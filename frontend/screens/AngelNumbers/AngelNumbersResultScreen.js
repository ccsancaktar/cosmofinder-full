import React from 'react';
import { ScrollView, Share, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import LazyImage from '../../components/LazyImage';

const SECTION_ICONS = {
  '👼': 'sparkles',
  '⚡': 'flash',
  '🔮': 'planet',
  '✨': 'sparkles',
};

const HEADING_ALIASES = [
  { emoji: '👼', patterns: [/^message of the number$/i, /^botschaft der zahl$/i, /^sayının mesajı$/i] },
  { emoji: '⚡', patterns: [/^current energy$/i, /^aktuelle energie$/i, /^şu anki enerji$/i] },
  { emoji: '🔮', patterns: [/^near effect$/i, /^nahe wirkung$/i, /^yakın etki$/i] },
  { emoji: '✨', patterns: [/^guidance$/i, /^orientierung$/i, /^tavsiye$/i] },
];

const cleanLine = (line) => line.replace(/\*\*/g, '').replace(/^#+\s*/, '').replace(/^[-•]\s*/, '').trim();
const normalizeHeading = (line) => {
  const cleaned = cleanLine(line);
  if (/^(👼|⚡|🔮|✨)/.test(cleaned)) return cleaned;
  const match = HEADING_ALIASES.find((item) => item.patterns.some((pattern) => pattern.test(cleaned)));
  return match ? `${match.emoji} ${cleaned}` : cleaned;
};
const isSectionHeading = (line) => /^(👼|⚡|🔮|✨)/.test(normalizeHeading(line));

const parseContent = (content, fallbackTitle = 'YORUM') => {
  if (!content) return [];
  const sections = [];
  let currentSection = null;
  content.split('\n').forEach((rawLine) => {
    const line = normalizeHeading(rawLine);
    if (!line) return;
    if (isSectionHeading(line)) {
      if (currentSection) sections.push(currentSection);
      currentSection = { title: line, points: [] };
      return;
    }
    if (!currentSection) currentSection = { title: `👼 ${fallbackTitle}`, points: [] };
    currentSection.points.push(line);
  });
  if (currentSection) sections.push(currentSection);
  return sections;
};

const splitHeading = (heading) => {
  const match = heading.match(/^(👼|⚡|🔮|✨)\s*(.*)$/);
  if (!match) return { emoji: '👼', text: heading };
  return { emoji: match[1], text: match[2] };
};

export default function AngelNumbersResultScreen({ route, navigation }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language?.startsWith('de') ? 'de' : i18n.language?.startsWith('en') ? 'en' : 'tr';
  const { sayi, yorum, analysis = {} } = route.params || {};
  const rawDigitSum = String(sayi || '')
    .split('')
    .filter((char) => /\d/.test(char))
    .reduce((total, char) => total + Number(char), 0);
  const ui = {
    tr: {
      subtitle: 'Tekrarlayan sayıların bugünkü mesajı',
      todaysSignal: 'Bugünün İşareti',
      digitSum: 'Rakamların Toplamı',
      reducedNumber: 'İndirgenmiş Sayı',
      shareTitle: 'Melek Sayım',
      fallbackTitle: 'YORUM',
    },
    en: {
      subtitle: 'Today’s message from repeating numbers',
      todaysSignal: 'Today’s Sign',
      digitSum: 'Sum of the Digits',
      reducedNumber: 'Reduced Number',
      shareTitle: 'My Angel Number',
      fallbackTitle: 'READING',
    },
    de: {
      subtitle: 'Die heutige Botschaft wiederkehrender Zahlen',
      todaysSignal: 'Zeichen des Tages',
      digitSum: 'Summe der Ziffern',
      reducedNumber: 'Reduzierte Zahl',
      shareTitle: 'Meine Engelszahl',
      fallbackTitle: 'DEUTUNG',
    },
  }[locale];

  const sections = parseContent(yorum, ui.fallbackTitle);
  const shareText = `${ui.shareTitle} ${sayi}\n\n${analysis.share_line || ''}\n\n${yorum}`;

  const handleShare = async () => {
    try {
      await Share.share({ message: shareText });
    } catch (_error) {}
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0B1F" translucent={false} />
      <LinearGradient colors={['#0D0B1F', '#1B1B2F', '#2A2A3F']} style={styles.gradientBg}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.headerSection}>
            <LazyImage source={require('../../assets/backgrounds/777.png')} style={styles.headerBackgroundImage} resizeMode="cover" showPlaceholder={false} fadeInDuration={500} />
            <LinearGradient colors={['rgba(0,0,0,0.58)', 'rgba(0,0,0,0.92)']} style={styles.headerGradient}>
              <Text style={styles.bigNumber}>{sayi}</Text>
              <Text style={styles.subtitle}>{ui.subtitle}</Text>
            </LinearGradient>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryPair}>
              <Text style={styles.summaryLabel}>{ui.digitSum}</Text>
              <Text style={styles.summaryValue}>{rawDigitSum || '-'}</Text>
            </View>
            <View style={styles.summaryPair}>
              <Text style={styles.summaryLabel}>{ui.reducedNumber}</Text>
              <Text style={styles.summaryValueSmall}>{analysis.digit_sum || '-'}</Text>
            </View>
            <Text style={styles.secondarySummaryLabel}>{ui.todaysSignal}</Text>
            <Text style={styles.summaryLine}>{analysis.share_line || ''}</Text>
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

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('Ana Sayfa')}>
              <Ionicons name="home" size={18} color="#FFFFFF" />
              <Text style={styles.secondaryButtonText}>{t('common.homeAction')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('Angel Numbers')}>
              <Ionicons name="refresh" size={18} color="#0D0B1F" />
              <Text style={styles.primaryButtonText}>{t('common.newFortuneAction')}</Text>
            </TouchableOpacity>
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
  headerGradient: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  bigNumber: { fontSize: 64, lineHeight: 70, color: '#FFD76B', fontWeight: '800', letterSpacing: 4 },
  subtitle: { fontSize: 16, lineHeight: 24, color: 'rgba(255,255,255,0.82)', textAlign: 'center', maxWidth: 280, marginTop: 8 },
  summaryCard: { marginHorizontal: 20, marginBottom: 16, backgroundColor: 'rgba(197,161,0,0.10)', borderRadius: 24, padding: 18, borderWidth: 1, borderColor: 'rgba(197,161,0,0.14)', alignItems: 'center' },
  summaryPair: { width: '100%', alignItems: 'center', marginBottom: 10 },
  summaryLabel: { color: 'rgba(255,255,255,0.68)', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 },
  summaryValue: { color: '#FFFFFF', fontSize: 30, fontWeight: '800', marginTop: 6 },
  summaryValueSmall: { color: '#FFFFFF', fontSize: 24, fontWeight: '800', marginTop: 6 },
  secondarySummaryLabel: { color: 'rgba(255,255,255,0.52)', fontSize: 12, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 },
  summaryLine: { color: '#FFD76B', textAlign: 'center', lineHeight: 22 },
  sectionCard: { marginHorizontal: 20, marginBottom: 14, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 22, padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  sectionIconWrap: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(197,161,0,0.12)' },
  sectionTitleWrap: { flexDirection: 'row', alignItems: 'center', marginLeft: 10, flex: 1 },
  sectionTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', flex: 1 },
  pointRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  pointDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#C5A100', marginTop: 8, marginRight: 10 },
  pointText: { flex: 1, color: 'rgba(255,255,255,0.78)', fontSize: 14, lineHeight: 23 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 20, marginTop: 4 },
  secondaryButton: { width: '48%', height: 54, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)' },
  secondaryButtonText: { color: '#FFFFFF', fontWeight: '700', marginLeft: 8 },
  primaryButton: { width: '48%', height: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', backgroundColor: '#C5A100' },
  primaryButtonText: { color: '#0D0B1F', fontWeight: '800', marginLeft: 8 },
});
