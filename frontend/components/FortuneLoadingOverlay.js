import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Modal, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

const RUNE_SYMBOLS = ['ᚠ', 'ᚢ', 'ᚱ'];
const KABALA_NODES = [
  { top: '15%', left: '50%' },
  { top: '31%', left: '30%' },
  { top: '31%', left: '70%' },
  { top: '49%', left: '50%' },
  { top: '67%', left: '34%' },
  { top: '67%', left: '66%' },
];

const CHINESE_ELEMENTS = [
  { icon: 'leaf', color: '#79D163' },
  { icon: 'flame', color: '#FF8A4C' },
  { icon: 'water', color: '#58B6FF' },
  { icon: 'diamond', color: '#E8E8E8' },
  { icon: 'earth', color: '#F5D06A' },
];

const THEMES = {
  tarot: {
    colors: ['#0D0B1F', '#1B1B2F', '#2A2A3F'],
    accent: '#F5D06A',
    accentSoft: 'rgba(245, 208, 106, 0.18)',
  },
  yildizname: {
    colors: ['#0D0B1F', '#1B1B2F', '#2A2A3F'],
    accent: '#C5A100',
    accentSoft: 'rgba(197, 161, 0, 0.18)',
  },
  coffee: {
    colors: ['#0D0B1F', '#1B1B2F', '#2A2A3F'],
    accent: '#D8B07A',
    accentSoft: 'rgba(216, 176, 122, 0.16)',
  },
  rune: {
    colors: ['#0D0B1F', '#1B1B2F', '#2A2A3F'],
    accent: '#B494FF',
    accentSoft: 'rgba(180, 148, 255, 0.16)',
  },
  chinese: {
    colors: ['#0D0B1F', '#1B1B2F', '#2A2A3F'],
    accent: '#E9C15F',
    accentSoft: 'rgba(233, 193, 95, 0.18)',
  },
  kabala: {
    colors: ['#0D0B1F', '#1B1B2F', '#2A2A3F'],
    accent: '#8A4FFF',
    accentSoft: 'rgba(138, 79, 255, 0.18)',
  },
  daily: {
    colors: ['#0D0B1F', '#1B1B2F', '#2A2A3F'],
    accent: '#C5A100',
    accentSoft: 'rgba(197, 161, 0, 0.18)',
  },
  numerology: {
    colors: ['#0D0B1F', '#1B1B2F', '#2A2A3F'],
    accent: '#C5A100',
    accentSoft: 'rgba(138, 79, 255, 0.16)',
  },
  compatibility: {
    colors: ['#0D0B1F', '#1B1B2F', '#2A2A3F'],
    accent: '#E4BE56',
    accentSoft: 'rgba(228, 190, 86, 0.16)',
  },
  angelNumbers: {
    colors: ['#0D0B1F', '#1B1B2F', '#2A2A3F'],
    accent: '#F5D06A',
    accentSoft: 'rgba(245, 208, 106, 0.16)',
  },
};

const LOADING_COPY_KEYS = {
  tarot: 'tarot',
  yildizname: 'yildizname',
  coffee: 'coffee',
  rune: 'rune',
  chinese: 'chinese',
  kabala: 'kabala',
  daily: 'daily',
  numerology: 'numerology',
  compatibility: 'compatibility',
  angelNumbers: 'angelNumbers',
};

function Backdrop({ accent, drift, shimmer }) {
  return (
    <View style={styles.backdropLayer} pointerEvents="none">
      <Animated.View
        style={[
          styles.orb,
          styles.orbLeft,
          {
            backgroundColor: accent,
            opacity: drift.interpolate({ inputRange: [0, 1], outputRange: [0.1, 0.22] }),
            transform: [
              { translateX: drift.interpolate({ inputRange: [0, 1], outputRange: [-12, 18] }) },
              { translateY: drift.interpolate({ inputRange: [0, 1], outputRange: [0, -18] }) },
              { scale: drift.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1.06] }) },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.orb,
          styles.orbRight,
          {
            backgroundColor: accent,
            opacity: shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.08, 0.16] }),
            transform: [
              { translateX: shimmer.interpolate({ inputRange: [0, 1], outputRange: [20, -14] }) },
              { translateY: shimmer.interpolate({ inputRange: [0, 1], outputRange: [12, -12] }) },
              { scale: shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1.08] }) },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.gridGlow,
          {
            opacity: shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.05, 0.12] }),
          },
        ]}
      />
    </View>
  );
}

function TarotAnimation({ pulse, spin, accent }) {
  return (
    <View style={styles.tarotStage}>
      {[0, 1, 2].map((idx) => {
        const isCenter = idx === 1;
        const sideOffset = idx === 0 ? -58 : idx === 2 ? 58 : 0;
        const sideTilt = idx === 0 ? '-14deg' : idx === 2 ? '14deg' : '0deg';
        return (
          <Animated.View
            key={idx}
            style={[
              styles.tarotCard,
              isCenter && styles.tarotCenterCard,
              {
                borderColor: isCenter ? accent : 'rgba(255,255,255,0.08)',
                opacity: isCenter ? 1 : 0.82,
                transform: [
                  { translateX: sideOffset },
                  {
                    translateY: pulse.interpolate({
                      inputRange: [0, 1],
                      outputRange: isCenter ? [4, -10] : [12, 6],
                    }),
                  },
                  {
                    rotate: isCenter
                      ? spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] })
                      : sideTilt,
                  },
                  {
                    scale: pulse.interpolate({
                      inputRange: [0, 1],
                      outputRange: isCenter ? [0.98, 1.04] : [1, 1.01],
                    }),
                  },
                ],
              },
            ]}
          >
            <LinearGradient colors={['rgba(255,255,255,0.04)', 'rgba(255,255,255,0.01)']} style={styles.tarotFace}>
              <View style={[styles.tarotSigil, { borderColor: accent }]}>
                <Ionicons name="sparkles" size={18} color={accent} />
              </View>
            </LinearGradient>
          </Animated.View>
        );
      })}
    </View>
  );
}

function YildiznameAnimation({ pulse, drift, accent }) {
  const stars = [
    { top: '18%', left: '20%' },
    { top: '34%', left: '42%' },
    { top: '28%', left: '74%' },
    { top: '58%', left: '60%' },
    { top: '64%', left: '26%' },
  ];

  return (
    <View style={styles.constellationStage}>
      <Animated.View
        style={[
          styles.constellationAura,
          {
            backgroundColor: accent,
            opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.08, 0.18] }),
            transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1.06] }) }],
          },
        ]}
      />
      {stars.map((star, idx) => (
        <Animated.View
          key={`${star.top}-${star.left}`}
          style={[
            styles.starDot,
            {
              top: star.top,
              left: star.left,
              backgroundColor: accent,
              opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.45 + idx * 0.06, 1] }),
              transform: [
                {
                  scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.25] }),
                },
                {
                  translateY: drift.interpolate({ inputRange: [0, 1], outputRange: [idx % 2 === 0 ? 2 : -2, idx % 2 === 0 ? -6 : 6] }),
                },
              ],
            },
          ]}
        />
      ))}
      <View style={[styles.constellationLine, { top: '30%', left: '24%', width: 80, transform: [{ rotate: '16deg' }], backgroundColor: accent }]} />
      <View style={[styles.constellationLine, { top: '39%', left: '43%', width: 66, transform: [{ rotate: '-20deg' }], backgroundColor: accent }]} />
      <View style={[styles.constellationLine, { top: '53%', left: '33%', width: 74, transform: [{ rotate: '28deg' }], backgroundColor: accent }]} />
    </View>
  );
}

function CoffeeAnimation({ rise, drift, accent }) {
  return (
    <View style={styles.coffeeStage}>
      <Animated.View
        style={[
          styles.coffeeAura,
          {
            backgroundColor: accent,
            opacity: rise.interpolate({ inputRange: [0, 1], outputRange: [0.08, 0.16] }),
            transform: [{ scale: rise.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1.08] }) }],
          },
        ]}
      />
      <View style={styles.coffeeSaucer} />
      <View style={styles.coffeeCup}>
        <LinearGradient colors={['#EAD8B8', '#A77A54']} style={styles.coffeeCupInner} />
        <View style={styles.coffeeHandle} />
      </View>
      {[0, 1, 2].map((idx) => (
        <Animated.View
          key={idx}
          style={[
            styles.steam,
            {
              left: `${40 + idx * 9}%`,
              opacity: rise.interpolate({ inputRange: [0, 1], outputRange: [0.12, 0.62] }),
              transform: [
                { translateY: rise.interpolate({ inputRange: [0, 1], outputRange: [8 + idx * 6, -44 - idx * 4] }) },
                { translateX: drift.interpolate({ inputRange: [0, 1], outputRange: [idx % 2 === 0 ? -4 : 4, idx % 2 === 0 ? 10 : -10] }) },
                { scaleY: rise.interpolate({ inputRange: [0, 1], outputRange: [0.88, 1.12] }) },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

function RuneAnimation({ pulse, drift, accent }) {
  return (
    <View style={styles.runeStage}>
      {RUNE_SYMBOLS.map((symbol, idx) => (
        <Animated.Text
          key={symbol}
          style={[
            styles.runeSymbol,
            {
              color: accent,
              opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.28 + idx * 0.12, 0.95] }),
              transform: [
                { translateY: drift.interpolate({ inputRange: [0, 1], outputRange: [idx * 6, -idx * 6] }) },
                { scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1.08] }) },
              ],
            },
          ]}
        >
          {symbol}
        </Animated.Text>
      ))}
    </View>
  );
}

function ChineseAnimation({ spin, pulse }) {
  return (
    <View style={styles.elementStage}>
      {CHINESE_ELEMENTS.map((item, idx) => (
        <Animated.View
          key={item.icon}
          style={[
            styles.elementOrbit,
            {
              transform: [
                { rotate: spin.interpolate({ inputRange: [0, 1], outputRange: [`${idx * 72}deg`, `${360 + idx * 72}deg`] }) },
              ],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.elementBadge,
              {
                backgroundColor: item.color,
                transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1.08] }) }],
              },
            ]}
          >
            <Ionicons name={item.icon} size={16} color="#0D0B1F" />
          </Animated.View>
        </Animated.View>
      ))}
      <Animated.View
        style={[
          styles.elementCore,
          {
            transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1.08] }) }],
          },
        ]}
      >
        <Ionicons name="sparkles" size={22} color="#F5D06A" />
      </Animated.View>
    </View>
  );
}

function KabalaAnimation({ pulse, accent }) {
  return (
    <View style={styles.kabalaStage}>
      <Animated.View
        style={[
          styles.kabalaAura,
          {
            backgroundColor: accent,
            opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.08, 0.18] }),
            transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1.08] }) }],
          },
        ]}
      />
      {KABALA_NODES.map((node, idx) => (
        <Animated.View
          key={`${node.top}-${node.left}`}
          style={[
            styles.kabalaNode,
            {
              top: node.top,
              left: node.left,
              backgroundColor: accent,
              opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.34 + idx * 0.06, 1] }),
              transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.16] }) }],
            },
          ]}
        />
      ))}
      <View style={[styles.kabalaLine, { top: '23%', left: '38%', width: 54, backgroundColor: accent }]} />
      <View style={[styles.kabalaLine, { top: '38%', left: '35%', width: 88, transform: [{ rotate: '20deg' }], backgroundColor: accent }]} />
      <View style={[styles.kabalaLine, { top: '56%', left: '40%', width: 60, transform: [{ rotate: '-14deg' }], backgroundColor: accent }]} />
    </View>
  );
}

function DailyAnimation({ pulse, spin, accent }) {
  return (
    <View style={styles.dailyStage}>
      {[0, 1, 2].map((idx) => (
        <Animated.View
          key={idx}
          style={[
            styles.dailyRing,
            {
              borderColor: accent,
              opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.14, 0.34] }),
              transform: [
                { rotate: spin.interpolate({ inputRange: [0, 1], outputRange: [`${idx * 18}deg`, `${360 + idx * 18}deg`] }) },
                { scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.82 + idx * 0.08, 1 + idx * 0.08] }) },
              ],
            },
          ]}
        />
      ))}
      <Animated.View
        style={[
          styles.dailyCore,
          {
            backgroundColor: 'rgba(245, 208, 106, 0.12)',
            borderColor: accent,
            transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1.08] }) }],
          },
        ]}
      >
        <Ionicons name="sunny" size={30} color={accent} />
      </Animated.View>
    </View>
  );
}

function NumerologyAnimation({ pulse, spin, accent }) {
  const numbers = ['3', '7', '11', '22', '9'];
  return (
    <View style={styles.numerologyStage}>
      <Animated.View
        style={[
          styles.numerologyCore,
          {
            borderColor: accent,
            transform: [
              { scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1.08] }) },
              { rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) },
            ],
          },
        ]}
      />
      {numbers.map((number, idx) => (
        <Animated.View
          key={number}
          style={[
            styles.numerologyOrbit,
            {
              transform: [
                {
                  rotate: spin.interpolate({
                    inputRange: [0, 1],
                    outputRange: [`${idx * 72}deg`, `${360 + idx * 72}deg`],
                  }),
                },
              ],
            },
          ]}
        >
          <Animated.Text
            style={[
              styles.numerologyDigit,
              {
                color: accent,
                opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.42, 1] }),
                transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1.12] }) }],
              },
            ]}
          >
            {number}
          </Animated.Text>
        </Animated.View>
      ))}
      <Animated.View
        style={[
          styles.numerologyCenterBadge,
          {
            backgroundColor: 'rgba(197, 161, 0, 0.14)',
            borderColor: accent,
            transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1.08] }) }],
          },
        ]}
      >
        <Ionicons name="grid" size={24} color={accent} />
      </Animated.View>
    </View>
  );
}

function CompatibilityAnimation({ pulse, drift, accent }) {
  return (
    <View style={styles.compatibilityStage}>
      <Animated.View
        style={[
          styles.compatibilityOrb,
          styles.compatibilityOrbLeft,
          {
            backgroundColor: accent,
            opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.16, 0.3] }),
            transform: [
              { translateX: drift.interpolate({ inputRange: [0, 1], outputRange: [-18, -2] }) },
              { scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1.04] }) },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.compatibilityOrb,
          styles.compatibilityOrbRight,
          {
            backgroundColor: '#8A4FFF',
            opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.16, 0.3] }),
            transform: [
              { translateX: drift.interpolate({ inputRange: [0, 1], outputRange: [18, 2] }) },
              { scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1.04] }) },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.compatibilityCore,
          {
            borderColor: accent,
            transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1.08] }) }],
          },
        ]}
      >
        <Ionicons name="heart-half" size={26} color={accent} />
      </Animated.View>
    </View>
  );
}

function AngelNumbersAnimation({ pulse, spin, accent }) {
  const digits = ['1', '4', '7'];
  return (
    <View style={styles.angelStage}>
      {[0, 1, 2].map((idx) => (
        <Animated.View
          key={idx}
          style={[
            styles.angelRing,
            {
              borderColor: accent,
              opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.14, 0.3] }),
              transform: [
                { rotate: spin.interpolate({ inputRange: [0, 1], outputRange: [`${idx * 18}deg`, `${360 + idx * 18}deg`] }) },
                { scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.82 + idx * 0.08, 1 + idx * 0.08] }) },
              ],
            },
          ]}
        />
      ))}
      <View style={styles.angelDigitsRow}>
        {digits.map((digit, idx) => (
          <Animated.Text
            key={digit}
            style={[
              styles.angelDigit,
              {
                color: accent,
                opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.45 + idx * 0.1, 1] }),
                transform: [{ translateY: pulse.interpolate({ inputRange: [0, 1], outputRange: [2, -4] }) }],
              },
            ]}
          >
            {digit}
          </Animated.Text>
        ))}
      </View>
    </View>
  );
}

export default function FortuneLoadingOverlay({ visible, readingType }) {
  const { t } = useTranslation();
  const pulse = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(0)).current;
  const drift = useRef(new Animated.Value(0)).current;
  const subtitleFade = useRef(new Animated.Value(1)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const [lineIndex, setLineIndex] = useState(0);

  const theme = THEMES[readingType] || THEMES.tarot;
  const copyKey = LOADING_COPY_KEYS[readingType] || 'tarot';
  const copy = {
    badge: t(`loadingOverlay.${copyKey}.badge`),
    title: t(`loadingOverlay.${copyKey}.title`),
    lines: [
      t(`loadingOverlay.${copyKey}.line1`),
      t(`loadingOverlay.${copyKey}.line2`),
      t(`loadingOverlay.${copyKey}.line3`),
    ],
    footer: t('loadingOverlay.footer'),
  };

  useEffect(() => {
    if (!visible) return undefined;

    pulse.setValue(0);
    spin.setValue(0);
    rise.setValue(0);
    drift.setValue(0);
    progress.setValue(0);
    subtitleFade.setValue(1);
    setLineIndex(0);

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1450, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1450, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );

    const spinLoop = Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 5600, easing: Easing.linear, useNativeDriver: true })
    );

    const riseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(rise, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(rise, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );

    const driftLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, { toValue: 1, duration: 2600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(drift, { toValue: 0, duration: 2600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );

    const progressLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(progress, { toValue: 0.35, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );

    pulseLoop.start();
    spinLoop.start();
    riseLoop.start();
    driftLoop.start();
    progressLoop.start();

    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(subtitleFade, { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(subtitleFade, { toValue: 1, duration: 260, useNativeDriver: true }),
      ]).start();
      setLineIndex((prev) => (prev + 1) % copy.lines.length);
    }, 1900);

    return () => {
      clearInterval(interval);
      pulseLoop.stop();
      spinLoop.stop();
      riseLoop.stop();
      driftLoop.stop();
      progressLoop.stop();
    };
  }, [visible, copy.lines.length, drift, progress, pulse, rise, spin, subtitleFade]);

  const animationNode = useMemo(() => {
    switch (readingType) {
      case 'yildizname':
        return <YildiznameAnimation pulse={pulse} drift={drift} accent={theme.accent} />;
      case 'coffee':
        return <CoffeeAnimation rise={rise} drift={drift} accent={theme.accent} />;
      case 'rune':
        return <RuneAnimation pulse={pulse} drift={drift} accent={theme.accent} />;
      case 'chinese':
        return <ChineseAnimation spin={spin} pulse={pulse} />;
      case 'kabala':
        return <KabalaAnimation pulse={pulse} accent={theme.accent} />;
      case 'daily':
        return <DailyAnimation pulse={pulse} spin={spin} accent={theme.accent} />;
      case 'numerology':
        return <NumerologyAnimation pulse={pulse} spin={spin} accent={theme.accent} />;
      case 'compatibility':
        return <CompatibilityAnimation pulse={pulse} drift={drift} accent={theme.accent} />;
      case 'angelNumbers':
        return <AngelNumbersAnimation pulse={pulse} spin={spin} accent={theme.accent} />;
      case 'tarot':
      default:
        return <TarotAnimation pulse={pulse} spin={spin} accent={theme.accent} />;
    }
  }, [drift, pulse, readingType, rise, spin, theme.accent]);

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.root}>
        <LinearGradient colors={theme.colors} style={styles.fullscreenGradient}>
          <Backdrop accent={theme.accent} drift={drift} shimmer={pulse} />

          <View style={styles.content}>
            <View style={[styles.badge, { borderColor: theme.accentSoft, backgroundColor: theme.accentSoft }]}>
              <View style={[styles.badgeDot, { backgroundColor: theme.accent }]} />
              <Text style={styles.badgeText}>{copy.badge}</Text>
            </View>

            <View style={styles.heroBlock}>
              <Text style={styles.title}>{copy.title}</Text>
              <Animated.Text style={[styles.subtitle, { opacity: subtitleFade }]}>
                {copy.lines[lineIndex]}
              </Animated.Text>
            </View>

            <View style={styles.animationShell}>
              <LinearGradient
                colors={['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.02)']}
                style={[styles.animationFrame, { borderColor: theme.accentSoft }]}
              >
                <Animated.View
                  style={[
                    styles.animationGlow,
                    {
                      backgroundColor: theme.accent,
                      opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.06, 0.16] }),
                      transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1.06] }) }],
                    },
                  ]}
                />
                {animationNode}
              </LinearGradient>
            </View>

            <View style={styles.footerBlock}>
              <View style={styles.progressTrack}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: theme.accent,
                      transform: [{ scaleX: progress }],
                    },
                  ]}
                />
              </View>
              <Text style={styles.footerText}>{copy.footer}</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  fullscreenGradient: {
    flex: 1,
  },
  backdropLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 999,
  },
  orbLeft: {
    top: 92,
    left: -90,
  },
  orbRight: {
    right: -80,
    bottom: 160,
  },
  gridGlow: {
    position: 'absolute',
    top: '24%',
    left: '-20%',
    right: '-20%',
    height: 240,
    borderRadius: 240,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  content: {
    flex: 1,
    paddingTop: 88,
    paddingBottom: 54,
    paddingHorizontal: 28,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  heroBlock: {
    alignItems: 'center',
    marginTop: 22,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: 12,
    maxWidth: 320,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(255,255,255,0.76)',
    textAlign: 'center',
    maxWidth: 300,
    minHeight: 48,
  },
  animationShell: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  animationFrame: {
    width: '100%',
    maxWidth: 360,
    minHeight: 340,
    borderRadius: 34,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  animationGlow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 999,
  },
  footerBlock: {
    width: '100%',
  },
  progressTrack: {
    width: '100%',
    height: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressFill: {
    flex: 1,
  },
  footerText: {
    fontSize: 14,
    lineHeight: 21,
    color: 'rgba(255,255,255,0.56)',
    textAlign: 'center',
  },
  tarotStage: {
    width: 240,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tarotCard: {
    position: 'absolute',
    width: 96,
    height: 142,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    backgroundColor: 'rgba(12,12,22,0.88)',
  },
  tarotCenterCard: {
    zIndex: 4,
  },
  tarotFace: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tarotSigil: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  constellationStage: {
    width: 250,
    height: 210,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  constellationAura: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
  },
  starDot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: -5,
    marginTop: -5,
  },
  constellationLine: {
    position: 'absolute',
    height: 1,
    opacity: 0.45,
  },
  coffeeStage: {
    width: 240,
    height: 220,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  coffeeAura: {
    position: 'absolute',
    bottom: 18,
    width: 170,
    height: 170,
    borderRadius: 85,
  },
  coffeeSaucer: {
    width: 148,
    height: 18,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginBottom: -8,
  },
  coffeeCup: {
    width: 126,
    height: 92,
    borderRadius: 22,
    overflow: 'visible',
    borderWidth: 6,
    borderColor: '#5A3726',
    backgroundColor: '#EAD8B8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coffeeCupInner: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  coffeeHandle: {
    position: 'absolute',
    right: -18,
    top: 24,
    width: 24,
    height: 36,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    borderWidth: 5,
    borderLeftWidth: 0,
    borderColor: '#5A3726',
  },
  steam: {
    position: 'absolute',
    bottom: 92,
    width: 12,
    height: 54,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.42)',
  },
  runeStage: {
    width: 250,
    height: 210,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  runeSymbol: {
    fontSize: 56,
    fontWeight: '700',
  },
  elementStage: {
    width: 240,
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
  },
  elementOrbit: {
    position: 'absolute',
    width: 170,
    height: 170,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  elementBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  elementCore: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(245, 208, 106, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 208, 106, 0.22)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  kabalaStage: {
    width: 250,
    height: 220,
    position: 'relative',
  },
  kabalaAura: {
    position: 'absolute',
    top: 30,
    left: 50,
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  kabalaNode: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    marginLeft: -7,
    marginTop: -7,
  },
  kabalaLine: {
    position: 'absolute',
    height: 1,
    opacity: 0.45,
  },
  dailyStage: {
    width: 240,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numerologyStage: {
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dailyCore: {
    width: 86,
    height: 86,
    borderRadius: 43,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    zIndex: 4,
  },
  dailyRing: {
    position: 'absolute',
    width: 132,
    height: 132,
    borderRadius: 66,
    borderWidth: 1,
  },
  numerologyCore: {
    position: 'absolute',
    width: 168,
    height: 168,
    borderRadius: 84,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  numerologyOrbit: {
    position: 'absolute',
    width: 176,
    height: 176,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  numerologyDigit: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 1,
  },
  numerologyCenterBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compatibilityStage: {
    width: 230,
    height: 210,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compatibilityOrb: {
    position: 'absolute',
    width: 92,
    height: 92,
    borderRadius: 46,
  },
  compatibilityOrbLeft: {
    left: 48,
  },
  compatibilityOrbRight: {
    right: 48,
  },
  compatibilityCore: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  angelStage: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  angelRing: {
    position: 'absolute',
    width: 136,
    height: 136,
    borderRadius: 68,
    borderWidth: 1,
  },
  angelDigitsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  angelDigit: {
    fontSize: 32,
    fontWeight: '800',
    marginHorizontal: 8,
    letterSpacing: 1,
  },
});
