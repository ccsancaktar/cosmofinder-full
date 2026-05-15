import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import LazyImage from '../../components/LazyImage';
import { fontStyles } from '../../utils/fontStyles';

const HEADING_CONFIG = [
  {
    id: 'impression',
    icon: 'eye-outline',
    aliases: [
      'FİNCANIN İLK İZLENİMİ',
      'FİNCANIN GENEL ENERJİSİ',
      'FIRST IMPRESSION OF THE CUP',
      'OVERALL ENERGY OF THE CUP',
      'ERSTER EINDRUCK DER TASSE',
      'GESAMTENERGIE DER TASSE',
    ],
  },
  {
    id: 'symbols',
    icon: 'sparkles-outline',
    aliases: [
      'GÖRÜLEN SEMBOLLER',
      'BELİREN SEMBOLLER VE ANLAMLARI',
      'VISIBLE SYMBOLS',
      'VISIBLE SYMBOLS AND THEIR MEANINGS',
      'SICHTBARE SYMBOLE',
      'SICHTBARE SYMBOLE UND IHRE BEDEUTUNGEN',
    ],
  },
  {
    id: 'past',
    icon: 'time-outline',
    aliases: [
      'GEÇMİŞTEN TAŞINANLAR',
      'YAKIN ZAMAN VE GELİŞMELER',
      'WHAT THE CUP CARRIES FROM THE PAST',
      'NEAR FUTURE AND DEVELOPMENTS',
      'WAS DIE TASSE AUS DER VERGANGENHEIT TRAEGT',
      'NAHE ZUKUNFT UND ENTWICKLUNGEN',
      'GEÇMİŞ ŞİMDİ VE GELECEK',
      'ZAMAN ANALİZİ',
    ],
  },
  {
    id: 'love',
    icon: 'heart-outline',
    aliases: ['AŞK VE İLİŞKİLER', 'LOVE AND RELATIONSHIPS', 'LIEBE UND BEZIEHUNGEN', 'AŞK HAYATI'],
  },
  {
    id: 'work',
    icon: 'briefcase-outline',
    aliases: ['İŞ, PARA VE KISMET', 'WORK, MONEY, AND LUCK', 'BERUF, GELD UND GLUECK', 'KARİYER'],
  },
  {
    id: 'future',
    icon: 'moon-outline',
    aliases: [
      'YAKIN GELECEK',
      'DİKKAT EDİLMESİ GEREKENLER',
      'NEAR FUTURE',
      'THINGS TO WATCH OUT FOR',
      'NAHE ZUKUNFT',
      'WORAUF DU ACHTEN SOLLTEST',
      'GELECEK',
    ],
  },
  {
    id: 'guidance',
    icon: 'compass-outline',
    aliases: ['TAVSİYE', 'FALIN MESAJI', 'GUIDANCE', 'MESSAGE OF THE READING', 'EMPFEHLUNG', 'BOTSCHAFT DER DEUTUNG', 'ÖNERİLER'],
  },
];

const normalizeLine = line =>
  line
    .replace(/^#+\s*/, '')
    .replace(/\*\*/g, '')
    .replace(/^\d+\.\s*/, '')
    .replace(/\s+/g, ' ')
    .trim();

const detectHeading = line => {
  const normalized = normalizeLine(line).toUpperCase();
  return HEADING_CONFIG.find(config =>
    config.aliases.some(alias => normalized === alias.toUpperCase() || normalized.includes(alias.toUpperCase()))
  );
};

const findEmbeddedHeading = line => {
  const normalized = normalizeLine(line);
  const upper = normalized.toUpperCase();

  for (const config of HEADING_CONFIG) {
    for (const alias of config.aliases) {
      const aliasUpper = alias.toUpperCase();
      const index = upper.indexOf(aliasUpper);
      if (index !== -1) {
        return {
          config,
          alias,
          index,
          normalized,
        };
      }
    }
  }

  return null;
};

const buildSections = text => {
  if (!text) {
    return [];
  }

  const sections = [];
  let currentSection = null;

  text.split('\n').forEach(rawLine => {
    let remaining = normalizeLine(rawLine);

    while (remaining) {
      const exactHeading = detectHeading(remaining);
      if (exactHeading) {
        currentSection = {
          id: exactHeading.id,
          title: remaining,
          icon: exactHeading.icon,
          paragraphs: [],
        };
        sections.push(currentSection);
        remaining = '';
        continue;
      }

      const embeddedHeading = findEmbeddedHeading(remaining);
      if (embeddedHeading) {
        const before = embeddedHeading.normalized.slice(0, embeddedHeading.index).trim();
        const headingAndAfter = embeddedHeading.normalized.slice(embeddedHeading.index).trim();
        const aliasUpper = embeddedHeading.alias.toUpperCase();
        const headingEnd = headingAndAfter.toUpperCase().indexOf(aliasUpper) + embeddedHeading.alias.length;
        const title = headingAndAfter.slice(0, headingEnd).trim();
        const after = headingAndAfter.slice(headingEnd).replace(/^[:\-.\s]+/, '').trim();

        if (before) {
          if (!currentSection) {
            currentSection = {
              id: 'overview',
              title: null,
              icon: 'document-text-outline',
              paragraphs: [],
            };
            sections.push(currentSection);
          }
          currentSection.paragraphs.push(before);
        }

        currentSection = {
          id: embeddedHeading.config.id,
          title,
          icon: embeddedHeading.config.icon,
          paragraphs: [],
        };
        sections.push(currentSection);
        remaining = after;
        continue;
      }

      if (!currentSection) {
        currentSection = {
          id: 'overview',
          title: null,
          icon: 'document-text-outline',
          paragraphs: [],
        };
        sections.push(currentSection);
      }

      currentSection.paragraphs.push(remaining);
      remaining = '';
    }
  });

  return sections.filter(section => section.paragraphs.length > 0 || section.title);
};

export default function CoffeeResultScreen({ route, navigation }) {
  const { t } = useTranslation();
  const params = route?.params || {};
  const { yorum, manual, interpretation, question, images = [] } = params;
  const fullText = yorum || interpretation || '';

  const sections = useMemo(() => buildSections(fullText), [fullText]);
  const previewImages = useMemo(() => images.filter(Boolean).slice(0, 3), [images]);

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
              source={require('../../assets/backgrounds/turk-kahvesi.jpg')}
              style={styles.headerBackgroundImage}
              resizeMode="cover"
              showPlaceholder={false}
              fadeInDuration={500}
            />
            <LinearGradient
              colors={['rgba(0,0,0,0.58)', 'rgba(0,0,0,0.92)']}
              style={styles.headerGradient}
            >
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonInCard}>
                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>

              <Text style={styles.title}>
                {manual ? t('coffee.coffeeCupGuide') : t('coffee.coffeeResultTitle')}
              </Text>
              <Text style={styles.subtitle}>
                {manual ? t('coffee.makeYourOwnInterpretation') : t('coffee.coffeeResultSubtitle')}
              </Text>
            </LinearGradient>
          </View>

          {question ? (
            <View style={styles.focusCard}>
              <View style={styles.focusIcon}>
                <Ionicons name="sparkles" size={16} color="#0D0B1F" />
              </View>
              <View style={styles.focusContent}>
                <Text style={styles.focusLabel}>{t('coffee.focusQuestion')}</Text>
                <Text style={styles.focusText}>{question}</Text>
              </View>
            </View>
          ) : null}

          {previewImages.length > 0 ? (
            <View style={styles.previewSection}>
              <View style={styles.previewHeader}>
                <Text style={styles.previewEyebrow}>{t('coffee.coffeeCupPhotos')}</Text>
                <Text style={styles.previewCaption}>{previewImages.length} / 3</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.previewRow}>
                {previewImages.map((imageUri, index) => (
                  <View key={`${imageUri}-${index}`} style={styles.previewCard}>
                    <LazyImage
                      source={{ uri: imageUri }}
                      style={styles.previewImage}
                      resizeMode="cover"
                      showPlaceholder={false}
                      fadeInDuration={250}
                    />
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.78)']}
                      style={styles.previewOverlay}
                    >
                      <Text style={styles.previewIndex}>{index + 1}. {t(`coffee.photo${index + 1}Title`)}</Text>
                    </LinearGradient>
                  </View>
                ))}
              </ScrollView>
            </View>
          ) : null}

          {sections.length > 0 ? (
            <View style={styles.sectionsWrap}>
              {sections.map(section => (
                <View key={`${section.id}-${section.title || 'overview'}`} style={styles.sectionCard}>
                  {section.title ? (
                    <View style={styles.sectionHeader}>
                      <View style={styles.sectionIconWrap}>
                        <Ionicons name={section.icon} size={18} color="#F5D06A" />
                      </View>
                      <Text style={styles.sectionTitle}>{section.title}</Text>
                    </View>
                  ) : null}

                  {section.paragraphs.map((paragraph, index) => (
                    <Text key={`${section.id}-${index}`} style={styles.paragraph}>
                      {paragraph}
                    </Text>
                  ))}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.paragraph}>{t('coffee.noCommentFound')}</Text>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={() => navigation.navigate('Kahve')} style={styles.newFortuneButton}>
              <Ionicons name="refresh" size={24} color="#FFFFFF" />
              <Text style={styles.newFortuneButtonText}>{t('coffee.newFortune')}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Ana Sayfa')} style={styles.homeButton}>
              <Ionicons name="home" size={24} color="#FFFFFF" />
              <Text style={styles.homeButtonText}>{t('coffee.homePage')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.disclaimer}>
            <Ionicons name="information-circle" size={16} color="#C5A100" />
            <Text style={styles.disclaimerText}>{t('coffee.disclaimerText')}</Text>
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
    overflow: 'hidden',
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
    paddingTop: Platform.OS === 'android' ? 0 : 24,
  },
  backButtonInCard: {
    position: 'absolute',
    top: 28,
    left: 24,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    borderWidth: 1,
    borderColor: 'rgba(245, 208, 106, 0.24)',
  },
  title: {
    fontSize: 28,
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    ...fontStyles.headingBold,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.92,
    ...fontStyles.body,
  },
  focusCard: {
    marginTop: -22,
    marginHorizontal: 20,
    marginBottom: 18,
    padding: 18,
    borderRadius: 20,
    backgroundColor: '#17172A',
    borderWidth: 1,
    borderColor: 'rgba(245, 208, 106, 0.18)',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  focusIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F5D06A',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  focusContent: {
    flex: 1,
  },
  focusLabel: {
    fontSize: 12,
    color: '#F5D06A',
    marginBottom: 4,
    letterSpacing: 0.6,
    ...fontStyles.bodyBold,
  },
  focusText: {
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 22,
    ...fontStyles.body,
  },
  previewSection: {
    marginHorizontal: 20,
    marginBottom: 18,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  previewEyebrow: {
    color: '#F5D06A',
    fontSize: 12,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    ...fontStyles.bodyBold,
  },
  previewCaption: {
    color: '#9F9AB7',
    fontSize: 12,
    ...fontStyles.body,
  },
  previewRow: {
    gap: 12,
    paddingRight: 10,
  },
  previewCard: {
    width: 118,
    height: 148,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#161628',
    borderWidth: 1,
    borderColor: 'rgba(245, 208, 106, 0.18)',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  previewIndex: {
    color: '#FFFFFF',
    fontSize: 11,
    lineHeight: 14,
    ...fontStyles.bodyBold,
  },
  sectionsWrap: {
    paddingHorizontal: 20,
    gap: 14,
  },
  sectionCard: {
    backgroundColor: '#19192E',
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: 'rgba(245, 208, 106, 0.08)',
    shadowColor: '#000000',
    shadowOpacity: 0.24,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  sectionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(245, 208, 106, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(245, 208, 106, 0.16)',
  },
  sectionTitle: {
    flex: 1,
    color: '#F5D06A',
    fontSize: 20,
    lineHeight: 26,
    textTransform: 'uppercase',
    ...fontStyles.headingBold,
  },
  paragraph: {
    color: '#F4F1FF',
    fontSize: 16,
    lineHeight: 29,
    ...fontStyles.body,
    marginBottom: 12,
  },
  emptyCard: {
    marginHorizontal: 20,
    backgroundColor: '#1B1B2F',
    borderRadius: 22,
    padding: 20,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    marginTop: 24,
    gap: 14,
  },
  newFortuneButton: {
    backgroundColor: '#8A4FFF',
    paddingVertical: 18,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  newFortuneButtonText: {
    color: '#FFFFFF',
    marginLeft: 10,
    fontSize: 18,
    ...fontStyles.bodyBold,
  },
  homeButton: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeButtonText: {
    color: '#FFFFFF',
    marginLeft: 10,
    fontSize: 18,
    ...fontStyles.bodyBold,
  },
  disclaimer: {
    marginHorizontal: 20,
    marginTop: 22,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  disclaimerText: {
    color: '#BDB8D3',
    fontSize: 13,
    lineHeight: 20,
    marginLeft: 10,
    flex: 1,
    ...fontStyles.body,
  },
});
