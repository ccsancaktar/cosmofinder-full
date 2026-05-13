import React from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import ZodiacIcon from '../../components/ZodiacIcon';
import LazyImage from '../../components/LazyImage';

const SECTION_META = {
  '🌟': { icon: 'sparkles', colors: ['rgba(197,161,0,0.18)', 'rgba(197,161,0,0.05)'] },
  '❤️': { icon: 'heart', colors: ['rgba(255,96,136,0.18)', 'rgba(255,96,136,0.05)'] },
  '💼': { icon: 'briefcase', colors: ['rgba(90,132,255,0.18)', 'rgba(90,132,255,0.05)'] },
  '⚡': { icon: 'flash', colors: ['rgba(255,168,0,0.18)', 'rgba(255,168,0,0.05)'] },
  '🍀': { icon: 'leaf', colors: ['rgba(59,194,124,0.18)', 'rgba(59,194,124,0.05)'] },
  '🔮': { icon: 'planet', colors: ['rgba(138,79,255,0.18)', 'rgba(138,79,255,0.05)'] },
  '✨': { icon: 'star', colors: ['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.04)'] },
};

const ZODIAC_KEYS = {
  Koç: 'aries',
  Boğa: 'taurus',
  İkizler: 'gemini',
  Yengeç: 'cancer',
  Aslan: 'leo',
  Başak: 'virgo',
  Terazi: 'libra',
  Akrep: 'scorpio',
  Yay: 'sagittarius',
  Oğlak: 'capricorn',
  Kova: 'aquarius',
  Balık: 'pisces',
};

const cleanLine = (line) =>
  line
    .replace(/\*\*/g, '')
    .replace(/^#+\s*/, '')
    .replace(/^[-•]\s*/, '')
    .replace(/^_{2,}$/, '')
    .trim();

const NUMERIC_HEADING_MAP = [
  { pattern: /^1\.\s*(bugünün genel enerjisi|today'?s general energy|energie des tages)/i, emoji: '🌟', title: { tr: 'Günün Enerjisi', en: "Today's Energy", de: 'Energie des Tages' } },
  { pattern: /^2\.\s*(burç özelliklerine göre günlük yorum|daily interpretation based on zodiac|deutung basierend auf dem sternzeichen)/i, emoji: '🌟', title: { tr: 'Burç Akışı', en: 'Zodiac Flow', de: 'Sternzeichen-Fluss' } },
  { pattern: /^3\.\s*(aşk ve ilişkiler açısından bugün|love and relationships|liebe und beziehungen)/i, emoji: '❤️', title: { tr: 'Aşk ve İletişim', en: 'Love and Communication', de: 'Liebe und Kommunikation' } },
  { pattern: /^4\.\s*(kariyer ve iş hayatı için bugün|career and work life|karriere und arbeit)/i, emoji: '💼', title: { tr: 'İş ve Para', en: 'Work and Money', de: 'Arbeit und Geld' } },
  { pattern: /^5\.\s*(sağlık ve enerji durumu|health and energy|gesundheit und energie)/i, emoji: '⚡', title: { tr: 'Enerji Dengesi', en: 'Energy Balance', de: 'Energiebalance' } },
  { pattern: /^6\.\s*(bugün dikkat edilmesi gerekenler|things to watch out for|worauf man achten sollte)/i, emoji: '⚡', title: { tr: 'Dikkat Edilmesi Gerekenler', en: 'Things to Watch Out For', de: 'Worauf man Achten Sollte' } },
  { pattern: /^7\.\s*(bugün yapılması önerilen aktiviteler|recommended activities|empfohlene aktivitäten)/i, emoji: '🍀', title: { tr: 'Önerilen Aktiviteler', en: 'Recommended Activities', de: 'Empfohlene Aktivitäten' } },
  { pattern: /^8\.\s*(yarın için hazırlık önerileri|preparation suggestions for tomorrow|vorbereitung für morgen)/i, emoji: '🔮', title: { tr: 'Yarına Hazırlık', en: 'Preparation for Tomorrow', de: 'Vorbereitung für Morgen' } },
  { pattern: /^(son söz|closing message|schlussbotschaft)/i, emoji: '🔮', title: { tr: 'Günün Mesajı', en: 'Message of the Day', de: 'Botschaft des Tages' } },
];

const normalizeLegacyHeading = (line, localeKey) => {
  for (const item of NUMERIC_HEADING_MAP) {
    if (item.pattern.test(line)) {
      return `${item.emoji} ${item.title[localeKey]}`;
    }
  }

  return line;
};

const splitHeading = (heading) => {
  const match = heading.match(/^(🌟|❤️|💼|⚡|🍀|🔮)\s*(.*)$/);
  if (!match) {
    return { emoji: '✨', text: heading };
  }

  return { emoji: match[1], text: match[2] };
};

const parseDailyContent = (content, fallbackTitle = 'YORUM', localeKey = 'tr') => {
  if (!content) return [];

  const sections = [];
  let currentSection = null;

  content.split('\n').forEach((rawLine) => {
    let line = cleanLine(rawLine);
    if (!line) return;

    if (line === '--' || line === '—' || line === '––') return;

    line = normalizeLegacyHeading(line, localeKey);

    if (/^(🌟|❤️|💼|⚡|🍀|🔮)/.test(line)) {
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
  return sections;
};

const parseLuckyItems = (points) => {
  const items = [];

  points.forEach((point) => {
    const normalized = point.replace(/\s+/g, ' ').trim();
    const colonIndex = normalized.indexOf(':');

    if (colonIndex > -1) {
      items.push({
        label: normalized.slice(0, colonIndex).trim(),
        value: normalized.slice(colonIndex + 1).trim(),
      });
      return;
    }

    const dashIndex = normalized.indexOf('-');
    if (dashIndex > -1) {
      items.push({
        label: normalized.slice(0, dashIndex).trim(),
        value: normalized.slice(dashIndex + 1).trim(),
      });
      return;
    }

    items.push({
      label: '',
      value: normalized,
    });
  });

  return items.filter((item) => item.value);
};

const formatDate = (value, locale) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  try {
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch (error) {
    return value;
  }
};

export default function DailyResultScreen({ route, navigation }) {
  const { t, i18n } = useTranslation();
  const params = route?.params || {};
  const { zodiac_sign, date, yorum } = params;
  const localeKey = i18n.language?.startsWith('de') ? 'de' : i18n.language?.startsWith('en') ? 'en' : 'tr';
  const locale = localeKey === 'de' ? 'de-DE' : localeKey === 'en' ? 'en-US' : 'tr-TR';

  const ui = {
    tr: {
      title: 'Günlük Falınız',
      subtitle: 'Bugünün enerjisini bölümler halinde oku',
      fallbackTitle: 'YORUM',
      zodiacLabel: 'Burç',
      dateLabel: 'Tarih',
      summaryEyebrow: 'GÜNLÜK AKIŞ',
      summaryTitle: 'Bugünün atmosferi sende nasıl çalışıyor?',
      luckyTitle: 'Şanslı Enerjiler',
      messageTitle: 'Kapanış Mesajı',
      newReading: 'Yeni Günlük Fal',
      disclaimer: 'Bu yorum eğlence amaçlıdır ve gerçek hayat kararlarınızı etkilememelidir.',
    },
    en: {
      title: 'Your Daily Reading',
      subtitle: 'Read today’s energy through focused sections',
      fallbackTitle: 'READING',
      zodiacLabel: 'Zodiac',
      dateLabel: 'Date',
      summaryEyebrow: 'DAILY FLOW',
      summaryTitle: 'How is today’s atmosphere working through you?',
      luckyTitle: 'Lucky Energies',
      messageTitle: 'Closing Message',
      newReading: 'New Daily Reading',
      disclaimer: 'This reading is for entertainment purposes and should not direct major life decisions.',
    },
    de: {
      title: 'Deine Tagesdeutung',
      subtitle: 'Lies die Energie des Tages in klaren Abschnitten',
      fallbackTitle: 'DEUTUNG',
      zodiacLabel: 'Sternzeichen',
      dateLabel: 'Datum',
      summaryEyebrow: 'TAGESFLUSS',
      summaryTitle: 'Wie wirkt die heutige Atmosphäre auf dich?',
      luckyTitle: 'Glücksenergien',
      messageTitle: 'Abschlussbotschaft',
      newReading: 'Neue Tagesdeutung',
      disclaimer: 'Diese Deutung dient nur der Unterhaltung und sollte keine wichtigen Lebensentscheidungen bestimmen.',
    },
  }[localeKey];

  const sections = parseDailyContent(yorum, ui.fallbackTitle, localeKey);
  const summarySection = sections[0];
  const luckySection = sections.find((section) => splitHeading(section.title).emoji === '🍀');
  const messageSection = sections.find((section) => splitHeading(section.title).emoji === '🔮');
  const mainSections = sections.filter((section) => {
    const emoji = splitHeading(section.title).emoji;
    return emoji !== '🍀' && emoji !== '🔮';
  });

  const zodiacKey = ZODIAC_KEYS[zodiac_sign];
  const localizedZodiac = zodiacKey ? t(`zodiac.${zodiacKey}`) : zodiac_sign;
  const luckyItems = luckySection ? parseLuckyItems(luckySection.points) : [];
  const introLines = (yorum || '')
    .split('\n')
    .map((line) => cleanLine(line))
    .filter(Boolean)
    .filter((line) => line !== '--' && line !== '—' && !/^(🌟|❤️|💼|⚡|🍀|🔮)/.test(line))
    .filter((line) => !NUMERIC_HEADING_MAP.some((item) => item.pattern.test(line)));
  const summaryLead = introLines[0] || summarySection?.points?.[0] || '';
  const closingMessage = messageSection?.points?.join(' ') || '';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0B1F" />

      <LinearGradient colors={['#0D0B1F', '#161427', '#22203A']} style={styles.gradientBg}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <LazyImage
              source={require('../../assets/backgrounds/gunluk-fal.jpg')}
              style={styles.heroImage}
              resizeMode="cover"
              showPlaceholder={false}
              fadeInDuration={500}
            />
            <LinearGradient colors={['rgba(7,7,16,0.35)', 'rgba(7,7,16,0.92)']} style={styles.heroOverlay}>
              <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
              </TouchableOpacity>

              <View style={styles.heroCenter}>
                <View style={styles.zodiacHalo}>
                  <ZodiacIcon zodiacSign={zodiac_sign} size={38} color="#E4BE56" />
                </View>
                <Text style={styles.heroTitle}>{ui.title}</Text>
                <Text style={styles.heroSubtitle}>{ui.subtitle}</Text>
              </View>
            </LinearGradient>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryEyebrow}>{ui.summaryEyebrow}</Text>
            <Text style={styles.summaryTitle}>{ui.summaryTitle}</Text>

            <View style={styles.metaRow}>
              <View style={styles.metaChip}>
                <Text style={styles.metaLabel}>{ui.zodiacLabel}</Text>
                <Text style={styles.metaValue}>{localizedZodiac}</Text>
              </View>
              <View style={styles.metaChip}>
                <Text style={styles.metaLabel}>{ui.dateLabel}</Text>
                <Text style={styles.metaValue}>{formatDate(date, locale)}</Text>
              </View>
            </View>

            {!!summaryLead && <Text style={styles.summaryLead}>{summaryLead}</Text>}
          </View>

          {mainSections.map((section, index) => {
            const { emoji, text } = splitHeading(section.title);
            const sectionMeta = SECTION_META[emoji] || SECTION_META['✨'];

            return (
              <LinearGradient key={`${section.title}-${index}`} colors={sectionMeta.colors} style={styles.sectionShell}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionBadge}>
                    <Ionicons name={sectionMeta.icon} size={18} color="#F5D277" />
                  </View>
                  <View style={styles.sectionHeadingWrap}>
                    <Text style={styles.sectionEmoji}>{emoji}</Text>
                    <Text style={styles.sectionTitle}>{text}</Text>
                  </View>
                </View>

                <View style={styles.sectionContent}>
                  {section.points.map((point, pointIndex) => (
                    <Text key={`${section.title}-${pointIndex}`} style={styles.sectionParagraph}>
                      {point}
                    </Text>
                  ))}
                </View>
              </LinearGradient>
            );
          })}

          {!!luckyItems.length && (
            <View style={styles.specialCard}>
              <View style={styles.specialHeader}>
                <Ionicons name="sparkles" size={18} color="#F5D277" />
                <Text style={styles.specialTitle}>{ui.luckyTitle}</Text>
              </View>

              <View style={styles.luckyGrid}>
                {luckyItems.map((item, index) => (
                  <View key={`${item.label}-${index}`} style={styles.luckyChip}>
                    {!!item.label && <Text style={styles.luckyLabel}>{item.label}</Text>}
                    <Text style={styles.luckyValue}>{item.value}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {!!closingMessage && (
            <LinearGradient colors={['rgba(138,79,255,0.20)', 'rgba(138,79,255,0.06)']} style={styles.messageCard}>
              <View style={styles.specialHeader}>
                <Ionicons name="planet" size={18} color="#D6B6FF" />
                <Text style={styles.specialTitle}>{ui.messageTitle}</Text>
              </View>
              <Text style={styles.messageText}>{closingMessage}</Text>
            </LinearGradient>
          )}

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('Daily')}>
              <Ionicons name="refresh" size={18} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>{ui.newReading}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('Ana Sayfa')}>
              <Ionicons name="home" size={18} color="#FFFFFF" />
              <Text style={styles.secondaryButtonText}>{t('navigation.home')}</Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 36,
  },
  hero: {
    height: 210,
    position: 'relative',
  },
  heroImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    justifyContent: 'space-between',
    paddingBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  heroCenter: {
    alignItems: 'center',
  },
  zodiacHalo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(228,190,86,0.34)',
    marginBottom: 14,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  heroSubtitle: {
    maxWidth: 260,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.84)',
    fontSize: 14,
    lineHeight: 21,
  },
  summaryCard: {
    marginHorizontal: 18,
    marginTop: 16,
    padding: 20,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  summaryEyebrow: {
    color: '#C5A100',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  summaryTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  metaChip: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  metaLabel: {
    color: 'rgba(255,255,255,0.56)',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 5,
  },
  metaValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  summaryLead: {
    marginTop: 16,
    color: 'rgba(255,255,255,0.82)',
    fontSize: 15,
    lineHeight: 24,
  },
  sectionShell: {
    marginHorizontal: 18,
    marginTop: 14,
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
  sectionBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginRight: 12,
  },
  sectionHeadingWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionEmoji: {
    fontSize: 17,
    marginRight: 8,
  },
  sectionTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  sectionContent: {
    gap: 10,
  },
  sectionParagraph: {
    color: 'rgba(255,255,255,0.84)',
    fontSize: 14,
    lineHeight: 23,
  },
  specialCard: {
    marginHorizontal: 18,
    marginTop: 14,
    padding: 18,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  specialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  specialTitle: {
    marginLeft: 8,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  luckyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  luckyChip: {
    minWidth: '30%',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  luckyLabel: {
    color: '#C5A100',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  luckyValue: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  messageCard: {
    marginHorizontal: 18,
    marginTop: 14,
    padding: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  messageText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 15,
    lineHeight: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 18,
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
    marginHorizontal: 18,
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
