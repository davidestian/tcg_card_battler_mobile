import { Stack } from "expo-router";

export default function storeMenuLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="booster-menu" />
        </Stack>
    );
}
