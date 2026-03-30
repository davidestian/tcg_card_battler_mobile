import { gs } from "@/src/styles/globalStyles";
import { useRouter } from "expo-router";
import { IdCard, IdCardLanyardIcon, LucideIcon } from "lucide-react-native";
import { memo, useCallback, useState } from "react";
import { FlatList, ListRenderItem, Pressable, Text, View } from "react-native";

interface menus {
    title: string;
    goToURL: () => void;
    icon: LucideIcon;
}

const Index = memo(() => {
    const [listHeight, setListHeight] = useState(0);
    const router = useRouter();

    const menus: menus[] = [
        {
            title: 'UNITS',
            goToURL: () => {
                router.push('/main-menu/inventory-menu/unit-menu')
            },
            icon: IdCard
        },
        {
            title: 'CARDS',
            goToURL: () => {
                router.push('/main-menu/inventory-menu/card-menu')
            },

            icon: IdCardLanyardIcon
        },
    ];

    const ITEM_HEIGHT = listHeight / 5;
    const renderItem: ListRenderItem<menus> = useCallback(({ item }) => {
        return (
            <View
                style={[{ height: ITEM_HEIGHT, width: '100%' }, gs.p5]}>
                <Pressable
                    style={[gs.full_size, gs.border_card, gs.all_center]}
                    onPress={item.goToURL}>
                    <item.icon />
                    <Text>
                        {item.title}
                    </Text>
                </Pressable>
            </View>
        )
    }, [ITEM_HEIGHT]);

    return (
        <View style={[gs.full_size, gs.p10]}
            onLayout={(e) => setListHeight(e.nativeEvent.layout.height)}>
            {listHeight > 0 &&
                <FlatList
                    data={menus}
                    keyExtractor={(item) => item.title}
                    renderItem={renderItem} />
            }
        </View>
    );
});

export default Index;