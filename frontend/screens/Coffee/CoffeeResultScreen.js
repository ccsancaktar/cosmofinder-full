import React from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, StatusBar, SafeAreaView, Platform } from 'react-native';
import { SafeAreaView as SafeAreaViewContext } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import LazyImage from '../../components/LazyImage';

export default function CoffeeResultScreen({ route, navigation }) {
  const { t } = useTranslation();
  
  // route.params undefined kontrolü
  const params = route?.params || {};
  const { yorum, manual, interpretation, fallback } = params;

  const shortenHeading = (text) => {
    // Kahve falı başlık kısaltma sözlüğü
    const headingMap = {
      'FİNCAN GENEL GÖRÜNÜM VE ENERJİ': 'FİNCAN GENEL',
      'FİNCANIN FARKLI BÖLGELERİNDEKİ SEMBOLLER': 'SEMBOLLER',
      'GEÇMİŞ ŞİMDİ VE GELECEK': 'ZAMAN ANALİZİ',
      'KİŞİSEL İLİŞKİLER VE AŞK HAYATI': 'AŞK HAYATI',
      'KARİYER VE İŞ HAYATI': 'KARİYER',
      'SAĞLIK DURUMU': 'SAĞLIK',
      'YAKIN GELECEKTEKİ OLAYLAR': 'GELECEK',
      'PRATİK ÖNERİLER VE TAVSİYELER': 'ÖNERİLER'
    };

    let shortText = text;
    
    // Başlık kısaltmalarını uygula
    Object.keys(headingMap).forEach(longForm => {
      if (text.includes(longForm)) {
        shortText = text.replace(longForm, headingMap[longForm]);
      }
    });
    
    return shortText;
  };

  const formatYorum = (yorum) => {
    if (!yorum) return <Text style={styles.paragraph}>{t('coffee.noCommentFound')}</Text>;
    
    // FİNCAN başlığından itibaren göster
    const lines = yorum.split('\n');
    let startIndex = -1;
    
    // FİNCAN, KARİYER, AŞK veya benzer başlık bul
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('FİNCAN') || lines[i].includes('KARİYER') || 
          lines[i].includes('AŞK') || lines[i].includes('SAĞLIK') ||
          lines[i].includes('1.') || lines[i].includes('**')) {
        startIndex = i;
        break;
      }
    }
    
    // Eğer uygun başlık bulunamazsa tüm metni göster
    const relevantLines = startIndex >= 0 ? lines.slice(startIndex) : lines;
    
    return relevantLines.map((line, index) => {
      // ##, ###, **, # ve --- işaretlerini kaldır
      const cleanLine = line.replace(/^###\s*/, '').replace(/^##\s*/, '').replace(/\*\*/g, '').replace(/^#\s*/, '').replace(/^---$/, '').replace(/^\d+\.\s*/, '');
      
      // Boş satırları atla
      if (!cleanLine.trim()) return null;
      
      // Başlıkları kalın yap - ** veya ### veya numaralı başlıklar
      const isHeading = line.includes('**') || line.includes('###') ||
                       line.includes('FİNCAN') || line.includes('SEMBOL') ||
                       line.includes('GEÇMİŞ') || line.includes('ZAMAN') ||
                       line.includes('AŞK') || line.includes('İLİŞKİ') ||
                       line.includes('KARİYER') || line.includes('İŞ') ||
                       line.includes('SAĞLIK') || line.includes('GELECEK') ||
                       line.includes('ÖNERİ') || line.includes('TAVSİYE') ||
                       /^\d+\.\s/.test(line); // Numaralı başlıklar (1., 2., vs.)
      
      // Başlık ise kısalt
      const finalText = isHeading ? shortenHeading(cleanLine) : cleanLine;
      
      return (
        <Text 
          key={index} 
          style={isHeading ? styles.boldText : styles.paragraph}
          numberOfLines={isHeading ? 1 : undefined}
          ellipsizeMode={isHeading ? 'tail' : 'clip'}
        >
          {finalText}
        </Text>
      );
    }).filter(Boolean); // null değerleri filtrele
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0B1F" translucent={false} hidden={false} />
      
      <LinearGradient
        colors={['#0D0B1F', '#1B1B2F', '#2A2A3F']}
        style={styles.gradientBg}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.headerSection}>
            <LazyImage
              source={require('../../assets/backgrounds/turk-kahvesi.jpg')}
              style={styles.headerBackgroundImage}
              resizeMode="cover"
              showPlaceholder={false}
              fadeInDuration={500}
            />
            <LinearGradient
              colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.9)']}
              style={styles.headerGradient}
            >
              <Text style={styles.title}>
                {manual ? t('coffee.coffeeCupGuide') : t('coffee.coffeeResultTitle')}
              </Text>
              <Text style={styles.subtitle}>
                {manual ? t('coffee.makeYourOwnInterpretation') : t('coffee.coffeeResultSubtitle')}
              </Text>
              

            </LinearGradient>
          </View>

          {/* Result Card */}
          <View style={styles.resultCard}>
            <View style={styles.yorumContainer}>
              {formatYorum(yorum || interpretation)}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Kahve')}
              style={styles.newFortuneButton}
            >
              <Ionicons name="refresh" size={24} color="#FFFFFF" />
              <Text style={styles.newFortuneButtonText}>{t('coffee.newFortune')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => navigation.navigate('Ana Sayfa')}
              style={styles.homeButton}
            >
              <Ionicons name="home" size={24} color="#FFFFFF" />
              <Text style={styles.homeButtonText}>{t('coffee.homePage')}</Text>
            </TouchableOpacity>
          </View>

          {/* Disclaimer */}
          <View style={styles.disclaimer}>
            <Ionicons name="information-circle" size={16} color="#C5A100" />
            <Text style={styles.disclaimerText}>
              {t('coffee.disclaimerText')}
            </Text>
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
    paddingTop: 0,
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
  header: {
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerSection: {
    height: 200,
    overflow: 'hidden',
    marginBottom: 0,
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
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 0 : 20,
  },
  backButtonInCard: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  resultCard: {
    backgroundColor: '#1B1B2F',
    marginHorizontal: 0,
    marginBottom: 24,
    borderRadius: 0,
    elevation: Platform.OS === 'android' ? 4 : 0,
    shadowColor: Platform.OS === 'ios' ? '#000' : 'transparent',
    shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 4 } : { width: 0, height: 0 },
    shadowOpacity: Platform.OS === 'ios' ? 0.3 : 0,
    shadowRadius: Platform.OS === 'ios' ? 8 : 0,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#C5A100',
    marginLeft: 8,
  },
  yorumContainer: {
    padding: 20,
  },
  paragraph: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 24,
    marginBottom: 16,
    textAlign: 'justify',
  },
  boldText: {
    fontSize: 16,
    color: '#FFD700',
    lineHeight: 20,
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '900',
    fontFamily: 'System',
    marginTop: 8,
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  newFortuneButton: {
    backgroundColor: '#8A4FFF',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    marginRight: 8,
    elevation: 6,
    shadowColor: '#8A4FFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  newFortuneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  homeButton: {
    backgroundColor: '#2A2A3F',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  homeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 24,
    borderRadius: 12,
  },
  disclaimerText: {
    fontSize: 14,
    color: '#999',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
}); 