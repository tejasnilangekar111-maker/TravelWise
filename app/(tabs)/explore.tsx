import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ConditionCard } from '../../components/ConditionCard';
import { FadeIn } from '../../components/FadeIn';
import { LoadingState } from '../../components/LoadingState';
import { RouteMap } from '../../components/RouteMap';
import { StateMessage } from '../../components/StateMessage';
import { TravelOptionCard } from '../../components/TravelOptionCard';
import { colors, font, radius, shadow, spacing } from '../../constants/theme';
import { useTravel } from '../../context/TravelContext';
import type { TravelOption, TravelResults, UserProfile } from '../../types/travel';
import { selectionTick } from '../../utils/haptics';
import { formatRupees, formatWhen, routeTitle } from '../../utils/format';

type SortKey = 'default' | 'time' | 'cost';
const SORTS: { key: SortKey; label: string }[] = [
  { key: 'default', label: 'All options' },
  { key: 'time', label: 'By time' },
  { key: 'cost', label: 'By cost' },
];

/** Soft, informational note — never hides an option. */
function preferenceHint(o: TravelOption, p: UserProfile): string | undefined {
  if (o.minCost > p.budgetMax) return `Above your ${formatRupees(p.budgetMax)} budget`;
  if (o.maxCost > p.budgetMax) return `May exceed your ${formatRupees(p.budgetMax)} budget`;
  if (o.maxMinutes > p.maxTravelMinutes) return `Longer than your ${p.maxTravelMinutes} min limit`;
  return undefined;
}

export default function ExploreScreen() {
  const router = useRouter();
  const { status, results, activeSearch, errorMessage, retry, isSaved, toggleSaved, profile } = useTravel();
  const [sort, setSort] = useState<SortKey>('default');

  const options = useMemo(() => {
    const list = [...(results?.options ?? [])];
    if (sort === 'time') list.sort((a, b) => a.maxMinutes - b.maxMinutes);
    if (sort === 'cost') list.sort((a, b) => a.minCost - b.minCost);
    return list;
  }, [results, sort]);

  if (!activeSearch || status === 'idle') {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.simpleHeader}>
          <Text style={styles.screenTitle}>Explore</Text>
        </View>
        <StateMessage
          icon="compass-outline"
          title="Plan a trip to compare options"
          message="Enter where you're starting and where you're going. We'll lay out public transport, cab, two-wheeler and carpool side by side."
          actionLabel="Start a search"
          actionIcon="search"
          onAction={() => router.navigate('/')}
        />
      </SafeAreaView>
    );
  }

  const saved = isSaved(activeSearch);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Route header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.navigate('/')} style={styles.iconBtn} accessibilityLabel="Edit search">
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.route} numberOfLines={1}>
            {routeTitle(activeSearch.from, activeSearch.to)}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {formatWhen(activeSearch.departAt)}
            {results && status === 'success' ? ` · ${results.distanceKm} km` : ''}
          </Text>
        </View>
        <Pressable
          onPress={() => toggleSaved(activeSearch)}
          style={styles.iconBtn}
          accessibilityLabel={saved ? 'Remove from saved commutes' : 'Save commute'}
        >
          <Ionicons name={saved ? 'heart' : 'heart-outline'} size={22} color={saved ? colors.danger : colors.text} />
        </Pressable>
      </View>

      {status === 'loading' && (
        <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }}>
          <LoadingState />
        </ScrollView>
      )}

      {status === 'error' && (
        <StateMessage
          icon="cloud-offline-outline"
          tone="error"
          title="Something went wrong"
          message={errorMessage ?? 'Unable to load travel options. Please try again.'}
          actionLabel="Try again"
          actionIcon="refresh"
          onAction={retry}
        />
      )}

      {status === 'success' && results && options.length === 0 && (
        <StateMessage
          icon="map-outline"
          title="No suitable travel options found."
          message="Try a different time, or check the start and destination."
          actionLabel="Edit search"
          actionIcon="create-outline"
          onAction={() => router.navigate('/')}
        />
      )}

      {status === 'success' && results && options.length > 0 && (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {results.route && (
            <FadeIn style={styles.overviewWrap}>
              <RouteOverview results={results} />
            </FadeIn>
          )}

          <FadeIn index={1}>
            <Text style={styles.sectionTitle}>Current conditions</Text>
            <ConditionCard conditions={results.conditions} />
          </FadeIn>

          <View style={styles.listHeader}>
            <Text style={styles.sectionTitle}>
              {options.length} ways to travel
            </Text>
          </View>
          <View style={styles.segment}>
            {SORTS.map((s) => {
              const active = sort === s.key;
              return (
                <Pressable
                  key={s.key}
                  onPress={() => {
                    selectionTick();
                    setSort(s.key);
                  }}
                  style={[styles.segmentItem, active && styles.segmentActive]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                >
                  <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{s.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.notice}>
            <Ionicons name="information-circle" size={16} color={colors.primary} />
            <Text style={styles.noticeText}>
              {results.distanceSource === 'live'
                ? 'Fares are based on the real road distance and live traffic. '
                : results.distanceSource === 'estimated'
                  ? "Couldn't reach live traffic, so distance is estimated. "
                  : ''}
              Prices are estimated ranges, not exact fares. Compare the trade-offs and choose what suits you.
            </Text>
          </View>

          <View style={{ gap: spacing.md }}>
            {options.map((o, i) => (
              <FadeIn key={o.mode} index={i + 2}>
                <TravelOptionCard
                  option={o}
                  preferred={profile.preferredModes.includes(o.mode)}
                  hint={preferenceHint(o, profile)}
                  onPress={() => router.push({ pathname: '/option/[mode]', params: { mode: o.mode } })}
                />
              </FadeIn>
            ))}
          </View>

          <Text style={styles.footer}>
            TravelWise compares options — you make the final choice.
          </Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

/** Map preview plus the at-a-glance trip summary. */
function RouteOverview({ results }: { results: TravelResults }) {
  const route = results.route!;
  const live = route.source === 'live';
  return (
    <View style={styles.overview}>
      <RouteMap route={route} height={170} />
      <View style={styles.overviewRow}>
        <View style={styles.overviewStat}>
          <Ionicons name="navigate-outline" size={16} color={colors.primary} />
          <Text style={styles.overviewValue}>{results.distanceKm} km</Text>
          <Text style={styles.overviewLabel}>by road</Text>
        </View>
        <View style={[styles.sourcePill, !live && styles.sourcePillMuted]}>
          <View style={[styles.sourceDot, !live && styles.sourceDotMuted]} />
          <Text style={[styles.sourceText, !live && styles.sourceTextMuted]}>
            {live ? 'Live traffic' : 'Estimated'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  simpleHeader: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg },
  screenTitle: { ...font.title, color: colors.text },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    zIndex: 1,
    ...shadow,
  },
  iconBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: colors.surfaceMuted,
  },
  headerText: { flex: 1, paddingHorizontal: spacing.md },
  route: { ...font.title, fontSize: 20, color: colors.text },
  meta: { ...font.small, color: colors.textSecondary, marginTop: 1 },
  content: { padding: spacing.xl, paddingBottom: spacing.xxl * 2 },
  sectionTitle: { ...font.heading, color: colors.text, marginBottom: spacing.md },
  listHeader: { marginTop: spacing.xxl },
  overviewWrap: { marginBottom: spacing.xxl },
  overview: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.sm,
    ...shadow,
  },
  overviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  overviewStat: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  overviewValue: { fontSize: 18, fontWeight: '800', color: colors.text, letterSpacing: -0.3 },
  overviewLabel: { ...font.small, color: colors.textSecondary },
  sourcePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.successSoft,
  },
  sourcePillMuted: { backgroundColor: colors.surfaceMuted },
  sourceDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success },
  sourceDotMuted: { backgroundColor: colors.textMuted },
  sourceText: { ...font.caption, color: colors.success },
  sourceTextMuted: { color: colors.textSecondary },
  segment: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: 4,
  },
  segmentItem: { flex: 1, minHeight: 38, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm },
  segmentActive: { backgroundColor: colors.surface, elevation: 1 },
  segmentText: { ...font.small, fontWeight: '600', color: colors.textSecondary },
  segmentTextActive: { color: colors.text, fontWeight: '700' },
  notice: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    padding: spacing.md,
    marginVertical: spacing.lg,
  },
  noticeText: { ...font.small, color: colors.primaryDark, flex: 1, lineHeight: 18 },
  footer: { ...font.small, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl },
});
