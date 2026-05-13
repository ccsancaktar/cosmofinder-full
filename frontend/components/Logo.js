import React from 'react';
import { View, Text, Image, StyleSheet, Platform } from 'react-native';

export default function Logo({ size = 'medium' }) {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          logoImage: { width: 80, height: 20 }
        };
      case 'medium':
        return {
          logoImage: { width: 120, height: 30 }
        };
      case 'large':
        return {
          logoImage: { width: 160, height: 40 }
        };
      case 'xLarge':
        return {
          logoImage: { width: 200, height: 50 }
        };
      case 'xxLarge':
        return {
          logoImage: { width: 280, height: 70 }
        };
      default:
        return {
          logoImage: { width: 120, height: 30 }
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <View style={styles.logoContainer}>
      <Image 
        source={require('../assets/CosmoFinder-long.png')} 
        style={[styles.logoImage, sizeStyles.logoImage]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  logoImage: {
    // Base styles - size will be overridden by getSizeStyles
  },

});
