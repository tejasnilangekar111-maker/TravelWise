import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '../constants/theme';
import { TravelProvider } from '../context/TravelContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <TravelProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="option/[mode]" />
        </Stack>
      </TravelProvider>
    </SafeAreaProvider>
  );
}
