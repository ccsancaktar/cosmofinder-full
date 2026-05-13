import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, StyleSheet, Animated, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const LazyImage = ({
  source,
  style,
  resizeMode = 'cover',
  onLoad,
  onError,
  showPlaceholder = true,
  fadeInDuration = 180,
  ...props
}) => {
  const isLocalAsset = useMemo(() => typeof source === 'number', [source]);
  const [isLoaded, setIsLoaded] = useState(isLocalAsset);
  const [hasError, setHasError] = useState(false);
  const fadeAnim = useRef(new Animated.Value(isLocalAsset ? 1 : 0)).current;

  useEffect(() => {
    setHasError(false);
    setIsLoaded(isLocalAsset);
    fadeAnim.setValue(isLocalAsset ? 1 : 0);
  }, [fadeAnim, isLocalAsset, source]);

  useEffect(() => {
    if (isLoaded && !hasError && !isLocalAsset) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: fadeInDuration,
        useNativeDriver: true,
      }).start();
    }
  }, [isLoaded, hasError, fadeAnim, fadeInDuration, isLocalAsset]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = (error) => {
    setHasError(true);
    onError?.(error);
  };

  if (hasError) {
    return (
      <View style={[styles.placeholder, style]}>
        <Ionicons name="image-outline" size={32} color="#8D7A3A" />
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {/* Placeholder */}
      {showPlaceholder && !isLoaded && !isLocalAsset && (
        <View style={[styles.placeholder, style]}>
          <Ionicons name="image-outline" size={32} color="#8D7A3A" />
        </View>
      )}

      {/* Actual Image */}
      <Animated.View
        style={[
          styles.imageContainer,
          { opacity: fadeAnim },
          isLoaded && styles.imageLoaded
        ]}
      >
        <Image
          source={source}
          style={[styles.image, style]}
          resizeMode={resizeMode}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  placeholder: {
    backgroundColor: '#171428',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  imageContainer: {
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageLoaded: {
    // Normal position
  },
});

export default LazyImage;
