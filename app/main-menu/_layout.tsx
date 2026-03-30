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
                listeners={({ navigation }) => ({
                    tabPress: (e) => {
                        // 2. Now you can use it
                        if (navigation.isFocused()) {
                            e.preventDefault();
                        }
                    },
                })}
            />
            <Tabs.Screen
                name="inventory-menu"
                options={{
                    title: 'INVENTORY',
                    popToTopOnBlur: true,
                    tabBarIcon: () => <Archive></Archive>,
                }}
                listeners={({ navigation }) => ({
                    tabPress: (e) => {
                        // 2. Now you can use it
                        if (navigation.isFocused()) {
                            e.preventDefault();
                        }
                    },
                })}
            />
            <Tabs.Screen
                name="team-menu"
                options={{
                    title: 'TEAM',
                    tabBarIcon: () => <UsersRoundIcon></UsersRoundIcon>,
                }}
                listeners={({ navigation }) => ({
                    tabPress: (e) => {
                        // 2. Now you can use it
                        if (navigation.isFocused()) {
                            e.preventDefault();
                        }
                    },
                })}
            />
            <Tabs.Screen
                name="battle-menu"
                options={{
                    title: 'BATTLE',
                    tabBarIcon: () => <Swords></Swords>,
                }}
                listeners={({ navigation }) => ({
                    tabPress: (e) => {
                        // 2. Now you can use it
                        if (navigation.isFocused()) {
                            e.preventDefault();
                        }
                    },
                })}
            />
            <Tabs.Screen
                name="store-menu"
                options={{
                    title: 'STORE',
                    tabBarIcon: () => <Store></Store>,
                    popToTopOnBlur: true,
                }}
                listeners={({ navigation }) => ({
                    tabPress: (e) => {
                        // 2. Now you can use it
                        if (navigation.isFocused()) {
                            e.preventDefault();
                        }
                    },
                })}
            />
        </Tabs>
    );
}
