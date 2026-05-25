import { invGetPlayerUnitCardByUnitCode, invGetPlayerUnitDetailByID, invGetPlayerUnitPrice, invPostPlayerUnitLevelUp, invPostSellPlayerUnit } from "@/src/api/inventory/service";
import { CostCardItemRQ, InvGetPlayerCardByUnitCodeRS, InvGetPlayerUnitDetailByIDRS, InvPostPlayerUnitLevelUpRQ } from "@/src/api/inventory/type";
import ConfirmationModalComponent from "@/src/components/general/ConfirmationModalComponent";
import { GBox } from "@/src/components/general/GBoxComponent";
import GeneralHeaderBarComponent from "@/src/components/general/GeneralHeaderBarComponent";
import LoadingModalComponent from "@/src/components/general/LoadingModalComponent";
import MessageModalComponent from "@/src/components/general/MessageModalComponent";
import { getUnitCardImagePath } from "@/src/services/generalService";
import { scaleMin } from "@/src/services/scalingSizeService";
import { gs } from "@/src/styles/globalStyles";
import { Image } from "expo-image";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { ListRestartIcon, UploadIcon } from "lucide-react-native";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { FlatList, ListRenderItem, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

const AVAILABLE_COLOR = 'rgb(157, 255, 130)';
const UNAVAILABLE_COLOR = 'rgb(255, 130, 130)';

const UnitDetailScreenIndex = memo(() => {
    const { playerUnitID } = useLocalSearchParams();
    const id = Array.isArray(playerUnitID) ? playerUnitID[0] : playerUnitID;

    const [isLoading, setIsLoading] = useState(true);
    const [unit, setUnit] = useState<InvGetPlayerUnitDetailByIDRS>({
        firstUnitCode: '',
        imageTypeNumber: 0,
        lastUnitCode: '',
        origin: '',
        playerUnitID: '',
        playerUnitLevel: 0,
        unitName: '',
        elementID1: 0,
        elementID2: 0
    });
    const [cards, setCards] = useState<InvGetPlayerCardByUnitCodeRS[]>([]);
    const [imgPath, setImgPath] = useState('');
    const [listHeight, setListHeight] = useState(0);

    const [currSelectedQTY, setCurrSelectedQTY] = useState(0);
    const currSelectedQTYRef = useRef(currSelectedQTY);
    useEffect(() => {
        currSelectedQTYRef.current = currSelectedQTY;
    }, [currSelectedQTY]);

    const [messageText, setMessageText] = useState('');
    const [sellText, setSellText] = useState('');

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
        if (id === '') return;

        try {
            const res = await invGetPlayerUnitDetailByID(id);
            if (!res.success) { return; }

            setUnit(res.data);

            await Promise.all([
                setImage(res.data.origin, res.data.lastUnitCode, res.data.imageTypeNumber),
                getCards(res.data.firstUnitCode)
            ]);
        }
        finally {
            setIsLoading(false);
        }

        setCurrSelectedQTY(0);
    }, [playerUnitID]);

    useFocusEffect(
        useCallback(() => {
            setIsLoading(true);
            init();
        }, [init])
    );

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
        playerUnitID: id,
        items: cards
            .filter(card => card.currQTY > 0)
            .map((card): CostCardItemRQ => ({
                imageTypeNumber: card.imageTypeNumber,
                qty: card.currQTY
            }))
    }), [playerUnitID, cards]);

    const onLevelUpPress = useCallback(async () => {
        setIsLoading(true);

        try {
            if (currSelectedQTYRef.current < 10)
                return;

            const request = prepareRequestLevelUp();
            const res = await invPostPlayerUnitLevelUp(request);
            if (!res.success) { return; }
            await init();
        } catch (error) {
            console.error("Level up failed:", error);
        } finally {
            setIsLoading(false);
        }
    }, [prepareRequestLevelUp]);

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

    const onSellPress = useCallback(async () => {
        setIsLoading(true);
        try {
            const resGold = await invGetPlayerUnitPrice(id);
            if (!resGold.success) {
                setMessageText(resGold.message);
            }
            else {
                setSellText(`Are you sure to sell this unit for ${resGold.data} G ?`);
            }
        }
        finally {
            setIsLoading(false);
        }
    }, []);

    const onSellPlayerUnit = useCallback(async () => {
        setIsLoading(true);
        setSellText('');

        try {
            const res = await invPostSellPlayerUnit(id);
            if (res.success) {
                router.back();
                return;
            }
            setMessageText(res.message);
        }
        finally {
            setIsLoading(false);
        }
    }, []);

    return (
        <View style={[gs.full_size]}>
            <Animated.View entering={FadeIn} style={[gs.full_size]}>
                <View style={[gs.f1]}>
                    <GeneralHeaderBarComponent title="UNIT DETAIL"></GeneralHeaderBarComponent>
                </View>
                <GBox elements={[unit.elementID1, unit.elementID2]} style={[gs.f3, gs.full_size, gs.column, gs.p10, styles.header]}>
                    <View style={[gs.f4, gs.px5]}>
                        <Image
                            source={imgPath}
                            contentFit="fill"
                            style={[gs.full_size, gs.border_card]}
                        />
                    </View>
                    <View style={[gs.f6, gs.border_card, gs.full_size, { backgroundColor: 'rgba(255,255,255,0.8)' }]}>
                        <View style={[gs.f1, gs.all_center]}>
                            <Text style={[gs.fontM]}>{unit.unitName}</Text>
                        </View>
                        <View style={[gs.f1, gs.column]}>
                            <View style={[gs.f2, gs.all_center]}>
                                <Text style={[gs.fontM]}>lvl. {unit.playerUnitLevel} / 10</Text>
                            </View>
                            <View style={[gs.f2, gs.all_center]}>
                                <Text style={[gs.fontM]}>{unit.lastUnitCode}</Text>
                            </View>
                        </View>
                        <View style={[gs.f2]}>
                        </View>
                        <View style={[gs.f1, gs.p5]}>
                            <Pressable
                                onPress={onSellPress}
                                style={[gs.full_size, gs.all_center, gs.border_card, { backgroundColor: 'red' }]}
                                accessibilityLabel="button">
                                <Text style={[gs.fontM, { color: 'white' }]}>SELL</Text>
                            </Pressable>
                        </View>
                    </View>
                </GBox>
                {unit.playerUnitLevel >= 10 ?
                    <View style={[gs.f7, gs.full_size, gs.all_center]}>
                        <Text style={[gs.fontL]}>
                            MAX LEVEL
                        </Text>
                    </View> :
                    <View style={[gs.f7, gs.p5, gs.row, gs.full_size]}>
                        {
                            cards.length <= 0 ?
                                <View style={[gs.f9, gs.all_center, gs.full_size, gs.f5]}>
                                    <Text style={[gs.fontL]}>NO AVAILABLE CARDS...</Text>
                                </View> :
                                <View style={[gs.f9, gs.full_size]}
                                    onLayout={(e) => setListHeight(e.nativeEvent.layout.height)}>
                                    <FlatList
                                        data={cards}
                                        numColumns={4}
                                        renderItem={renderItem}
                                        keyExtractor={(item) => item.imageTypeNumber.toString()}
                                        extraData={cards}
                                    />
                                </View>
                        }
                        <View style={[gs.f1, gs.column, gs.p5]}>
                            <Pressable style={[gs.f2, gs.all_center, gs.column, gs.border_card]}
                                onPress={onResetPress}>
                                <ListRestartIcon size={scaleMin(18)} />
                            </Pressable>
                            <View style={[gs.f6, gs.all_center]}>
                                <Text style={[gs.fontL]}>
                                    COST : {currSelectedQTY} / 10
                                </Text>
                            </View>
                            <Pressable style={[gs.f2, gs.all_center, gs.column, gs.border_card, currSelectedQTY === 10 ? styles.available : styles.unavailable]}
                                onPress={onLevelUpPress}>
                                <UploadIcon size={scaleMin(18)} />
                            </Pressable>
                        </View>
                    </View>
                }
            </Animated.View>
            {messageText !== '' &&
                <MessageModalComponent message={messageText} onClose={() => { setMessageText('') }} />
            }
            <ConfirmationModalComponent
                visible={sellText !== ''}
                data={{
                    message: sellText,
                    yesText: 'YES',
                    noText: 'NO'
                }}
                onClose={() => { setSellText('') }}
                onConfirm={onSellPlayerUnit}
            />
            <LoadingModalComponent visible={isLoading} />
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

export default UnitDetailScreenIndex;