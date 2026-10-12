import { StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../constants/theme';

interface Props {
  label: string;
  fg?: string;
  bg?: string;
}

export function Badge({ label, fg = colors.primaryDark, bg = colors.primarySoft }: Props) {
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  text: { fontSize: 11, fontWeight: '700', letterSpacing: 0.2 },
});
