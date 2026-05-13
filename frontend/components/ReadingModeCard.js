import React, { useEffect, useRef } from 'react';
import { Animated, LayoutAnimation, Platform, StyleSheet, Text, TouchableOpacity, UIManager, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ReadingModeCard = ({
  title,
  subtitle,
  mode,
  onChangeMode,
  selfLabel,
  otherLabel,
  summaryTitle,
  summaryDescription,
  summaryItems = [],
  canUseProfile = true,
  missingMessage,
  onPrimaryAction,
  primaryActionLabel,
  badgeLabel = 'Profil özeti',
}) => {
  const summaryOpacity = useRef(new Animated.Value(mode === 'self' ? 1 : 0)).current;
  const summaryTranslate = useRef(new Animated.Value(mode === 'self' ? 0 : 12)).current;

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    if (mode === 'self') {
      Animated.parallel([
        Animated.timing(summaryOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(summaryTranslate, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(summaryOpacity, {
          toValue: 0,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.timing(summaryTranslate, {
          toValue: 12,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [mode, summaryOpacity, summaryTranslate]);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

      <View style={styles.segmentWrap}>
        <TouchableOpacity
          style={[styles.segmentButton, mode === 'self' && styles.segmentButtonActive]}
          onPress={() => onChangeMode('self')}
          activeOpacity={0.9}
        >
          <Ionicons name="person" size={16} color={mode === 'self' ? '#0D0B1F' : '#C5A100'} />
          <Text style={[styles.segmentText, mode === 'self' && styles.segmentTextActive]}>{selfLabel}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentButton, mode === 'other' && styles.segmentButtonActive]}
          onPress={() => onChangeMode('other')}
          activeOpacity={0.9}
        >
          <Ionicons name="people" size={16} color={mode === 'other' ? '#0D0B1F' : '#C5A100'} />
          <Text style={[styles.segmentText, mode === 'other' && styles.segmentTextActive]}>{otherLabel}</Text>
        </TouchableOpacity>
      </View>

      {mode === 'self' ? (
        <Animated.View
          style={[
            styles.summaryCard,
            {
              opacity: summaryOpacity,
              transform: [{ translateY: summaryTranslate }],
            },
          ]}
        >
          <View style={styles.summaryPill}>
            <Ionicons name="sparkles-outline" size={12} color="#C5A100" />
            <Text style={styles.summaryPillText}>{badgeLabel}</Text>
          </View>

          <View style={styles.summaryHeader}>
            <View style={styles.summaryIcon}>
              <Ionicons name="sparkles" size={16} color="#C5A100" />
            </View>
            <View style={styles.summaryHeaderCopy}>
              <Text style={styles.summaryTitle}>{summaryTitle}</Text>
              <Text style={styles.summaryDescription}>
                {canUseProfile ? summaryDescription : missingMessage}
              </Text>
            </View>
          </View>

          {canUseProfile ? (
            <View style={styles.summaryList}>
              {summaryItems.map((item) => (
                <View key={`${item.label}-${item.value || 'empty'}`} style={styles.summaryRow}>
                  <View style={styles.summaryLabelWrap}>
                    <Ionicons name={item.icon || 'ellipse'} size={16} color="#C5A100" />
                    <Text style={styles.summaryLabel}>{item.label}</Text>
                  </View>
                  <Text style={styles.summaryValue}>{item.value}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {onPrimaryAction && primaryActionLabel ? (
            <TouchableOpacity style={styles.primaryActionButton} onPress={onPrimaryAction} activeOpacity={0.9}>
              <Text style={styles.primaryActionText}>{primaryActionLabel}</Text>
              <Ionicons name="arrow-forward" size={16} color="#0D0B1F" />
            </TouchableOpacity>
          ) : null}
        </Animated.View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 22,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(197,161,0,0.12)',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: 'rgba(255,255,255,0.68)',
    marginBottom: 16,
  },
  segmentWrap: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    padding: 4,
  },
  segmentButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  segmentButtonActive: {
    backgroundColor: '#C5A100',
  },
  segmentText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: '#0D0B1F',
  },
  summaryCard: {
    marginTop: 16,
    backgroundColor: 'rgba(13,11,31,0.78)',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(197,161,0,0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 6,
  },
  summaryPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(197,161,0,0.12)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(197,161,0,0.16)',
  },
  summaryPillText: {
    color: '#C5A100',
    fontSize: 12,
    fontWeight: '700',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  summaryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(197,161,0,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  summaryHeaderCopy: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  summaryDescription: {
    fontSize: 13,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.68)',
  },
  summaryList: {
    marginTop: 14,
    gap: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  summaryLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: 13,
    marginLeft: 10,
  },
  summaryValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 12,
    maxWidth: '48%',
    textAlign: 'right',
  },
  primaryActionButton: {
    marginTop: 16,
    minHeight: 44,
    borderRadius: 14,
    backgroundColor: '#C5A100',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primaryActionText: {
    color: '#0D0B1F',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default ReadingModeCard;
