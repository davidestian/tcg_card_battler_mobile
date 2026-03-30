import { putAccountGold } from "@/src/api/account/service";
import { gs } from "@/src/styles/globalStyles";
import { memo, useCallback, useEffect, useState } from "react";
import { FlatList, ListRenderItem, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { SlideInDown } from "react-native-reanimated";

const ResultItemComponent = memo(({ header, val }: {
    header: string;
    val: number;
}) => {
    return (
        <View style={[gs.full_size, gs.all_center, gs.column]}>
            <View style={[gs.f1]}>
            </View>
            <View style={[gs.f2, { justifyContent: 'center', alignItems: 'flex-start' }]}>
                <Text>
                    {header}
                </Text>
            </View>
            <View style={[gs.f2, { justifyContent: 'center', alignItems: 'flex-end' }]}>
                <Text>
                    {val}
                </Text>
            </View>
            <View style={[gs.f1]}>
            </View>
        </View>
    )
});

const PLAYER_COLOR = '#3B82F6';
const ENEMY_COLOR = '#dc5555';

const BattleResultModalComponent = memo(({ isWin, headers, values, dificulty, onContinue }: {
    isWin: boolean;
    headers: string[];
    values: number[];
    dificulty: number;
    onContinue: () => void;
}) => {
    const [listHeight, setListHeight] = useState<number>(0);
    const [total, setTotal] = useState<number>(0);
    const [finish, setFinish] = useState<boolean>(false);
    const [finalHeaders, setFinalHeaders] = useState<string[]>([]);
    const [finalValues, setFinalValues] = useState<number[]>([]);
    const [now, setNow] = useState<string>('');

    const ITEM_HEIGHT = listHeight / 10;
    const renderItems: ListRenderItem<string> = useCallback(({ item, index }) => {
        return (
            <Animated.View entering={SlideInDown.delay(500 * index)} style={{ height: ITEM_HEIGHT, width: '100%' }}>
                <ResultItemComponent header={item} val={finalValues[index]} />
            </Animated.View>
        )
    }, [ITEM_HEIGHT, finalValues]);

    const saveGold = useCallback(async (gold: number) => {
        await putAccountGold({ gold });
    }, []);

    useEffect(() => {
        setNow(new Date().toString());
        setFinish(false);
        setListHeight(0);

        const tempHeaders = [...headers];
        const tempValues = [...values];

        if (isWin) {
            tempHeaders.push('WIN');
            tempValues.push(10);
        }

        setFinalHeaders(tempHeaders);
        setFinalValues(tempValues);

        const calculatedTotal = tempValues.reduce((acc, curr) => acc + curr, 0);
        setTotal(calculatedTotal);

        const timer = setTimeout(() => {
            setFinish(true);
        }, 500 * (tempHeaders.length + 1));

        saveGold(calculatedTotal * dificulty);
        return () => clearTimeout(timer);

    }, [isWin, headers, values, saveGold]);

    const onContinuePress = useCallback(() => {
        setFinalHeaders([]);
        setFinalValues([]);
        setFinish(false);
        setListHeight(0);
        setTotal(0);
        onContinue();
    }, []);


    return (
        <Modal transparent animationType="slide">
            <View style={[gs.full_size, { backgroundColor: 'rgba(0,0,0,0.5)' }, gs.all_center]}>
                <View style={[styles.body, gs.border_card]}>
                    <View style={[gs.f1, gs.p5]}>
                        <View style={[gs.full_size, gs.all_center, gs.border_card, { backgroundColor: isWin ? PLAYER_COLOR : ENEMY_COLOR }]}>
                            {isWin ?
                                <Text style={{ color: 'white' }}>
                                    YOU WIN
                                </Text> :
                                <Text style={{ color: 'white' }}>
                                    YOU LOSE
                                </Text>
                            }
                        </View>
                    </View>
                    <View style={[gs.f8, gs.full_size]}
                        onLayout={(e) => setListHeight(e.nativeEvent.layout.height)}>
                        {listHeight > 0 &&
                            <View style={[gs.full_size]}>
                                <FlatList
                                    data={finalHeaders}
                                    renderItem={renderItems}
                                    keyExtractor={item => `${item}-${now}`}
                                />
                            </View>
                        }
                    </View>
                    <View style={[gs.f1, gs.full_size, gs.column, styles.border_total]}>
                        {finish &&
                            <>
                                <View style={[gs.f1, gs.all_center]}>
                                    <Text>
                                        TOTAL
                                    </Text>
                                </View>
                                <View style={[gs.f2, gs.all_center]}>
                                    <Text>
                                        {total} X {dificulty} =
                                    </Text>
                                </View>
                                <View style={[gs.f1, gs.all_center]}>
                                    <Text>
                                        {total * dificulty}
                                    </Text>
                                </View>
                            </>
                        }
                    </View>
                    <View style={[gs.f1]}>
                        {finish &&
                            <Pressable style={[gs.all_center, gs.full_size]}
                                onPress={onContinuePress}>
                                <Text style={{ color: 'red' }}>CLICK TO CONTINUE</Text>
                            </Pressable>
                        }
                    </View>
                </View>
            </View>
        </Modal >
    );
});

const styles = StyleSheet.create({
    body: {
        width: '90%',
        height: '90%',
        backgroundColor: 'white'
    },
    border_total: {
        borderBottomWidth: 2,
        borderTopWidth: 2,
        borderStyle: 'dashed'
    }
});

export default BattleResultModalComponent;