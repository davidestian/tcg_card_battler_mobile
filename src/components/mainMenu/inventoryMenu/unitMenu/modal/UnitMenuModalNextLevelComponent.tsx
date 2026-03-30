import { UnitGetNextLevelPath } from "@/src/api/unit/service";
import { UnitGetNextLevelPathRS } from "@/src/api/unit/type";
import { getUnitCardImagePath } from "@/src/services/generalService";
import { gs } from "@/src/styles/globalStyles";
import { Image } from "expo-image";
import { CheckSquare2Icon, ImageIcon, XSquareIcon } from "lucide-react-native";
import { memo, useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, ListRenderItem, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import UnitMenuModalUpgradeComponent from "./UnitMenuModalUpgradeComponent";

interface props {
    refreshHome: () => void;
    playerUnitID: string;
    unitCode: string;
    unitLevel: number;
}

const UnitMenuModalNextLevelComponent = memo(({ playerUnitID, unitCode, unitLevel, refreshHome }: props) => {
    const [isLoading, setIsLoading] = useState(true);
    const [unitNextLevels, setUnitNextLevels] = useState<UnitGetNextLevelPathRS[]>([]);
    const [listHeight, setListHeight] = useState(0);
    const [currSlotIdx, setCurrSlotIdx] = useState<number>(-1);

    const CardItem = memo(({ item, unitLevel, height, onPress }: {
        item: UnitGetNextLevelPathRS;
        height: number;
        unitLevel: number;
        onPress: () => void;
    }) => {
        return (
            <Pressable style={[{ width: '100%', height: height }, gs.column, gs.p5, styles.items]}
                onPress={unitLevel >= item.targetLevel ? onPress : () => { }}>
                <View style={[gs.f1, gs.all_center, gs.full_size]}>
                    <Text>{item.targetLevel}</Text>
                    {unitLevel >= item.targetLevel ?
                        <CheckSquare2Icon color={gs.available_text.color} /> :
                        <XSquareIcon color={gs.unavailable_text.color} />
                    }
                </View>
                <View style={[gs.f2, gs.full_size, gs.all_center]}>
                    <Image
                        source={item.imgURL}
                        contentFit="fill"
                        style={[gs.full_size, gs.border_card]}
                    />
                </View>
                <View style={[gs.f7, , gs.full_size, gs.row]}>
                    <View style={[gs.f1, gs.full_size, gs.column]}>
                        <View style={[gs.f2, gs.all_center, gs.full_size]}>
                            <Text>{item.unitName}</Text>
                        </View>
                        <View style={[gs.f1, gs.all_center, gs.full_size]}>
                            <Text>C : {item.cost}</Text>
                        </View>
                    </View>
                    <View style={[gs.f1, , gs.full_size, gs.column]}>
                        <View style={[gs.f1, gs.all_center]}>
                            <Text style={{ color: '#2A9D8F' }}>{item.offense}</Text>
                        </View>
                        <View style={[gs.f1, gs.all_center]}>
                            <Text style={{ color: '#E63946' }}>{item.defense}</Text>
                        </View>
                        <View style={[gs.f1, gs.all_center]}>
                            <Text style={{ color: '#4CC9F0' }}>{item.technique}</Text>
                        </View>
                        <View style={[gs.f1, gs.all_center]}>
                            <Text style={{ color: '#F4A261' }}>{item.speed}</Text>
                        </View>
                        <View style={[gs.f1, gs.all_center]}>
                            <Text style={{ color: '#4361EE' }}>{item.spirit}</Text>
                        </View>
                    </View>
                </View>
            </Pressable>)
    });

    const ITEM_HEIGHT = listHeight / 4.5;
    const renderItem: ListRenderItem<UnitGetNextLevelPathRS> = useCallback(({ item, index }) => {
        const onPress = () => {
            onPressSlot(index);
        }
        return <CardItem height={ITEM_HEIGHT}
            item={item}
            onPress={onPress}
            unitLevel={unitLevel}
        />
    }, [ITEM_HEIGHT, unitLevel]);

    const init = useCallback(async () => {
        if (!unitCode) return;

        const res = await UnitGetNextLevelPath(unitCode);
        if (!res.success) return;
        if (!res.success || !res.data?.length) return;

        const updatedData = await Promise.all(
            res.data.map(async (item) => ({
                ...item,
                imgURL: await getUnitCardImagePath(item.origin, item.unitCode, 0)
            }))
        );

        setCurrSlotIdx(-1);
        setUnitNextLevels(updatedData);
    }, [unitCode]);

    useEffect(() => {
        setIsLoading(true);
        init().finally(() => setIsLoading(false));
    }, [init]);

    const onPressSlot = useCallback((idx: number) => {
        setCurrSlotIdx(idx);
    }, []);

    const onClose = useCallback(() => {
        setCurrSlotIdx(-1);
    }, []);

    return (
        <View style={[gs.full_size, gs.row]}>
            {isLoading &&
                <Animated.View entering={FadeIn} exiting={FadeOut} style={[gs.f1, gs.all_center]}>
                    <ActivityIndicator size="large" color="#0000ff" />
                </Animated.View>
            }
            {!isLoading &&
                <Animated.View entering={FadeIn} exiting={FadeOut} style={[gs.f1, gs.all_center]} >
                    <View style={[gs.f1, gs.full_size, gs.p5, styles.header]}>
                        <View style={[gs.f1, gs.full_size, gs.column]}>
                            <View style={[gs.f1, gs.all_center, gs.full_size]}>
                                <View style={[gs.f1, gs.all_center]}>
                                    <Text>lvl.</Text>
                                </View>
                            </View>
                            <View style={[gs.f2, gs.full_size, gs.all_center]}>
                                <ImageIcon />
                            </View>
                            <View style={[gs.f7, , gs.full_size, gs.all_center, gs.column]}>
                                <View style={[gs.f1, gs.all_center]}>
                                    <Text style={{ color: '#2A9D8F' }}>
                                        VIT
                                    </Text>
                                </View>
                                <View style={[gs.f1, gs.all_center]}>
                                    <Text style={{ color: '#E63946' }}>
                                        STR
                                    </Text>
                                </View>
                                <View style={[gs.f1, gs.all_center]}>
                                    <Text style={{ color: '#4CC9F0' }}>
                                        AGI
                                    </Text>
                                </View>
                                <View style={[gs.f1, gs.all_center]}>
                                    <Text style={{ color: '#F4A261' }}>
                                        DEX
                                    </Text>
                                </View>
                                <View style={[gs.f1, gs.all_center]}>
                                    <Text style={{ color: '#4361EE' }}>
                                        WIS
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                    {unitNextLevels.length > 0 ?
                        <View style={[gs.f9, gs.full_size, gs.row]}
                            onLayout={(e) => setListHeight(e.nativeEvent.layout.height)}>
                            <FlatList
                                data={unitNextLevels}
                                renderItem={renderItem}
                                keyExtractor={(item) => item.unitCode}
                                extraData={unitNextLevels} // Tells FlatList to check for data changes
                            />
                        </View> :
                        <View style={[gs.f9, gs.full_size, gs.all_center]}>
                            <Text style={{ fontSize: 36 }}>
                                MAX UPGRADE
                            </Text>
                        </View>
                    }
                </Animated.View>
            }

            {currSlotIdx != -1 &&
                <UnitMenuModalUpgradeComponent
                    playerUnitID={playerUnitID}
                    onClose={onClose}
                    unitCode={unitNextLevels[currSlotIdx].unitCode}
                    unitName={unitNextLevels[currSlotIdx].unitName}
                    unitLevel={unitNextLevels[currSlotIdx].targetLevel}
                    cost={unitNextLevels[currSlotIdx].cost}
                    imgURL={unitNextLevels[currSlotIdx].imgURL}
                    off={unitNextLevels[currSlotIdx].offense}
                    def={unitNextLevels[currSlotIdx].defense}
                    tec={unitNextLevels[currSlotIdx].technique}
                    spd={unitNextLevels[currSlotIdx].speed}
                    spt={unitNextLevels[currSlotIdx].spirit}
                    tags={unitNextLevels[currSlotIdx].tags}
                    onSuccessUpgrade={refreshHome}
                />
            }
        </View >
    );
});

const styles = StyleSheet.create({
    header: {
        borderBottomWidth: 1,
        borderStyle: 'dotted'
    },
    items: {
        borderBottomWidth: 1,
        borderStyle: 'solid'
    },
    footer: {
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderStyle: 'dotted'
    },
})

export default UnitMenuModalNextLevelComponent;