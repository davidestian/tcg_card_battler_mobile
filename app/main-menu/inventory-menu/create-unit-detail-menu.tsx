import { invGetPlayerUnitCardByUnitCode, invPostCreatePlayerUnit } from "@/src/api/inventory/service";
import { CostCardItemRQ, InvGetPlayerCardByUnitCodeRS, InvPostCreatePlayerUnitRQ } from "@/src/api/inventory/type";
import { GetUnitByCode } from "@/src/api/unit/service";
import { Unit } from "@/src/api/unit/type";
import { getBackCardImage } from "@/src/assets/backCardImages";
import BattleEvolveModalComponent from "@/src/components/battle/BattleEvolveModalComponent";
import CardSlotComponent from "@/src/components/general/CardSlotComponent";
import { GBox } from "@/src/components/general/GBoxComponent";
import GeneralHeaderBarComponent from "@/src/components/general/GeneralHeaderBarComponent";
import LoadingModalComponent from "@/src/components/general/LoadingModalComponent";
import MessageModalComponent from "@/src/components/general/MessageModalComponent";
import { StatColor } from "@/src/enums/colorEnum";
import { getUnitCardImagePath } from "@/src/services/generalService";
import { scaleMin } from "@/src/services/scalingSizeService";
import { gs } from "@/src/styles/globalStyles";
import { LoadingModalType } from "@/src/types/general/loadingType";
import { MessageModalDataType } from "@/src/types/general/MessageModalDataType";
import { router, useLocalSearchParams } from "expo-router";
import { CpuIcon, FlameIcon, GaugeIcon, HandFistIcon, ListRestart, ShieldIcon, Upload } from "lucide-react-native";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { FlatList, ListRenderItem, Pressable, StyleSheet, Text, View } from "react-native";

const CreateUnitDetailMenu = memo(() => {
    const [loadingData, setLoadingData] = useState<LoadingModalType>({
        isLoading: true,
        message: 'Fecthing Cards...',
    });

    const [messageModalData, setMessageModalData] = useState<MessageModalDataType>({
        message: '',
        onClose: () => { }
    });

    const { unitCode } = useLocalSearchParams();
    const [listHeight, setListHeight] = useState(0);
    const [unit, setUnit] = useState<Unit>();
    const [cards, setCards] = useState<InvGetPlayerCardByUnitCodeRS[]>([]);

    const [currSelectedQTY, setCurrSelectedQTY] = useState(0);
    const currSelectedQTYRef = useRef(currSelectedQTY);
    useEffect(() => {
        currSelectedQTYRef.current = currSelectedQTY;
    }, [currSelectedQTY]);

    const [playEvolveAnimation, setPlayEvolveAnimation] = useState(false);

    const init = useCallback(async () => {
        if (!unitCode) return;
        setLoadingData({
            isLoading: true,
            message: 'Fecthing Cards...',
        });

        try {
            const code = Array.isArray(unitCode) ? unitCode[0] : unitCode;

            const [resUnit, resCards] = await Promise.all([
                GetUnitByCode(code),
                invGetPlayerUnitCardByUnitCode(code)

            ]);

            if (!resUnit.success || !resCards.success) return;

            const [unitImgURL, updatedList] = await Promise.all([
                getUnitCardImagePath(resUnit.data.origin, resUnit.data.unitCode, 0),
                Promise.all(resCards.data.map(async (card) => ({
                    ...card,
                    currQTY: 0,
                    imgURL: await getUnitCardImagePath(card.origin, card.cardCode, card.imageTypeNumber)
                })))
            ]);
            setTimeout(() => {
                setUnit({ ...resUnit.data, imgURL: unitImgURL });
                setCards(updatedList);
            }, 1000);
        }
        finally {
            setTimeout(() => {
                setLoadingData({
                    isLoading: false,
                    message: '',
                });
            }, 1000);
        }
    }, [unitCode]);

    useEffect(() => {
        init();
    }, []);

    const onPressCard = useCallback((imgTypeNumber: number, curr: number, max: number, qty: number) => {
        qty = Math.min(50 - currSelectedQTYRef.current, qty);
        if (currSelectedQTYRef.current + qty > 50 || curr + qty > max) return;

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

    const ITEM_HEIGHT2 = listHeight / 2;
    const renderItemCard: ListRenderItem<InvGetPlayerCardByUnitCodeRS> = useCallback(({ item, index }) => {
        const onPress1 = () => {
            onPressCard(item.imageTypeNumber, item.currQTY, item.qty, 1)
        };

        const onPress10 = () => {
            onPressCard(item.imageTypeNumber, item.currQTY, item.qty, 10)
        };

        return (
            <View style={[gs.p5, { width: '25%', height: ITEM_HEIGHT2 }]}>
                <View style={[gs.f8, gs.full_size]}>
                    <CardSlotComponent
                        imgURL={item.imgURL}
                        footerText={''}
                        index={index}
                        isShow={true}
                    />
                </View>
                <View style={[gs.f2, gs.full_size, gs.all_center]}>
                    <Text>
                        {item.currQTY} / {item.qty}
                    </Text>
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
        )
    }, [ITEM_HEIGHT2, onPressCard]);

    const prepareRequestLevelUp = useCallback((): InvPostCreatePlayerUnitRQ => ({
        unitCode: Array.isArray(unitCode) ? unitCode[0] : unitCode,
        items: cards
            .filter(card => card.currQTY > 0)
            .map((card): CostCardItemRQ => ({
                imageTypeNumber: card.imageTypeNumber,
                qty: card.currQTY
            }))
    }), [unitCode, cards]);

    const onSubmitPress = useCallback(async () => {
        if (currSelectedQTYRef.current < 50) return;
        setLoadingData({
            isLoading: true,
            message: 'Creating Unit...',
        });

        try {
            const res = await invPostCreatePlayerUnit(prepareRequestLevelUp());
            if (!res.success) {
                setMessageModalData({
                    message: res.message,
                    onClose: () => {
                        setMessageModalData((prev) => {
                            return {
                                ...prev,
                                message: ''
                            }
                        })
                    }
                });
                return;
            }

            setPlayEvolveAnimation(true);
        }
        finally {
            setTimeout(() => {
                setLoadingData({
                    isLoading: false,
                    message: '',
                });
            }, 1000);
        }
    }, [prepareRequestLevelUp]);

    const onCloseAnimation = useCallback(() => {
        setPlayEvolveAnimation(false);
        router.back();
    }, []);

    return (
        <View style={[gs.full_size]}>
            <View style={[gs.f1]}>
                <GeneralHeaderBarComponent title="CREATE UNIT DETAIL" />
            </View>
            <View style={[gs.f3]}>
                {unit !== undefined &&
                    <GBox style={[gs.full_size, gs.p5]} elements={[unit.elementID1, unit.elementID2]}>
                        <View style={[gs.f8, gs.full_size, gs.column]}>
                            <View style={[gs.f3, gs.all_center, gs.full_size, gs.px5]}>
                                <CardSlotComponent
                                    imgURL={unit.imgURL}
                                    footerText={''}
                                    index={0}
                                    isShow={true}
                                />
                            </View>
                            <View style={[gs.f6]}>
                                <View style={[gs.border_card, gs.full_size, { backgroundColor: 'rgba(255,255,255,0.8)' }]}>
                                    <View style={[gs.f1, gs.all_center]}>
                                        <Text style={[gs.fontM]}>{unit.unitName}</Text>
                                    </View>
                                    <View style={[gs.f1, gs.column]}>
                                        <View style={[gs.f1, gs.all_center]}>
                                            <Text style={[gs.fontM]}>lvl. {unit.unitLevel}</Text>
                                        </View>
                                        <View style={[gs.f2, gs.all_center]}>
                                            <Text style={[gs.fontM]}>{unit.unitCode}</Text>
                                        </View>
                                    </View>
                                    <View style={[gs.f3]}>
                                        <View style={[gs.f1, gs.full_size, gs.column]}>
                                            <View style={[gs.f1]}>
                                                <View style={[gs.f1, gs.all_center]}>
                                                    <HandFistIcon color={StatColor.offense} size={scaleMin(18)} />
                                                </View>
                                                <View style={[gs.f1, gs.all_center]}>
                                                    <Text style={[gs.fontM, { color: StatColor.offense }]}>{unit.offense}</Text>
                                                </View>
                                            </View>
                                            <View style={[gs.f1]}>
                                                <View style={[gs.f1, gs.all_center]}>
                                                    <ShieldIcon color={StatColor.defense} size={scaleMin(18)} />
                                                </View>
                                                <View style={[gs.f1, gs.all_center]}>
                                                    <Text style={[gs.fontM, { color: StatColor.defense }]}>{unit.defense}</Text>
                                                </View>
                                            </View>
                                            <View style={[gs.f1]}>
                                                <View style={[gs.f1, gs.all_center]}>
                                                    <CpuIcon color={StatColor.technique} size={scaleMin(18)} />
                                                </View>
                                                <View style={[gs.f1, gs.all_center]}>
                                                    <Text style={[gs.fontM, { color: StatColor.technique }]}>{unit.technique}</Text>
                                                </View>
                                            </View>
                                        </View>
                                        <View style={[gs.f1, gs.full_size, gs.column]}>
                                            <View style={[gs.f1]}>
                                                <View style={[gs.f1, gs.all_center]}>
                                                    <GaugeIcon color={StatColor.speed} size={scaleMin(18)} />
                                                </View>
                                                <View style={[gs.f1, gs.all_center]}>
                                                    <Text style={[gs.fontM, { color: StatColor.speed }]}>{unit.speed}</Text>
                                                </View>
                                            </View>
                                            <View style={[gs.f1]}>
                                                <View style={[gs.f1, gs.all_center]}>
                                                    <FlameIcon color={StatColor.spirit} size={scaleMin(18)} />
                                                </View>
                                                <View style={[gs.f1, gs.all_center]}>
                                                    <Text style={[gs.fontM, { color: StatColor.spirit }]}>{unit.spirit}</Text>
                                                </View>
                                            </View>
                                            <View style={[gs.f1]}>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </GBox>
                }
            </View>
            <View style={[gs.f6, gs.border_top, gs.border_bottom, gs.p5]}>
                <View style={[gs.full_size]}
                    onLayout={(e) => setListHeight(e.nativeEvent.layout.height)}>
                    {(!loadingData.isLoading || cards.length > 0) && listHeight > 0 &&
                        <FlatList
                            data={cards}
                            renderItem={renderItemCard}
                            numColumns={4}
                            keyExtractor={(item) => item.cardCode + item.imageTypeNumber} />
                    }

                </View>
            </View>
            <View style={[gs.f1, gs.column, gs.p5]}>
                <Pressable style={[gs.f2, gs.all_center, gs.full_size, gs.border_card]}
                    onPress={onResetPress}>
                    <ListRestart />
                </Pressable>
                <View style={[gs.f6, gs.all_center]}>
                    <Text >
                        {currSelectedQTY} / 50
                    </Text>
                </View>
                <Pressable style={[gs.f2, gs.full_size, gs.all_center, gs.border_card, currSelectedQTY === 50 ? gs.available : gs.unavailable]}
                    accessibilityLabel="button"
                    onPress={onSubmitPress}>
                    <Upload />
                </Pressable>
            </View>
            <LoadingModalComponent visible={loadingData.isLoading} />
            {unit &&
                <BattleEvolveModalComponent visible={(playEvolveAnimation)} prevURI={getBackCardImage(unit.origin)} nextURI={unit.imgURL} onClose={onCloseAnimation}></BattleEvolveModalComponent>
            }

            <MessageModalComponent
                message={messageModalData.message}
                onClose={messageModalData.onClose}
            />
        </View>
    )
});
const styles = StyleSheet.create({
});

export default CreateUnitDetailMenu;