import { invGetPlayerUnitCardByUnitCode, invPostPlayerUnitUpgrade } from "@/src/api/inventory/service";
import { CostCardItemRQ, InvGetPlayerCardByUnitCodeRS, InvPostUnitUpgradeRQ } from "@/src/api/inventory/type";
import { getUnitCardImagePath } from "@/src/services/generalService";
import { gs } from "@/src/styles/globalStyles";
import { Image } from "expo-image";
import { ChevronDownIcon, ListRestart, Upload } from "lucide-react-native";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { FlatList, ListRenderItem, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FlipInXUp, FlipOutXDown } from "react-native-reanimated";

interface props {
    playerUnitID: string;
    unitCode: string;
    unitName: string;
    imgURL: string;
    unitLevel: number;
    cost: number;
    tags: string[];
    off: number;
    def: number;
    tec: number;
    spd: number;
    spt: number;
    onClose: () => void;
    onSuccessUpgrade: () => void;
}

const AVAILABLE_COLOR = 'rgb(157, 255, 130)';
const UNAVAILABLE_COLOR = 'rgb(255, 130, 130)';

const UnitMenuModalUpgradeComponent = memo(({ playerUnitID, unitCode, unitName, imgURL, unitLevel, cost, tags, off, def, tec, spd, spt, onClose, onSuccessUpgrade }: props) => {
    const [isLoading, setIsLoading] = useState(true);
    const [cards, setCards] = useState<InvGetPlayerCardByUnitCodeRS[]>([]);
    const [listHeight, setListHeight] = useState(0);

    const [currSelectedQTY, setCurrSelectedQTY] = useState(0);
    const currSelectedQTYRef = useRef(currSelectedQTY);
    useEffect(() => {
        currSelectedQTYRef.current = currSelectedQTY;
    }, [currSelectedQTY]);

    const init = useCallback(async () => {
        if (unitCode === '') return;

        await getCards(unitCode);

        setCurrSelectedQTY(0);
    }, [unitCode]);

    useEffect(() => {
        setIsLoading(true);
        init().finally(() => setIsLoading(false));
    }, [init]);

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

    const CardItem = memo(({ item, h, onPress }: {
        item: InvGetPlayerCardByUnitCodeRS,
        h: number,
        onPress: (imgType: number, curr: number, max: number) => void
    }) => {

        const handleOnPress = () => {
            onPress(item.imageTypeNumber, item.currQTY, item.qty);
        };

        return (
            <Pressable
                onPress={handleOnPress}
                style={[{ width: '33%', height: h }, gs.p5, gs.row]}
            >
                <View style={[gs.f4]}>
                    <Image
                        source={item.imgURL}
                        contentFit="fill"
                        style={[gs.full_size, gs.border_card, gs.all_center]}
                    />
                </View>
                <View style={[gs.f1, gs.all_center]}>
                    <Text>{item.currQTY} / {item.qty}</Text>
                </View>
            </Pressable>
        );
    });

    const onPressCard = useCallback((imgTypeNumber: number, curr: number, max: number) => {
        if (currSelectedQTYRef.current === cost || curr === max) return;

        setCards((prev) => {
            return prev.map((card) => {
                return card.imageTypeNumber !== imgTypeNumber ? card : { ...card, currQTY: Math.min(card.currQTY + 1, card.qty) }
            });
        });

        setCurrSelectedQTY((prev) => prev + 1);
    }, [unitLevel]);

    const ITEM_HEIGHT = listHeight / 1.8;
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
        if (currSelectedQTYRef.current < cost)
            return;

        setIsLoading(true);
        try {
            const request = prepareRequestUpgrade();
            const res = await invPostPlayerUnitUpgrade(request);
            if (!res.success) { return; }

            await onSuccessUpgrade();
        } catch (error) {
            console.error("Level up failed:", error);
        } finally {
            setIsLoading(false);
        }
    }, [prepareRequestUpgrade, cost]);

    return (
        <Modal onRequestClose={onClose}
            transparent={true}
            visible={unitCode !== ''}
            animationType="fade">
            <View style={gs.overlay}>
                <Animated.View entering={FlipInXUp} exiting={FlipOutXDown} style={styles.modalView} >
                    <View style={[gs.full_size, gs.row]}>
                        <View style={[gs.f05, gs.all_center, gs.header, styles.header]}>
                            <Text>UPGRADE UNIT</Text>
                        </View>
                        <View style={[gs.f3, gs.all_center, gs.column, gs.p5]}>
                            <View style={[gs.f4, { paddingRight: 5 }]}>
                                <Image
                                    source={imgURL}
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
                                        <Text>lvl. {unitLevel}</Text>
                                    </View>
                                    <View style={[gs.f3, gs.all_center]}>
                                        <Text>{unitCode}</Text>
                                    </View>
                                </View>
                                <View style={[gs.f3]}>
                                    <View style={[gs.f1, gs.border_card, gs.all_center]}>
                                        <Text>
                                            {tags}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                        <View style={[gs.f05, gs.all_center, gs.column, styles.top_box]}>
                            <View style={[gs.f1, gs.all_center]}>
                                <Text style={{ color: '#2A9D8F' }}>{off}</Text>
                            </View>
                            <View style={[gs.f1, gs.all_center]}>
                                <Text style={{ color: '#E63946' }}>{def}</Text>
                            </View>
                            <View style={[gs.f1, gs.all_center]}>
                                <Text style={{ color: '#4CC9F0' }}>{tec}</Text>
                            </View>
                            <View style={[gs.f1, gs.all_center]}>
                                <Text style={{ color: '#F4A261' }}>{spd}</Text>
                            </View>
                            <View style={[gs.f1, gs.all_center]}>
                                <Text style={{ color: '#4361EE' }}>{spt}</Text>
                            </View>
                        </View>
                        <View style={[gs.f5, gs.all_center, gs.p5, styles.top_box]}>
                            {
                                cards.length <= 0 ?
                                    <View style={[gs.f3, gs.all_center, gs.full_size, gs.f5]}>
                                        <Text>NO AVAILABLE CARDS...</Text>
                                    </View> :
                                    <View style={[gs.f3, gs.full_size]}
                                        onLayout={(e) => setListHeight(e.nativeEvent.layout.height)}>
                                        <FlatList
                                            data={cards}
                                            numColumns={3}
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
                                <ListRestart />
                            </Pressable>
                            <View style={[gs.f6, gs.all_center]}>
                                <Text >
                                    COST : {currSelectedQTY} / {cost}
                                </Text>
                            </View>
                            <Pressable style={[gs.f2, gs.all_center, gs.column, gs.border_card, currSelectedQTY === cost ? styles.available : styles.unavailable]}
                                onPress={onUpgradePress}>
                                <Upload />
                            </Pressable>
                        </View>
                        <Pressable style={[gs.f05, gs.all_center, gs.full_size]}
                            onPress={onClose}>
                            <ChevronDownIcon color={'red'} />
                        </Pressable>
                    </View>
                </Animated.View>
            </View>
        </Modal>
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

export default UnitMenuModalUpgradeComponent;