import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, font, spacing } from '../constants/theme';
import { SearchButton } from './SearchButton';

interface Props {
  icon: ComponentProps<typeof Ionicons>['name'];
  tone?: 'neutral' | 'error';
  title: string;
  message: string;
  actionLabel?: string;
  actionIcon?: ComponentProps<typeof Ionicons>['name'];
  onAction?: () => void;
}

/** Shared layout for empty and error states. */
export function StateMessage({ icon, tone = 'neutral', title, message, actionLabel, actionIcon, onAction }: Props) {
  const isError = tone === 'error';
  return (
    <View style={styles.wrap}>
      <View style={[styles.icon, { backgroundColor: isError ? colors.dangerSoft : colors.primarySoft }]}>
        <Ionicons name={icon} size={32} color={isError ? colors.danger : colors.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction && (
        <View style={styles.action}>
          <SearchButton label={actionLabel} icon={actionIcon} onPress={onAction} variant="secondary" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: spacing.xxl * 1.5, paddingHorizontal: spacing.xl },
  icon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  title: { ...font.heading, fontSize: 18, color: colors.text, marginTop: spacing.lg, textAlign: 'center' },
  message: { ...font.body, color: colors.textSecondary, marginTop: 6, textAlign: 'center', lineHeight: 21 },
  action: { marginTop: spacing.xl, alignSelf: 'stretch' },
});
