import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// SVG imports
import AriesSvg from '../assets/zodiacs/Aries.svg';
import TaurusSvg from '../assets/zodiacs/Taurus.svg';
import GeminiSvg from '../assets/zodiacs/Gemini.svg';
import CancerSvg from '../assets/zodiacs/Cancer.svg';
import LeoSvg from '../assets/zodiacs/Leo.svg';
import VirgoSvg from '../assets/zodiacs/Virgo.svg';
import LibraSvg from '../assets/zodiacs/Libra.svg';
import ScorpioSvg from '../assets/zodiacs/Scorpio.svg';
import SagittariusSvg from '../assets/zodiacs/Sagittarius.svg';
import CapricornSvg from '../assets/zodiacs/Capricorn.svg';
import AquariusSvg from '../assets/zodiacs/Aquarius.svg';
import PiscesSvg from '../assets/zodiacs/Pisces.svg';

const ZodiacIcon = React.memo(({ zodiacSign, size = 24, color = '#C5A100' }) => {
  // Zodiac SVG mapping'ini useMemo ile optimize et
  const zodiacSvgs = useMemo(() => ({
    'Koç': AriesSvg,
    'Boğa': TaurusSvg,
    'İkizler': GeminiSvg,
    'Yengeç': CancerSvg,
    'Aslan': LeoSvg,
    'Başak': VirgoSvg,
    'Terazi': LibraSvg,
    'Akrep': ScorpioSvg,
    'Yay': SagittariusSvg,
    'Oğlak': CapricornSvg,
    'Kova': AquariusSvg,
    'Balık': PiscesSvg
  }), []);

  // Fallback icon mapping
  const fallbackIcons = useMemo(() => ({
    'Koç': 'flame',
    'Boğa': 'leaf',
    'İkizler': 'people',
    'Yengeç': 'water',
    'Aslan': 'sunny',
    'Başak': 'flower',
    'Terazi': 'scale',
    'Akrep': 'bug',
    'Yay': 'arrow-up',
    'Oğlak': 'mountain',
    'Kova': 'water',
    'Balık': 'fish'
  }), []);

  // SVG component'ini useMemo ile optimize et
  const ZodiacSvg = useMemo(() => {
    return zodiacSvgs[zodiacSign] || null;
  }, [zodiacSign, zodiacSvgs]);

  // Style'ı useMemo ile optimize et
  const containerStyle = useMemo(() => ({
    width: size,
    height: size,
    alignItems: 'center',
    justifyContent: 'center'
  }), [size]);

  const svgStyle = useMemo(() => ({
    color: color
  }), [color]);
  
  // SVG yoksa fallback icon kullan
  if (!ZodiacSvg) {
    const fallbackIcon = fallbackIcons[zodiacSign] || 'star';
    return (
      <View style={containerStyle}>
        <Ionicons name={fallbackIcon} size={size} color={color} />
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      <ZodiacSvg width={size} height={size} style={svgStyle} />
    </View>
  );
});

// Display name ekle (debug için)
ZodiacIcon.displayName = 'ZodiacIcon';

export default ZodiacIcon; 