import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import LazyImage from '../../components/LazyImage';
import { useAuth } from '../../context/AuthContext';

export default function CompatibilityBilgiScreen({ navigation }) {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const features = [
    { icon: 'heart-half', title: t('compatibility.feature1Title'), body: t('compatibility.feature1Body') },
    { icon: 'chatbubble-ellipses', title: t('compatibility.feature2Title'), body: t('compatibility.feature2Body') },
    { icon: 'sparkles', title: t('compatibility.feature3Title'), body: t('compatibility.feature3Body') },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0D0B1F" translucent={false} />
        <LinearGradient colors={['#0D0B1F', '#1B1B2F', '#2A2A3F']} style={styles.gradientBg}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.headerSection}>
              <LazyImage source={require('../../assets/backgrounds/yildizname.jpg')} style={styles.headerBackgroundImage} resizeMode="cover" showPlaceholder={false} fadeInDuration={450} />
              <LinearGradient colors={['rgba(0,0,0,0.60)', 'rgba(0,0,0,0.92)']} style={styles.headerGradient}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonInCard}>
                  <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.title}>{t('compatibility.title')}</Text>
                <Text style={styles.subtitle}>{t('compatibility.subtitle')}</Text>
              </LinearGradient>
            </View>

            <View style={styles.content}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('compatibility.whatIs')}</Text>
                <Text style={styles.sectionText}>{t('compatibility.description')}</Text>
              </View>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('compatibility.keyFeatures')}</Text>
                {features.map((item) => (
                  <View key={item.title} style={styles.featureItem}>
                    <Ionicons name={item.icon} size={20} color="#C5A100" />
                    <View style={styles.featureContent}>
                      <Text style={styles.featureTitle}>{item.title}</Text>
                      <Text style={styles.featureDesc}>{item.body}</Text>
                    </View>
                  </View>
                ))}
              </View>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('compatibility.tipsTitle')}</Text>
                {[t('compatibility.tip1'), t('compatibility.tip2'), t('compatibility.tip3')].map((tip) => (
                  <View key={tip} style={styles.tipRow}>
                    <Ionicons name="checkmark-circle" size={16} color="#C5A100" />
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>
            </View>

            <TouchableOpacity style={styles.startButton} onPress={() => navigation.navigate(isAuthenticated ? 'Compatibility' : 'Login')}>
              <Ionicons name="heart-half" size={22} color="#FFFFFF" />
              <Text style={styles.startButtonText}>{t('compatibility.startButton')}</Text>
            </TouchableOpacity>
          </ScrollView>
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0D0B1F' },
  container: { flex: 1, backgroundColor: '#0D0B1F' },
  gradientBg: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  headerSection: { height: 210, position: 'relative' },
  headerBackgroundImage: { position: 'absolute', width: '100%', height: '100%' },
  headerGradient: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, paddingTop: 20 },
  backButtonInCard: { position: 'absolute', top: 20, left: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.66)', justifyContent: 'center', alignItems: 'center' },
  title: { color: '#FFFFFF', fontSize: 34, fontWeight: '700', textAlign: 'center', marginBottom: 10 },
  subtitle: { color: 'rgba(255,255,255,0.82)', fontSize: 16, lineHeight: 24, textAlign: 'center', maxWidth: 300 },
  content: { paddingHorizontal: 20, paddingTop: 18 },
  section: { marginBottom: 22 },
  sectionTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '700', marginBottom: 12 },
  sectionText: { color: 'rgba(255,255,255,0.76)', lineHeight: 24, fontSize: 15 },
  featureItem: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 12 },
  featureContent: { flex: 1, marginLeft: 12 },
  featureTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', marginBottom: 4 },
  featureDesc: { color: 'rgba(255,255,255,0.72)', lineHeight: 21 },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  tipText: { flex: 1, color: '#FFFFFF', marginLeft: 10, lineHeight: 21 },
  startButton: { marginHorizontal: 20, height: 56, borderRadius: 18, backgroundColor: '#C5A100', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', marginTop: 4 },
  startButtonText: { color: '#0D0B1F', fontWeight: '800', fontSize: 16, marginLeft: 10 },
  bannerAdContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#0D0B1F' },
});
