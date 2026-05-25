import { invGetPlayerUnitPrevLevel } from "@/src/api/inventory/service";
import { InvGetPlayerUnitPrevLevelRS } from "@/src/api/inventory/type";
import { GBox } from "@/src/components/general/GBoxComponent";
import GeneralHeaderBarComponent from "@/src/components/general/GeneralHeaderBarComponent";
import LoadingModalComponent from "@/src/components/general/LoadingModalComponent";
import { StatColor } from "@/src/enums/colorEnum";
import { getUnitCardImagePath } from "@/src/services/generalService";
import { scaleMin } from "@/src/services/scalingSizeService";
import { gs } from "@/src/styles/globalStyles";
import { Image } from "expo-image";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { CpuIcon, FlameIcon, GaugeIcon, HandFistIcon, ShieldIcon, Sigma } from "lucide-react-native";
import { memo, useCallback, useState } from "react";
import { FlatList, ListRenderItem, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

const UnitPrevPathScreen = memo(() => {
    const { playerUnitID } = useLocalSearchParams();
    const id = Array.isArray(playerUnitID) ? playerUnitID[0] : playerUnitID;

    const [isLoading, setIsLoading] = useState(true);
    const [listHeight, setListHeight] = useState(0);
    const [levels, setLevels] = useState<InvGetPlayerUnitPrevLevelRS[]>([]);
    const [stats, setStats] = useState<number[]>([0, 0, 0, 0, 0]);
    const [selectedLevel, setSelectedLevel] = useState(-1);

    const init = useCallback(async () => {
        try {
            if (id === '') return;

            const res = await invGetPlayerUnitPrevLevel(id);
            if (!res.success) return;

            const tempStats = [0, 0, 0, 0, 0];
            const enrichedLevels = await Promise.all(
                res.data.map(async (unit) => {
                    tempStats[0] += unit.offense;
                    tempStats[1] += unit.defense;
                    tempStats[2] += unit.technique;
                    tempStats[3] += unit.speed;
                    tempStats[4] += unit.spirit;
                    return ({
                        ...unit,
                        imgURL: await getUnitCardImagePath(unit.origin, unit.unitCode, unit.imageTypeNumber)
                    })
                })
            );

            setStats(tempStats);
            setSelectedLevel(-1);
            setLevels(enrichedLevels);
        }
        finally {
            setIsLoading(false);
        }
    }, [playerUnitID]);

    useFocusEffect(
        useCallback(() => {
            setIsLoading(true);
            init();
        }, [init])
    );

    const onLevelImagePress = useCallback((idx: number) => {
        router.push({
            pathname: '/unit-detail-screen-2/unit-change-image-screen',
            params: {
                playerUnitIdP: id,
                unitCodeP: levels[idx].unitCode,
                unitNameP: levels[idx].unitName,
                originP: levels[idx].origin,
                imageTypeNumberP: levels[idx].imageTypeNumber,
                imageTypeCountP: levels[idx].imageTypeCount,
                levelP: levels[idx].targetLevel
            }
        })
    }, [levels]);

    const ITEM_HEIGHT = listHeight / scaleMin(4.5);
    const renderItem: ListRenderItem<InvGetPlayerUnitPrevLevelRS> = useCallback(({ item, index }) => {
        function onPress() {
            onLevelImagePress(index);
        }

        return (
            <GBox elements={[item.elementID1, item.elementID2]} style={[{ width: '100%', height: ITEM_HEIGHT }, gs.p5, gs.column, styles.items]}>
                <View style={[gs.f1, gs.all_center, gs.full_size]}>
                    <Text style={gs.fontM}>lvl</Text>
                    <Text style={gs.fontM}>{item.targetLevel}</Text>
                </View>
                <Pressable style={[gs.f2, gs.full_size, gs.all_center, gs.px5]}
                    onPress={onPress}>
                    <Image
                        source={item.imgURL}
                        contentFit="fill"
                        style={[gs.full_size, gs.border_card]}
                    />
                </Pressable>
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
        );
    }, [ITEM_HEIGHT, onLevelImagePress]);

    return (
        <View style={[gs.full_size]}>
            {!isLoading && selectedLevel === -1 &&
                <Animated.View entering={FadeIn} exiting={FadeOut} style={[gs.full_size]}>
                    <View style={[gs.f1]}>
                        <GeneralHeaderBarComponent title="PREV PATH"></GeneralHeaderBarComponent>
                    </View>
                    <View style={[gs.f8, gs.full_size, gs.row]}
                        onLayout={(e) => setListHeight(e.nativeEvent.layout.height)}>
                        <FlatList
                            data={levels}
                            renderItem={renderItem}
                            keyExtractor={(item) => item.unitCode}
                            extraData={levels} // Tells FlatList to check for data changes
                        />
                    </View>
                    <View style={[gs.f1, gs.full_size, gs.p5, styles.footer]}>
                        <View style={[gs.f1, gs.full_size, gs.column]}>
                            <View style={[gs.f2, gs.all_center, gs.full_size]}>
                                <View style={[gs.f1, gs.all_center]}>
                                    <Sigma size={scaleMin(22)} />
                                </View>
                            </View>
                            <View style={[gs.f8, gs.full_size]}>
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
                                <View style={[gs.f1, , gs.full_size, gs.all_center, gs.column]}>
                                    <View style={[gs.f1, gs.all_center]}>
                                        <Text style={{ color: StatColor.offense }}>{stats[0]}</Text>
                                    </View>
                                    <View style={[gs.f1, gs.all_center]}>
                                        <Text style={{ color: StatColor.defense }}>{stats[1]}</Text>
                                    </View>
                                    <View style={[gs.f1, gs.all_center]}>
                                        <Text style={{ color: StatColor.technique }}>{stats[2]}</Text>
                                    </View>
                                    <View style={[gs.f1, gs.all_center]}>
                                        <Text style={{ color: StatColor.speed }}>{stats[3]}</Text>
                                    </View>
                                    <View style={[gs.f1, gs.all_center]}>
                                        <Text style={{ color: StatColor.spirit }}>{stats[4]}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                </Animated.View>
            }
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
});
export default UnitPrevPathScreen;