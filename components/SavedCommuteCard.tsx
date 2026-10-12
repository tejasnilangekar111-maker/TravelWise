import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, font, radius, shadow, spacing, touchTarget } from '../constants/theme';
import type { SavedCommute } from '../types/travel';
import { routeTitle } from '../utils/format';

const ICONS = {
  home: 'home',
  school: 'school',
  briefcase: 'briefcase',
  location: 'location',
} as const;

interface Props {
  commute: SavedCommute;
  onPress: () => void;
  onRemove?: () => void;
  compact?: boolean;
}

export function SavedCommuteCard({ commute, onPress, onRemove, compact }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Use commute ${commute.label}`}
      style={({ pressed }) => [styles.card, compact && styles.compact, pressed && { opacity: 0.85 }]}
    >
      <View style={styles.icon}>
        <Ionicons name={ICONS[commute.icon]} size={compact ? 18 : 20} color={colors.primary} />
      </View>
      <View style={styles.body}>
        <Text style={styles.label} numberOfLines={1}>{commute.label}</Text>
        <Text style={styles.route} numberOfLines={1}>
          {routeTitle(commute.from, commute.to)}
        </Text>
      </View>
      <View style={styles.time}>
        <Text style={styles.timeText}>{commute.time}</Text>
      </View>
      {onRemove ? (
        <Pressable
          onPress={onRemove}
          hitSlop={8}
          style={styles.action}
          accessibilityLabel={`Remove ${commute.label}`}
        >
          <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
        </Pressable>
      ) : (
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    minHeight: touchTarget + 16,
    ...shadow,
  },
  compact: { padding: spacing.md },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1 },
  label: { ...font.body, fontWeight: '700', color: colors.text },
  route: { ...font.small, color: colors.textSecondary, marginTop: 2 },
  time: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
  },
  timeText: { ...font.caption, color: colors.textSecondary },
  action: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
});
