import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { useCallback, useRef } from 'react';
import { Keyboard, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DepartureTimeField } from '../../components/DepartureTimeField';
import { SavedCommuteCard } from '../../components/SavedCommuteCard';
import { SearchButton } from '../../components/SearchButton';
import { TravelInput } from '../../components/TravelInput';
import { colors, font, radius, shadow, shadowLifted, spacing } from '../../constants/theme';
import { useTravel } from '../../context/TravelContext';
import { lightTap, selectionTick } from '../../utils/haptics';

const VALUE_PROPS = [
  { icon: 'git-compare-outline', text: 'Compare every mode' },
  { icon: 'pricetag-outline', text: 'Honest cost ranges' },
  { icon: 'hand-left-outline', text: 'You decide' },
] as const;

function greeting(now = new Date()) {
  const h = now.getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const {
    form, formErrors, setField, setPlace, locateFrom, locating, setDepartAt, swapPlaces, applyCommute, search,
    savedCommutes, profile,
  } = useTravel();

  // The hero is dark, so the status bar goes light while Home is on screen.
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('light');
      return () => setStatusBarStyle('dark');
    }, []),
  );

  const onSearch = () => {
    Keyboard.dismiss();
    lightTap();
    if (search()) router.navigate('/explore');
  };

  const routeError = Boolean(formErrors.from || formErrors.to);

  return (
    <View style={styles.screen}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={[styles.hero, { paddingTop: insets.top + spacing.lg }]}>
          <View style={[styles.orb, styles.orbLarge]} pointerEvents="none" />
          <View style={[styles.orb, styles.orbSmall]} pointerEvents="none" />

          <View style={styles.header}>
            <View style={styles.brand}>
              <View style={styles.logo}>
                <Ionicons name="git-compare" size={18} color={colors.onInk} />
              </View>
              <Text style={styles.brandName}>TravelWise</Text>
            </View>
            <Pressable
              style={styles.avatar}
              onPress={() => router.navigate('/profile')}
              accessibilityLabel="Open profile"
            >
              <Text style={styles.avatarText}>{profile.name[0]}</Text>
            </Pressable>
          </View>

          <Text style={styles.greeting}>
            {greeting()}, {profile.name}
          </Text>
          <Text style={styles.title}>Where to next?</Text>
        </View>

        {/* Search card, overlapping the hero */}
        <View style={styles.card}>
          <View style={[styles.routeBox, routeError && styles.routeBoxError]}>
            <TravelInput
              bare
              label="From"
              variant="origin"
              value={form.from}
              onChangeText={(v) => setField('from', v)}
              onSelectPlace={(p) => {
                selectionTick();
                setPlace('from', p);
              }}
              placeSelected={Boolean(form.fromPlace)}
              placeholder="Starting location"
              error={formErrors.from}
              onLocate={() => {
                selectionTick();
                locateFrom();
              }}
              locating={locating}
            />
            <View style={styles.routeDivider}>
              {/* Dotted connector between the From and To markers. */}
              <View style={styles.connector}>
                {[0, 1, 2].map((i) => (
                  <View key={i} style={styles.connectorDot} />
                ))}
              </View>
              <View style={styles.hairline} />
              <Pressable
                onPress={() => {
                  selectionTick();
                  swapPlaces();
                }}
                style={({ pressed }) => [styles.swap, pressed && styles.swapPressed]}
                accessibilityLabel="Swap from and to"
              >
                <Ionicons name="swap-vertical" size={18} color={colors.primary} />
              </Pressable>
            </View>
            <TravelInput
              bare
              label="To"
              variant="destination"
              value={form.to}
              onChangeText={(v) => setField('to', v)}
              onSelectPlace={(p) => {
                selectionTick();
                setPlace('to', p);
              }}
              placeSelected={Boolean(form.toPlace)}
              placeholder="Destination"
              error={formErrors.to}
            />
          </View>

          <DepartureTimeField value={form.departAt} onChange={setDepartAt} error={formErrors.time} />

          <View style={styles.searchGap} />
          <SearchButton label="Search Travel" onPress={onSearch} />
        </View>

        <View style={styles.body}>
          {/* Saved commutes */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Saved commutes</Text>
            <Pressable onPress={() => router.navigate('/saved')} hitSlop={10} style={styles.linkRow}>
              <Text style={styles.link}>See all</Text>
              <Ionicons name="chevron-forward" size={14} color={colors.primary} />
            </Pressable>
          </View>
          {savedCommutes.length === 0 ? (
            <Text style={styles.emptyText}>
              No saved commutes yet. Tap the heart on a results page to save one.
            </Text>
          ) : (
            <View style={{ gap: spacing.sm }}>
              {savedCommutes.slice(0, 3).map((c) => (
                <SavedCommuteCard
                  key={c.id}
                  commute={c}
                  compact
                  onPress={() => {
                    applyCommute(c);
                    scrollRef.current?.scrollTo({ y: 0, animated: true });
                  }}
                />
              ))}
            </View>
          )}

          {/* Value props */}
          <View style={styles.valueRow}>
            {VALUE_PROPS.map((v) => (
              <View key={v.text} style={styles.valueItem}>
                <View style={styles.valueIcon}>
                  <Ionicons name={v.icon} size={18} color={colors.primary} />
                </View>
                <Text style={styles.valueText}>{v.text}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

/** How far the search card reaches up into the hero. */
const CARD_OVERLAP = 64;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xxl * 2 },

  hero: {
    backgroundColor: colors.ink,
    paddingHorizontal: spacing.xl,
    paddingBottom: CARD_OVERLAP + spacing.xl,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  orb: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(255, 255, 255, 0.06)' },
  orbLarge: { width: 260, height: 260, top: -90, right: -80 },
  orbSmall: { width: 140, height: 140, bottom: -40, left: -50 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: colors.inkSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: { fontSize: 18, fontWeight: '800', color: colors.onInk, letterSpacing: -0.3 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.inkSoft,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '800', color: colors.onInk },
  greeting: { ...font.body, color: colors.onInkMuted, marginTop: spacing.xxl },
  title: { fontSize: 32, fontWeight: '800', letterSpacing: -0.8, color: colors.onInk, marginTop: 4 },

  card: {
    marginTop: -CARD_OVERLAP,
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    ...shadowLifted,
  },
  routeBox: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  routeBoxError: { borderColor: colors.danger, backgroundColor: colors.dangerSoft },
  routeDivider: { flexDirection: 'row', alignItems: 'center', height: 2, zIndex: 1 },
  // Centered under the 12px markers, which sit 12px in from the edge.
  connector: { position: 'absolute', left: 16.5, top: -13, height: 28, justifyContent: 'space-between' },
  connectorDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: colors.textMuted },
  hairline: { flex: 1, height: 1, marginLeft: 36, marginRight: 64, backgroundColor: colors.border },
  swap: {
    position: 'absolute',
    right: spacing.md,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  swapPressed: { backgroundColor: colors.primarySoft },
  searchGap: { height: spacing.lg },

  body: { paddingHorizontal: spacing.xl },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
  },
  sectionTitle: { ...font.heading, color: colors.text },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  link: { ...font.small, fontWeight: '700', color: colors.primary },
  emptyText: { ...font.small, color: colors.textSecondary },
  valueRow: {
    flexDirection: 'row',
    marginTop: spacing.xxl,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  valueItem: { flex: 1, alignItems: 'center', gap: spacing.sm, paddingHorizontal: 4 },
  valueIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: { fontSize: 12, fontWeight: '600', color: colors.text, textAlign: 'center' },
});
