import { invGetPlayerUnits } from "@/src/api/inventory/service";
import { FilterPlayerUnit, PlayerUnit } from "@/src/api/inventory/type";
import FilterPlayerUnitPaginationModal from "@/src/components/general/FilterPlayerUnitPaginationModal";
import { GBox } from "@/src/components/general/GBoxComponent";
import LoadingModalComponent from "@/src/components/general/LoadingModalComponent";
import UnitMenuSlotComponent from "@/src/components/mainMenu/inventoryMenu/unitMenu/UnitMenuSlotComponent";
import { getUnitCardImagePath } from "@/src/services/generalService";
import { gs } from "@/src/styles/globalStyles";
import { router, useFocusEffect } from "expo-router";
import { ChevronLeftCircleIcon, ChevronRightCircleIcon, FilterIcon, IdCard, PlusSquareIcon } from "lucide-react-native";
import { memo, useCallback, useRef, useState } from "react";
import { FlatList, ListRenderItem, Pressable, Text, View } from "react-native";

const UnitMenu = memo(() => {
    const [isLoading, setIsLoading] = useState(false)
    const [playerUnits, setPlayerUnits] = useState<PlayerUnit[]>([]);
    const [listHeight, setListHeight] = useState(0);
    const [currPage, setCurrPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);
    const [showFilter, setShowFilter] = useState(false);
    const filter = useRef<FilterPlayerUnit>({
        lastUnitLevel: 0,
        level: 0,
        name: '',
        origin: '',
        element1: 0,
        element2: 0,
        sort: 0
    })
    const LIMIT = 20

    useFocusEffect(useCallback(() => {
        setShowFilter(false);
        fetchData(currPage);
    }, [currPage]));

    const fetchData = useCallback(async (page: number) => {
        setIsLoading(true);
        try {
            const res = await invGetPlayerUnits(LIMIT, page, filter.current.name, filter.current.level,
                filter.current.lastUnitLevel, filter.current.element1, filter.current.element2, filter.current.origin,
                filter.current.sort);

            if (!res.success) {
                setPlayerUnits([]);
                return;
            }

            const processedData = await Promise.all(res.data.units.map(async (unit) => {
                const imgURL = await getUnitCardImagePath(unit.origin, unit.unitCode, unit.imageTypeNumber);
                return { ...unit, imgURL };
            }));

            setPlayerUnits(processedData);
            setTotalPage(res.data.totalPage);
        } catch (error) {
            console.error("Infinite scroll fetch failed", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const onPressSlot = useCallback((playerUnitID: string) => {
        router.push({
            pathname: '/unit-detail-screen',
            params: { playerUnitID: playerUnitID }
        });
    }, []);

    // Calculate 1/4 of the available space
    const ITEM_HEIGHT = listHeight / 5;
    const renderItem: ListRenderItem<PlayerUnit> = useCallback(({ item }) => {
        return (
            <View style={[gs.all_center, { width: '25%', height: ITEM_HEIGHT }, gs.p2]}>
                <GBox elements={[item.elementID1, item.elementID2]} style={[gs.full_size]}>
                    <UnitMenuSlotComponent
                        playerUnitID={item.playerUnitID}
                        imageUrl={item.imgURL}
                        level={item.level}
                        onPressSlot={onPressSlot} />
                </GBox>
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

    const onFilterPress = useCallback(() => {
        setShowFilter(true);
    }, []);

    const onFilterApply = useCallback(async (fil: FilterPlayerUnit) => {
        filter.current = fil;
        setShowFilter(false);
        await fetchData(1);
    }, []);
    const onCloseFilter = useCallback(async () => {
        setShowFilter(false);
        await fetchData(1);
    }, []);
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
                <Pressable
                    onPress={onFilterPress}
                    accessibilityLabel="button"
                    style={[gs.f1, gs.all_center]}>
                    <FilterIcon />
                </Pressable>
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
            <FilterPlayerUnitPaginationModal visible={showFilter} onClose={onCloseFilter} onApply={onFilterApply} />
            <LoadingModalComponent visible={isLoading} />
        </View>
    );
});

export default UnitMenu;