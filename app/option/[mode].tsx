import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { ComponentProps, ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge } from '../../components/Badge';
import { ConditionCard } from '../../components/ConditionCard';
import { FadeIn } from '../../components/FadeIn';
import { RouteMap } from '../../components/RouteMap';
import { SearchButton } from '../../components/SearchButton';
import { StateMessage } from '../../components/StateMessage';
import { MODE_META, TRADE_OFF_STYLE } from '../../constants/modes';
import { colors, font, radius, shadow, spacing } from '../../constants/theme';
import { useTravel } from '../../context/TravelContext';
import { MODE_TRADEOFFS } from '../../data/tradeoffs';
import type { JourneyStep, OptionDetails, TravelOption } from '../../types/travel';
import { formatCostRange, formatRupees, routeTitle } from '../../utils/format';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

const STEP_ICON: Record<JourneyStep['kind'], ComponentProps<typeof MaterialCommunityIcons>['name']> = {
  walk: 'walk',
  bus: 'bus',
  metro: 'subway-variant',
  ride: 'car',
};

export default function OptionDetailsScreen() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode: string }>();
  const { results, activeSearch } = useTravel();
  const option = results?.options.find((o) => o.mode === mode);

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/explore'));

  if (!option || !results || !activeSearch) {
    return (
      <SafeAreaView style={styles.safe}>
        <TopBar onBack={goBack} title="Option details" />
        <StateMessage
          icon="search-outline"
          title="This option is no longer available"
          message="Run a new search to see the latest travel options."
          actionLabel="Back to options"
          actionIcon="arrow-back"
          onAction={goBack}
        />
      </SafeAreaView>
    );
  }

  const meta = MODE_META[option.mode];
  const tradeoffs = MODE_TRADEOFFS[option.mode];
  const conditions = {
    ...results.conditions,
    demand: option.details.type === 'CAB' ? option.details.demand : results.conditions.demand,
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <TopBar onBack={goBack} title={routeTitle(activeSearch.from, activeSearch.to)} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: meta.tintSoft }]}>
          <View style={styles.heroIcon}>
            <MaterialCommunityIcons name={meta.icon} size={34} color={meta.tint} />
          </View>
          <Text style={styles.heroTitle}>{meta.label}</Text>
          <Text style={styles.heroSummary}>{option.summary}</Text>
          {option.badges.length > 0 && (
            <View style={styles.badges}>
              {option.badges.map((b) => (
                <Badge key={b} label={b} fg={TRADE_OFF_STYLE[b].fg} bg={TRADE_OFF_STYLE[b].bg} />
              ))}
            </View>
          )}
        </View>

        {results.route && (
          <FadeIn style={styles.mapWrap}>
            <RouteMap route={results.route} height={220} interactive />
          </FadeIn>
        )}

        {/* Key numbers */}
        <View style={styles.statRow}>
          <Stat icon="time-outline" label="Estimated travel time" value={option.duration} />
          <Stat
            icon="wallet-outline"
            label={option.mode === 'CARPOOL' ? 'Shared cost' : 'Estimated cost'}
            value={formatCostRange(option.minCost, option.maxCost)}
          />
        </View>

        <ModeSpecific option={option} />

        <FadeIn index={1}>
          <Section title="Current conditions">
            <ConditionCard conditions={conditions} showDemand />
          </Section>
        </FadeIn>

        <View style={styles.explain}>
          <Ionicons name="information-circle" size={18} color={colors.primary} />
          <Text style={styles.explainText}>
            Travel time and cost may change based on current conditions and provider availability.
          </Text>
        </View>

        <FadeIn index={2}>
          <Section title="Trade-offs">
            <View style={styles.tradeCard}>
              <TradeList icon="checkmark-circle" color={colors.success} title="Good for" items={tradeoffs.goodFor} />
              <View style={styles.tradeDivider} />
              <TradeList icon="alert-circle" color={colors.warning} title="Keep in mind" items={tradeoffs.keepInMind} />
            </View>
          </Section>
        </FadeIn>
      </ScrollView>

      <View style={styles.footer}>
        <SearchButton label="Back to options" icon="list" onPress={goBack} />
      </View>
    </SafeAreaView>
  );
}

function ModeSpecific({ option }: { option: TravelOption }) {
  const d: OptionDetails = option.details;
  switch (d.type) {
    case 'PUBLIC_TRANSPORT':
      return (
        <>
          <View style={styles.statRow}>
            <Stat icon="swap-horizontal" label="Transfers" value={String(d.transfers)} />
            <Stat icon="walk" label="Walking" value={`~${d.walkingMinutes} min`} />
          </View>
          <Section title="Journey">
            <View style={styles.card}>
              {d.steps.map((s, i) => (
                <View key={i} style={styles.step}>
                  <View style={styles.stepRail}>
                    <View style={styles.stepIcon}>
                      <MaterialCommunityIcons name={STEP_ICON[s.kind]} size={18} color={colors.accent} />
                    </View>
                    {i < d.steps.length - 1 && <View style={styles.stepLine} />}
                  </View>
                  <View style={styles.stepBody}>
                    <Text style={styles.stepLabel}>{s.label}</Text>
                    <Text style={styles.stepMeta}>{s.minutes} min</Text>
                  </View>
                </View>
              ))}
            </View>
          </Section>
        </>
      );
    case 'CAB':
      return (
        <View style={styles.statRow}>
          <Stat icon="navigate-outline" label="Pickup in" value={d.pickupEta} />
          <Stat icon="trending-up" label="Demand" value={d.demand} tone={d.demand === 'High' ? 'caution' : undefined} />
        </View>
      );
    case 'TWO_WHEELER':
      return (
        <>
          <View style={styles.statRow}>
            <Stat icon="speedometer-outline" label="Distance" value={`${d.distanceKm} km`} />
            <Stat icon="cash-outline" label="Per km (est.)" value={`${formatRupees(Math.round(option.minCost / d.distanceKm))}–${formatRupees(Math.round(option.maxCost / d.distanceKm))}`} />
          </View>
          <View style={[styles.explain, { backgroundColor: colors.warningSoft }]}>
            <Ionicons name="rainy" size={18} color={colors.warning} />
            <Text style={[styles.explainText, { color: colors.warning }]}>{d.note}</Text>
          </View>
        </>
      );
    case 'CARPOOL':
      return (
        <>
          <View style={styles.statRow}>
            <Stat icon="people-outline" label="Available seats" value={String(d.availableSeats)} />
            <Stat icon="alarm-outline" label="Departure time" value={d.departureTime} />
          </View>
          <View style={[styles.card, styles.pickup]}>
            <Ionicons name="location" size={18} color={colors.violet} />
            <View style={{ flex: 1 }}>
              <Text style={styles.statLabel}>Pickup point</Text>
              <Text style={styles.pickupText}>{d.pickupPoint}</Text>
            </View>
          </View>
        </>
      );
  }
}

function TopBar({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <View style={styles.topBar}>
      <Pressable onPress={onBack} style={styles.backBtn} accessibilityLabel="Back to options">
        <Ionicons name="arrow-back" size={22} color={colors.text} />
      </Pressable>
      <Text style={styles.topTitle} numberOfLines={1}>{title}</Text>
      <View style={{ width: 48 }} />
    </View>
  );
}

function Stat({ icon, label, value, tone }: { icon: IoniconName; label: string; value: string; tone?: 'caution' }) {
  return (
    <View style={[styles.card, styles.stat]}>
      <Ionicons name={icon} size={18} color={tone === 'caution' ? colors.warning : colors.primary} />
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, tone === 'caution' && { color: colors.warning }]}>{value}</Text>
    </View>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={{ marginTop: spacing.xl }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function TradeList({ icon, color, title, items }: { icon: IoniconName; color: string; title: string; items: string[] }) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={styles.tradeTitle}>{title}</Text>
      {items.map((it) => (
        <View key={it} style={styles.tradeItem}>
          <Ionicons name={icon} size={16} color={color} />
          <Text style={styles.tradeText}>{it}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  backBtn: {
    width: 44,
    height: 44,
    margin: 2,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    ...shadow,
  },
  topTitle: { ...font.body, fontWeight: '700', color: colors.textSecondary, flex: 1, textAlign: 'center' },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  hero: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.xl,
    marginTop: spacing.sm,
  },
  heroIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    ...shadow,
  },
  heroTitle: { ...font.display, color: colors.text, marginTop: spacing.md },
  heroSummary: { ...font.body, color: colors.textSecondary, marginTop: 4, textAlign: 'center' },
  badges: { flexDirection: 'row', gap: 6, marginTop: spacing.md, flexWrap: 'wrap', justifyContent: 'center' },
  mapWrap: { marginTop: spacing.md, marginBottom: spacing.xs },
  statRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow,
  },
  stat: { flex: 1, gap: 4 },
  statLabel: { ...font.caption, color: colors.textMuted },
  statValue: { fontSize: 18, fontWeight: '800', color: colors.text, letterSpacing: -0.3 },
  sectionTitle: { ...font.heading, color: colors.text, marginBottom: spacing.md },
  step: { flexDirection: 'row', gap: spacing.md },
  stepRail: { alignItems: 'center' },
  stepIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLine: { width: 2, flex: 1, minHeight: 14, backgroundColor: colors.border, marginVertical: 2 },
  stepBody: { flex: 1, paddingBottom: spacing.lg, paddingTop: 6 },
  stepLabel: { ...font.body, color: colors.text },
  stepMeta: { ...font.small, color: colors.textMuted, marginTop: 2 },
  pickup: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.md },
  pickupText: { ...font.body, fontWeight: '700', color: colors.text },
  explain: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  explainText: { ...font.small, color: colors.primaryDark, flex: 1, lineHeight: 19 },
  tradeCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow,
  },
  tradeDivider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  tradeTitle: { ...font.caption, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.6 },
  tradeItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tradeText: { ...font.body, color: colors.text, flex: 1 },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    boxShadow: '0px -8px 24px rgba(20, 50, 44, 0.07)',
  },
});
