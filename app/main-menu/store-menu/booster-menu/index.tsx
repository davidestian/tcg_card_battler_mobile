import { getUserDetail } from "@/src/api/account/service";
import { storeGetAllBooster } from "@/src/api/store/service";
import { Booster } from "@/src/api/store/type";
import ConfirmationModalComponent from "@/src/components/general/ConfirmationModalComponent";
import BoosterDetailModalComponent from "@/src/components/mainMenu/inventoryMenu/storeMenu/boosterMenu/BoosterDetailModalComponent";
import { gs } from "@/src/styles/globalStyles";
import { ConfirmationModalData } from "@/src/types/general/confirmationType";
import { router, useFocusEffect } from "expo-router";
import { PackageOpen } from "lucide-react-native";
import { memo, useCallback, useState } from "react";
import { FlatList, ListRenderItem, Pressable, Text, View } from "react-native";

const StoreMenuBoosterIndex = memo(() => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [boosters, setBoosters] = useState<Booster[]>([]);
    const [listHeight, setListHeight] = useState(0);
    const [selectedBoosterIndex, setSelectedBoosterIndex] = useState(-1);
    const [isShowDetail, setIsShowDetail] = useState(false);
    const [isShowConfirmation, setIsShowConfirmation] = useState(false);
    const [selectedQTY, setSelectedQTY] = useState(0);
    const [gold, setGold] = useState(0n);
    const [confirmationModalData, setConfirmationModalData] = useState<ConfirmationModalData>({
        message: '',
        noText: '',
        yesText: ''
    });

    const init = useCallback(async () => {
        const res = await storeGetAllBooster();
        if (!res.success) { }

        setSelectedBoosterIndex(-1);
        setIsShowDetail(false);
        setBoosters(res.data.boosters);
        await getGold();
    }, []);

    useFocusEffect(useCallback(() => {
        setIsLoading(true);
        init().finally(() => setIsLoading(false));
    }, [init]));

    const ITEM_HEIGHT = listHeight / 4;
    const renderItem: ListRenderItem<Booster> = useCallback(({ item, index }) => {
        const onLongPress = () => {
            showBoosterDetail(index)
        };

        const onPress1 = () => {
            confirmationBuyPack(index, {
                message: `Are you to spend ${item.price} for 1\npack (${item.boosterCode} - ${item.boosterName}) ? `,
                yesText: 'BUY',
                noText: 'NO'
            });
            setSelectedQTY(1);
        };

        const onPress10 = () => {
            confirmationBuyPack(index, {
                message: `Are you to spend ${item.price * 10} for 10\npack (${item.boosterCode} - ${item.boosterName}) ? `,
                yesText: 'BUY',
                noText: 'NO'
            });
            setSelectedQTY(10);
        };

        return (
            <View style={[{ height: ITEM_HEIGHT, width: '100%' }, gs.all_center, gs.p5]}>
                <Pressable style={[gs.full_size, gs.border_card, gs.all_center, gs.p5]}
                    onLongPress={onLongPress}
                    accessibilityLabel="button">
                    <View style={[gs.f1, gs.all_center]}>
                        <Text>{item.boosterCode} - {item.boosterName}</Text>
                    </View>
                    <View style={[gs.f2]}>
                    </View>
                    <View style={[gs.f2, gs.column]}>
                        <Pressable style={[gs.f1, gs.p5]}
                            onPress={onPress1}
                            accessibilityLabel="button">
                            <View style={[gs.full_size, gs.all_center, gs.border_card]}>
                                <Text>BUY 1</Text>
                                <Text>{item.price} G</Text>
                            </View>
                        </Pressable>
                        <Pressable style={[gs.f1, gs.all_center, gs.p5]}
                            onPress={onPress10}
                            accessibilityLabel="button">
                            <View style={[gs.full_size, gs.all_center, gs.border_card]}>
                                <Text>BUY 10</Text>
                                <Text>{item.price * 10} G</Text>
                            </View>
                        </Pressable>
                    </View>
                </Pressable>
            </View>
        );
    }, [ITEM_HEIGHT]);

    const confirmationBuyPack = useCallback((idx: number, modalData: ConfirmationModalData) => {
        setSelectedBoosterIndex(idx);
        setIsShowConfirmation(true);
        setConfirmationModalData({
            message: modalData.message,
            noText: modalData.noText,
            yesText: modalData.yesText
        });
    }, []);

    const onCloseBuyPack = useCallback(() => {
        setSelectedBoosterIndex(-1);
        setIsShowConfirmation(false);
    }, []);

    const getGold = useCallback(async () => {
        const res = await getUserDetail();
        if (!res.success) return

        setGold((res.data.gold));
    }, []);

    const openPack = useCallback((boosterCode: string, qty: number) => {
    }, [router]);

    const onConfirmBuyPack = useCallback(() => {
        var booster = boosters[selectedBoosterIndex];
        router.push({
            pathname: '/main-menu/store-menu/booster-menu/buy-pack',
            params: { boosterCode: booster.boosterCode, boosterName: booster.boosterName, qty: selectedQTY }
        });

        setSelectedBoosterIndex(-1);
        setIsShowConfirmation(false);
    }, [router, boosters, selectedBoosterIndex, selectedQTY]);

    const onCloseBoosterDetail = useCallback(() => {
        setSelectedBoosterIndex(-1);
        setIsShowDetail(false);
    }, []);

    const showBoosterDetail = useCallback((idx: number) => {
        setSelectedBoosterIndex(idx);
        setIsShowDetail(true);
    }, []);

    return (
        <View style={[gs.full_size, gs.all_center, gs.row]}>
            <View style={[gs.f1, gs.all_center, gs.column]} >
                <View style={[gs.f1, gs.all_center]}>
                </View>
                <View style={[gs.f2, gs.all_center, gs.column]}>
                    <PackageOpen />
                    <Text> BOOSTER</Text>
                </View>
                <View style={[gs.f1, gs.all_center]}>
                    <Text> G : {gold}</Text>
                </View>
            </View>
            {!isLoading &&
                <View style={[gs.f9, gs.full_size]}
                    onLayout={(e) => setListHeight(e.nativeEvent.layout.height)}>
                    <FlatList
                        data={boosters}
                        numColumns={1}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.boosterCode}
                        extraData={boosters}
                    />
                </View>
            }

            {selectedBoosterIndex > -1 && isShowDetail &&
                <BoosterDetailModalComponent
                    boosterCode={boosters[selectedBoosterIndex].boosterCode}
                    boosterName={boosters[selectedBoosterIndex].boosterName}
                    price={boosters[selectedBoosterIndex].price}
                    onClose={onCloseBoosterDetail} />
            }

            {selectedBoosterIndex > -1 && isShowConfirmation &&
                <ConfirmationModalComponent
                    data={confirmationModalData}
                    onClose={onCloseBuyPack}
                    onConfirm={onConfirmBuyPack} />
            }
        </View>
    );
});

export default StoreMenuBoosterIndex;