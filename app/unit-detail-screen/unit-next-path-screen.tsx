import { invGetPlayerUnitDetailByID } from "@/src/api/inventory/service";
import { UnitGetNextLevelPath } from "@/src/api/unit/service";
import { UnitGetNextLevelPathRS } from "@/src/api/unit/type";
import { GBox } from "@/src/components/general/GBoxComponent";
import GeneralHeaderBarComponent from "@/src/components/general/GeneralHeaderBarComponent";
import LoadingModalComponent from "@/src/components/general/LoadingModalComponent";
import { StatColor } from "@/src/enums/colorEnum";
import { getUnitCardImagePath } from "@/src/services/generalService";
import { scaleMin } from "@/src/services/scalingSizeService";
import { gs } from "@/src/styles/globalStyles";
import { Image } from "expo-image";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { CheckSquareIcon, CpuIcon, FlameIcon, GaugeIcon, HandFistIcon, ShieldIcon, XSquareIcon } from "lucide-react-native";
import { memo, useCallback, useState } from "react";
import { FlatList, ListRenderItem, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";


const CardItem = memo(({ item, unitLevel, height, onPress }: {
    item: UnitGetNextLevelPathRS;
    height: number;
    unitLevel: number;
    onPress: () => void;
}) => {
    return (
        <Pressable style={[{ width: '100%', height: height }]}
            onPress={unitLevel >= item.unitLevel ? onPress : () => { }}>
            <GBox elements={[item.elementID1, item.elementID2]} style={[gs.p5, gs.column, styles.items]}>
                <View style={[gs.f1, gs.full_size]}>
                    <View style={[gs.f1, gs.all_center, gs.full_size]}>
                        <Text style={gs.fontM}>lvl</Text>
                        <Text style={gs.fontM}>{item.unitLevel}</Text>
                    </View>
                    <View style={[gs.f1, gs.all_center, gs.full_size]}>
                        {unitLevel >= item.unitLevel ?
                            <CheckSquareIcon color={'green'} size={scaleMin(18)} /> :
                            <XSquareIcon color={'red'} size={scaleMin(18)} />
                        }
                    </View>
                </View>
                <View style={[gs.f2, gs.full_size, gs.all_center, gs.px5]}>
                    <Image
                        source={item.imgURL}
                        contentFit="fill"
                        style={[gs.full_size, gs.border_card]}
                    />
                </View>
                <View style={[gs.f6]}>
                    <View style={[gs.full_size, gs.border_card, { backgroundColor: 'rgba(255,255,255,0.8)' }]}>
                        <View style={[gs.f2, gs.all_center, gs.full_size]}>
                            <Text style={[gs.fontM]}>{item.unitName}</Text>
                            <Text style={[gs.fontS]}>{item.unitCode}</Text>
                        </View>
                        <View style={[gs.f1, , gs.full_size, gs.all_center, gs.column]}>
                            <View style={[gs.f1, gs.all_center]}>
                                <HandFistIcon size={scaleMin(18)} color={StatColor.offense} />
                            </View>
                            <View style={[gs.f1, gs.all_center]}>
                                <ShieldIcon size={scaleMin(18)} color={StatColor.defense} />
                            </View>
                            <View style={[gs.f1, gs.all_center]}>
                                <CpuIcon size={scaleMin(18)} color={StatColor.technique} />
                            </View>
                            <View style={[gs.f1, gs.all_center]}>
                                <GaugeIcon size={scaleMin(18)} color={StatColor.speed} />
                            </View>
                            <View style={[gs.f1, gs.all_center]}>
                                <FlameIcon size={scaleMin(18)} color={StatColor.spirit} />
                            </View>
                        </View>
                        <View style={[gs.f1, , gs.full_size, gs.column]}>
                            <View style={[gs.f1, gs.all_center]}>
                                <Text style={[{ color: StatColor.offense }, gs.fontM]}>{item.offense}</Text>
                            </View>
                            <View style={[gs.f1, gs.all_center]}>
                                <Text style={[{ color: StatColor.defense }, gs.fontM]}>{item.defense}</Text>
                            </View>
                            <View style={[gs.f1, gs.all_center]}>
                                <Text style={[{ color: StatColor.technique }, gs.fontM]}>{item.technique}</Text>
                            </View>
                            <View style={[gs.f1, gs.all_center]}>
                                <Text style={[{ color: StatColor.speed }, gs.fontM]}>{item.speed}</Text>
                            </View>
                            <View style={[gs.f1, gs.all_center]}>
                                <Text style={[{ color: StatColor.spirit }, gs.fontM]}>{item.spirit}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </GBox>
        </Pressable>
    )
});

const UnitNextPathScreen = memo(() => {
    const { playerUnitID } = useLocalSearchParams();
    const id = Array.isArray(playerUnitID) ? playerUnitID[0] : playerUnitID;

    const [isLoading, setIsLoading] = useState(true);
    const [unitNextLevels, setUnitNextLevels] = useState<UnitGetNextLevelPathRS[]>([]);
    const [listHeight, setListHeight] = useState(0);
    const [unitLevel, setunitLevel] = useState(0);

    const ITEM_HEIGHT = listHeight / scaleMin(5);
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
        try {
            const resDetail = await invGetPlayerUnitDetailByID(id);
            if (!resDetail.success) { return; }

            setunitLevel(resDetail.data.playerUnitLevel);
            const res = await UnitGetNextLevelPath(resDetail.data.lastUnitCode);
            if (!res.success) return;
            if (!res.success || !res.data?.length) return;

            const updatedData = await Promise.all(
                res.data.map(async (item) => ({
                    ...item,
                    imgURL: await getUnitCardImagePath(item.origin, item.unitCode, 0)
                }))
            );

            setUnitNextLevels(updatedData);

        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useFocusEffect(
        useCallback(() => {
            setIsLoading(true);
            init();
        }, [init])
    );

    const onPressSlot = useCallback((idx: number) => {
        router.push({
            pathname: '/unit-detail-screen-2/unit-upgrade-screen',
            params: {
                playerUnitIDP: id,
                unitCodeP: unitNextLevels[idx].unitCode,
                unitNameP: unitNextLevels[idx].unitName,
                imgURLP: unitNextLevels[idx].imgURL,
                unitLevelP: unitNextLevels[idx].unitLevel,
                element1P: unitNextLevels[idx].elementID1,
                element2P: unitNextLevels[idx].elementID2
            }
        })
    }, [unitNextLevels]);

    return (
        <View style={[gs.full_size, gs.row]}>
            <Animated.View entering={FadeIn} exiting={FadeOut} style={[gs.f1, gs.all_center]} >
                <View style={[gs.f1, gs.full_size]}>
                    <GeneralHeaderBarComponent title="NEXT PATH"></GeneralHeaderBarComponent>
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
            <LoadingModalComponent visible={isLoading}></LoadingModalComponent>
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

export default UnitNextPathScreen;