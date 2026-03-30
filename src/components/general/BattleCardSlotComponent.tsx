import { gs } from "@/src/styles/globalStyles";
import { CircleQuestionMarkIcon, LucideIcon } from "lucide-react-native";
import { memo, useCallback, useEffect } from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

interface props {
    index: number;
    CardIcon: LucideIcon;
    isShow: boolean;
    backGColor: string;
    onPress: (index: number) => void;
}

const BattleCardSlotComponent = memo(({ index, backGColor, CardIcon, isShow, onPress }: props) => {
    const spin = useSharedValue(0);

    useEffect(() => {
        // Duration of 400-500ms is standard for a smooth "snap" feel
        spin.value = withTiming(isShow ? 1 : 0, { duration: 400 });
    }, [isShow]);

    const frontAnimatedStyle = useAnimatedStyle(() => {
        const rotateValue = interpolate(spin.value, [0, 1], [0, 180]);
        return {
            transform: [{ perspective: 1000 }, { rotateY: `${rotateValue}deg` }],
            // backfaceVisibility: 'hidden' is critical here
            backfaceVisibility: 'hidden',
        };
    });

    const backAnimatedStyle = useAnimatedStyle(() => {
        // Back starts at 180 and rotates to 360
        const rotateValue = interpolate(spin.value, [0, 1], [180, 360]);
        return {
            transform: [{ perspective: 1000 }, { rotateY: `${rotateValue}deg` }],
            position: 'absolute', // Ensures it stays behind the front face
            backfaceVisibility: 'hidden',
        };
    });

    const handlePress = useCallback(() => {
        if (isShow) return;
        onPress(index);
    }, [onPress]);

    return (
        <Pressable style={gs.full_size} onPress={handlePress}>
            {/* Front Side */}
            <Animated.View style={[gs.full_size, gs.border_card, frontAnimatedStyle, gs.all_center]}>
                <CircleQuestionMarkIcon />
            </Animated.View>

            {/* Back Side */}
            <Animated.View style={[gs.full_size, , gs.border_card, backAnimatedStyle, gs.all_center, { backgroundColor: backGColor }]}>
                <CardIcon />
            </Animated.View>
        </Pressable>
    );
});

const styles = StyleSheet.create({
    cardBase: {
        alignItems: 'center',
        justifyContent: 'center',
    }
});

export default BattleCardSlotComponent;