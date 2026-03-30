import { invGetAllPlayerCard } from "@/src/api/inventory/service";
import { PlayerCard } from "@/src/api/inventory/type";
import CardSlotComponent from "@/src/components/general/CardSlotComponent";
import { getUnitCardImagePath } from "@/src/services/generalService";
import { gs } from "@/src/styles/globalStyles";
import { ChevronLeftCircleIcon, ChevronRightCircleIcon, IdCardLanyardIcon } from "lucide-react-native";
import { memo, useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, ListRenderItem, Pressable, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

interface filter {
    currPageNumber: number;
    currTotalPage: number;
}

const CardMenu = memo(() => {
    const [isLoading, setIsLoading] = useState(true);
    const [listHeight, setListHeight] = useState(0);
    const [cards, setCards] = useState<PlayerCard[]>([]);
    const [rqFilter, setRQFilter] = useState<filter>({
        currPageNumber: 1,
        currTotalPage: 0
    });

    const getData = useCallback(async (
        isPrev: boolean,
        pageNumber: number,
        cursorPrice = 0,
        cursorCode = '',
        cursorImageTypeNumber = 0
    ) => {
        setIsLoading(true);
        try {
            const res = await invGetAllPlayerCard(16, cursorPrice, cursorCode, cursorImageTypeNumber, isPrev, pageNumber);
            if (!res.success) { return }

            const results = await Promise.all(
                res.data.cards.map(async (c: PlayerCard) => {
                    const imgURL = await getUnitCardImagePath(c.origin, c.cardCode, c.imageTypeNumber);
                    return {
                        ...c,
                        imgURL
                    };
                })
            );

            setRQFilter(() => {
                return {
                    currPageNumber: pageNumber,
                    currTotalPage: res.data.totalPage,
                }
            });
            setCards(results);

        }
        finally {
            setIsLoading(false);
        }
    }, [])

    useEffect(() => {
        getData(false, 1);
    }, []);

    const ITEM_HEIGHT = listHeight / 4;
    const renderItem: ListRenderItem<PlayerCard> = useCallback(({ item, index }) => {
        return (
            <View
                style={[gs.all_center, { width: '25%', height: ITEM_HEIGHT }, gs.p5]}>
                <View style={[gs.f8, gs.full_size]}>
                    <CardSlotComponent
                        imgURL={item.imgURL}
                        index={index}
                        isShow={true}
                        footerText={item.cardRarityCode} />
                </View>
                <View style={[gs.f2, gs.all_center]}>
                    <Text>{item.qty} X</Text>
                </View>
            </View>
        )
    }, [ITEM_HEIGHT]);

    const onPrevPress = useCallback(async () => {
        // 1. Prevent going below Page 1
        if (isLoading || rqFilter.currPageNumber <= 1) return;

        setIsLoading(true);

        // 2. Get the FIRST card (index 0) to seek backwards
        const firstCard = cards[0];

        if (firstCard) {
            await getData(
                true,
                rqFilter.currPageNumber - 1,
                firstCard.price,
                firstCard.cardCode,
                firstCard.imageTypeNumber
            );
        }

        setIsLoading(false);
    }, [rqFilter, cards, isLoading, getData]);

    const onNextPress = useCallback(async () => {
        if (isLoading || rqFilter.currPageNumber >= rqFilter.currTotalPage) return;
        setIsLoading(true);
        const lastCard = cards.at(-1)!;
        await getData(false, rqFilter.currPageNumber + 1, lastCard.price, lastCard.cardCode, lastCard.imageTypeNumber);
        setIsLoading(false);
    }, [rqFilter, cards, isLoading, getData]);

    return (
        <View style={[gs.full_size, gs.row]}>
            <View style={[gs.f1, gs.full_size, gs.all_center, gs.header, gs.border_bottom, gs.column]}>
                <IdCardLanyardIcon />
                <Text> CARDS</Text>
            </View>
            <View style={[gs.f8]}>
                <View style={[gs.p5]}>
                    <View style={[gs.full_size]}
                        onLayout={(e) => setListHeight(e.nativeEvent.layout.height)}>
                        {listHeight > 0 &&
                            <FlatList
                                renderItem={renderItem}
                                numColumns={4}
                                data={cards}
                                keyExtractor={(item) => item.cardCode + item.imageTypeNumber}
                            />
                        }
                    </View>
                </View>
                {isLoading && (
                    <Animated.View
                        entering={FadeIn}
                        exiting={FadeOut.delay(500)}
                        style={[
                            gs.full_size,
                            gs.overlay_loading,
                            gs.all_center
                        ]}
                    >
                        <ActivityIndicator size="large" color="#0000ff" />
                        <Text>Loading Cards...</Text>
                    </Animated.View>
                )}
            </View>
            <View style={[gs.f1, gs.column, gs.border_top]}>
                <Pressable style={[gs.f1, gs.full_size, gs.all_center]}
                    accessibilityLabel="button"
                    onPress={onPrevPress}>
                    <ChevronLeftCircleIcon />
                </Pressable>
                <View style={[gs.f1, gs.full_size, gs.all_center]}>
                    <Text>
                        {rqFilter.currPageNumber} / {rqFilter.currTotalPage}
                    </Text>
                </View>
                <Pressable style={[gs.f1, gs.full_size, gs.all_center]}
                    accessibilityLabel="button"
                    onPress={onNextPress}>
                    <ChevronRightCircleIcon />
                </Pressable>
            </View>
        </View>
    )
});

export default CardMenu;