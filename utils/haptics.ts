import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/** Soft tactile feedback. Never throws — haptics are a nicety, not a requirement. */

export function selectionTick() {
  if (Platform.OS === 'web') return;
  Haptics.selectionAsync().catch(() => {});
}

export function lightTap() {
  if (Platform.OS === 'web') return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}
