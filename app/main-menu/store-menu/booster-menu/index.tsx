import { getUserDetail } from "@/src/api/account/service";
import { storeGetAllBooster } from "@/src/api/store/service";
import { Booster } from "@/src/api/store/type";
import ConfirmationModalComponent from "@/src/components/general/ConfirmationModalComponent";
import GeneralHeaderBarComponent from "@/src/components/general/GeneralHeaderBarComponent";
import LoadingModalComponent from "@/src/components/general/LoadingModalComponent";
import { getUnitCardImagePath } from "@/src/services/generalService";
import { gs } from "@/src/styles/globalStyles";
import { ConfirmationModalData } from "@/src/types/general/confirmationType";
import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import { memo, useCallback, useState } from "react";
import { FlatList, ListRenderItem, Pressable, StyleSheet, Text, View } from "react-native";

const StoreMenuBoosterIndex = memo(() => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [boosters, setBoosters] = useState<Booster[]>([]);
    const [listHeight, setListHeight] = useState(0);
    const [selectedBoosterIndex, setSelectedBoosterIndex] = useState(-1);
    const [isShowConfirmation, setIsShowConfirmation] = useState(false);
    const [selectedQTY, setSelectedQTY] = useState(0);
    const [gold, setGold] = useState(0n);
    const [confirmationModalData, setConfirmationModalData] = useState<ConfirmationModalData>({
        message: '',
        noText: '',
        yesText: ''
    });

    const init = useCallback(async () => {
        const [boosterRes, goldRes] = await Promise.all([
            storeGetAllBooster(5),
            getUserDetail()
        ]);

        if (!boosterRes.success || !goldRes.success) { return; }
        for (let i = 0; i < boosterRes.data.boosters.length; i++) {
            for (let j = 0; j < boosterRes.data.boosters[i].boosterCards.length; j++) {
                boosterRes.data.boosters[i].boosterCards[j].imgURL = await getUnitCardImagePath(
                    boosterRes.data.boosters[i].boosterCards[j].origin,
                    boosterRes.data.boosters[i].boosterCards[j].cardCode,
                    boosterRes.data.boosters[i].boosterCards[j].imageTypeNumber);
            }
        }

        setSelectedBoosterIndex(-1);
        setBoosters(boosterRes.data.boosters);
        setGold(goldRes.data.gold);
    }, []);

    useFocusEffect(useCallback(() => {
        setIsLoading(true);
        init().finally(() => setIsLoading(false));
    }, [init]));

    const ITEM_HEIGHT = listHeight / 3;
    const renderItem: ListRenderItem<Booster> = useCallback(({ item, index }) => {
        const onLongPress = () => {
            showBoosterDetail(item.boosterCode, item.boosterName, item.price);
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
                <Pressable style={[gs.f3, gs.full_size, gs.border_card, gs.all_center]}
                    onLongPress={onLongPress}
                    accessibilityLabel="button">
                    <View style={[gs.f2, gs.column]}>
                        <View style={[gs.f1]}>
                            <Image source={item.boosterCards[3].imgURL}
                                contentFit="cover"
                                style={[gs.full_size]} />
                        </View>
                        <View style={[gs.f1]}>
                            <Image source={item.boosterCards[1].imgURL}
                                contentFit="cover"
                                style={[gs.full_size]} />
                        </View>
                        <View style={[gs.f1]}>
                            <Image source={item.boosterCards[0].imgURL}
                                contentFit="cover"
                                style={[gs.full_size]} />
                        </View>
                        <View style={[gs.f1]}>
                            <Image source={item.boosterCards[2].imgURL}
                                contentFit="cover"
                                style={[gs.full_size]} />
                        </View>
                        <View style={[gs.f1]}>
                            <Image source={item.boosterCards[4].imgURL}
                                contentFit="cover"
                                style={[gs.full_size]} />
                        </View>
                    </View>
                    <View style={[{ height: '20%' }, gs.f1, gs.all_center, styles.topBanner]}>
                        <Text>{item.boosterCode} - {item.boosterName}</Text>
                    </View>
                    <View style={[{ height: '20%' }, gs.column, styles.bottomBanner]}>
                        <Pressable style={[gs.f1]}
                            onPress={onPress1}
                            accessibilityLabel="button">
                            <View style={[gs.full_size, gs.all_center, gs.border_right]}>
                                <Text style={[gs.fontM]}>BUY 1 ({item.price} G)</Text>
                            </View>
                        </Pressable>
                        <Pressable style={[gs.f1]}
                            onPress={onPress10}
                            accessibilityLabel="button">
                            <View style={[gs.full_size, gs.all_center]}>
                                <Text style={[gs.fontM]}>BUY 10 ({item.price * 10} G)</Text>
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

    const onConfirmBuyPack = useCallback(() => {
        var booster = boosters[selectedBoosterIndex];
        router.push({
            pathname: '/main-menu/store-menu/booster-menu/buy-pack',
            params: { boosterCode: booster.boosterCode, boosterName: booster.boosterName, qty: selectedQTY }
        });

        setSelectedBoosterIndex(-1);
        setIsShowConfirmation(false);
    }, [router, boosters, selectedBoosterIndex, selectedQTY]);

    const showBoosterDetail = useCallback((boosterCode: string, boosterName: string, price: number) => {
        router.push({
            pathname: '/main-menu/store-menu/booster-menu/booster-detail-screen',
            params: {
                boosterCodeParam: boosterCode,
                boosterNameParam: boosterName,
                priceParam: price
            }
        });
    }, []);

    return (
        <View style={[gs.full_size, gs.all_center, gs.row]}>
            <View style={[gs.f1]} >
                <GeneralHeaderBarComponent title="BOOSTERS"></GeneralHeaderBarComponent>
            </View>
            <View style={[gs.f05, gs.all_center, gs.column]} >
                <View style={[gs.f1, gs.all_center]}>
                    <Text style={[gs.fontM]}> G : {gold}</Text>
                </View>
            </View>
            <View style={[gs.f9, gs.full_size]}
                onLayout={(e) => setListHeight(e.nativeEvent.layout.height)}>
                {listHeight > 0 &&
                    <FlatList
                        data={boosters}
                        numColumns={1}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.boosterCode}
                        extraData={boosters}
                    />
                }
            </View>
            <ConfirmationModalComponent
                visible={selectedBoosterIndex > -1 && isShowConfirmation}
                data={confirmationModalData}
                onClose={onCloseBuyPack}
                onConfirm={onConfirmBuyPack} />
            <LoadingModalComponent visible={isLoading}></LoadingModalComponent>
        </View>
    );
});

const styles = StyleSheet.create({
    bottomBanner: {
        position: 'absolute', // This positions the view relative to the cardContainer
        bottom: 0,            // Anchors it to the bottom edge
        width: '100%',        // Makes it span the full width
        alignItems: 'center', // Centers text horizontally
        justifyContent: 'center',
        textAlign: 'center',
        backgroundColor: 'rgba(255,255,255,0.7)'
    },
    topBanner: {
        position: 'absolute', // This positions the view relative to the cardContainer
        top: 0,            // Anchors it to the bottom edge
        width: '100%',        // Makes it span the full width
        alignItems: 'center', // Centers text horizontally
        justifyContent: 'center',
        textAlign: 'center',
        backgroundColor: 'rgba(255,255,255,0.7)'
    }
});

export default StoreMenuBoosterIndex;