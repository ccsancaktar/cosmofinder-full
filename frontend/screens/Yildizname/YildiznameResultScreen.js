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
  '🧿': 'sparkles',
  '⚖️': 'planet',
  '💫': 'star',
  '📅': 'calendar',
  '👥': 'people',
  '💼': 'briefcase',
  '🛤️': 'trail-sign',
};

const STAR_LABELS = {
  tr: {
    sems: 'Şems',
    kamer: 'Kamer',
    merih: 'Merih',
    utarid: 'Utarid',
    musteri: 'Müşteri',
    zuhre: 'Zühre',
    zuhal: 'Zuhal',
  },
  en: {
    sems: 'Shams',
    kamer: 'Qamar',
    merih: 'Mirrikh',
    utarid: 'Utarid',
    musteri: 'Mushtari',
    zuhre: 'Zuhra',
    zuhal: 'Zuhal',
  },
  de: {
    sems: 'Schams',
    kamer: 'Kamer',
    merih: 'Merih',
    utarid: 'Utarid',
    musteri: 'Müşteri',
    zuhre: 'Zühre',
    zuhal: 'Zuhal',
  },
};

const PLANET_LABELS = {
  tr: {
    sun: 'Güneş',
    moon: 'Ay',
    mars: 'Mars',
    mercury: 'Merkür',
    jupiter: 'Jüpiter',
    venus: 'Venüs',
    saturn: 'Satürn',
  },
  en: {
    sun: 'Sun',
    moon: 'Moon',
    mars: 'Mars',
    mercury: 'Mercury',
    jupiter: 'Jupiter',
    venus: 'Venus',
    saturn: 'Saturn',
  },
  de: {
    sun: 'Sonne',
    moon: 'Mond',
    mars: 'Mars',
    mercury: 'Merkur',
    jupiter: 'Jupiter',
    venus: 'Venus',
    saturn: 'Saturn',
  },
};

const TIER_BADGE = {
  free: {
    label: 'Kısa Yorum',
    colors: ['rgba(255,255,255,0.16)', 'rgba(255,255,255,0.08)'],
    icon: 'moon',
  },
  premium: {
    label: 'Detaylı Ustalık Yorumu',
    colors: ['#C5A100', '#8A4FFF'],
    icon: 'diamond',
  },
};

const cleanLine = (line) =>
  line
    .replace(/\*\*/g, '')
    .replace(/^#+\s*/, '')
    .replace(/^[-•]\s*/, '')
    .trim();

const isSectionHeading = (line) => {
  const trimmed = cleanLine(line);
  return /^(🧿|⚖️|💫|📅|👥|💼|🛤️)/.test(trimmed);
};

const parseYildiznameContent = (content, fallbackTitle = 'COMMENTARY') => {
  if (!content) {
    return { sections: [], cta: '' };
  }

  const lines = content.split('\n');
  const sections = [];
  let currentSection = null;
  let cta = '';

  lines.forEach((rawLine) => {
    const line = cleanLine(rawLine);

    if (!line) {
      return;
    }

    if (
      line.startsWith('👉') ||
      /detailed yildizname/i.test(line) ||
      /detailed reading/i.test(line) ||
      /detaillierte yildizname/i.test(line)
    ) {
      cta = line;
      return;
    }

    if (isSectionHeading(line)) {
      if (currentSection) {
        sections.push(currentSection);
      }

      currentSection = {
        title: line,
        points: [],
      };
      return;
    }

    if (!currentSection) {
      currentSection = {
        title: `✨ ${fallbackTitle}`,
        points: [],
      };
    }

    currentSection.points.push(line);
  });

  if (currentSection) {
    sections.push(currentSection);
  }

  return { sections, cta };
};

const getIconFromHeading = (heading) => {
  const match = heading.match(/^(🧿|⚖️|💫|📅|👥|💼|🛤️)/);
  return match ? SECTION_ICONS[match[1]] : 'document-text';
};

const splitHeading = (heading) => {
  const match = heading.match(/^(🧿|⚖️|💫|📅|👥|💼|🛤️)\s*(.*)$/);
  if (!match) {
    return { emoji: '✨', text: heading };
  }

  return {
    emoji: match[1],
    text: match[2],
  };
};

export default function YildiznameResultScreen({ route, navigation }) {
  const { t, i18n } = useTranslation();
  const { hasPremium } = usePremium();
  const params = route?.params || {};
  const { yorum, analysis = {}, readingTier = 'free' } = params;
  const locale = i18n.language?.startsWith('de') ? 'de' : i18n.language?.startsWith('en') ? 'en' : 'tr';
  const ui = {
    tr: {
      freeBadge: 'Kısa Yorum',
      premiumBadge: 'Detaylı Ustalık Yorumu',
      fallbackTitle: 'YORUM',
      analysisTitle: 'Ebced ve Hakim Tesir',
      nameEbced: 'İsim Ebced',
      motherEbced: 'Anne Adı Ebced',
      totalEbced: 'Toplam',
      starNumber: 'Yıldız Sayısı',
      dominantStar: 'Hakim yıldız',
      dominantPlanet: 'Hakim gezegen',
      premiumEyebrow: 'Detaylı Katman Açık Değil',
      premiumTitle: 'Bu yorum kısa yıldızname özetidir',
      premiumDescription:
        'Premium yıldıznamede ebced tesirlerinin derin anlamı, gizli etkiler, kısmetin gerçek durumu ve 1-6 aylık zamanlama çok daha açık şekilde yorumlanır.',
      premiumPoint1: 'Gizli etkiler ve çevresel tesir analizi',
      premiumPoint2: 'Kısmet açıklığı ve gecikme nedenleri',
      premiumPoint3: '1-3 ay ve 3-6 ay için net zamanlama yorumu',
      premiumButton: 'Detaylı Yıldıznameyi Aç',
    },
    en: {
      freeBadge: 'Short Reading',
      premiumBadge: 'Detailed Master Reading',
      fallbackTitle: 'READING',
      analysisTitle: 'Ebced and Dominant Influence',
      nameEbced: 'Name Ebced',
      motherEbced: 'Mother Name Ebced',
      totalEbced: 'Total',
      starNumber: 'Star Number',
      dominantStar: 'Dominant star',
      dominantPlanet: 'Dominant planet',
      premiumEyebrow: 'Detailed Layer Locked',
      premiumTitle: 'This is the short Yildizname summary',
      premiumDescription:
        'In the premium Yildizname, the deeper meaning of ebced influences, hidden effects, the true state of fortune, and 1-6 month timing are interpreted much more clearly.',
      premiumPoint1: 'Hidden influences and environmental effects analysis',
      premiumPoint2: 'Fortune openness and delay reasons',
      premiumPoint3: 'Clear timing reading for 1-3 and 3-6 months',
      premiumButton: 'Unlock Detailed Yildizname',
    },
    de: {
      freeBadge: 'Kurze Deutung',
      premiumBadge: 'Detaillierte Meisterdeutung',
      fallbackTitle: 'DEUTUNG',
      analysisTitle: 'Ebced und Vorherrschender Einfluss',
      nameEbced: 'Namens-Ebced',
      motherEbced: 'Ebced des Mutter-Namens',
      totalEbced: 'Gesamt',
      starNumber: 'Sternzahl',
      dominantStar: 'Vorherrschender Stern',
      dominantPlanet: 'Vorherrschender Planet',
      premiumEyebrow: 'Detaillierte Ebene Gesperrt',
      premiumTitle: 'Dies ist die kurze Yildizname-Zusammenfassung',
      premiumDescription:
        'In der Premium-Yildizname werden die tiefere Bedeutung der Ebced-Einflüsse, verborgene Effekte, der wahre Zustand des Schicksals und die Zeitlinien für 1-6 Monate deutlich klarer gedeutet.',
      premiumPoint1: 'Analyse verborgener und äußerer Einflüsse',
      premiumPoint2: 'Zustand des Schicksals und Ursachen von Verzögerungen',
      premiumPoint3: 'Klare Zeitdeutung für 1-3 und 3-6 Monate',
      premiumButton: 'Detaillierte Yildizname Öffnen',
    },
  }[locale];

  const localizeStar = (key, fallback) => (key ? STAR_LABELS[locale][key] || fallback : fallback || ui.dominantStar);
  const localizePlanet = (key, fallback) => (key ? PLANET_LABELS[locale][key] || fallback : fallback || ui.dominantPlanet);

  const { sections, cta } = parseYildiznameContent(yorum, ui.fallbackTitle);
  const badgeConfig = TIER_BADGE[readingTier] || TIER_BADGE.free;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0B1F" translucent={false} hidden={false} />

      <LinearGradient colors={['#0D0B1F', '#1B1B2F', '#2A2A3F']} style={styles.gradientBg}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerSection}>
            <LazyImage
              source={require('../../assets/backgrounds/yildizname.jpg')}
              style={styles.headerBackgroundImage}
              resizeMode="cover"
              showPlaceholder={false}
              fadeInDuration={500}
            />
            <LinearGradient
              colors={['rgba(0,0,0,0.58)', 'rgba(0,0,0,0.92)']}
              style={styles.headerGradient}
            >
              <Text style={styles.title}>{t('yildizname.yildiznameResultTitle')}</Text>
              <Text style={styles.subtitle}>{t('yildizname.yildiznameResultSubtitle')}</Text>

              <LinearGradient colors={badgeConfig.colors} style={styles.tierBadge}>
                <Ionicons name={badgeConfig.icon} size={16} color="#FFFFFF" />
                <Text style={styles.tierBadgeText}>{readingTier === 'premium' ? ui.premiumBadge : ui.freeBadge}</Text>
              </LinearGradient>
            </LinearGradient>
          </View>

          <View style={styles.analysisCard}>
            <Text style={styles.analysisTitle}>{ui.analysisTitle}</Text>
            <View style={styles.analysisGrid}>
              <View style={styles.analysisItem}>
                <Text style={styles.analysisLabel}>{ui.nameEbced}</Text>
                <Text style={styles.analysisValue}>{analysis.isim_ebced ?? '-'}</Text>
              </View>
              <View style={styles.analysisItem}>
                <Text style={styles.analysisLabel}>{ui.motherEbced}</Text>
                <Text style={styles.analysisValue}>{analysis.anne_adi_ebced ?? '-'}</Text>
              </View>
              <View style={styles.analysisItem}>
                <Text style={styles.analysisLabel}>{ui.totalEbced}</Text>
                <Text style={styles.analysisValue}>{analysis.toplam_ebced ?? '-'}</Text>
              </View>
              <View style={styles.analysisItem}>
                <Text style={styles.analysisLabel}>{ui.starNumber}</Text>
                <Text style={styles.analysisValue}>{analysis.yildiz_sayisi ?? '-'}</Text>
              </View>
            </View>

            <View style={styles.planetRow}>
              <View style={styles.planetPill}>
                <Ionicons name="sparkles" size={16} color="#C5A100" />
                <Text style={styles.planetText}>
                  {localizeStar(analysis.hakim_yildiz_key, analysis.hakim_yildiz)}
                </Text>
              </View>
              <View style={styles.planetPill}>
                <Ionicons name="planet" size={16} color="#C5A100" />
                <Text style={styles.planetText}>
                  {localizePlanet(analysis.hakim_gezegen_key, analysis.hakim_gezegen)}
                </Text>
              </View>
            </View>
          </View>

          {sections.map((section, index) => {
            const heading = splitHeading(section.title);
            return (
              <View key={`${section.title}-${index}`} style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIconWrap}>
                    <Ionicons name={getIconFromHeading(section.title)} size={18} color="#C5A100" />
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
            <LinearGradient colors={['rgba(197,161,0,0.20)', 'rgba(138,79,255,0.18)']} style={styles.ctaCard}>
              <Ionicons name="lock-closed" size={18} color="#FFD76B" />
              <Text style={styles.ctaText}>{cta.replace(/^👉\s*/, '')}</Text>
            </LinearGradient>
          )}

          {!hasPremium && readingTier === 'free' && (
            <LinearGradient colors={['rgba(197,161,0,0.18)', 'rgba(64,34,122,0.28)']} style={styles.premiumCard}>
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

              <TouchableOpacity
                style={styles.premiumButton}
                onPress={() => navigation.navigate('Premium')}
              >
                <LinearGradient colors={['#D4A91F', '#8A4FFF']} style={styles.premiumButtonGradient}>
                  <Ionicons name="sparkles" size={18} color="#FFFFFF" />
                  <Text style={styles.premiumButtonText}>{ui.premiumButton}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Yıldızname')}
              style={styles.newFortuneButton}
            >
              <Ionicons name="refresh" size={22} color="#FFFFFF" />
              <Text style={styles.newFortuneButtonText}>{t('yildizname.newFortune')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Ana Sayfa')}
              style={styles.homeButton}
            >
              <Ionicons name="home" size={22} color="#FFFFFF" />
              <Text style={styles.homeButtonText}>{t('yildizname.homePage')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.disclaimer}>
            <Ionicons name="information-circle" size={16} color="#C5A100" />
            <Text style={styles.disclaimerText}>{t('yildizname.disclaimerText')}</Text>
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
    paddingBottom: 32,
  },
  headerSection: {
    height: 220,
    position: 'relative',
  },
  headerBackgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
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
  tierBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  analysisCard: {
    marginHorizontal: 20,
    marginTop: -24,
    marginBottom: 16,
    backgroundColor: 'rgba(20,18,40,0.96)',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(197,161,0,0.18)',
  },
  analysisTitle: {
    color: '#EED38A',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
  },
  analysisGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  analysisItem: {
    width: '47%',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  analysisLabel: {
    color: '#A8A7BF',
    fontSize: 12,
    marginBottom: 8,
  },
  analysisValue: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },
  planetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
  },
  planetPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(197,161,0,0.08)',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(197,161,0,0.16)',
  },
  planetText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  sectionCard: {
    marginHorizontal: 20,
    marginBottom: 14,
    backgroundColor: 'rgba(27,27,47,0.96)',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
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
    backgroundColor: 'rgba(197,161,0,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  sectionTitle: {
    flex: 1,
    color: '#EED38A',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
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
    color: '#F6F4FF',
    fontSize: 15,
    lineHeight: 24,
  },
  ctaCard: {
    marginHorizontal: 20,
    marginBottom: 18,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  ctaText: {
    flex: 1,
    color: '#F8E9A6',
    fontSize: 14,
    lineHeight: 22,
    marginLeft: 10,
    fontWeight: '600',
  },
  premiumCard: {
    marginHorizontal: 20,
    marginBottom: 18,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(212,169,31,0.20)',
  },
  premiumCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  premiumIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,215,107,0.12)',
    marginRight: 12,
  },
  premiumHeaderText: {
    flex: 1,
  },
  premiumEyebrow: {
    color: '#FFD76B',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  premiumTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
  },
  premiumDescription: {
    color: '#E9E7F4',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 14,
  },
  premiumPoints: {
    gap: 10,
    marginBottom: 16,
  },
  premiumPointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  premiumPointText: {
    flex: 1,
    color: '#F6F4FF',
    fontSize: 14,
    lineHeight: 21,
    marginLeft: 10,
  },
  premiumButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  premiumButtonGradient: {
    minHeight: 52,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 6,
    marginBottom: 24,
  },
  newFortuneButton: {
    backgroundColor: '#8A4FFF',
    padding: 16,
    borderRadius: 18,
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    marginRight: 8,
    justifyContent: 'center',
  },
  newFortuneButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
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
  homeButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginHorizontal: 20,
    borderRadius: 16,
  },
  disclaimerText: {
    fontSize: 13,
    color: '#9B9AAF',
    marginLeft: 8,
    flex: 1,
    lineHeight: 19,
  },
});
