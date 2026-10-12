import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, font, radius, spacing, touchTarget } from '../constants/theme';
import type { PickMode } from '../utils/departure';

interface Props {
  mode: PickMode;
  label: string;
  onPress: () => void;
}

/** The tappable date or time shown in the search card; opens the platform picker. */
export function PickerPill({ mode, label, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.pill, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`${mode === 'date' ? 'Travel date' : 'Departure time'}: ${label}. Change`}
    >
      <Ionicons name={mode === 'date' ? 'calendar-outline' : 'time-outline'} size={18} color={colors.primary} />
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: touchTarget,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  pressed: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  label: { ...font.body, fontWeight: '700', color: colors.text, flexShrink: 1 },
});
