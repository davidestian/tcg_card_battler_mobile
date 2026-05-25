import { invGetEligibleUnitsToCreate } from "@/src/api/inventory/service";
import { EligibleUnit } from "@/src/api/inventory/type";
import GeneralHeaderBarComponent from "@/src/components/general/GeneralHeaderBarComponent";
import LoadingModalComponent from "@/src/components/general/LoadingModalComponent";
import { getUnitCardImagePath } from "@/src/services/generalService";
import { gs } from "@/src/styles/globalStyles";
import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import { ChevronLeftCircleIcon, ChevronRightCircleIcon } from "lucide-react-native";
import { memo, useCallback, useState } from "react";
import { FlatList, ListRenderItem, Pressable, Text, View } from "react-native";

interface filter {
    page: number;
    totalPage: number;
}

const CreateUnitMenu = memo(() => {
    const [isLoading, setIsLoading] = useState(true);

    const [listHeight, setListHeight] = useState(0);
    const [units, setUnits] = useState<EligibleUnit[]>([]);
    const [currPage, setCurrPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);

    const fectEligibleUnits = useCallback(async (limit: number, page: number) => {
        setIsLoading(true);
        if (page === 0) return;

        try {
            const res = await invGetEligibleUnitsToCreate(limit, page);
            if (!res.success) {
                return;
            }

            for (let i = 0; i < res.data.units.length; i++) {
                res.data.units[i].imgURL = await getUnitCardImagePath(res.data.units[i].origin, res.data.units[i].unitCode, 0);
            }

            setUnits(res.data.units);
            setTotalPage(res.data.totalPage)
        }
        finally {
            setIsLoading(false);
        }
    }, []);

    useFocusEffect(useCallback(() => {
        fectEligibleUnits(20, currPage);
    }, [currPage]));

    const ITEM_HEIGHT = listHeight / 5;
    const renderItemEligibleUnit: ListRenderItem<EligibleUnit> = useCallback(({ item }) => (
        <EligibleUnitItem
            item={item}
            height={ITEM_HEIGHT}
        />
    ), [ITEM_HEIGHT]);

    // Separate memoized component to prevent list re-renders
    const EligibleUnitItem = memo(({ item, height }: { item: EligibleUnit, height: number }) => {
        const handlePress = () => {
            router.push({
                pathname: '/main-menu/inventory-menu/create-unit-detail-menu',
                params: { unitCode: item.unitCode }
            });
        };

        return (
            <Pressable
                style={[gs.p5, { width: '25%', height }]}
                onPress={handlePress}
                // Optimization: improves touch feedback performance
                android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
            >
                <Image
                    source={item.imgURL}
                    contentFit="fill"
                    style={[gs.full_size, gs.border_card]}
                    // Optimization: simple transition for smoother loading
                    transition={200}
                />
            </Pressable>
        );
    });

    const onNextPress = () => {
        if (isLoading) return;
        setCurrPage((prev) => Math.min(prev + 1, totalPage))
    };

    const onPrevPress = () => {
        if (isLoading) return;
        setCurrPage((prev) => Math.max(prev - 1, 1))
    };

    return (
        <View style={[gs.full_size]}>
            <View style={[gs.f1]}>
                <GeneralHeaderBarComponent title="CREATE UNIT"></GeneralHeaderBarComponent>
            </View>
            <View style={[gs.f9, gs.full_size]}>
                <View style={[gs.full_size]}>
                    <View style={[gs.f9, gs.full_size, gs.p5, gs.border_top, gs.border_bottom]}>
                        <View style={[gs.full_size]}
                            onLayout={(e) => setListHeight(e.nativeEvent.layout.height)}>
                            {listHeight > 0 && units.length > 0 ?
                                <FlatList
                                    data={units}
                                    numColumns={4}
                                    renderItem={renderItemEligibleUnit}
                                    keyExtractor={(item) => item.unitCode}
                                /> :
                                units.length === 0 ?
                                    <View style={[gs.full_size, gs.all_center]}>
                                        <Text>NO ELIGIBLE UNITS...</Text>
                                    </View> :
                                    <></>
                            }
                        </View>
                    </View>
                    <View style={[gs.f1, gs.column]}>
                        <Pressable style={[gs.f1, gs.full_size, gs.all_center]}
                            accessibilityLabel="button"
                            onPress={onPrevPress}>
                            <ChevronLeftCircleIcon />
                        </Pressable>
                        <View style={[gs.f1, gs.full_size, gs.all_center]}>
                            <Text>
                                {Math.min(currPage, totalPage)} / {totalPage}
                            </Text>
                        </View>
                        <Pressable style={[gs.f1, gs.full_size, gs.all_center]}
                            accessibilityLabel="button"
                            onPress={onNextPress}>
                            <ChevronRightCircleIcon />
                        </Pressable>
                    </View>
                </View>
            </View>
            <LoadingModalComponent visible={isLoading} />
        </View>
    )
});


export default CreateUnitMenu;