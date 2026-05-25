import { Tabs } from "expo-router";
import { Archive, Store, Swords, Tent, UsersRoundIcon } from "lucide-react-native";

export default function mainMenuLayout() {
    return (
        <Tabs screenOptions={{ headerShown: false }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'HOME',
                    tabBarIcon: () => <Tent></Tent>,
                }}
            />
            <Tabs.Screen
                name="inventory-menu"
                options={{
                    title: 'INVENTORY',
                    popToTopOnBlur: true,
                    tabBarIcon: () => <Archive></Archive>,
                }}
            />
            <Tabs.Screen
                name="team-menu"
                options={{
                    title: 'TEAM',
                    tabBarIcon: () => <UsersRoundIcon></UsersRoundIcon>,
                }}
            />
            <Tabs.Screen
                name="battle-menu"
                options={{
                    title: 'BATTLE',
                    tabBarIcon: () => <Swords></Swords>,
                }}
            />
            <Tabs.Screen
                name="store-menu"
                options={{
                    title: 'STORE',
                    tabBarIcon: () => <Store></Store>,
                    popToTopOnBlur: true,
                }}
            />
        </Tabs>
    );
}
