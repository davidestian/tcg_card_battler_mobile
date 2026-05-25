import { storeGetAllBoosterCard, storeGetBoosterRarityRate } from "@/src/api/store/service";
import { BoosterCard, BoosterCardPercentage } from "@/src/api/store/type";
import CardComponent from "@/src/components/general/CardComponent";
import GeneralHeaderBarComponent from "@/src/components/general/GeneralHeaderBarComponent";
import LoadingModalComponent from "@/src/components/general/LoadingModalComponent";
import { getUnitCardImagePath } from "@/src/services/generalService";
import { scaleMin } from "@/src/services/scalingSizeService";
import { gs } from "@/src/styles/globalStyles";
import { useLocalSearchParams } from "expo-router";
import { memo, useCallback, useEffect, useState } from "react";
import { FlatList, ListRenderItem, Text, View } from "react-native";
import Animated, { FadeIn, SlideInDown, SlideOutDown } from "react-native-reanimated";


const BoosterDetailScreen = memo(() => {
    const { boosterCodeParam, boosterNameParam, priceParam } = useLocalSearchParams();
    const boosterCode = Array.isArray(boosterCodeParam) ? boosterCodeParam[0] : boosterCodeParam;
    const boosterName = Array.isArray(boosterNameParam) ? boosterNameParam[0] : boosterNameParam;
    const price = Array.isArray(priceParam) ? priceParam[0] : priceParam;

    const [isLoading, setIsLoading] = useState(true);
    const [boosterCards, setBoosterCards] = useState<BoosterCard[]>([]);
    const [boosterRarities, setBoosterRarities] = useState<BoosterCardPercentage[]>([]);
    const [listWidth, setListWidth] = useState(0);
    const [listHeight, setListHeight] = useState(0);

    const init = useCallback(async () => {
        const [resCard, resRate] = await Promise.all([
            storeGetAllBoosterCard(boosterCode),
            storeGetBoosterRarityRate(boosterCode)
        ]);

        if (!resCard.success || !resRate.success) {
            console.error("Failed to fetch booster data");
        }

        for (let i = 0; i < resCard.data.cards.length; i++) {
            resCard.data.cards[i].imgURL = await getUnitCardImagePath(
                resCard.data.cards[i].origin,
                resCard.data.cards[i].cardCode,
                resCard.data.cards[i].imageTypeNumber);
        }

        setBoosterCards(resCard.data.cards);
        setBoosterRarities(resRate.data.items);
    }, []);

    useEffect(() => {
        setIsLoading(true);
        init().finally(() => setIsLoading(false));
    }, [init]);

    const ITEM_WIDTH = listWidth / 5;
    const rarityRenderItem: ListRenderItem<BoosterCardPercentage> = useCallback(({ item }) => {
        return (
            <View style={[{ height: '100%', width: ITEM_WIDTH }, gs.all_center, gs.p5]}>
                <View style={[gs.f1, gs.all_center]}>
                    <Text style={[gs.fontM]}>
                        {item.cardRarityCode}
                    </Text>
                </View>
                <View style={[gs.f1, gs.all_center]}>
                    <Text style={[gs.fontM]}>
                        {item.percentage}%
                    </Text>
                </View>
            </View>
        );
    }, [ITEM_WIDTH]);

    const ITEM_HEIGHT = listHeight / scaleMin(3);
    const cardRenderItem: ListRenderItem<BoosterCard> = useCallback(({ item, index }) => {
        return (
            <View style={[{ height: ITEM_HEIGHT, width: '33%' }, gs.all_center, gs.p5]}>
                <CardComponent imgURL={item.imgURL} footerText={item.cardRarityCode} elements={[item.elementID1, item.elementID2]} />
            </View>
        );
    }, [ITEM_HEIGHT]);

    return (
        <View style={[gs.full_size]}>
            <Animated.View
                entering={SlideInDown}
                exiting={SlideOutDown}
                style={[gs.full_size]}>
                <View style={[gs.f1]}>
                    <GeneralHeaderBarComponent title="BOOSTER DETAIL"></GeneralHeaderBarComponent>
                </View>
                <Animated.View style={[gs.f9, gs.full_size, gs.all_center]} entering={FadeIn.delay(500)}>
                    {!isLoading &&
                        <>
                            <View style={[gs.f05, gs.all_center]}>
                                <Text style={[gs.fontM]}>{boosterName}</Text>
                            </View>
                            <View style={[gs.f05, gs.all_center, gs.column]}>
                                <View style={[gs.f1, gs.all_center]}>
                                    <Text style={[gs.fontM]}>CODE : {boosterCode}</Text>
                                </View>
                                <View style={[gs.f1, gs.all_center]}>
                                    <Text style={[gs.fontM]}>PRICE : {price}</Text>
                                </View>
                            </View>
                            <View style={[gs.f1, gs.all_center, gs.full_size]}
                                onLayout={(e) => setListWidth(e.nativeEvent.layout.width)}>
                                {!isLoading &&
                                    <FlatList
                                        data={boosterRarities}
                                        horizontal
                                        renderItem={rarityRenderItem}
                                        keyExtractor={(item) => item.cardRarityCode}
                                        extraData={boosterRarities}
                                    />
                                }
                            </View>
                            <View style={[gs.f8, gs.all_center, gs.row, gs.border_y, gs.p5]}>
                                <View style={[gs.all_center, gs.full_size]}
                                    onLayout={(e) => setListHeight(e.nativeEvent.layout.height)}>
                                    {listHeight > 0 &&
                                        <FlatList
                                            data={boosterCards}
                                            renderItem={cardRenderItem}
                                            numColumns={3}
                                            keyExtractor={(item) => `${item.cardCode}-${item.imageTypeNumber}`}
                                            showsHorizontalScrollIndicator={false}
                                            removeClippedSubviews={true}
                                        />
                                    }
                                </View>
                            </View>
                        </>
                    }
                </Animated.View>
                <LoadingModalComponent visible={isLoading}></LoadingModalComponent>
            </Animated.View>
        </View>
    )
});

export default BoosterDetailScreen;