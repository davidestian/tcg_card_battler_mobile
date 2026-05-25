import { BoosterCard } from "@/src/api/store/type";
import CardSlotComponent from "@/src/components/general/CardSlotComponent";
import { gs } from "@/src/styles/globalStyles";
import { memo, useCallback, useEffect, useState } from "react";
import { FlatList, ListRenderItem, Modal, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface props {
    isShow: boolean;
    cards?: BoosterCard[];
    onClose: () => void;
}

interface GroupedRarity {
    rarityCode: string;
    price: number;
    cards: GroupedCard[];
}

interface GroupedCard {
    imgURL: string;
    qty: number;
}

const OpenPackResultMModalComopnent = memo(({ isShow, cards, onClose }: props) => {
    const [isLoading, setIsLoading] = useState(true);
    const [groupedRarities, setGroupedRarities] = useState<GroupedRarity[]>([]);
    const [listHeight, setListHeight] = useState(0);
    const [listWidth, setListWidth] = useState(0);

    useEffect(() => {
        setIsLoading(true);

        if (cards && cards.length > 0) {
            const groupedMap = cards.reduce((accumulator, currentCard) => {
                const { cardRarityCode, price, imgURL } = currentCard;

                if (!accumulator.has(cardRarityCode)) {
                    // Set the value as an object containing the price and a new Map
                    accumulator.set(cardRarityCode, {
                        price: price,
                        cardsMap: new Map<string, GroupedCard>()
                    });
                }

                const rarityMap = accumulator.get(cardRarityCode)!;

                if (rarityMap.cardsMap.has(imgURL)) {
                    rarityMap.cardsMap.get(imgURL)!.qty += 1;
                } else {
                    rarityMap.cardsMap.set(imgURL, { imgURL, qty: 1 });
                }

                return accumulator;
            }, new Map<string, { price: number, cardsMap: Map<string, GroupedCard> }>());

            // 2. Convert the nested Maps into your GroupedRarity[] structure
            const finalData: GroupedRarity[] = Array.from(groupedMap.entries()).map(
                ([rarityCode, val]): GroupedRarity => {
                    return {
                        rarityCode: rarityCode,
                        price: val.price,
                        cards: Array.from(val.cardsMap.values()).sort((a, b) => b.qty - a.qty)
                    };
                }
            ).sort((a, b) => b.price - a.price);

            setGroupedRarities(finalData);
        }

        setIsLoading(false);
    }, [cards]);

    const ITEM_HEIGHT = listHeight / 3.5;
    const headerList: ListRenderItem<GroupedRarity> = useCallback(({ item }) => {
        return (
            <View style={[{ height: ITEM_HEIGHT, width: '100%' }, gs.p5]}>
                <View style={[gs.f2, gs.full_size, gs.all_center]}>
                    <Text style={[gs.fontM, gs.border_bottom]}>
                        {item.rarityCode}
                    </Text>
                </View>
                <View style={[gs.f8, gs.full_size]}>
                    <FlatList
                        data={item.cards}
                        renderItem={cardRenderItem}
                        horizontal
                        scrollEnabled
                        keyExtractor={(item) => item.imgURL}
                    />
                </View>
            </View>
        );
    }, [ITEM_HEIGHT]);

    const ITEM_WIDTH = listWidth / 3.5;
    const cardRenderItem: ListRenderItem<GroupedCard> = useCallback(({ item, index }) => {
        return (
            <View style={[{ height: '100%', width: ITEM_WIDTH }, gs.all_center, gs.p5]}>
                <CardSlotComponent index={index} imgURL={item.imgURL} footerText={`X ${String(item.qty)}`} isShow={true} />
            </View>
        );
    }, [ITEM_WIDTH]);

    return (
        <Modal
            onRequestClose={onClose}
            visible={isShow}>
            {!isLoading &&
                <SafeAreaView style={[gs.full_size]}>
                    <View style={[gs.f1, gs.all_center, gs.header]}>
                        <Text style={[gs.fontM]}>
                            RESULT PACK
                        </Text>
                    </View>
                    <View style={[gs.f9, gs.all_center, gs.full_size]}
                        onLayout={(e) => {
                            setListHeight(e.nativeEvent.layout.height);
                            setListWidth(e.nativeEvent.layout.width);
                        }}>
                        {listHeight > 0 && listWidth > 0 &&
                            <FlatList
                                data={groupedRarities}
                                renderItem={headerList}
                                keyExtractor={(item) => item.rarityCode}
                            />
                        }
                    </View>
                    <Pressable style={[gs.f05, gs.all_center]}
                        onPress={onClose}>
                        <Text style={[gs.fontM, { color: 'red' }]}>
                            CLOSE
                        </Text>
                    </Pressable>
                </SafeAreaView>
            }
        </Modal>
    )
});

export default OpenPackResultMModalComopnent;