import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font, radius, spacing } from '../constants/theme';
import { mergePick } from '../utils/departure';
import type { PickMode } from '../utils/departure';
import { PickerPill } from './PickerPill';

export interface DateTimeButtonProps {
  mode: PickMode;
  value: Date;
  /** Earliest selectable day (date mode). */
  minimumDate: Date;
  onChange: (value: Date) => void;
  label: string;
}

/**
 * Native date/time picker behind a pill. Android uses the system dialog
 * (the library's recommended imperative API); iOS shows the picker in a sheet.
 */
export function DateTimeButton({ mode, value, minimumDate, onChange, label }: DateTimeButtonProps) {
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState<Date | null>(null);

  const open = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value,
        mode,
        minimumDate: mode === 'date' ? minimumDate : undefined,
        is24Hour: false,
        onValueChange: (_, picked) => onChange(mergePick(mode, value, picked)),
      });
      return;
    }
    setDraft(value);
  };

  const close = () => setDraft(null);

  return (
    <>
      <PickerPill mode={mode} label={label} onPress={open} />
      {Platform.OS === 'ios' && (
        <Modal visible={draft !== null} transparent animationType="slide" onRequestClose={close}>
          <View style={styles.overlay}>
            <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityLabel="Close picker" />
            <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.md }]}>
              <View style={styles.sheetHeader}>
                <Pressable onPress={close} hitSlop={10} accessibilityRole="button">
                  <Text style={styles.cancel}>Cancel</Text>
                </Pressable>
                <Text style={styles.title}>{mode === 'date' ? 'Travel date' : 'Departure time'}</Text>
                <Pressable
                  onPress={() => {
                    if (draft) onChange(mergePick(mode, value, draft));
                    close();
                  }}
                  hitSlop={10}
                  accessibilityRole="button"
                >
                  <Text style={styles.done}>Done</Text>
                </Pressable>
              </View>
              {draft && (
                <DateTimePicker
                  value={draft}
                  mode={mode}
                  display={mode === 'date' ? 'inline' : 'spinner'}
                  minimumDate={mode === 'date' ? minimumDate : undefined}
                  minuteInterval={5}
                  accentColor={colors.primary}
                  themeVariant="light"
                  onValueChange={(_, picked) => setDraft(picked)}
                  style={styles.picker}
                />
              )}
            </View>
          </View>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(30, 47, 44, 0.25)' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  title: { ...font.heading, color: colors.text },
  cancel: { ...font.body, color: colors.textSecondary },
  done: { ...font.body, fontWeight: '700', color: colors.primary },
  picker: { alignSelf: 'center' },
});
