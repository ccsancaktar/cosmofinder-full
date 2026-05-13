import React from 'react';
import { Image, StyleSheet } from 'react-native';

const TokenIcon = ({ size = 16, style, ...props }) => {
  return (
    <Image
      source={require('../assets/token.png')}
      style={[
        styles.icon,
        { width: size, height: size },
        style
      ]}
      resizeMode="contain"
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  icon: {
    // Default styles for the token icon
  },
});

export default TokenIcon;
