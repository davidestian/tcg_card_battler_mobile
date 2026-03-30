import { Stack } from "expo-router";

export default function inventoryMenuLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="create-unit-menu" />
            <Stack.Screen name="unit-menu" />
            <Stack.Screen name="card-menu" />
        </Stack>
    );
}
