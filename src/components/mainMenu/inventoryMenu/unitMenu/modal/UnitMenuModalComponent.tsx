import { invGetPlayerUnitDetailByID } from "@/src/api/inventory/service";
import { InvGetPlayerUnitDetailByIDRS } from "@/src/api/inventory/type";
import { InventoryUnitDetailTabEnums } from "@/src/enums/inventoryEnum";
import { gs } from "@/src/styles/globalStyles";
import { ChevronDown, IdCardLanyard, List, Network } from "lucide-react-native";
import { memo, useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from "react-native-reanimated";
import UnitMenuModalLevelUpTabComponent from "./UnitMenuModalLevelUpTabComponent";
import UnitMenuModalNextLevelComponent from "./UnitMenuModalNextLevelComponent";
import UnitMenuModalPrevLevelTabComponent from "./UnitMenuModalPrevLevelTabComponent";

interface props {
    playerUnitID: string;
    onClose: () => void;
}

const AVAILABLE_COLOR = 'rgb(1, 171, 183)';

const UnitMenuModalComponent = memo(({ playerUnitID, onClose }: props) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isBusy, setIsBusy] = useState(false);
    const [currTab, setCurrTab] = useState(InventoryUnitDetailTabEnums.LevelUp);
    const [unitDetail, setUnitDetail] = useState<InvGetPlayerUnitDetailByIDRS>({
        imageTypeNumber: 0,
        playerUnitID: '',
        playerUnitLevel: 0,
        tags: [],
        firstUnitCode: '',
        lastUnitCode: '',
        origin: '',
        unitName: ''
    });

    const init = useCallback(async () => {
        if (playerUnitID === '') return;

        const res = await invGetPlayerUnitDetailByID(playerUnitID);
        if (!res.success) { }

        setCurrTab(InventoryUnitDetailTabEnums.LevelUp);
        setUnitDetail(res.data);
    }, [playerUnitID]);

    useEffect(() => {
        setIsLoading(true);
        init().finally(() => setIsLoading(false));
    }, [init]);

    const onPressLevelUpTab = useCallback(() => {
        setCurrTab(InventoryUnitDetailTabEnums.LevelUp);
    }, []);
    const onPressPrevLevelTab = useCallback(() => {
        setCurrTab(InventoryUnitDetailTabEnums.PrevLevel);
    }, []);
    const onPressNextLevelTab = useCallback(() => {
        setCurrTab(InventoryUnitDetailTabEnums.NextLevel);
    }, []);

    const onPressClose = useCallback(() => {
        setCurrTab(InventoryUnitDetailTabEnums.LevelUp);
        onClose();
    }, []);

    const refreshHome = useCallback(() => {
        setIsLoading(true);
        init().finally(() => setIsLoading(false));
    }, [init]);

    return (
        <Modal visible={playerUnitID !== ""}
            transparent={true}
            onRequestClose={onClose}>
            <View style={[gs.overlay, gs.full_size]}>
                <Animated.View
                    entering={SlideInDown}
                    exiting={SlideOutDown}
                    style={[gs.full_size, gs.all_center]}>
                    <View style={[gs.full_size, styles.modalView, gs.row]}>
                        <View style={[gs.f1, gs.full_size, gs.row, styles.header]}>
                            <View style={[gs.f1, gs.all_center]}>
                                {currTab === InventoryUnitDetailTabEnums.LevelUp &&
                                    <Text>
                                        PLAYER UNIT LEVEL UP
                                    </Text>
                                }
                                {currTab === InventoryUnitDetailTabEnums.PrevLevel &&
                                    <Text>
                                        PLAYER UNIT PREV LEVEL
                                    </Text>
                                }
                                {currTab === InventoryUnitDetailTabEnums.NextLevel &&
                                    <Text>
                                        PLAYER UNIT NEXT LEVEL
                                    </Text>
                                }
                            </View>
                        </View>
                        {isLoading &&
                            <Animated.View exiting={FadeOut} style={[gs.full_size, gs.f10, gs.all_center]}>
                                <ActivityIndicator size="large" color="#0000ff" />
                            </Animated.View>
                        }
                        {!isLoading &&
                            <View style={[gs.f10, gs.full_size]}>
                                {currTab === InventoryUnitDetailTabEnums.LevelUp &&
                                    <Animated.View style={gs.full_size} entering={FadeIn} exiting={FadeOut} >
                                        <UnitMenuModalLevelUpTabComponent
                                            playerUnitID={unitDetail.playerUnitID}
                                            firstUnitCode={unitDetail.firstUnitCode}
                                            lastUnitCode={unitDetail.lastUnitCode}
                                            imageTypeNumber={unitDetail.imageTypeNumber}
                                            origin={unitDetail.origin}
                                            tags={unitDetail.tags}
                                            unitLevel={unitDetail.playerUnitLevel}
                                            unitName={unitDetail.unitName}
                                            refreshHome={refreshHome}
                                        />
                                    </Animated.View>
                                }
                                {currTab === InventoryUnitDetailTabEnums.PrevLevel &&
                                    <Animated.View style={gs.full_size} entering={FadeIn} exiting={FadeOut}>
                                        <UnitMenuModalPrevLevelTabComponent
                                            playerUnitID={unitDetail.playerUnitID}
                                            lastUnitCode={unitDetail.lastUnitCode}
                                            unitLevel={unitDetail.playerUnitLevel}
                                            refresHome={refreshHome}
                                        />
                                    </Animated.View>
                                }
                                {currTab === InventoryUnitDetailTabEnums.NextLevel &&
                                    <UnitMenuModalNextLevelComponent
                                        refreshHome={refreshHome}
                                        unitLevel={unitDetail.playerUnitLevel}
                                        playerUnitID={playerUnitID}
                                        unitCode={unitDetail.lastUnitCode} />
                                }
                            </View>
                        }
                        <View style={[gs.f1, gs.all_center, gs.column, styles.tabBar]}>
                            <Pressable style={[gs.f1, gs.all_center]}
                                onPress={onPressLevelUpTab}>
                                <IdCardLanyard color={currTab === InventoryUnitDetailTabEnums.LevelUp ? AVAILABLE_COLOR : 'black'} />
                            </Pressable>
                            <Pressable style={[gs.f1, gs.all_center]}
                                onPress={onPressPrevLevelTab}>
                                <List color={currTab === InventoryUnitDetailTabEnums.PrevLevel ? AVAILABLE_COLOR : 'black'} />
                            </Pressable>
                            <Pressable style={[gs.f1, gs.all_center]}
                                onPress={onPressNextLevelTab}>
                                <Network color={currTab === InventoryUnitDetailTabEnums.NextLevel ? AVAILABLE_COLOR : 'black'} />
                            </Pressable>
                            <Pressable style={[gs.f1, gs.all_center]} onPress={onClose} >
                                <ChevronDown color={'red'} />
                            </Pressable>
                        </View>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
});

const styles = StyleSheet.create({
    modalView: {
        backgroundColor: 'white',
    },
    header: {
        backgroundColor: 'rgb(191, 191, 191)'
    },
    tabBar: {
        borderTopWidth: 1
    },
    parentContainer: {
        backgroundColor: 'white',
        width: 100, // Example size
        height: 100, // Example size
        // This line clips the overflow:
        overflow: 'hidden',
    },
    childWithRadius: {
        // The background color of the child that you want clipped
        backgroundColor: 'blue',
        width: '100%',
        height: '100%',
        borderRadius: 20, // Example radius
    },
});
export default UnitMenuModalComponent;