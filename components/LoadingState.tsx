import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Animated, Easing, Platform, StyleSheet, Text, View } from 'react-native';
import { ALL_MODES, MODE_META } from '../constants/modes';
import { colors, font, motion, radius, spacing } from '../constants/theme';

const useNativeDriver = Platform.OS !== 'web';

interface Props {
  title?: string;
  subtitle?: string;
}

export function LoadingState({
  title = 'Finding the best ways to travel...',
  subtitle = 'Comparing public transport, cabs, two-wheelers and carpools',
}: Props) {
  const [index, setIndex] = useState(0);
  const [pulse] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        // Slow, breath-like pulse rather than a busy spinner.
        Animated.timing(pulse, { toValue: 1, duration: motion.breathe, easing: Easing.inOut(Easing.sin), useNativeDriver }),
        Animated.timing(pulse, { toValue: 0, duration: motion.breathe, easing: Easing.inOut(Easing.sin), useNativeDriver }),
      ]),
    );
    loop.start();
    const t = setInterval(() => setIndex((i) => (i + 1) % ALL_MODES.length), motion.breathe);
    return () => {
      loop.stop();
      clearInterval(t);
    };
  }, [pulse]);

  const meta = MODE_META[ALL_MODES[index]];
  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] });

  return (
    <View style={styles.wrap} accessibilityRole="progressbar" accessibilityLabel={title}>
      <Animated.View style={[styles.halo, { transform: [{ scale }] }]}>
        <View style={[styles.iconCircle, { backgroundColor: meta.tintSoft }]}>
          <MaterialCommunityIcons name={meta.icon} size={34} color={meta.tint} />
        </View>
      </Animated.View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      <View style={styles.skeletons}>
        {[0, 1, 2].map((i) => (
          <Animated.View
            key={i}
            style={[styles.skeleton, { opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0.9] }) }]}
          >
            <View style={styles.skIcon} />
            <View style={{ flex: 1, gap: 8 }}>
              <View style={[styles.skLine, { width: '55%' }]} />
              <View style={[styles.skLine, { width: '80%' }]} />
            </View>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingTop: spacing.xxl, paddingHorizontal: spacing.xl },
  halo: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconCircle: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center' },
  title: { ...font.heading, fontSize: 18, color: colors.text, marginTop: spacing.xl, textAlign: 'center' },
  subtitle: { ...font.small, color: colors.textSecondary, marginTop: 6, textAlign: 'center' },
  skeletons: { alignSelf: 'stretch', marginTop: spacing.xxl, gap: spacing.md },
  skeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  skIcon: { width: 46, height: 46, borderRadius: 14, backgroundColor: colors.surfaceMuted },
  skLine: { height: 10, borderRadius: 5, backgroundColor: colors.surfaceMuted },
});
