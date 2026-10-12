import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, font, radius, shadow, spacing } from '../constants/theme';
import { defaultDeparture, startOfDay } from '../utils/departure';
import { formatClock, formatDay } from '../utils/format';
import { selectionTick } from '../utils/haptics';
import { DateTimeButton } from './DateTimeButton';

interface Props {
  /** null = leave now. */
  value: Date | null;
  onChange: (value: Date | null) => void;
  error?: string;
}

/** "Leave now" or any future date and time, picked with the platform's calendar and clock. */
export function DepartureTimeField({ value, onChange, error }: Props) {
  const options = [
    { key: 'now', label: 'Leave now', selected: value === null, pick: () => onChange(null) },
    { key: 'later', label: 'Schedule', selected: value !== null, pick: () => onChange(value ?? defaultDeparture()) },
  ];

  return (
    <View>
      <View style={styles.header}>
        <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
        <Text style={styles.label}>Travel time</Text>
        <View style={styles.toggle} accessibilityRole="radiogroup">
          {options.map((o) => (
            <Pressable
              key={o.key}
              onPress={() => {
                selectionTick();
                o.pick();
              }}
              style={[styles.option, o.selected && styles.optionActive]}
              accessibilityRole="radio"
              accessibilityState={{ checked: o.selected }}
            >
              <Text style={[styles.optionText, o.selected && styles.optionTextActive]}>{o.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {value ? (
        <View style={styles.pickers}>
          <View style={styles.dateCol}>
            <DateTimeButton
              mode="date"
              value={value}
              minimumDate={startOfDay(new Date())}
              onChange={onChange}
              label={formatDay(value)}
            />
          </View>
          <View style={styles.timeCol}>
            <DateTimeButton
              mode="time"
              value={value}
              minimumDate={startOfDay(new Date())}
              onChange={onChange}
              label={formatClock(value)}
            />
          </View>
        </View>
      ) : (
        <Text style={styles.hint}>Showing options for leaving right now.</Text>
      )}

      {error ? (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle" size={14} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.lg },
  label: { ...font.small, fontWeight: '600', color: colors.textSecondary, flex: 1 },
  toggle: { flexDirection: 'row', padding: 3, borderRadius: radius.pill, backgroundColor: colors.surfaceMuted },
  option: { paddingHorizontal: spacing.md, minHeight: 32, justifyContent: 'center', borderRadius: radius.pill },
  optionActive: { backgroundColor: colors.surface, ...shadow },
  optionText: { ...font.small, fontWeight: '600', color: colors.textSecondary },
  optionTextActive: { color: colors.primary, fontWeight: '700' },
  pickers: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  dateCol: { flex: 1.35 },
  timeCol: { flex: 1 },
  hint: { ...font.small, color: colors.textMuted, marginTop: spacing.sm },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6, marginLeft: 4 },
  errorText: { ...font.small, color: colors.danger },
});
