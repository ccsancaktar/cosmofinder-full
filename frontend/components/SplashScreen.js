import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated, StatusBar, Platform } from 'react-native';
import Logo from './Logo';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="#0D0B1F"
        translucent={Platform.OS === 'android'}
        hidden={false}
      />
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Logo size="xxLarge" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0B1F',
    justifyContent: 'center',
    alignItems: 'center',
    width: width,
    height: height,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
