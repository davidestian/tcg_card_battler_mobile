import { scaleMin } from "@/src/services/scalingSizeService";
import { gs } from "@/src/styles/globalStyles";
import { router } from "expo-router";
import { ArrowLeftSquareIcon, LucideIcon } from "lucide-react-native";
import { memo, useCallback } from "react";
import { Pressable, Text, View } from "react-native";

const GeneralHeaderBarComponent = memo(({ title, RightIcon, color, iconPress }: {
    title: string;
    RightIcon?: LucideIcon;
    color?: string;
    iconPress?: () => void;
}) => {
    const onBackPress = useCallback(() => {
        router.back();
    }, [])
    return (
        <View style={[gs.full_size, gs.header, gs.column]}>
            <Pressable style={[gs.f1, gs.all_center]}
                onPress={onBackPress}>
                <ArrowLeftSquareIcon size={scaleMin(18)} color={'red'} />
            </Pressable>
            <View style={[gs.f2, gs.full_size, gs.all_center]}>
                <Text style={[gs.fontL]}>
                    {title}
                </Text>
            </View>
            <Pressable style={[gs.f1, gs.all_center]} onPress={iconPress}>
                {RightIcon &&
                    <RightIcon size={scaleMin(18)} color={color} />
                }
            </Pressable>
        </View>
    )
});

export default GeneralHeaderBarComponent;