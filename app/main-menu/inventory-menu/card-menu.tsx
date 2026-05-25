import { invGetAllPlayerCard } from "@/src/api/inventory/service";
import { PlayerCard } from "@/src/api/inventory/type";
import CardSlotComponent from "@/src/components/general/CardSlotComponent";
import GeneralHeaderBarComponent from "@/src/components/general/GeneralHeaderBarComponent";
import LoadingModalComponent from "@/src/components/general/LoadingModalComponent";
import { getUnitCardImagePath } from "@/src/services/generalService";
import { gs } from "@/src/styles/globalStyles";
import { ChevronLeftCircleIcon, ChevronRightCircleIcon } from "lucide-react-native";
import { memo, useCallback, useEffect, useState } from "react";
import { FlatList, ListRenderItem, Pressable, Text, View } from "react-native";

interface filter {
    currPageNumber: number;
    currTotalPage: number;
}

interface cardToSell {
    cardCode: string;
    imageTypeNumber: number;
    currQty: number;
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
        pageNumber: number
    ) => {
        setIsLoading(true);
        try {
            const res = await invGetAllPlayerCard(16, pageNumber);
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
        getData(1);
    }, []);

    const ITEM_HEIGHT = listHeight / 4;
    const renderItem: ListRenderItem<PlayerCard> = useCallback(({ item, index }) => {
        return (
            <View
                style={[gs.all_center, { width: '25%', height: ITEM_HEIGHT }, gs.px5]}>
                <View style={[gs.f8, gs.full_size]}>
                    <CardSlotComponent
                        backURL={item.imgURL}
                        index={index}
                        isShow={false}
                        backText={item.cardRarityCode}
                        footerText="" />
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

        await getData(rqFilter.currPageNumber - 1);
    }, [rqFilter, cards, isLoading, getData]);

    const onNextPress = useCallback(async () => {
        if (isLoading || rqFilter.currPageNumber >= rqFilter.currTotalPage) return;

        await getData(rqFilter.currPageNumber + 1);
    }, [rqFilter, cards, isLoading, getData]);

    return (
        <View style={[gs.full_size, gs.row]}>
            <View style={[gs.f1]}>
                <GeneralHeaderBarComponent title="CARDS" />
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
            <LoadingModalComponent visible={isLoading}></LoadingModalComponent>
        </View>
    )
});

export default CardMenu;