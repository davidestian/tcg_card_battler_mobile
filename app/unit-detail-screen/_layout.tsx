import { Tabs, useLocalSearchParams } from "expo-router";
import { IdCardLanyardIcon, ListIcon, NetworkIcon } from "lucide-react-native";

export default function unitDetailScreenLayout() {
    const { playerUnitID } = useLocalSearchParams();

    return (
        <Tabs screenOptions={{ headerShown: false }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'UNIT DETAIL',
                    tabBarIcon: () => <IdCardLanyardIcon></IdCardLanyardIcon>,
                }}
                listeners={({ navigation }) => ({
                    tabPress: (e) => {
                        // 2. Now you can use it
                        if (navigation.isFocused()) {
                            e.preventDefault();
                        }
                    },
                })}
                initialParams={{ playerUnitID: playerUnitID }}
            />
            <Tabs.Screen
                name="unit-prev-path-screen"
                options={{
                    title: 'PREV PATH',
                    tabBarIcon: () => <ListIcon></ListIcon>,
                }}
                listeners={({ navigation }) => ({
                    tabPress: (e) => {
                        if (navigation.isFocused()) {
                            e.preventDefault();
                        }
                    },
                })}
                initialParams={{ playerUnitID: playerUnitID }}
            />
            <Tabs.Screen
                name="unit-next-path-screen"
                options={{
                    title: 'NEXT PATH',
                    tabBarIcon: () => <NetworkIcon></NetworkIcon>,
                }}
                listeners={({ navigation }) => ({
                    tabPress: (e) => {
                        if (navigation.isFocused()) {
                            e.preventDefault();
                        }
                    },
                })}
                initialParams={{ playerUnitID: playerUnitID }}
            />
        </Tabs>
    );
}
