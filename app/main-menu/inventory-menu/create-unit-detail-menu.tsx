import { invGetPlayerUnitCardByUnitCode, invPostCreatePlayerUnit } from "@/src/api/inventory/service";
import { CostCardItemRQ, InvGetPlayerCardByUnitCodeRS, InvPostCreatePlayerUnitRQ } from "@/src/api/inventory/type";
import { GetUnitByCode } from "@/src/api/unit/service";
import { Unit } from "@/src/api/unit/type";
import CardSlotComponent from "@/src/components/general/CardSlotComponent";
import LoadingModalComponent from "@/src/components/general/LoadingModalComponent";
import MessageModalComponent from "@/src/components/general/MessageModalComponent";
import { getUnitCardImagePath } from "@/src/services/generalService";
import { gs } from "@/src/styles/globalStyles";
import { LoadingModalType } from "@/src/types/general/loadingType";
import { MessageModalDataType } from "@/src/types/general/MessageModalDataType";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeftIcon, ListRestart, Upload } from "lucide-react-native";
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

            setTimeout(() => {
                setMessageModalData({
                    message: 'Create Unit Success',
                    onClose: () => {
                        setMessageModalData((prev) => {
                            return {
                                ...prev,
                                message: ''
                            }
                        });
                        router.back();
                    }
                });
            }, 800);
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

    const onBackPress = useCallback(() => {
        router.back();
    }, []);

    return (
        <View style={[gs.full_size]}>
            <View style={[gs.f1, gs.header, gs.all_center, gs.column]}>
                <Pressable style={[gs.f1, gs.full_size, gs.all_center]}
                    onPress={onBackPress}
                    accessibilityLabel="button">
                    <ArrowLeftIcon></ArrowLeftIcon>
                </Pressable>
                <View style={[gs.f2, gs.all_center]}>
                    <Text>CREATE UNIT DETAIL</Text>
                </View>
                <View style={[gs.f1, gs.all_center]}></View>
            </View>
            <View style={[gs.f3, gs.row, gs.p5]}>
                {unit !== undefined &&
                    <>
                        <View style={[gs.f8, gs.full_size, gs.column]}>
                            <View style={[gs.f3, gs.all_center, gs.full_size]}>
                                <CardSlotComponent
                                    imgURL={unit.imgURL}
                                    footerText={''}
                                    index={0}
                                    isShow={true}
                                />
                            </View>
                            <View style={[gs.f6, gs.full_size]}>
                                <View style={[gs.f1, gs.all_center]}>
                                    <Text>{unit.unitName}</Text>
                                </View>
                                <View style={[gs.f1, gs.column]}>
                                    <View style={[gs.f1, gs.all_center]}>
                                        <Text>lvl. {unit.unitLevel}</Text>
                                    </View>
                                    <View style={[gs.f2, gs.all_center]}>
                                        <Text>{unit.unitCode}</Text>
                                    </View>
                                </View>
                                <View style={[gs.f3, gs.all_center, gs.p5]}>
                                    <View style={[gs.full_size, gs.border_card, gs.all_center]}>
                                        <Text>{unit.tags}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                        <View style={[gs.f2, gs.full_size, gs.column]}>
                            <View style={[gs.f1, gs.all_center]}>
                                <Text>OFF</Text>
                                <Text>{unit.offense}</Text>
                            </View>
                            <View style={[gs.f1, gs.all_center]}>
                                <Text>DEF</Text>
                                <Text>{unit.defense}</Text>
                            </View>
                            <View style={[gs.f1, gs.all_center]}>
                                <Text>TEC</Text>
                                <Text>{unit.technique}</Text>
                            </View>
                            <View style={[gs.f1, gs.all_center]}>
                                <Text>SPD</Text>
                                <Text>{unit.speed}</Text>
                            </View>
                            <View style={[gs.f1, gs.all_center]}>
                                <Text>SPT</Text>
                                <Text>{unit.spirit}</Text>
                            </View>
                        </View>
                    </>
                }
            </View>
            <View style={[gs.f5, gs.border_top, gs.border_bottom, gs.p5]}>
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
            {loadingData.isLoading &&
                <LoadingModalComponent />
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