import { Stack } from "expo-router";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";

function LayoutContent() {
  const insets = useSafeAreaInsets();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // Applies padding to the container of every screen
        contentStyle: {
          paddingBottom: insets.bottom,
          flex: 1,
        },
      }}
    >
      <Stack.Screen name="unit-change-image-screen" />
      <Stack.Screen name="unit-upgrade-screen" />
    </Stack>
  );
}
export default function UnitDetailScreen2() {
  return (
    <SafeAreaProvider>
      <LayoutContent />
    </SafeAreaProvider>
  );
}
