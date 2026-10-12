import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, font, radius, spacing, touchTarget } from '../constants/theme';
import type { Place } from '../types/travel';
import { searchPlaces } from '../utils/geo';

const SEARCH_DEBOUNCE_MS = 350;

interface Props {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  /** Called when the user picks a suggestion. Enables place search when set. */
  onSelectPlace?: (place: Place) => void;
  /** True once the value came from a picked suggestion — suggestions stay hidden. */
  placeSelected?: boolean;
  placeholder: string;
  variant: 'origin' | 'destination';
  error?: string;
  /** Shows a "use my location" button while the field is empty. */
  onLocate?: () => void;
  locating?: boolean;
  /** No background of its own — for fields grouped inside a shared container. */
  bare?: boolean;
}

export function TravelInput({
  label,
  value,
  onChangeText,
  onSelectPlace,
  placeSelected,
  placeholder,
  variant,
  error,
  onLocate,
  locating,
  bare,
}: Props) {
  const isOrigin = variant === 'origin';
  const [focused, setFocused] = useState(false);
  // True from the moment a finger/mouse goes down on a suggestion until the
  // press ends. The input blurs on that press (on web), and the list must stay
  // open long enough for the press to land, however long it's held.
  const choosing = useRef(false);
  const inputFocused = useRef(false);
  // Results are tagged with their query so stale ones are never shown.
  const [result, setResult] = useState<{ query: string; places: Place[] } | null>(null);
  const active = Boolean(onSelectPlace) && focused && !placeSelected && value.trim().length >= 3;
  const suggestions = active && result?.query === value ? result.places : [];
  const searching = active && result?.query !== value;

  useEffect(() => {
    if (!active) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      searchPlaces(value, controller.signal)
        .then((places) => setResult({ query: value, places }))
        .catch(() => {
          // Suggestions are a convenience; the typed text is still geocoded on search.
          if (!controller.signal.aborted) setResult({ query: value, places: [] });
        });
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [active, value]);

  return (
    <View>
      <View style={[styles.field, bare ? styles.fieldBare : error ? styles.fieldError : null]}>
        <View style={[styles.marker, isOrigin ? styles.markerOrigin : styles.markerDest]} />
        <View style={styles.body}>
          <Text style={styles.label}>{label}</Text>
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            returnKeyType="next"
            accessibilityLabel={label}
            onFocus={() => {
              inputFocused.current = true;
              setFocused(true);
            }}
            // Delay so a tap on a suggestion lands before the list hides.
            onBlur={() => {
              inputFocused.current = false;
              setTimeout(() => {
                if (!choosing.current) setFocused(false);
              }, 150);
            }}
          />
        </View>
        {(searching || locating) && (
          <ActivityIndicator size="small" color={colors.primary} style={styles.spinner} />
        )}
        {onLocate && !locating && value.length === 0 && (
          <Pressable
            onPress={onLocate}
            hitSlop={8}
            style={styles.locate}
            accessibilityRole="button"
            accessibilityLabel="Use my current location"
          >
            <Ionicons name="locate" size={16} color={colors.primary} />
            <Text style={styles.locateText}>Use my location</Text>
          </Pressable>
        )}
        {value.length > 0 && (
          <Pressable
            onPress={() => onChangeText('')}
            hitSlop={8}
            style={styles.clear}
            accessibilityLabel={`Clear ${label}`}
          >
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </Pressable>
        )}
      </View>
      {active && suggestions.length > 0 && (
        <View style={[styles.suggestions, bare && styles.suggestionsBare]} accessibilityRole="list">
          {suggestions.map((p, i) => (
            <Pressable
              key={`${p.lat},${p.lon}`}
              onPressIn={() => {
                choosing.current = true;
              }}
              onPressOut={() => {
                // Runs for both completed and cancelled presses; let onPress go first.
                setTimeout(() => {
                  choosing.current = false;
                  if (!inputFocused.current) setFocused(false);
                }, 0);
              }}
              onPress={() => {
                onSelectPlace?.(p);
              }}
              style={({ pressed }) => [styles.suggestion, i > 0 && styles.suggestionDivider, pressed && styles.suggestionPressed]}
              accessibilityRole="button"
              accessibilityLabel={`Choose ${p.label}`}
            >
              <Ionicons name="location-outline" size={18} color={colors.primary} />
              <Text style={styles.suggestionText} numberOfLines={2}>
                {p.label}
              </Text>
            </Pressable>
          ))}
        </View>
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
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: touchTarget + 12,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  fieldError: { borderColor: colors.danger, backgroundColor: colors.dangerSoft },
  fieldBare: { backgroundColor: 'transparent', borderWidth: 0 },
  marker: { width: 12, height: 12, marginRight: spacing.md },
  markerOrigin: { borderRadius: 6, borderWidth: 3, borderColor: colors.accent },
  markerDest: { borderRadius: 2, backgroundColor: colors.primary },
  body: { flex: 1, paddingVertical: spacing.sm },
  label: { ...font.caption, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.6 },
  input: { ...font.body, fontSize: 16, color: colors.text, paddingVertical: 2, paddingHorizontal: 0 },
  clear: { padding: spacing.xs },
  spinner: { marginLeft: spacing.xs },
  locate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
  },
  locateText: { ...font.caption, color: colors.primary },
  suggestions: {
    marginTop: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: touchTarget,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  // Inside the grouped From/To box: inset from its edges, and clear of the swap
  // button and route dots that sit on the divider just below.
  suggestionsBare: { marginHorizontal: spacing.sm, marginTop: 0, marginBottom: spacing.xxl },
  suggestionDivider: { borderTopWidth: 1, borderTopColor: colors.border },
  suggestionPressed: { backgroundColor: colors.primarySoft },
  suggestionText: { ...font.body, color: colors.text, flex: 1 },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6, marginLeft: 4, marginBottom: 6 },
  errorText: { ...font.small, color: colors.danger },
});
