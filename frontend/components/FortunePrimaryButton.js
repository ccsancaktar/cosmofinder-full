import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const FortunePrimaryButton = ({
  label,
  onPress,
  disabled = false,
  loading = false,
  loadingLabel,
  icon = 'sparkles',
  loadingIcon = 'hourglass',
  style,
}) => {
  const text = loading && loadingLabel ? loadingLabel : label;
  const iconName = loading ? loadingIcon : icon;
  const content = (
    <View style={[styles.inner, disabled && styles.innerDisabled]}>
      <Ionicons name={iconName} size={20} color={disabled ? 'rgba(255,255,255,0.55)' : '#FFFFFF'} />
      <Text style={[styles.text, disabled && styles.textDisabled]}>{text}</Text>
    </View>
  );

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      disabled={disabled}
      style={[styles.touchable, style]}
    >
      {disabled ? (
        <View style={[styles.disabledSurface, styles.surface]}>{content}</View>
      ) : (
        <LinearGradient colors={['#8A4FFF', '#A86BFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.surface}>
          {content}
        </LinearGradient>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    width: '100%',
    borderRadius: 18,
    overflow: 'hidden',
  },
  surface: {
    minHeight: 58,
    borderRadius: 18,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  disabledSurface: {
    backgroundColor: 'rgba(138,79,255,0.28)',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerDisabled: {
    opacity: 0.82,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    marginLeft: 10,
  },
  textDisabled: {
    color: 'rgba(255,255,255,0.65)',
  },
});

export default FortunePrimaryButton;
