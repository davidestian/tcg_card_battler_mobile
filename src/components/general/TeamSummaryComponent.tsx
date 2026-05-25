import { gs } from "@/src/styles/globalStyles";
import { memo } from "react";
import { Pressable, Text, View } from "react-native";
import CardComponent from "./CardComponent";

export const TeamSummaryComponent = memo(({
    name, level, imgURL1, level1, imgURL2, level2, imgURL3, level3,
    element1_1, element1_2, element2_1, element2_2, element3_1, element3_2,
    onPress }: {
        name: string;
        level: number;
        imgURL1: string;
        level1: number;
        imgURL2: string;
        level2: number;
        imgURL3: string;
        level3: number;
        element1_1: number;
        element1_2: number;
        element2_1: number;
        element2_2: number;
        element3_1: number;
        element3_2: number;
        onPress: () => void;
    }) => {
    return (
        <Pressable style={[gs.full_size, gs.p5]} onPress={onPress}>
            <View style={[gs.full_size, gs.f1, gs.column]}>
                <View style={[gs.full_size, gs.f1, gs.all_center]}>
                    <Text>
                        lvl. {level}
                    </Text>
                </View>
                <View style={[gs.full_size, gs.f4, gs.all_center]}>
                    <Text style={gs.border_bottom}>
                        {name}
                    </Text>
                </View>
            </View>
            <View style={[gs.full_size, gs.f4, gs.column]}>
                <View style={[gs.f1, gs.full_size, gs.p5]}>
                    <CardComponent
                        imgURL={imgURL1}
                        footerText={`${level1}`}
                        elements={[element1_1, element1_2]}
                    />
                </View>
                <View style={[gs.f1, gs.full_size, gs.p5]}>
                    <CardComponent
                        imgURL={imgURL2}
                        footerText={`${level2}`}
                        elements={[element2_1, element2_2]}
                    />
                </View>
                <View style={[gs.f1, gs.full_size, gs.p5]}>
                    <CardComponent
                        imgURL={imgURL3}
                        footerText={`${level3}`}
                        elements={[element3_1, element3_2]}
                    />
                </View>
            </View>
        </Pressable>
    );
});