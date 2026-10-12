import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MODE_META, TRADE_OFF_STYLE } from '../constants/modes';
import { colors, font, radius, shadow, spacing } from '../constants/theme';
import type { TravelOption } from '../types/travel';
import { formatCostRange } from '../utils/format';
import { Badge } from './Badge';

interface Props {
  option: TravelOption;
  preferred?: boolean;
  /** Soft, non-blocking note based on the user's preferences. */
  hint?: string;
  onPress: () => void;
}

export function TravelOptionCard({ option, preferred, hint, onPress }: Props) {
  const meta = MODE_META[option.mode];
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${meta.label}, ${option.duration}, ${formatCostRange(option.minCost, option.maxCost)}`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.top}>
        <View style={[styles.icon, { backgroundColor: meta.tintSoft }]}>
          <MaterialCommunityIcons name={meta.icon} size={24} color={meta.tint} />
        </View>
        <View style={styles.titleCol}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>{meta.label}</Text>
            {preferred && (
              <Ionicons name="heart" size={13} color={colors.danger} accessibilityLabel="Preferred mode" />
            )}
          </View>
          <Text style={styles.summary} numberOfLines={1}>{option.summary}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </View>

      {(option.badges.length > 0 || option.alert) && (
        <View style={styles.badges}>
          {option.badges.map((b) => (
            <Badge key={b} label={b} fg={TRADE_OFF_STYLE[b].fg} bg={TRADE_OFF_STYLE[b].bg} />
          ))}
          {option.alert && (
            <View style={styles.alert}>
              <Ionicons name="trending-up" size={13} color={colors.warning} />
              <Text style={styles.alertText}>{option.alert}</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.metrics}>
        <View style={styles.metric}>
          <Ionicons name="time-outline" size={16} color={meta.tint} />
          <View>
            <Text style={styles.metricLabel}>Travel time</Text>
            <Text style={styles.metricValue}>{option.duration}</Text>
          </View>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metric}>
          <Ionicons name="wallet-outline" size={16} color={meta.tint} />
          <View>
            <Text style={styles.metricLabel}>Estimated fare</Text>
            <Text style={styles.metricValue}>{formatCostRange(option.minCost, option.maxCost)}</Text>
          </View>
        </View>
      </View>

      {hint && (
        <View style={styles.hint}>
          <Ionicons name="information-circle-outline" size={14} color={colors.textMuted} />
          <Text style={styles.hintText}>{hint}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    ...shadow,
  },
  pressed: { backgroundColor: colors.surfaceMuted, transform: [{ scale: 0.99 }] },
  top: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  icon: { width: 50, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  titleCol: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { ...font.heading, color: colors.text, flexShrink: 1 },
  summary: { ...font.small, color: colors.textSecondary, marginTop: 2 },
  metrics: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },
  metric: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  metricDivider: { width: 1, alignSelf: 'stretch', backgroundColor: colors.border, marginHorizontal: spacing.md },
  metricLabel: { ...font.caption, color: colors.textMuted, marginBottom: 2 },
  metricValue: { fontSize: 17, fontWeight: '800', color: colors.text, letterSpacing: -0.3 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.md, alignItems: 'center' },
  // Amber, not red: alerts inform the choice, they shouldn't alarm.
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.warningSoft,
  },
  alertText: { fontSize: 11, fontWeight: '700', color: colors.warning, letterSpacing: 0.2 },
  hint: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.sm },
  hintText: { fontSize: 12, fontWeight: '500', color: colors.textMuted },
});
