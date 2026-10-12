import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { colors, font, radius, shadow, spacing } from '../constants/theme';
import type { Conditions, Level } from '../types/travel';

const weatherIcon = (w: string): keyof typeof Ionicons.glyphMap =>
  /rain/i.test(w) ? 'rainy-outline' : /cloud/i.test(w) ? 'cloudy-outline' : /sun/i.test(w) ? 'sunny-outline' : 'partly-sunny-outline';

const levelColor = (l: Level) =>
  l === 'High' ? colors.danger : l === 'Moderate' ? colors.warning : colors.success;

interface Props {
  conditions: Conditions;
  showDemand?: boolean;
}

export function ConditionCard({ conditions, showDemand = false }: Props) {
  const items = [
    { icon: 'speedometer-outline' as const, label: 'Traffic', value: conditions.traffic, color: levelColor(conditions.traffic) },
    { icon: weatherIcon(conditions.weather), label: 'Weather', value: conditions.weather, color: colors.primary },
    ...(showDemand && conditions.demand
      ? [{ icon: 'people-outline' as const, label: 'Demand', value: conditions.demand, color: levelColor(conditions.demand) }]
      : []),
  ];

  return (
    <View style={styles.card}>
      {items.map((it, i) => (
        <View key={it.label} style={[styles.item, i > 0 && styles.divider]}>
          <Ionicons name={it.icon} size={18} color={it.color} />
          <View>
            <Text style={styles.label}>{it.label}</Text>
            <Text style={[styles.value, { color: it.color }]}>{it.value}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    ...shadow,
  },
  item: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: spacing.md },
  divider: { borderLeftWidth: 1, borderLeftColor: colors.border },
  label: { ...font.caption, color: colors.textMuted },
  value: { fontSize: 14, fontWeight: '700' },
});
