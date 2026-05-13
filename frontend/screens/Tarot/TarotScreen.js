import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, SafeAreaView, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const TarotScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0B1F" />
      
      <LinearGradient
        colors={['#0D0B1F', '#1B1B2F', '#2A2A3F']}
        style={styles.gradientBg}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.headerSection}>
            <View style={styles.headerIcon}>
              <Ionicons name="card" size={40} color="#C5A100" />
            </View>
            <Text style={styles.title}>Tarot Falı</Text>
            <Text style={styles.subtitle}>
              Tarot kartları ile geleceğinizi keşfedin
            </Text>
          </View>

          <View style={styles.content}>
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>Tarot Falı Nedir?</Text>
              <Text style={styles.cardText}>
                Tarot falı, 78 karttan oluşan özel bir desteyle yapılan geleneksel bir fal türüdür. 
                Her kartın kendine özgü anlamı ve enerjisi vardır. Tarot kartları, geçmiş, şimdi ve 
                gelecek hakkında rehberlik sağlar.
              </Text>
            </View>

            <View style={styles.featuresCard}>
              <Text style={styles.featuresTitle}>Tarot Falının Özellikleri:</Text>
              
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color="#C5A100" />
                <Text style={styles.featureText}>
                  78 kartlık özel tarot destesi kullanılır
                </Text>
              </View>
              
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color="#C5A100" />
                <Text style={styles.featureText}>
                  Major ve Minor Arkana kartları
                </Text>
              </View>
              
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color="#C5A100" />
                <Text style={styles.featureText}>
                  Her kartın düz ve ters anlamı vardır
                </Text>
              </View>
              
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color="#C5A100" />
                <Text style={styles.featureText}>
                  Detaylı ve kapsamlı yorumlar
                </Text>
              </View>
              
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color="#C5A100" />
                <Text style={styles.featureText}>
                  Gelecek dönemler için rehberlik
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.infoButton}
              onPress={() => navigation.navigate('TarotBilgi')}
            >
              <Ionicons name="information-circle" size={24} color="#FFFFFF" />
              <Text style={styles.infoButtonText}>Tarot Hakkında Bilgi</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.startButton}
              onPress={() => navigation.navigate('TarotForm')}
            >
              <Ionicons name="play" size={24} color="#FFFFFF" />
              <Text style={styles.startButtonText}>Tarot Falına Başla</Text>
            </TouchableOpacity>

            <View style={styles.warningCard}>
              <Ionicons name="warning" size={16} color="#F59E0B" />
              <Text style={styles.warningText}>
                Tarot falı eğlence amaçlıdır ve gerçek hayat kararlarınızı etkilememelidir.
              </Text>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

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
  headerSection: {
    padding: 24,
    alignItems: 'center',
    marginTop: 16,
  },
  headerIcon: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 32,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#C5A100',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 22,
  },
  content: {
    padding: 24,
  },
  infoCard: {
    backgroundColor: '#1B1B2F',
    padding: 24,
    borderRadius: 20,
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#C5A100',
    marginBottom: 16,
  },
  cardText: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 22,
  },
  featuresCard: {
    backgroundColor: '#1B1B2F',
    padding: 24,
    borderRadius: 20,
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#C5A100',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 16,
    color: '#fff',
    flex: 1,
    marginLeft: 8,
    lineHeight: 22,
  },
  infoButton: {
    backgroundColor: '#1B1B2F',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  infoButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  startButton: {
    backgroundColor: '#8A4FFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#8A4FFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  warningCard: {
    backgroundColor: '#2A2A3F',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  warningText: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'left',
    flex: 1,
    marginLeft: 8,
    lineHeight: 20,
  },
});

export default TarotScreen; 