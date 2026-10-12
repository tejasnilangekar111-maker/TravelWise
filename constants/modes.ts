import type { ComponentProps } from 'react';
import type { MaterialCommunityIcons } from '@expo/vector-icons';
import type { TradeOff, TravelMode } from '../types/travel';
import { colors } from './theme';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export const MODE_META: Record<
  TravelMode,
  { label: string; icon: IconName; tint: string; tintSoft: string }
> = {
  PUBLIC_TRANSPORT: {
    label: 'Public Transport',
    icon: 'subway-variant',
    tint: colors.accent,
    tintSoft: colors.accentSoft,
  },
  CAB: { label: 'Cab', icon: 'car', tint: colors.primary, tintSoft: colors.primarySoft },
  TWO_WHEELER: {
    label: 'Two-Wheeler',
    icon: 'motorbike',
    tint: colors.warning,
    tintSoft: colors.warningSoft,
  },
  CARPOOL: {
    label: 'Carpool',
    icon: 'car-multiple',
    tint: colors.violet,
    tintSoft: colors.violetSoft,
  },
};

export const ALL_MODES: TravelMode[] = ['PUBLIC_TRANSPORT', 'CAB', 'TWO_WHEELER', 'CARPOOL'];

export const TRADE_OFF_STYLE: Record<TradeOff, { fg: string; bg: string }> = {
  Fastest: { fg: colors.primaryDark, bg: colors.primarySoft },
  Cheapest: { fg: colors.success, bg: colors.successSoft },
  Comfortable: { fg: colors.warning, bg: colors.warningSoft },
  'Shared ride': { fg: colors.violet, bg: colors.violetSoft },
  'Most predictable': { fg: colors.accent, bg: colors.accentSoft },
};
