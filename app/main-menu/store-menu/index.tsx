import { gs } from "@/src/styles/globalStyles";
import { useRouter } from "expo-router";
import { LucideIcon, PackageOpen } from "lucide-react-native";
import { memo, useCallback, useState } from "react";
import { FlatList, ListRenderItem, Pressable, Text, View } from "react-native";

interface menus {
    title: string;
    goToURL: () => void;
    icon: LucideIcon;
}

const StoreMenuIndex = memo(() => {
    const [listHeight, setListHeight] = useState(0);
    const router = useRouter();

    const menus: menus[] = [
        {
            title: 'BOOSTER',
            goToURL: () => {
                router.push('/main-menu/store-menu/booster-menu')
            },
            icon: PackageOpen
        }
    ];

    const ITEM_HEIGHT = listHeight / 5;
    const renderItem: ListRenderItem<menus> = useCallback(({ item }) => {
        return (
            <View
                style={[{ height: ITEM_HEIGHT, width: '100%' }, gs.p5]}>
                <Pressable
                    style={[gs.full_size, gs.border_card, gs.all_center]}
                    onPress={item.goToURL}>
                    <item.icon></item.icon>
                    <Text>
                        {item.title}
                    </Text>
                </Pressable>
            </View>
        )
    }, [ITEM_HEIGHT]);

    return (
        <View style={[gs.full_size]}>
            <View style={[gs.f1, gs.all_center, gs.header]}>
                <Text>STORE</Text>
            </View>
            <View style={[gs.full_size, gs.f9, gs.p10]}
                onLayout={(e) => setListHeight(e.nativeEvent.layout.height)}>
                {listHeight > 0 &&
                    <FlatList
                        data={menus}
                        keyExtractor={(item) => item.title}
                        renderItem={renderItem} />
                }
            </View>

        </View>
    );
});

// Explicit display name for debugging
StoreMenuIndex.displayName = "StoreMenuIndex";

export default StoreMenuIndex;