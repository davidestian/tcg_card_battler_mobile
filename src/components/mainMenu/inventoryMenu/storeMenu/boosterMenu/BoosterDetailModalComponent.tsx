import { storeGetAllBoosterCard, storeGetBoosterRarityRate } from "@/src/api/store/service";
import { BoosterCard, BoosterCardPercentage } from "@/src/api/store/type";
import CardSlotComponent from "@/src/components/general/CardSlotComponent";
import { getUnitCardImagePath } from "@/src/services/generalService";
import { gs } from "@/src/styles/globalStyles";
import { ChevronDown } from "lucide-react-native";
import { memo, useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, ListRenderItem, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from "react-native-reanimated";

interface props {
    boosterCode: string;
    boosterName: string;
    price: number;
    onClose: () => void;
}

const BoosterDetailModalComponent = memo(({ boosterCode, boosterName, price, onClose }: props) => {
    const [isLoading, setIsLoading] = useState(true);
    const [boosterCards, setBoosterCards] = useState<BoosterCard[]>([]);
    const [boosterRarities, setBoosterRarities] = useState<BoosterCardPercentage[]>([]);
    const [listWidth, setListWidth] = useState(0);
    const [listHeight, setListHeight] = useState(0);

    const init = useCallback(async () => {
        const [resCard, resRate] = await Promise.all([
            storeGetAllBoosterCard(boosterCode),
            storeGetBoosterRarityRate(boosterCode)
        ]);

        if (!resCard.success || !resRate.success) {
            console.error("Failed to fetch booster data");
        }

        const updatedCards = await Promise.all(
            resCard.data.cards.map(async (c: BoosterCard) => {
                const imgURL = await getUnitCardImagePath(c.origin, c.cardCode, c.imageTypeNumber);
                return {
                    ...c,
                    imgURL
                };
            })
        );

        setBoosterCards(updatedCards);
        setBoosterRarities(resRate.data.items);
    }, []);

    useEffect(() => {
        setIsLoading(true);
        init().finally(() => setIsLoading(false));
    }, [init]);

    const ITEM_WIDTH = listWidth / 5;
    const rarityRenderItem: ListRenderItem<BoosterCardPercentage> = useCallback(({ item }) => {
        return (
            <View style={[{ height: '100%', width: ITEM_WIDTH }, gs.all_center, gs.p5]}>
                <View style={[gs.f1, gs.all_center]}>
                    <Text>
                        {item.cardRarityCode}
                    </Text>
                </View>
                <View style={[gs.f1, gs.all_center]}>
                    <Text>
                        {item.percentage}%
                    </Text>
                </View>
            </View>
        );
    }, [ITEM_WIDTH]);

    const ITEM_HEIGHT = listHeight / 2.7;
    const cardRenderItem: ListRenderItem<BoosterCard> = useCallback(({ item, index }) => {
        return (
            <View style={[{ height: ITEM_HEIGHT, width: '33%' }, gs.all_center, gs.p5]}>
                <CardSlotComponent index={index} imgURL={item.imgURL} footerText={item.cardRarityCode} isShow={true} />
            </View>
        );
    }, [ITEM_HEIGHT]);

    return (
        <Modal
            visible={boosterCode !== ""}
            transparent={true}
            onRequestClose={onClose}
            animationType="fade">
            <View style={[styles.overlay]}>
                <Animated.View
                    entering={SlideInDown}
                    exiting={SlideOutDown}
                    style={[gs.full_size, styles.modalView]}>
                    <View style={[gs.f05, gs.all_center, gs.header]}>
                        <Text>BOOSTER DETAIL</Text>
                    </View>
                    {isLoading &&
                        <Animated.View style={[gs.f9, gs.full_size, gs.all_center]} exiting={FadeOut}>
                            <ActivityIndicator size="large" color="#0000ff" />
                        </Animated.View>
                    }
                    {!isLoading &&
                        <Animated.View style={[gs.f9, gs.full_size, gs.all_center]} entering={FadeIn.delay(500)}>
                            <View style={[gs.f05, gs.all_center]}>
                                <Text>{boosterName}</Text>
                            </View>
                            <View style={[gs.f05, gs.all_center, gs.column]}>
                                <View style={[gs.f1, gs.all_center]}>
                                    <Text>CODE : {boosterCode}</Text>
                                </View>
                                <View style={[gs.f1, gs.all_center]}>
                                    <Text>PRICE : {price}</Text>
                                </View>
                            </View>
                            <View style={[gs.f1, gs.all_center, gs.full_size]}
                                onLayout={(e) => setListWidth(e.nativeEvent.layout.width)}>
                                {!isLoading &&
                                    <FlatList
                                        data={boosterRarities}
                                        horizontal
                                        renderItem={rarityRenderItem}
                                        keyExtractor={(item) => item.cardRarityCode}
                                        extraData={boosterRarities}
                                    />
                                }
                            </View>
                            <View style={[gs.f8, gs.all_center, gs.row, gs.border_y, gs.p5]}>
                                <View style={[gs.f1, gs.all_center]}>
                                    <Text>LIST OF CARDS</Text>
                                </View>
                                <View style={[gs.f9, gs.all_center, gs.full_size]}
                                    onLayout={(e) => setListHeight(e.nativeEvent.layout.height)}>
                                    {!isLoading && (
                                        <FlatList
                                            data={boosterCards}
                                            renderItem={cardRenderItem}
                                            numColumns={3}
                                            keyExtractor={(item) => `${item.cardCode}-${item.imageTypeNumber}`}
                                            showsHorizontalScrollIndicator={false}
                                            removeClippedSubviews={true}
                                        />
                                    )}
                                </View>
                            </View>
                        </Animated.View>
                    }
                    <Pressable style={[gs.f05, gs.all_center]} onPress={onClose} accessibilityLabel="button">
                        <ChevronDown color={'red'} />
                    </Pressable>
                </Animated.View>
            </View>
        </Modal>
    )
});

const styles = StyleSheet.create({
    modalView: {
        backgroundColor: 'white'
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)', // Dims the background
        justifyContent: 'flex-end', // Aligns content to bottom (optional)
    }
});

export default BoosterDetailModalComponent;