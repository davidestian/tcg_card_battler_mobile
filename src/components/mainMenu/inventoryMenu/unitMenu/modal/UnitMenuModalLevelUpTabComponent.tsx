import { invGetPlayerUnitCardByUnitCode, invPostPlayerUnitLevelUp } from "@/src/api/inventory/service";
import { CostCardItemRQ, InvGetPlayerCardByUnitCodeRS, InvPostPlayerUnitLevelUpRQ } from "@/src/api/inventory/type";
import { getUnitCardImagePath } from "@/src/services/generalService";
import { gs } from "@/src/styles/globalStyles";
import { Image } from "expo-image";
import { ListRestart, Upload } from "lucide-react-native";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, ListRenderItem, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

interface props {
    playerUnitID: string;
    unitName: string;
    firstUnitCode: string;
    lastUnitCode: string;
    origin: string;
    imageTypeNumber: number;
    unitLevel: number;
    tags: string[];
    refreshHome: () => void;
}

const AVAILABLE_COLOR = 'rgb(157, 255, 130)';
const UNAVAILABLE_COLOR = 'rgb(255, 130, 130)';

const UnitMenuModalLevelUpTabComponent = memo(({ playerUnitID, firstUnitCode, lastUnitCode, origin, imageTypeNumber, unitLevel, unitName, tags, refreshHome }: props) => {
    const [isLoading, setIsLoading] = useState(true);
    const [cards, setCards] = useState<InvGetPlayerCardByUnitCodeRS[]>([]);
    const [imgPath, setImgPath] = useState('');
    const [listHeight, setListHeight] = useState(0);

    const [currSelectedQTY, setCurrSelectedQTY] = useState(0);
    const currSelectedQTYRef = useRef(currSelectedQTY);
    useEffect(() => {
        currSelectedQTYRef.current = currSelectedQTY;
    }, [currSelectedQTY]);

    const getCards = useCallback(async (unitCode: string) => {
        const res = await invGetPlayerUnitCardByUnitCode(unitCode);
        if (!res.success) { return; }

        if (res.data.length === 0) { return; }

        const updatedData = await Promise.all(
            res.data.map(async (item) => ({
                ...item,
                imgURL: await getUnitCardImagePath(item.origin, item.cardCode, item.imageTypeNumber),
                currQTY: 0
            }))
        );

        setCards(updatedData);
    }, []);

    const setImage = useCallback(async (origin: string, unitCode: string, imageTypeNumber: number) => {
        const unitFile = await getUnitCardImagePath(origin, unitCode, imageTypeNumber);
        setImgPath(unitFile);
    }, []);

    const init = useCallback(async () => {
        if (playerUnitID === '') return;

        await Promise.all([
            setImage(origin, lastUnitCode, imageTypeNumber),
            getCards(firstUnitCode)
        ]);

        setCurrSelectedQTY(0);
    }, [playerUnitID, origin, firstUnitCode, lastUnitCode, imageTypeNumber]);

    useEffect(() => {
        setIsLoading(true);
        init().finally(() => setIsLoading(false));
    }, [init]);

    const onPressCard = useCallback((imgTypeNumber: number, curr: number, max: number, qty: number) => {
        qty = Math.min(10 - currSelectedQTYRef.current, qty);
        qty = Math.min(max - curr, qty);
        if (currSelectedQTYRef.current + qty > 10 || curr + qty > max) return;

        setCards((prev) => {
            return prev.map((card) => {
                return card.imageTypeNumber !== imgTypeNumber ? card : { ...card, currQTY: Math.min(card.currQTY + qty, card.qty) }
            });
        });

        setCurrSelectedQTY((prev) => prev + qty);
    }, []);

    const onResetPress = useCallback(() => {
        setCurrSelectedQTY(0);
        setCards((prev) => {
            return prev.map((card) => {
                return {
                    ...card,
                    currQTY: 0
                };
            })
        })
    }, []);

    const prepareRequestLevelUp = useCallback((): InvPostPlayerUnitLevelUpRQ => ({
        playerUnitID,
        items: cards
            .filter(card => card.currQTY > 0)
            .map((card): CostCardItemRQ => ({
                imageTypeNumber: card.imageTypeNumber,
                qty: card.currQTY
            }))
    }), [playerUnitID, cards]);

    const onLevelUpPress = useCallback(async () => {
        if (currSelectedQTYRef.current < 10)
            return;

        setIsLoading(true);
        try {
            const request = prepareRequestLevelUp();
            const res = await invPostPlayerUnitLevelUp(request);
            if (!res.success) { return; }

            refreshHome();
        } catch (error) {
            console.error("Level up failed:", error);
        } finally {
            setIsLoading(false);
        }
    }, [prepareRequestLevelUp, unitLevel]);

    const CardItem = memo(({ item, h, onPress }: {
        item: InvGetPlayerCardByUnitCodeRS,
        h: number,
        onPress: (imgType: number, curr: number, max: number, qty: number) => void
    }) => {
        const onPress1 = () => {
            onPress(item.imageTypeNumber, item.currQTY, item.qty, 1)
        };

        const onPress10 = () => {
            onPress(item.imageTypeNumber, item.currQTY, item.qty, 10)
        };

        return (
            <View style={[{ width: '25%', height: h }, gs.p5, gs.row]}>
                <View style={[gs.f6]}>
                    <Image
                        source={item.imgURL}
                        contentFit="fill"
                        style={[gs.full_size, gs.border_card, gs.all_center]}
                    />
                </View>
                <View style={[gs.f2, gs.all_center]}>
                    <Text>{item.currQTY} / {item.qty}</Text>
                </View>
                <View style={[gs.f2, gs.full_size, gs.column]}>
                    <Pressable style={[gs.f1, gs.all_center, gs.border_card]}
                        onPress={onPress1}
                        accessibilityLabel="button">
                        <Text>+ 1</Text>
                    </Pressable>
                    <Pressable style={[gs.f1, gs.all_center, gs.border_card]}
                        onPress={onPress10}
                        accessibilityLabel="button">
                        <Text>+ 10</Text>
                    </Pressable>
                </View>
            </View>
        );
    });

    const ITEM_HEIGHT = listHeight / 2;
    const renderItem: ListRenderItem<InvGetPlayerCardByUnitCodeRS> = useCallback(({ item }) => {
        return (
            <CardItem
                item={item}
                h={ITEM_HEIGHT}
                onPress={onPressCard}
            />
        );
    }, [ITEM_HEIGHT, onPressCard]);

    return (
        <View style={[gs.full_size]}>
            {isLoading &&
                <Animated.View exiting={FadeOut} style={[gs.full_size, gs.all_center]}>
                    <ActivityIndicator size="large" color="#0000ff" />
                </Animated.View>
            }
            {!isLoading &&
                <Animated.View entering={FadeIn} style={[gs.full_size]}>
                    <View style={[gs.f3, gs.full_size, gs.column, gs.p5, styles.header]}>
                        <View style={[gs.f4, { paddingRight: 5 }]}>
                            <Image
                                source={imgPath}
                                contentFit="fill"
                                style={[gs.full_size, gs.border_card]}
                            />
                        </View>
                        <View style={[gs.f6, gs.row]}>
                            <View style={[gs.f1, gs.all_center]}>
                                <Text>{unitName}</Text>
                            </View>
                            <View style={[gs.f1, gs.column]}>
                                <View style={[gs.f2, gs.all_center]}>
                                    <Text>lvl. {unitLevel} / 10</Text>
                                </View>
                                <View style={[gs.f2, gs.all_center]}>
                                    <Text>{lastUnitCode}</Text>
                                </View>
                            </View>
                            <View style={[gs.f3]}>
                                <View style={[gs.f1, gs.border_card, gs.all_center]}>
                                    <Text style={{ fontSize: 10 }}>
                                        {tags}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                    {unitLevel >= 10 ?
                        <View style={[gs.f7, gs.full_size, gs.all_center]}>
                            <Text style={{ fontSize: 36 }}>
                                MAX LEVEL
                            </Text>
                        </View> :
                        <View style={[gs.f7, gs.p5, gs.row, gs.full_size]}>
                            {
                                cards.length <= 0 ?
                                    <View style={[gs.f9, gs.all_center, gs.full_size, gs.f5]}>
                                        <Text>NO AVAILABLE CARDS...</Text>
                                    </View> :
                                    <View style={[gs.f9, gs.full_size]}
                                        onLayout={(e) => setListHeight(e.nativeEvent.layout.height)}>
                                        <FlatList
                                            data={cards}
                                            numColumns={4}
                                            renderItem={renderItem}
                                            keyExtractor={(item) => item.imageTypeNumber.toString()}
                                            extraData={cards} // Tells FlatList to check for data changes
                                        />
                                    </View>
                            }
                            <View style={[gs.f1, gs.column, gs.p5]}>
                                <Pressable style={[gs.f2, gs.all_center, gs.column, gs.border_card]}
                                    onPress={onResetPress}>
                                    <ListRestart />
                                </Pressable>
                                <View style={[gs.f6, gs.all_center]}>
                                    <Text >
                                        COST : {currSelectedQTY} / 10
                                    </Text>
                                </View>
                                <Pressable style={[gs.f2, gs.all_center, gs.column, gs.border_card, currSelectedQTY === 10 ? styles.available : styles.unavailable]}
                                    onPress={onLevelUpPress}>
                                    <Upload />
                                </Pressable>
                            </View>
                        </View>
                    }
                </Animated.View>
            }
        </View >
    );
});

const styles = StyleSheet.create({
    header: {
        borderBottomWidth: 1,
        borderStyle: 'dashed'
    },
    unavailable: {
        backgroundColor: UNAVAILABLE_COLOR
    },
    available: {
        backgroundColor: AVAILABLE_COLOR
    }
});

export default UnitMenuModalLevelUpTabComponent;