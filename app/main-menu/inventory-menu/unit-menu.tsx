import { invGetPlayerUnits } from "@/src/api/inventory/service";
import { PlayerUnit } from "@/src/api/inventory/type";
import LoadingModalComponent from "@/src/components/general/LoadingModalComponent";
import UnitMenuModalComponent from "@/src/components/mainMenu/inventoryMenu/unitMenu/modal/UnitMenuModalComponent";
import UnitMenuSlotComponent from "@/src/components/mainMenu/inventoryMenu/unitMenu/UnitMenuSlotComponent";
import { getUnitCardImagePath } from "@/src/services/generalService";
import { gs } from "@/src/styles/globalStyles";
import { router, useFocusEffect } from "expo-router";
import { ChevronLeftCircleIcon, ChevronRightCircleIcon, FilterIcon, IdCard, PlusSquareIcon } from "lucide-react-native";
import { memo, useCallback, useState } from "react";
import { FlatList, ListRenderItem, Pressable, Text, View } from "react-native";

const UnitMenu = memo(() => {
    const [isLoading, setIsLoading] = useState(false)
    const [playerUnits, setPlayerUnits] = useState<PlayerUnit[]>([]);
    const [listHeight, setListHeight] = useState(0);
    const [currPlayerUnitID, setCurrPlayerUnitID] = useState<string>('');
    const [currPage, setCurrPage] = useState(1);
    const [totalPage, setTotalPage] = useState(0);
    const LIMIT = 20

    useFocusEffect(useCallback(() => {
        fetchData(currPage);
    }, [currPage]));

    const fetchData = useCallback(async (page: number) => {
        setIsLoading(true);
        try {
            const res = await invGetPlayerUnits(LIMIT, page);
            if (!res.success || res.data.units.length === 0) {
                setPlayerUnits([]);
                return;
            }
            const processedData = await Promise.all(res.data.units.map(async (unit) => {
                const imgURL = await getUnitCardImagePath(unit.origin, unit.unitCode, unit.imageTypeNumber);
                return { ...unit, imgURL };
            }));

            setTimeout(() => {
                setPlayerUnits(processedData);
                setTotalPage(res.data.totalPage);
            }, 800);
        } catch (error) {
            console.error("Infinite scroll fetch failed", error);
        } finally {
            setTimeout(() => {
                setIsLoading(false);
            }, 1000);
        }
    }, []);

    const onPressSlot = useCallback((playerUnitID: string) => {
        setCurrPlayerUnitID(playerUnitID);
    }, []);

    const onModalClose = useCallback(() => {
        setCurrPlayerUnitID('');
    }, []);

    // Calculate 1/4 of the available space
    const ITEM_HEIGHT = listHeight / 5;
    const renderItem: ListRenderItem<PlayerUnit> = useCallback(({ item }) => {
        return (
            <View style={[gs.all_center, { width: '25%', height: ITEM_HEIGHT }]}>
                <UnitMenuSlotComponent
                    playerUnitID={item.playerUnitID}
                    imageUrl={item.imgURL}
                    level={item.level}
                    onPressSlot={onPressSlot} />
            </View>
        )
    }, [ITEM_HEIGHT]);

    const onAddNewUnitPress = useCallback(() => {
        router.push("/main-menu/inventory-menu/create-unit-menu");
    }, []);

    const onNextPress = () => {
        if (isLoading) return;
        setCurrPage((prev) => Math.min(prev + 1, totalPage));
    };

    const onPrevPress = () => {
        if (isLoading) return;
        setCurrPage((prev) => Math.max(prev - 1, 1));
    };

    return (
        <View style={[gs.full_size, gs.all_center, gs.row]}>
            <View style={[gs.full_size, gs.f1, gs.column, gs.header, gs.border_bottom]}>
                <Pressable style={[gs.f1, gs.all_center, gs.full_size]}
                    accessibilityLabel="button"
                    onPress={onAddNewUnitPress}>
                    <PlusSquareIcon />
                </Pressable>
                <View style={[gs.f2, gs.all_center, gs.column]}>
                    <IdCard />
                    <Text> UNITS</Text>
                </View>
                <View style={[gs.f1, gs.all_center]}>
                    <FilterIcon />
                </View>
            </View>
            <View
                style={[gs.full_size, gs.f9, gs.all_center, gs.p5]}>
                <View style={[gs.full_size]}
                    onLayout={(e) => setListHeight(e.nativeEvent.layout.height)}>
                    {playerUnits.length > 0 && listHeight > 0 &&
                        <FlatList
                            data={playerUnits}
                            numColumns={4}
                            keyExtractor={(item) => item.playerUnitID}
                            renderItem={renderItem}
                        />
                    }
                </View>
            </View>
            <View style={[gs.full_size, gs.f1, gs.all_center, gs.column, gs.border_top]}>
                <Pressable style={[gs.f1, gs.full_size, gs.all_center]}
                    accessibilityLabel="button"
                    onPress={onPrevPress}>
                    <ChevronLeftCircleIcon />
                </Pressable>
                <View style={[gs.f1, gs.full_size, gs.all_center]}>
                    <Text>
                        {currPage} / {totalPage}
                    </Text>
                </View>
                <Pressable style={[gs.f1, gs.full_size, gs.all_center]}
                    accessibilityLabel="button"
                    onPress={onNextPress}>
                    <ChevronRightCircleIcon />
                </Pressable>
            </View>
            {currPlayerUnitID !== '' &&
                <UnitMenuModalComponent playerUnitID={currPlayerUnitID} onClose={onModalClose} />
            }
            {isLoading &&
                <LoadingModalComponent />
            }
        </View>
    );
});

export default UnitMenu;