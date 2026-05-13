import React from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { fontStyles } from '../utils/fontStyles';

export default function FortuneInfoSheet({
  visible,
  onClose,
  title,
  subtitle,
  sections = [],
  tips = [],
  accentColor = '#C5A100',
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <View style={styles.sheetWrap}>
          <LinearGradient
            colors={['#171327', '#201B34', '#2A243F']}
            style={styles.sheet}
          >
            <View style={styles.handle} />

            <View style={styles.header}>
              <View style={styles.headerIconWrap}>
                <Ionicons name="sparkles" size={18} color={accentColor} />
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.title}>{title}</Text>
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

              {sections.map((section, index) => (
                <View key={`${section.title}-${index}`} style={styles.sectionCard}>
                  <View style={styles.sectionHeader}>
                    <Ionicons
                      name={section.icon || 'information-circle-outline'}
                      size={18}
                      color={accentColor}
                    />
                    <Text style={styles.sectionTitle}>{section.title}</Text>
                  </View>
                  <Text style={styles.sectionBody}>{section.body}</Text>
                </View>
              ))}

              {tips.length ? (
                <View style={styles.tipsCard}>
                  <Text style={styles.tipsTitle}>İpuçları</Text>
                  {tips.map((tip, index) => (
                    <View key={`${tip}-${index}`} style={styles.tipRow}>
                      <Ionicons name="checkmark-circle" size={16} color={accentColor} />
                      <Text style={styles.tipText}>{tip}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </ScrollView>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 6, 16, 0.6)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetWrap: {
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  sheet: {
    maxHeight: '82%',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(197,161,0,0.16)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.28,
    shadowRadius: 22,
    elevation: 16,
  },
  handle: {
    alignSelf: 'center',
    width: 54,
    height: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 12,
  },
  headerIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(197,161,0,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(197,161,0,0.18)',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 24,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    marginBottom: 8,
    ...fontStyles.headingBold,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 18,
    ...fontStyles.body,
  },
  sectionCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 10,
    ...fontStyles.bodyBold,
  },
  sectionBody: {
    color: 'rgba(255,255,255,0.76)',
    fontSize: 14,
    lineHeight: 22,
    ...fontStyles.body,
  },
  tipsCard: {
    backgroundColor: 'rgba(197,161,0,0.08)',
    borderRadius: 18,
    padding: 16,
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(197,161,0,0.12)',
  },
  tipsTitle: {
    color: '#C5A100',
    fontSize: 16,
    marginBottom: 12,
    ...fontStyles.bodyBold,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  tipText: {
    flex: 1,
    marginLeft: 10,
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 21,
    ...fontStyles.body,
  },
});
