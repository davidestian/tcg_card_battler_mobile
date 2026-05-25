import { getElements, getOrigins } from "@/src/api/general/service";
import { Elements, Origins } from "@/src/api/general/type";
import { FilterPlayerUnit } from "@/src/api/inventory/type";
import { scaleMin } from "@/src/services/scalingSizeService";
import { gs } from "@/src/styles/globalStyles";
import { Picker } from '@react-native-picker/picker';
import { ArrowLeftSquareIcon } from "lucide-react-native";
import { memo, useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";

const levels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const sorts = ["DATE ASC", "DATE DESC", "LEVEL ASC", "LEVEL DESC"];

const FilterPlayerUnitPaginationModal = memo(({ visible, onClose, onApply }: {
    visible: boolean;
    onClose: () => void;
    onApply: (fil: FilterPlayerUnit) => void;
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [elements, setElements] = useState<Elements[]>([]);
    const [origins, setOrigins] = useState<Origins[]>([]);

    const [name, setName] = useState('');
    const [level, setLevel] = useState(0);
    const [lastUnitLevel, setLastUnitLevel] = useState(0);
    const [origin, setOrigin] = useState('000');
    const [element1, setElement1] = useState(0);
    const [element2, setElement2] = useState(0);
    const [sort, setSort] = useState(0);

    const onReset = useCallback(() => {
        setName('');
        setLevel(0);
        setLastUnitLevel(0);
        setOrigin('');
        setElement1(0);
        setElement2(0);
        setSort(0);
    }, []);

    const init = useCallback(async () => {
        setIsLoading(true);

        try {
            onReset();
            const [resElements, resOrigins] = await Promise.all([
                getElements(),
                getOrigins(),
            ]);

            if (!resElements.success || !resOrigins.success) return;

            resElements.data.unshift({
                id: 0,
                name: "None"
            });
            resOrigins.data.unshift({
                code: "000",
                name: "None"
            });
            setElements(resElements.data);
            setOrigins(resOrigins.data);
        }
        finally {
            setIsLoading(false);
        }
    }, [onReset]);

    function onApplyPress() {
        onApply({
            element1: element1,
            element2: element2,
            lastUnitLevel: lastUnitLevel,
            level: level,
            name: name,
            origin: origin,
            sort: sort
        });
    };

    useEffect(() => {
        setIsLoading(false);
        init();
    }, [init]);

    return (
        <Modal
            visible={visible}
            onRequestClose={onClose}
            animationType="slide">
            <View style={[gs.full_size]}>
                {isLoading &&
                    <View style={[gs.full_size, { backgroundColor: 'rgba(0,0,0,0.8)' }, gs.all_center]}>
                        <ActivityIndicator size="large" color='white' />
                    </View>
                }
                {!isLoading &&
                    <>
                        <View style={[gs.f1]}>
                            <View style={[gs.full_size, gs.header, gs.column]}>
                                <Pressable style={[gs.f1, gs.all_center]}
                                    onPress={onClose}>
                                    <ArrowLeftSquareIcon size={scaleMin(18)} color={'red'} />
                                </Pressable>
                                <View style={[gs.f2, gs.full_size, gs.all_center]}>
                                    <Text style={[gs.fontL]}>
                                        FILTER & SORT
                                    </Text>
                                </View>
                                <View style={[gs.f1]}>
                                </View>
                            </View>
                        </View>
                        <View style={[gs.f8, gs.full_size]}>
                            <ScrollView style={[{ flexGrow: 1 }, gs.p5]}>
                                <View style={[gs.f1]}>
                                    <View style={[gs.f1]}>
                                        <Text style={[gs.fontM]}>
                                            Name
                                        </Text>
                                    </View>
                                    <View style={[gs.f1, gs.border_bottom]}>
                                        <TextInput style={[gs.fontM]}
                                            placeholder="Enter name"
                                            onChangeText={(text) => { setName(text); }}
                                            returnKeyType="next"
                                            value={name}
                                        />
                                    </View>
                                </View>
                                <View style={[gs.f1, gs.full_size, { paddingTop: 10 }]}>
                                    <View style={[gs.f1]}>
                                        <Text style={[gs.fontM]}>
                                            Level
                                        </Text>
                                    </View>
                                    <View style={[gs.f1, gs.border_bottom]}>
                                        <Picker
                                            selectedValue={level}
                                            onValueChange={(itemValue, itemIndex) =>
                                                setLevel(itemValue)
                                            }>
                                            {levels.map((e, idx) => {
                                                return <Picker.Item label={e === 0 ? "None" : e.toString()} value={e} />
                                            })}
                                        </Picker>
                                    </View>
                                </View>
                                <View style={[gs.f1, gs.full_size, { paddingTop: 10 }]}>
                                    <View style={[gs.f1]}>
                                        <Text style={[gs.fontM]}>
                                            Last Unit Level
                                        </Text>
                                    </View>
                                    <View style={[gs.f1, gs.border_bottom]}>
                                        <Picker
                                            selectedValue={lastUnitLevel}
                                            onValueChange={(itemValue, itemIndex) =>
                                                setLastUnitLevel(itemValue)
                                            }>
                                            {levels.map((e, idx) => {
                                                return <Picker.Item label={e === 0 ? "None" : e.toString()} value={e} />
                                            })}
                                        </Picker>
                                    </View>
                                </View>
                                <View style={[gs.f1, gs.full_size, { paddingTop: 10 }]}>
                                    <View style={[gs.f1]}>
                                        <Text style={[gs.fontM]}>
                                            Origins
                                        </Text>
                                    </View>
                                    <View style={[gs.f1, gs.border_bottom]}>
                                        <Picker
                                            selectedValue={origin}
                                            onValueChange={(itemValue, itemIndex) =>
                                                setOrigin(itemValue)
                                            }>
                                            {origins.map((e, idx) => {
                                                return <Picker.Item label={e.name} value={e.code} />
                                            })}
                                        </Picker>
                                    </View>
                                </View>
                                <View style={[gs.f1, gs.full_size, { paddingTop: 10 }]}>
                                    <View style={[gs.f1]}>
                                        <Text style={[gs.fontM]}>
                                            Element 1
                                        </Text>
                                    </View>
                                    <View style={[gs.f1, gs.border_bottom]}>
                                        <Picker
                                            selectedValue={element1}
                                            onValueChange={(itemValue, itemIndex) =>
                                                setElement1(itemValue)
                                            }>
                                            {elements.map((e, idx) => {
                                                return <Picker.Item label={e.name} value={e.id} />
                                            })}
                                        </Picker>
                                    </View>
                                </View>
                                <View style={[gs.f1, gs.full_size, { paddingTop: 10 }]}>
                                    <View style={[gs.f1]}>
                                        <Text style={[gs.fontM]}>
                                            Element 2
                                        </Text>
                                    </View>
                                    <View style={[gs.f1, gs.border_bottom]}>
                                        <Picker
                                            selectedValue={element2}
                                            onValueChange={(itemValue, itemIndex) =>
                                                setElement2(itemValue)
                                            }>
                                            {elements.map((e, idx) => {
                                                return <Picker.Item label={e.name} value={e.id} />
                                            })}
                                        </Picker>
                                    </View>
                                </View>
                                <View style={[gs.f1, gs.full_size, { paddingTop: 10 }]}>
                                    <View style={[gs.f1]}>
                                        <Text style={[gs.fontM]}>
                                            Sort
                                        </Text>
                                    </View>
                                    <View style={[gs.f1, gs.border_bottom]}>
                                        <Picker
                                            selectedValue={sort}
                                            onValueChange={(itemValue, itemIndex) =>
                                                setSort(itemValue)
                                            }>
                                            {sorts.map((e, idx) => {
                                                return <Picker.Item label={e} value={idx} />
                                            })}
                                        </Picker>
                                    </View>
                                </View>
                            </ScrollView>
                        </View>
                        <View style={[gs.f1, gs.p5, gs.column]}>
                            <Pressable
                                style={[gs.f1, gs.all_center, gs.border_card, gs.full_size]}
                                accessibilityLabel="button"
                                onPress={onReset}>
                                <Text style={[gs.fontM]}>
                                    RESET
                                </Text>
                            </Pressable>
                            <Pressable
                                style={[gs.f2, gs.all_center, gs.border_card, gs.full_size, { backgroundColor: 'red' }]}
                                accessibilityLabel="button"
                                onPress={onApplyPress}>
                                <Text style={[gs.fontM, { color: 'white' }]}>
                                    APPLY
                                </Text>
                            </Pressable>
                        </View>
                    </>
                }
            </View>
        </Modal>
    );
});

export default FilterPlayerUnitPaginationModal;