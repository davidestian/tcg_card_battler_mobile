import { invGetPlayerUnits } from "@/src/api/inventory/service";
import { PlayerUnit } from "@/src/api/inventory/type";
import { PostPlayerTeam } from "@/src/api/team/service";
import CardComponent from "@/src/components/general/CardComponent";
import FooterListViewComponent from "@/src/components/general/FooterListViewComponent";
import LoadingModalComponent from "@/src/components/general/LoadingModalComponent";
import MessageModalComponent from "@/src/components/general/MessageModalComponent";
import { getUnitCardImagePath } from "@/src/services/generalService";
import { gs } from "@/src/styles/globalStyles";
import { router } from "expo-router";
import { ArrowLeftIcon, EditIcon } from "lucide-react-native";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { FlatList, ListRenderItem, Pressable, Text, TextInput, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

const PlayerUnitSlot = memo(({ imgURL, level, isSelected, index, element1, element2, onPress }: {
    imgURL: string;
    index: number;
    level: number;
    element1: number;
    element2: number;
    isSelected: boolean;
    onPress: (index: number) => void;
}) => {
    const handlePress = () => {
        onPress(index);
    }

    return (
        <Pressable style={[gs.f1, gs.all_center, gs.full_size, gs.p5, isSelected ? gs.available : {}, { borderRadius: 10 }]}
            onPress={handlePress}
            accessibilityLabel="button">
            <CardComponent
                imgURL={imgURL}
                footerText={level === 0 ? '' : `lvl. ${level}`}
                elements={[element1, element2]}
            />
        </Pressable>
    );
});

const UnitCard = memo(({ imgURL, playerUnitID, level, h, element1, element2, onCardPress }: {
    imgURL: string;
    playerUnitID: string;
    level: number;
    element1: number;
    element2: number;
    h: number;
    onCardPress: (playerUnitID: string) => void
}) => {
    const handlePress = () => {
        onCardPress(playerUnitID);
    }

    return (
        <Pressable style={[{ width: '20%', height: h }, gs.p5]}
            onPress={handlePress}
            accessibilityLabel="button">
            <CardComponent
                imgURL={imgURL}
                footerText={`lvl. ${level}`}
                elements={[element1, element2]}
            />
        </Pressable>
    )
});

const TeamMenuScreenIndex = memo(() => {
    const [isLoading, setIsLoading] = useState(true);
    const [currPage, setCurrPage] = useState(1);
    const [totalPage, setTotalPage] = useState(0);
    const [message, setMessage] = useState('');
    const [listHeight, setListHeight] = useState(0);
    const teamNameRef = useRef('');
    const [playerUnits, setPlayerUnits] = useState<PlayerUnit[]>([{
        imageTypeNumber: 0,
        imgURL: '',
        level: 0,
        origin: '',
        playerUnitID: '',
        unitCode: '',
        elementID1: 0,
        elementID2: 0,
    },
    {
        imageTypeNumber: 0,
        imgURL: '',
        level: 0,
        origin: '',
        playerUnitID: '',
        unitCode: '',
        elementID1: 0,
        elementID2: 0,
    },
    {
        imageTypeNumber: 0,
        imgURL: '',
        level: 0,
        origin: '',
        playerUnitID: '',
        unitCode: '',
        elementID1: 0,
        elementID2: 0,
    }]);

    const [selectedSlotIndex, setSelectedSlotIndex] = useState(0);
    const selectedSlotIndexRef = useRef(0);

    const [units, setUnits] = useState<PlayerUnit[]>([]);
    const unitsRef = useRef<PlayerUnit[]>([]);
    const fetchData = useCallback(async (page: number) => {
        setIsLoading(true);
        try {
            const res = await invGetPlayerUnits(20, page);
            if (!res.success) {
                setMessage(res.message);
                return;
            }

            const updatedList = await Promise.all(res.data.units.map(async (unit) => {
                return {
                    ...unit,
                    imgURL: await getUnitCardImagePath(unit.origin, unit.unitCode, unit.imageTypeNumber)
                }
            }));

            setUnits(updatedList);
            unitsRef.current = updatedList;
            setTotalPage(res.data.totalPage);
        }
        finally {
            setTimeout(() => {
                setIsLoading(false);
            }, 500);
        }

    }, []);

    const onMessageModalClose = useCallback(() => {
        setMessage('');
    }, []);

    useEffect(() => {
        fetchData(currPage)
    }, [currPage]);

    const onNextPress = () => {
        if (isLoading) return;

        setCurrPage((prev) => Math.min(prev + 1, totalPage));
    };

    const onPrevPress = () => {
        if (isLoading) return;

        setCurrPage((prev) => Math.max(prev - 1, 1));
    };

    const onBackPress = useCallback(() => {
        router.dismiss();
    }, []);

    const onSlotPress = useCallback((index: number) => {
        setSelectedSlotIndex(index);
        selectedSlotIndexRef.current = index;
    }, []);

    const onCardPress = useCallback((playerUnitID: string) => {
        const unit = unitsRef.current.find(q => q.playerUnitID === playerUnitID);
        if (unit === undefined) return;

        setPlayerUnits((prev) => {
            return prev.map((u, index): PlayerUnit => {
                if (index !== selectedSlotIndexRef.current && u.playerUnitID === playerUnitID) {
                    return {
                        imageTypeNumber: 0,
                        imgURL: '',
                        level: 0,
                        origin: '',
                        playerUnitID: '',
                        unitCode: '',
                        elementID1: 0,
                        elementID2: 0,
                    };
                }
                else if (index === selectedSlotIndexRef.current) {
                    return u.playerUnitID !== playerUnitID ?
                        {
                            ...unit
                        } :
                        {
                            imageTypeNumber: 0,
                            imgURL: '',
                            level: 0,
                            origin: '',
                            playerUnitID: '',
                            unitCode: '',
                            elementID1: 0,
                            elementID2: 0,
                        };
                }
                return u;
            });
        });
    }, []);

    const ITEM_HEIGHT = listHeight / 4;
    const renderItem: ListRenderItem<PlayerUnit> = useCallback(({ item }) => {
        return (
            <UnitCard
                imgURL={item.imgURL}
                h={ITEM_HEIGHT}
                playerUnitID={item.playerUnitID}
                level={item.level}
                element1={item.elementID1}
                element2={item.elementID2}
                onCardPress={onCardPress}
            />
        );
    }, [ITEM_HEIGHT, onCardPress]);

    const onResetPress = useCallback(() => {
        setPlayerUnits((prev) => {
            return prev.map(u => {
                return {
                    imageTypeNumber: 0,
                    imgURL: '',
                    level: 0,
                    origin: '',
                    playerUnitID: '',
                    unitCode: '',
                    elementID1: 0,
                    elementID2: 0,
                }
            })
        });
    }, []);

    const onSubmitPress = async () => {
        setIsLoading(true);
        try {
            if (teamNameRef.current.length > 10) {
                setMessage('Team name max 10 length');
                return;
            }
            if (playerUnits[0].playerUnitID === '' || playerUnits[1].playerUnitID === '' || playerUnits[2].playerUnitID === '') {
                setMessage('Must select 3 units');
                return;
            }

            const res = await PostPlayerTeam({
                teamName: teamNameRef.current,
                playerUnitID1: playerUnits[0].playerUnitID,
                playerUnitID2: playerUnits[1].playerUnitID,
                playerUnitID3: playerUnits[2].playerUnitID,
            });

            if (!res.success) {
                setMessage(res.message);
                return;
            }

            onBackPress();
        }
        finally {
            setTimeout(() => {
                setIsLoading(false);
            }, 1000);
        }
    };

    return (
        <Animated.View entering={FadeIn.delay(500)} style={[gs.full_size, gs.all_center, gs.row]}>
            <View style={[gs.f1, gs.column, gs.header, gs.full_size]}>
                <Pressable style={[gs.f1, gs.all_center, gs.full_size]}
                    onPress={onBackPress}
                    accessibilityLabel="button">
                    <ArrowLeftIcon />
                </Pressable>
                <View style={[gs.f2, gs.all_center, gs.full_size]}>
                    <Text> CREATE TEAM</Text>
                </View>
                <View style={[gs.f1, gs.all_center, gs.full_size]}>
                </View>
            </View>
            <View style={[gs.f4, gs.p5, gs.all_center]}>
                <View style={[gs.f2, gs.all_center, gs.column]}>
                    <View style={[gs.f2, gs.all_center]}>
                        <EditIcon />
                    </View>
                    <View style={[gs.f8, gs.all_center, gs.full_size]}>
                        <TextInput style={[gs.full_size, gs.all_center]}
                            placeholder="Team Name..."
                            onChangeText={(q) => { teamNameRef.current = q; }}
                            returnKeyType="next"></TextInput>
                    </View>
                </View>
                <View style={[gs.f5, gs.all_center, gs.full_size, gs.column, gs.p5]}>
                    <PlayerUnitSlot index={0}
                        isSelected={selectedSlotIndex == 0}
                        imgURL={playerUnits[0].imgURL}
                        level={playerUnits[0].level}
                        element1={playerUnits[0].elementID1}
                        element2={playerUnits[0].elementID2}
                        onPress={onSlotPress} />
                    <PlayerUnitSlot index={1}
                        isSelected={selectedSlotIndex == 1}
                        imgURL={playerUnits[1].imgURL}
                        level={playerUnits[1].level}
                        element1={playerUnits[1].elementID1}
                        element2={playerUnits[1].elementID2}
                        onPress={onSlotPress} />
                    <PlayerUnitSlot index={2}
                        isSelected={selectedSlotIndex == 2}
                        imgURL={playerUnits[2].imgURL}
                        level={playerUnits[2].level}
                        element1={playerUnits[2].elementID1}
                        element2={playerUnits[2].elementID2}
                        onPress={onSlotPress} />
                </View>
                <View style={[gs.f1, gs.column]}>
                    <View style={[gs.f2, gs.px5]}>
                        <Pressable style={[gs.f2, gs.all_center, gs.border_card]}
                            onPress={onResetPress}
                            accessibilityLabel="button">
                            <Text>RESET</Text>
                        </Pressable>
                    </View>
                    <View style={[gs.f2]}>
                        <Pressable style={[gs.f2, gs.all_center, gs.border_card]}
                            onPress={onSubmitPress}
                            accessibilityLabel="button">
                            <Text>CREATE</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
            <View style={[gs.f5, gs.all_center, gs.p5, gs.full_size, gs.border_top]}>
                <View style={[gs.full_size]}
                    onLayout={(e) => setListHeight(e.nativeEvent.layout.height)}>
                    {listHeight > 0 &&
                        <FlatList
                            data={units}
                            renderItem={renderItem}
                            numColumns={5}
                            keyExtractor={(item) => item.playerUnitID}>
                        </FlatList>
                    }
                </View>
            </View>
            <View style={[gs.f05, gs.all_center]}>
                <FooterListViewComponent
                    currPage={currPage}
                    totalPage={totalPage}
                    onNextPress={onNextPress}
                    onPrevPress={onPrevPress} />
            </View>
            <MessageModalComponent message={message} onClose={onMessageModalClose} />
            {isLoading && <LoadingModalComponent />}
        </Animated.View>)
});

export default TeamMenuScreenIndex;