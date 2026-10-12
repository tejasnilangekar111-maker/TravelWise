import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ALL_MODES, MODE_META } from '../../constants/modes';
import { colors, font, radius, shadow, spacing, touchTarget } from '../../constants/theme';
import { useTravel } from '../../context/TravelContext';
import type { DemoScenario, TravelMode } from '../../types/travel';
import { formatRupees } from '../../utils/format';

const BUDGETS = [150, 300, 500, 1000];
const MAX_TIMES = [30, 45, 60, 90];
const SCENARIOS: { key: DemoScenario; label: string }[] = [
  { key: 'normal', label: 'Normal' },
  { key: 'empty', label: 'No options' },
  { key: 'failure', label: 'Failure' },
];

export default function ProfileScreen() {
  const { profile, updateProfile, scenario, setScenario } = useTravel();

  const toggleMode = (m: TravelMode) => {
    const has = profile.preferredModes.includes(m);
    updateProfile({
      preferredModes: has ? profile.preferredModes.filter((x) => x !== m) : [...profile.preferredModes, m],
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Profile</Text>

        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{profile.name[0]}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{profile.name}</Text>
            <View style={styles.cityRow}>
              <Ionicons name="location-outline" size={13} color={colors.onInkMuted} />
              <Text style={styles.city}>Pune · Daily commuter</Text>
            </View>
          </View>
        </View>

        <Section title="Preferred travel modes" hint="Preferred modes are marked with a heart in results.">
          <View style={styles.card}>
            {ALL_MODES.map((m, i) => {
              const checked = profile.preferredModes.includes(m);
              const meta = MODE_META[m];
              return (
                <Pressable
                  key={m}
                  onPress={() => toggleMode(m)}
                  style={[styles.modeRow, i > 0 && styles.rowDivider]}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked }}
                >
                  <MaterialCommunityIcons name={meta.icon} size={20} color={meta.tint} />
                  <Text style={styles.modeLabel}>{meta.label}</Text>
                  <View style={[styles.checkbox, checked && styles.checkboxOn]}>
                    {checked && <Ionicons name="checkmark" size={16} color="#fff" />}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </Section>

        <Section title="Budget preference" value={`${formatRupees(0)} – ${formatRupees(profile.budgetMax)}`}>
          <ChipGroup
            options={BUDGETS.map((b) => ({ key: b, label: `Up to ${formatRupees(b)}` }))}
            selected={profile.budgetMax}
            onSelect={(b) => updateProfile({ budgetMax: b })}
          />
        </Section>

        <Section title="Maximum travel time" value={`${profile.maxTravelMinutes} minutes`}>
          <ChipGroup
            options={MAX_TIMES.map((t) => ({ key: t, label: `${t} min` }))}
            selected={profile.maxTravelMinutes}
            onSelect={(t) => updateProfile({ maxTravelMinutes: t })}
          />
        </Section>

        <Section title="Prototype demo" hint="Simulate how results behave in edge cases. Applies to the next search.">
          <ChipGroup
            options={SCENARIOS.map((s) => ({ key: s.key, label: s.label }))}
            selected={scenario}
            onSelect={setScenario}
          />
        </Section>

        <Text style={styles.footer}>TravelWise prototype · Fares are estimates</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, value, hint, children }: { title: string; value?: string; hint?: string; children: ReactNode }) {
  return (
    <View style={{ marginTop: spacing.xxl }}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {value && <Text style={styles.sectionValue}>{value}</Text>}
      </View>
      {hint && <Text style={styles.hint}>{hint}</Text>}
      {children}
    </View>
  );
}

function ChipGroup<K extends string | number>({
  options,
  selected,
  onSelect,
}: {
  options: { key: K; label: string }[];
  selected: K;
  onSelect: (k: K) => void;
}) {
  return (
    <View style={styles.chips}>
      {options.map((o) => {
        const active = o.key === selected;
        return (
          <Pressable
            key={String(o.key)}
            onPress={() => onSelect(o.key)}
            style={[styles.chip, active && styles.chipActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingBottom: spacing.xxl * 2 },
  title: { ...font.display, color: colors.text },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: colors.ink,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginTop: spacing.xl,
    ...shadow,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.inkSoft,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 22, fontWeight: '800', color: colors.onInk },
  name: { ...font.title, color: colors.onInk },
  cityRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  city: { ...font.small, color: colors.onInkMuted },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: spacing.sm },
  sectionTitle: { ...font.heading, color: colors.text },
  sectionValue: { ...font.small, fontWeight: '700', color: colors.primary },
  hint: { ...font.small, color: colors.textSecondary, marginBottom: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    ...shadow,
  },
  modeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: touchTarget + 8 },
  rowDivider: { borderTopWidth: 1, borderTopColor: colors.border },
  modeLabel: { ...font.body, color: colors.text, flex: 1 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: 14,
    minHeight: 40,
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  chipText: { ...font.small, fontWeight: '600', color: colors.textSecondary },
  chipTextActive: { color: colors.primary, fontWeight: '700' },
  footer: { ...font.small, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xxl },
});
