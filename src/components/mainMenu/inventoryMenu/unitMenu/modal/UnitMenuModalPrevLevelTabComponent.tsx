import { invGetPlayerUnitPrevLevel, invPostPlayerUnitLevelChangeImage } from "@/src/api/inventory/service";
import { InvGetPlayerUnitPrevLevelRS, InvPostPlayerUnitLevelChangeImageRQ } from "@/src/api/inventory/type";
import { getUnitCardImagePath } from "@/src/services/generalService";
import { gs } from "@/src/styles/globalStyles";
import { Image } from "expo-image";
import { ImageIcon, Sigma } from "lucide-react-native";
import { memo, useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, ListRenderItem, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import UnitMenuModalChangeImageCompnent from "./UnitMenuModalChangeImageComponent";

interface props {
    playerUnitID: string;
    lastUnitCode: string;
    unitLevel: number;
    refresHome: () => void;
}
const UnitMenuModalPrevLevelTabComponent = memo(({ playerUnitID, lastUnitCode, unitLevel, refresHome }: props) => {
    const [isLoading, setIsLoading] = useState(true);
    const [listHeight, setListHeight] = useState(0);
    const [levels, setLevels] = useState<InvGetPlayerUnitPrevLevelRS[]>([]);
    const [stats, setStats] = useState<number[]>([0, 0, 0, 0, 0]);
    const [selectedLevel, setSelectedLevel] = useState(-1);

    const init = useCallback(async () => {
        if (playerUnitID === '') return;

        const res = await invGetPlayerUnitPrevLevel(playerUnitID);
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
    }, [playerUnitID, unitLevel]);

    useEffect(() => {
        setIsLoading(true);
        init().finally(() => setIsLoading(false));
    }, [init]);

    const onChangeBack = useCallback(() => {
        setSelectedLevel(-1);
    }, []);

    const onChangeImage = useCallback(async (imageTypeNumber: number) => {
        setIsLoading(true);
        try {
            let rq: InvPostPlayerUnitLevelChangeImageRQ = {
                imageTypeNumber: imageTypeNumber,
                playerUnitID: levels[selectedLevel].playerUnitID,
                targetLevel: levels[selectedLevel].targetLevel,
                unitCode: levels[selectedLevel].unitCode,
            }

            const res = await invPostPlayerUnitLevelChangeImage(rq);
            if (!res.success) { return; }

            if (levels[selectedLevel].unitCode === lastUnitCode) {
                refresHome();
            } else {
                await init();
            }
        } catch (error) {
            console.error("Level up failed:", error);
        } finally {
            setIsLoading(false);
        }
    }, [levels, selectedLevel, lastUnitCode, refresHome]);

    const ITEM_HEIGHT = listHeight / 4.5;
    const renderItem: ListRenderItem<InvGetPlayerUnitPrevLevelRS> = useCallback(({ item, index }) => {
        function onPress() {
            setSelectedLevel(index);
        }

        return (
            <View style={[{ width: '100%', height: ITEM_HEIGHT }, gs.column, gs.p5, styles.items]}>
                <View style={[gs.f1, gs.all_center, gs.full_size]}>
                    <Text>{item.targetLevel}</Text>
                </View>
                <Pressable style={[gs.f2, gs.full_size, gs.all_center]}
                    onPress={onPress}>
                    <Image
                        source={item.imgURL}
                        contentFit="fill"
                        style={[gs.full_size, gs.border_card]}
                    />
                </Pressable>
                <View style={[gs.f7, , gs.full_size, gs.row]}>
                    <View style={[gs.f1, gs.all_center, gs.full_size, gs.column]}>
                        <Text>{item.unitName}</Text>
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
            </View>
        );
    }, [ITEM_HEIGHT]);

    return (
        <View style={[gs.full_size]}>
            {isLoading &&
                <Animated.View entering={FadeIn} exiting={FadeOut} style={[gs.full_size, gs.all_center]}>
                    <ActivityIndicator size="large" color="#0000ff" />
                </Animated.View>
            }
            {!isLoading && selectedLevel === -1 &&
                <Animated.View entering={FadeIn} exiting={FadeOut} style={[gs.full_size]}>
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
                            <View style={[gs.f3, gs.all_center, gs.full_size]}>
                                <View style={[gs.f1, gs.all_center]}>
                                    <Sigma />
                                </View>
                            </View>
                            <View style={[gs.f7, , gs.full_size, gs.all_center, gs.column]}>
                                <View style={[gs.f1, gs.all_center]}>
                                    <Text style={{ color: '#2A9D8F' }}>{stats[0]}</Text>
                                </View>
                                <View style={[gs.f1, gs.all_center]}>
                                    <Text style={{ color: '#E63946' }}>{stats[1]}</Text>
                                </View>
                                <View style={[gs.f1, gs.all_center]}>
                                    <Text style={{ color: '#4CC9F0' }}>{stats[2]}</Text>
                                </View>
                                <View style={[gs.f1, gs.all_center]}>
                                    <Text style={{ color: '#F4A261' }}>{stats[3]}</Text>
                                </View>
                                <View style={[gs.f1, gs.all_center]}>
                                    <Text style={{ color: '#4361EE' }}>{stats[4]}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </Animated.View>
            }
            {!isLoading && selectedLevel != -1 &&
                <View style={[gs.f8, gs.full_size]}>
                    <UnitMenuModalChangeImageCompnent
                        onChangeBack={onChangeBack}
                        onChangeImage={onChangeImage}
                        unitCode={levels[selectedLevel].unitCode}
                        unitName={levels[selectedLevel].unitName}
                        imageTypeCount={levels[selectedLevel].imageTypeCount}
                        imageTypeNumber={levels[selectedLevel].imageTypeNumber}
                        origin={levels[selectedLevel].origin}
                    />
                </View>
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
});
export default UnitMenuModalPrevLevelTabComponent;