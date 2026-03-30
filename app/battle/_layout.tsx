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
                    paddingTop: insets.top,
                    paddingBottom: insets.bottom,
                    flex: 1,
                },
            }}
        >
            <Stack.Screen name="index" />
        </Stack>
    );
}

export default function BattleLayout() {
    // Note: You must be inside a SafeAreaProvider to use hooks
    return (
        <SafeAreaProvider>
            <LayoutContent />
        </SafeAreaProvider>
    );
}
