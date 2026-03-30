import { invGetPlayerUnitCardByUnitCode } from "@/src/api/inventory/service";
import { getUnitCardImagePath } from "@/src/services/generalService";
import { gs } from "@/src/styles/globalStyles";
import { Image } from "expo-image";
import { ArrowLeftSquareIcon, ArrowRightSquareIcon, CheckSquare2, ChevronDownIcon, XSquare } from "lucide-react-native";
import { memo, useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeOut, FlipInXUp, FlipOutXDown } from "react-native-reanimated";

interface props {
    unitCode: string;
    unitName: string;
    origin: string;
    imageTypeNumber: number;
    imageTypeCount: number;
    onChangeBack: () => void;
    onChangeImage: (imageTypeNumber: number) => void;
}

const UnitMenuModalChangeImageCompnent = memo(({ unitCode, unitName, origin, imageTypeNumber, imageTypeCount, onChangeBack, onChangeImage }: props) => {
    const [isLoading, setIsLoading] = useState(true);
    const [imgURLs, setIMGURLs] = useState<string[]>([]);
    const [playerCardQty, setPlayerCardQty] = useState<number[]>([]);
    const [currIndex, setCurrIndex] = useState(imageTypeNumber);

    const init = useCallback(async () => {
        const res = await invGetPlayerUnitCardByUnitCode(unitCode);
        if (!res?.success) return;

        const indexes = Array.from({ length: imageTypeCount }, (_, i) => i);

        // 1. Map QTYs first to keep logic clean
        const qtys = indexes.map(i => {
            const card = res.data.find(q => q.imageTypeNumber === i);
            return card?.qty ?? 0;
        });

        // 2. Fetch URLs in parallel
        const urls = await Promise.all(
            indexes.map(i => getUnitCardImagePath(origin, unitCode, i))
        );

        setPlayerCardQty(qtys);
        setIMGURLs(urls);
    }, [origin, unitCode, imageTypeCount]);

    useEffect(() => {
        setIsLoading(true);
        init().finally(() => setIsLoading(false));
    }, []);

    const onPressNext = useCallback(() => {
        setCurrIndex((prev) => {
            if (prev + 1 === imageTypeCount) return 0;
            else return prev + 1;
        })
    }, [imageTypeCount])

    const onPressPrev = useCallback(() => {
        setCurrIndex((prev) => {
            if (prev - 1 === -1) return imageTypeCount - 1;
            else return prev - 1;
        })
    }, [imageTypeCount])

    const onPressSet = useCallback(() => {
        if (playerCardQty[currIndex] <= 0) console.log('gagal');
        onChangeImage(currIndex);
    }, [onChangeImage, currIndex, playerCardQty]);

    return (
        <Modal onRequestClose={onChangeBack}
            transparent={true}>
            <View style={[gs.overlay]}>
                <Animated.View style={[styles.modalView]} entering={FlipInXUp} exiting={FlipOutXDown}>
                    <View style={[gs.full_size, gs.row]}>
                        <View style={[gs.f1, gs.all_center, styles.header]}>
                            <Text>CHANGE UNIT IMAGE</Text>
                        </View>
                        {isLoading &&
                            <Animated.View exiting={FadeOut} style={[gs.full_size, gs.f9, gs.all_center]}>
                                <ActivityIndicator size="large" color="#0000ff" />
                            </Animated.View>
                        }
                        {!isLoading &&
                            <View style={[gs.f9, gs.full_size, gs.row, gs.p5]}>
                                <View style={[gs.f05, gs.all_center]}>
                                    <Text>{unitName}</Text>
                                </View>
                                <View style={[gs.f05, gs.column]}>
                                    <View style={[gs.f2, gs.all_center]}>
                                        <Text>{unitCode}</Text>
                                    </View>
                                    <View style={[gs.f1, gs.all_center, gs.border_x]}>
                                        <Text>{String(currIndex).padStart(2, '0')} / {String(imageTypeCount - 1).padStart(2, '0')}</Text>
                                    </View>
                                    <View style={[gs.f2, gs.all_center]}>
                                        <Text>QTY : {playerCardQty[currIndex]}</Text>
                                    </View>
                                </View>
                                <View style={[gs.f8, gs.all_center, gs.p5]}>
                                    <Image
                                        source={imgURLs[currIndex]}
                                        contentFit="fill"
                                        style={[gs.full_size, gs.border_card]}
                                    />
                                </View>
                                <View style={[gs.f1, gs.column]}>
                                    <Pressable style={[gs.all_center, gs.f1]}
                                        onPress={onPressNext}>
                                        <ArrowLeftSquareIcon />
                                    </Pressable>
                                    {currIndex === imageTypeNumber ?
                                        <View style={[gs.f1, gs.all_center]}>
                                            <Text>CURRENT</Text>
                                        </View> :
                                        playerCardQty[currIndex] > 0 ?
                                            <Pressable style={[gs.all_center, gs.f1]}
                                                onPress={onPressSet}>
                                                <CheckSquare2 color={'rgb(67, 255, 34)'} />
                                            </Pressable> :
                                            <View style={[gs.all_center, gs.f1]}>
                                                <XSquare color='red' />
                                            </View>
                                    }
                                    <Pressable style={[gs.all_center, gs.f1]}
                                        onPress={onPressPrev}>
                                        <ArrowRightSquareIcon />
                                    </Pressable>
                                </View>
                            </View>
                        }
                        <Pressable style={[gs.f05, gs.all_center, gs.full_size, styles.footer]}
                            onPress={onChangeBack}>
                            <ChevronDownIcon color={'red'} />
                        </Pressable>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
});

const styles = StyleSheet.create({
    modalView: {
        width: '90%',
        height: '90%',
        backgroundColor: 'white',
        borderRadius: 20,
        borderWidth: 2
    },
    header: {
        backgroundColor: 'rgb(191, 191, 191)',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
    },
    footer: {
        borderTopWidth: 1
    }
});

export default UnitMenuModalChangeImageCompnent;