import { invGetPlayerUnitCardByUnitCode, invPostPlayerUnitLevelChangeImage } from "@/src/api/inventory/service";
import { InvPostPlayerUnitLevelChangeImageRQ } from "@/src/api/inventory/type";
import GeneralHeaderBarComponent from "@/src/components/general/GeneralHeaderBarComponent";
import LoadingModalComponent from "@/src/components/general/LoadingModalComponent";
import UnitChangeImageAnimationComponent from "@/src/components/mainMenu/inventoryMenu/unitMenu/modal/UnitChangeImageAnimationComponent";
import { getUnitCardImagePath } from "@/src/services/generalService";
import { gs } from "@/src/styles/globalStyles";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeftSquareIcon, ArrowRightSquareIcon, CheckSquare2, XSquare } from "lucide-react-native";
import { memo, useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";


const UnitChangeImageScreen = memo(() => {
    const { playerUnitIdP, unitCodeP, unitNameP, originP, imageTypeNumberP, imageTypeCountP, levelP } = useLocalSearchParams();
    const playerUnitId = Array.isArray(playerUnitIdP) ? playerUnitIdP[0] : playerUnitIdP;
    const unitCode = Array.isArray(unitCodeP) ? unitCodeP[0] : unitCodeP;
    const unitName = Array.isArray(unitNameP) ? unitNameP[0] : unitNameP;
    const origin = Array.isArray(originP) ? originP[0] : originP;
    const imageTypeNumber = Number(Array.isArray(imageTypeNumberP) ? imageTypeNumberP[0] : imageTypeNumberP);
    const imageTypeCount = Number(Array.isArray(imageTypeCountP) ? imageTypeCountP[0] : imageTypeCountP);
    const level = Number(Array.isArray(levelP) ? levelP[0] : levelP);

    const [isLoading, setIsLoading] = useState(true);
    const [imgURLs, setIMGURLs] = useState<string[]>([]);
    const [playerCardQty, setPlayerCardQty] = useState<number[]>([]);
    const [currIndex, setCurrIndex] = useState(imageTypeNumber);
    const [playAnimation, setPlayAnimation] = useState(false);

    const init = useCallback(async () => {
        try {
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

        } finally {
            setIsLoading(false);
        }
    }, [origin, unitCode, imageTypeCount]);

    useEffect(() => {
        setIsLoading(true);
        setPlayAnimation(false);
        init();
    }, [unitCode]);

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
    }, [imageTypeCount]);

    const onChangeImage = useCallback(async (itn: number) => {
        setIsLoading(true);
        try {
            let rq: InvPostPlayerUnitLevelChangeImageRQ = {
                imageTypeNumber: itn,
                playerUnitID: playerUnitId,
                targetLevel: level,
                unitCode: unitCode,
            }

            const res = await invPostPlayerUnitLevelChangeImage(rq);
            if (!res.success) { return; }

            setPlayAnimation(true);
        } catch (error) {
            console.error("Level up failed:", error);
        } finally {
            setIsLoading(false);
        }
    }, [playerUnitId, level, unitCode]);

    const onDone = useCallback(() => {
        setPlayAnimation(false);
        router.back();
    }, [])

    const onPressSet = useCallback(() => {
        if (playerCardQty[currIndex] <= 0) return;
        onChangeImage(currIndex);
    }, [onChangeImage, currIndex, playerCardQty]);

    return (
        <View style={[gs.full_size]}>
            <View style={[gs.full_size, gs.row]}>
                <View style={[gs.f1]}>
                    <GeneralHeaderBarComponent title="CHANGE IMAGE"></GeneralHeaderBarComponent>
                </View>
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
            </View>
            {playAnimation &&
                <UnitChangeImageAnimationComponent
                    prevImgURI={imgURLs[imageTypeNumber]}
                    nextImgURI={imgURLs[currIndex]}
                    onDone={onDone} />
            }

            <LoadingModalComponent visible={isLoading}></LoadingModalComponent>
        </View>
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

export default UnitChangeImageScreen;