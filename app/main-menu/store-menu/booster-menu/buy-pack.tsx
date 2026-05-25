import { storePostBuyBoosterPack } from "@/src/api/store/service";
import { BoosterCard } from "@/src/api/store/type";
import { getBackCardImage } from "@/src/assets/backCardImages";
import CardSlotComponent from "@/src/components/general/CardSlotComponent";
import MessageModalComponent from "@/src/components/general/MessageModalComponent";
import OpenPackResultMModalComopnent from "@/src/components/mainMenu/inventoryMenu/storeMenu/boosterMenu/OpenPackResultModalComponent";
import { getUnitCardImagePath } from "@/src/services/generalService";
import { gs } from "@/src/styles/globalStyles";
import { router, useLocalSearchParams } from "expo-router";
import { memo, useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, ListRenderItem, Pressable, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from "react-native-reanimated";

const StoreMenuBuyPack = memo(() => {
    const [isLoading, setIsLoading] = useState(true);
    const { boosterCode, boosterName, qty } = useLocalSearchParams();
    const [packs, setPacks] = useState<BoosterCard[][]>([]);
    const [currIndexPack, setCurrIndexPack] = useState(0);
    const [message, setMessage] = useState('');
    const [currFlippedCard, setCurrFlippedCard] = useState(0);
    const [listHeight, setListHeight] = useState(0);
    const [isResult, setIsResult] = useState(false);

    const init = useCallback(async () => {
        const res = await storePostBuyBoosterPack({ boosterCode: String(boosterCode), qty: Number(qty) });
        if (!res.success) {
            setMessage(res.message)
            return;
        }

        for (let i = 0; i < res.data.cards.length; i++) {
            for (let j = 0; j < res.data.cards[i].length; j++) {
                res.data.cards[i][j].imgURL = await getUnitCardImagePath(
                    res.data.cards[i][j].origin,
                    res.data.cards[i][j].cardCode,
                    res.data.cards[i][j].imageTypeNumber
                );
                res.data.cards[i][j].index = j
            }
        }
        const resolvedPacks = await Promise.all(
            res.data.cards.map(async (pack: BoosterCard[]) => {
                const resolvedCards = await Promise.all(
                    pack.map(async (card: BoosterCard, index) => {
                        const imgURL = await getUnitCardImagePath(
                            card.origin,
                            card.cardCode,
                            card.imageTypeNumber
                        );
                        return { ...card, index: index, imgURL };
                    })
                );
                return resolvedCards;
            })
        );

        setCurrFlippedCard(0);
        setMessage('');
        setCurrIndexPack(0);
        setIsResult(false);
        setPacks(resolvedPacks);
    }, [boosterCode, qty]);

    useEffect(() => {
        setIsLoading(true);
        init().finally(() => { setIsLoading(false) });
    }, [init]);

    const onPressCard = useCallback((index: number) => {
        setPacks((prev) => {
            return prev.map((pack, i) => {
                if (i !== currIndexPack) return pack;

                return pack.map((card, j) => {
                    if (j !== index) return card;

                    return {
                        ...card,
                        isShow: true
                    }
                });
            });
        });
        setCurrFlippedCard((prev) => prev + 1);
    }, [currIndexPack]);

    const ITEM_HEIGHT = listHeight / 3;
    const cardRenderItem: ListRenderItem<BoosterCard> = useCallback(({ item, index }) => {
        return (
            <Animated.View
                entering={SlideInDown.delay(index * 100)}
                exiting={SlideOutDown}
                style={[{ height: ITEM_HEIGHT, width: '50%' }, gs.all_center, gs.p5]}>
                <CardSlotComponent
                    backURL={getBackCardImage(item.origin)}
                    onPress={onPressCard}
                    index={index}
                    imgURL={item.imgURL}
                    isShow={item.isShow}
                    footerText={item.cardRarityCode}
                    isOneTime={true} />
            </Animated.View>
        );
    }, [ITEM_HEIGHT, onPressCard]);

    const onClose = useCallback(() => {
        setMessage('');
        router.back();
    }, [router]);

    const onNextPress = useCallback(() => {
        if (currFlippedCard !== 6) {
            setPacks((prev) => {
                return prev.map((pack, i) => {
                    if (i !== currIndexPack) return pack;

                    return pack.map((card, j) => {
                        return {
                            ...card,
                            isShow: true
                        }
                    });
                });
            });
            setCurrFlippedCard(6);
        } else if (currIndexPack === packs.length - 1) {
            setIsResult(true);
        }
        else {
            setCurrIndexPack((prev) => prev + 1);
            setCurrFlippedCard(0);
        }
    }, [currIndexPack, currFlippedCard, packs]);

    const onSkipPress = useCallback(() => {
        setIsResult(true);
    }, [])

    return (
        <Animated.View style={gs.full_size} entering={FadeIn} exiting={FadeOut}>
            {isLoading &&
                <View style={[gs.full_size, gs.all_center]}>
                    <ActivityIndicator size="large" color="#0000ff" />
                </View>
            }
            {!isLoading && packs.length > 0 &&
                <View style={gs.full_size}>
                    <View style={[gs.f1, gs.full_size, gs.all_center, gs.header]}>
                        <Text>
                            {boosterCode} - {boosterName}
                        </Text>
                    </View>
                    <View style={[gs.f8, gs.column, gs.p5]}>
                        <View style={[gs.f1]}></View>
                        <View style={[gs.f8]}
                            onLayout={(e) => { setListHeight(e.nativeEvent.layout.height) }}>
                            {listHeight > 0 &&
                                <FlatList
                                    key={`list-pack-${currIndexPack}`}
                                    data={packs[currIndexPack]}
                                    numColumns={2}
                                    renderItem={cardRenderItem}
                                    keyExtractor={(item) => `pack-${currIndexPack}-card-${item.index}`}
                                    extraData={packs}
                                    removeClippedSubviews={false}
                                />
                            }
                        </View>
                        <View style={[gs.f1]}></View>
                    </View>
                    <View style={[gs.f1, gs.full_size, gs.column, gs.p5]}>
                        <Pressable accessibilityLabel="button"
                            style={[gs.f1, gs.all_center]}
                            onPress={onSkipPress}>
                            <Text>
                                SKIP
                            </Text>
                        </Pressable>
                        <Pressable accessibilityLabel="button"
                            style={[gs.f1, gs.all_center]}>
                            <Text>
                                {currIndexPack + 1} / {packs.length}
                            </Text>
                        </Pressable>
                        <Pressable accessibilityLabel="button"
                            style={[gs.f1, gs.all_center]}
                            onPress={onNextPress}>
                            <Text>
                                NEXT
                            </Text>
                        </Pressable>
                    </View>
                </View>
            }
            <MessageModalComponent message={message} onClose={onClose} />
            <OpenPackResultMModalComopnent cards={packs.flat()} isShow={isResult} onClose={onClose} />
        </Animated.View>
    )
});

export default StoreMenuBuyPack;