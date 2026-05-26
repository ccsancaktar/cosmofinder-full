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
          <Ionicons name="person" size={14} color={mode === 'self' ? '#0D0B1F' : '#C5A100'} />
          <Text style={[styles.segmentText, mode === 'self' && styles.segmentTextActive]}>{selfLabel}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentButton, mode === 'other' && styles.segmentButtonActive]}
          onPress={() => onChangeMode('other')}
          activeOpacity={0.9}
        >
          <Ionicons name="people" size={14} color={mode === 'other' ? '#0D0B1F' : '#C5A100'} />
          <Text style={[styles.segmentText, mode === 'other' && styles.segmentTextActive]}>{otherLabel}</Text>
        </TouchableOpacity>
      </View>

      {mode === 'self' ? (
        <Animated.View
          style={[
            styles.summaryCard,
            canUseProfile && styles.summaryCardReady,
            !canUseProfile && styles.summaryCardWarning,
            {
              opacity: summaryOpacity,
              transform: [{ translateY: summaryTranslate }],
            },
          ]}
        >
          <View style={styles.summaryHeader}>
            <View style={[styles.summaryIcon, !canUseProfile && styles.summaryIconWarning]}>
              <Ionicons name={canUseProfile ? 'checkmark' : 'alert'} size={16} color={canUseProfile ? '#7DD36E' : '#F4B45F'} />
            </View>
            <View style={styles.summaryHeaderCopy}>
              {!canUseProfile ? <Text style={styles.summaryTitle}>{summaryTitle}</Text> : null}
              <Text style={[styles.summaryDescription, canUseProfile && styles.summaryDescriptionReady]}>
                {canUseProfile ? summaryDescription : missingMessage}
              </Text>
            </View>
          </View>

          {!canUseProfile && onPrimaryAction && primaryActionLabel ? (
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
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24,
    padding: 20,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(197,161,0,0.10)',
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 24,
    color: 'rgba(255,255,255,0.70)',
    marginBottom: 18,
  },
  segmentWrap: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.035)',
    borderRadius: 18,
    padding: 5,
  },
  segmentButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  segmentButtonActive: {
    backgroundColor: '#C5A100',
  },
  segmentText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  segmentTextActive: {
    color: '#0D0B1F',
  },
  summaryCard: {
    marginTop: 14,
    backgroundColor: 'rgba(13,11,31,0.58)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(197,161,0,0.10)',
  },
  summaryCardReady: {
    backgroundColor: 'rgba(125,211,110,0.08)',
    borderColor: 'rgba(125,211,110,0.30)',
  },
  summaryCardWarning: {
    backgroundColor: 'rgba(13,11,31,0.58)',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  summaryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(125,211,110,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  summaryIconWarning: {
    backgroundColor: 'rgba(244,180,95,0.14)',
  },
  summaryHeaderCopy: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  summaryDescription: {
    fontSize: 14,
    lineHeight: 21,
    color: 'rgba(255,255,255,0.66)',
  },
  summaryDescriptionReady: {
    color: '#E8F5E9',
  },
  primaryActionButton: {
    marginTop: 16,
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: '#C5A100',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primaryActionText: {
    color: '#0D0B1F',
    fontSize: 16,
    fontWeight: '800',
  },
});

export default ReadingModeCard;
