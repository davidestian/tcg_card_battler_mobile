import { invGetPlayerUnitCardByUnitCode, invGetPlayerUnitDetailByID, invPostPlayerUnitUpgrade } from "@/src/api/inventory/service";
import { CostCardItemRQ, InvGetPlayerCardByUnitCodeRS, InvPostUnitUpgradeRQ } from "@/src/api/inventory/type";
import BattleEvolveModalComponent from "@/src/components/battle/BattleEvolveModalComponent";
import { GBox } from "@/src/components/general/GBoxComponent";
import GeneralHeaderBarComponent from "@/src/components/general/GeneralHeaderBarComponent";
import LoadingModalComponent from "@/src/components/general/LoadingModalComponent";
import { getUnitCardImagePath } from "@/src/services/generalService";
import { scaleMin } from "@/src/services/scalingSizeService";
import { gs } from "@/src/styles/globalStyles";
import { Image } from "expo-image";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { ListRestart, Upload } from "lucide-react-native";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { FlatList, ListRenderItem, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FlipInXUp, FlipOutXDown } from "react-native-reanimated";

const AVAILABLE_COLOR = 'rgb(157, 255, 130)';
const UNAVAILABLE_COLOR = 'rgb(255, 130, 130)';

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

const UnitUpgradeScreen = memo(() => {
    const { playerUnitIDP, unitCodeP, unitNameP, imgURLP, unitLevelP, element1P, element2P } = useLocalSearchParams();
    const playerUnitID = Array.isArray(playerUnitIDP) ? playerUnitIDP[0] : playerUnitIDP;
    const unitCode = Array.isArray(unitCodeP) ? unitCodeP[0] : unitCodeP;
    const unitName = Array.isArray(unitNameP) ? unitNameP[0] : unitNameP;
    const imgURL = Array.isArray(imgURLP) ? imgURLP[0] : imgURLP;
    const unitLevel = Number(Array.isArray(unitLevelP) ? unitLevelP[0] : unitLevelP);
    const element1 = Number(Array.isArray(element1P) ? element1P[0] : element1P);
    const element2 = Number(Array.isArray(element2P) ? element2P[0] : element2P);

    const [isLoading, setIsLoading] = useState(false);
    const [cards, setCards] = useState<InvGetPlayerCardByUnitCodeRS[]>([]);
    const [listHeight, setListHeight] = useState(0);
    const [playAnimation, setPlayAnimation] = useState(false);
    const [prevImgURI, setPrevImgURI] = useState('');
    const costRef = useRef(20);

    const [currSelectedQTY, setCurrSelectedQTY] = useState(0);
    const currSelectedQTYRef = useRef(currSelectedQTY);

    useEffect(() => {
        currSelectedQTYRef.current = currSelectedQTY;
    }, [currSelectedQTY]);

    const init = useCallback(async () => {
        try {
            if (unitCode === '') return;
            setIsLoading(true);
            const res = await invGetPlayerUnitDetailByID(playerUnitID);
            if (!res.success) { return; }

            const prevImg = await getUnitCardImagePath(res.data.origin, res.data.lastUnitCode, res.data.imageTypeNumber);

            await getCards(unitCode);

            setPrevImgURI(prevImg);
            setCurrSelectedQTY(0);
        } finally {
            setIsLoading(false);
        }
    }, [unitCode]);

    useFocusEffect(
        useCallback(() => {
            setIsLoading(true);
            init();
        }, [init])
    );

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

    const onPressCard = useCallback((imgTypeNumber: number, curr: number, max: number, qty: number) => {
        qty = Math.min(costRef.current - currSelectedQTYRef.current, qty);
        qty = Math.min(max - curr, qty);
        if (currSelectedQTYRef.current + qty > costRef.current || curr + qty > max) return;

        setCards((prev) => {
            return prev.map((card) => {
                return card.imageTypeNumber !== imgTypeNumber ? card : { ...card, currQTY: Math.min(card.currQTY + qty, card.qty) }
            });
        });

        setCurrSelectedQTY((prev) => prev + qty);
    }, []);

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

    const prepareRequestUpgrade = useCallback((): InvPostUnitUpgradeRQ => ({
        playerUnitID: playerUnitID,
        targetUnitCode: unitCode,
        items: cards
            .filter(card => card.currQTY > 0)
            .map((card): CostCardItemRQ => ({
                imageTypeNumber: card.imageTypeNumber,
                qty: card.currQTY
            }))
    }), [playerUnitID, unitCode, cards]);

    const onUpgradePress = useCallback(async () => {
        if (currSelectedQTYRef.current < costRef.current)
            return;

        setIsLoading(true);
        try {
            const request = prepareRequestUpgrade();
            const res = await invPostPlayerUnitUpgrade(request);
            if (!res.success) { return; }
            setPlayAnimation(true);

        } catch (error) {
            console.error("Level up failed:", error);
        } finally {
            setIsLoading(false);
        }
    }, [prepareRequestUpgrade, costRef.current]);

    const onDone = useCallback(() => {
        setPrevImgURI('');
        setPlayAnimation(false);
        router.back();
    }, []);

    return (
        <View style={gs.full_size}>
            <Animated.View entering={FlipInXUp} exiting={FlipOutXDown}>
                <View style={[gs.full_size, gs.row]}>
                    <View style={[gs.f1]}>
                        <GeneralHeaderBarComponent title="UPGRADE UNIT" />
                    </View>
                    <GBox elements={[element1, element2]} style={[gs.f3, gs.all_center, gs.column, gs.p10]}>
                        <View style={[gs.f4, gs.px5]}>
                            <Image
                                source={imgURL}
                                contentFit="fill"
                                style={[gs.full_size, gs.border_card]}
                            />
                        </View>
                        <View style={[gs.f6, gs.border_card, gs.full_size, { backgroundColor: 'rgba(255,255,255,0.8)' }]}>
                            <View style={[gs.f1, gs.all_center]}>
                                <Text style={[gs.fontM]}>{unitName}</Text>
                            </View>
                            <View style={[gs.f1, gs.column]}>
                                <View style={[gs.f2, gs.all_center]}>
                                    <Text style={[gs.fontM]}>lvl. {unitLevel}</Text>
                                </View>
                                <View style={[gs.f3, gs.all_center]}>
                                    <Text style={[gs.fontM]}>{unitCode}</Text>
                                </View>
                            </View>
                            <View style={[gs.f3]}>
                            </View>
                        </View>
                    </GBox>
                    <View style={[gs.f5, gs.all_center, gs.p5, styles.top_box]}>
                        {cards.length <= 0 ?
                            <View style={[gs.f3, gs.all_center, gs.full_size, gs.f5]}>
                                <Text style={[gs.fontL]}>NO AVAILABLE CARDS...</Text>
                            </View> :
                            <View style={[gs.f3, gs.full_size]}
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
                    </View>
                    <View style={[gs.f1, gs.column, gs.p5]}>
                        <Pressable style={[gs.f2, gs.all_center, gs.column, gs.border_card]}
                            onPress={onResetPress}>
                            <ListRestart size={scaleMin(18)} />
                        </Pressable>
                        <View style={[gs.f6, gs.all_center]}>
                            <Text style={gs.fontM}>
                                COST : {currSelectedQTY} / {costRef.current}
                            </Text>
                        </View>
                        <Pressable style={[gs.f2, gs.all_center, gs.column, gs.border_card, currSelectedQTY === costRef.current ? styles.available : styles.unavailable]}
                            onPress={onUpgradePress}>
                            <Upload />
                        </Pressable>
                    </View>
                </View>
            </Animated.View>
            <LoadingModalComponent visible={isLoading}></LoadingModalComponent>
            <BattleEvolveModalComponent
                visible={playAnimation}
                prevURI={prevImgURI}
                nextURI={imgURL}
                onClose={onDone}
            />

        </View>
    );
});

const styles = StyleSheet.create({
    modalView: {
        width: '90%',
        height: '90%',
        backgroundColor: 'white',
        borderRadius: 20,
        borderWidth: 2,
    },
    header: {
        borderTopLeftRadius: 17,
        borderTopRightRadius: 17,
    },
    top_box: {
        borderBottomWidth: 1,
    },
    unavailable: {
        backgroundColor: UNAVAILABLE_COLOR
    },
    available: {
        backgroundColor: AVAILABLE_COLOR
    }
});

export default UnitUpgradeScreen;