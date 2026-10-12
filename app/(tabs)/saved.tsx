import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SavedCommuteCard } from '../../components/SavedCommuteCard';
import { StateMessage } from '../../components/StateMessage';
import { colors, font, radius, spacing } from '../../constants/theme';
import { useTravel } from '../../context/TravelContext';
import type { SavedCommute } from '../../types/travel';

export default function SavedScreen() {
  const router = useRouter();
  const { savedCommutes, applyCommute, removeCommute } = useTravel();

  const openCommute = (c: SavedCommute) => {
    applyCommute(c);
    router.navigate('/');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>My Commutes</Text>
        <Text style={styles.subtitle}>Tap a commute to load it into your search.</Text>

        {savedCommutes.length === 0 ? (
          <StateMessage
            icon="heart-outline"
            title="No saved commutes yet"
            message="Search a route and tap the heart on the results page to save it here."
            actionLabel="Plan a trip"
            actionIcon="search"
            onAction={() => router.navigate('/')}
          />
        ) : (
          <View style={{ gap: spacing.md }}>
            {savedCommutes.map((c) => (
              <SavedCommuteCard
                key={c.id}
                commute={c}
                onPress={() => openCommute(c)}
                onRemove={() => removeCommute(c.id)}
              />
            ))}
          </View>
        )}

        {savedCommutes.length > 0 && (
          <View style={styles.tip}>
            <Ionicons name="bulb-outline" size={16} color={colors.accent} />
            <Text style={styles.tipText}>
              Save any route from the results page with the heart icon.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingBottom: spacing.xxl * 2 },
  title: { ...font.display, color: colors.text },
  subtitle: { ...font.body, color: colors.textSecondary, marginTop: 4, marginBottom: spacing.xl },
  tip: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.xl,
  },
  tipText: { ...font.small, color: colors.text, flex: 1 },
});
