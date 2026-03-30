import { gs } from "@/src/styles/globalStyles";
import { ChevronLeftCircleIcon, ChevronRightCircleIcon } from "lucide-react-native";
import { memo } from "react";
import { Pressable, Text, View } from "react-native";

interface props {
    currPage: number;
    totalPage: number;
    onPrevPress: () => void;
    onNextPress: () => void;
}

const FooterListViewComponent = memo(({ currPage, totalPage, onPrevPress, onNextPress }: props) => {
    return (

        <View style={[gs.full_size, gs.f1, gs.all_center, gs.column, gs.border_top]}>
            <Pressable style={[gs.f1, gs.full_size, gs.all_center]}
                accessibilityLabel="button"
                onPress={onPrevPress}>
                <ChevronLeftCircleIcon />
            </Pressable>
            <View style={[gs.f1, gs.full_size, gs.all_center]}>
                <Text>
                    {currPage} / {totalPage}
                </Text>
            </View>
            <Pressable style={[gs.f1, gs.full_size, gs.all_center]}
                accessibilityLabel="button"
                onPress={onNextPress}>
                <ChevronRightCircleIcon />
            </Pressable>
        </View>
    )
})

export default FooterListViewComponent;