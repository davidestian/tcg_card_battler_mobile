import { gs } from "@/src/styles/globalStyles";
import { Image } from "expo-image";
import { CircleQuestionMarkIcon } from "lucide-react-native";
import { memo, useCallback, useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

interface props {
    index: number;
    imgURL?: string;
    backURL?: string;
    backText?: string;
    footerText?: string;
    isShow: boolean;
    isOneTime?: boolean
    onPress?: (index: number) => void;
}

const CardSlotComponent = memo(({ index, imgURL = '', footerText = '', isShow, isOneTime = false, backURL = '', backText = '', onPress }: props) => {
    const spin = useSharedValue(0);
    const hasFlipped = useSharedValue(false);

    useEffect(() => {
        if (isOneTime && hasFlipped.value) return;

        const nextValue = isShow ? 1 : 0;

        spin.value = withTiming(nextValue, { duration: 400 });
        if (nextValue === 1) {
            hasFlipped.value = true;
        }
    }, [isShow, isOneTime]);

    const frontAnimatedStyle = useAnimatedStyle(() => {
        const rotateValue = interpolate(spin.value, [0, 1], [0, 180]);
        return {
            transform: [
                { perspective: 1000 },
                { rotateY: `${rotateValue}deg` }
            ],
            zIndex: spin.value < 0.5 ? 1 : 0, // Fix for iOS 2026 layering issues
        };
    });

    const backAnimatedStyle = useAnimatedStyle(() => {
        const rotateValue = interpolate(spin.value, [0, 1], [180, 360]);
        return {
            transform: [
                { perspective: 1000 },
                { rotateY: `${rotateValue}deg` }
            ],
            zIndex: spin.value >= 0.5 ? 1 : 0,
        };
    });

    const onPressClick = useCallback(() => {
        if (onPress === undefined || (isOneTime && hasFlipped.value)) return;

        onPress(index);
    }, [onPress]);

    return (
        <Pressable style={[gs.full_size]} accessibilityLabel="button"
            onPress={onPressClick}>
            {/* Front Side */}
            <Animated.View style={[styles.card, frontAnimatedStyle]}>
                {backURL === '' ?
                    <CircleQuestionMarkIcon /> :
                    <Image
                        source={backURL}
                        contentFit="fill"
                        style={[gs.full_size, gs.border_card]}
                    />
                }
                {backText !== '' &&
                    <View style={styles.bottomBanner}>
                        <Text style={[styles.textOnlyBackground, gs.fontS]}>
                            {backText}
                        </Text>
                    </View>
                }
            </Animated.View>

            {/* Back Side */}
            <Animated.View style={[styles.card, backAnimatedStyle]}>
                {imgURL === '' ?
                    <CircleQuestionMarkIcon /> :
                    <Image
                        source={imgURL}
                        contentFit="fill"
                        style={[gs.full_size, gs.border_card]}
                    />
                }
                {footerText !== '' &&
                    <View style={styles.bottomBanner}>
                        <Text style={[styles.textOnlyBackground, gs.fontS]}>
                            {footerText}
                        </Text>
                    </View>
                }
            </Animated.View>
        </Pressable>
    )
});

const styles = StyleSheet.create({
    bottomBanner: {
        paddingVertical: 5,
        position: 'absolute', // This positions the view relative to the cardContainer
        bottom: 0,            // Anchors it to the bottom edge
        width: '100%',        // Makes it span the full width
        alignItems: 'center', // Centers text horizontally
        justifyContent: 'center',
        textAlign: 'center'
    },
    textOnlyBackground: {
        // 1. This is the key: it makes the background only as wide as the text
        width: '60%',

        // 2. Styling
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: 4, // Rounded background for the text
        overflow: 'hidden', // Required for borderRadius to show on iOS Text
        color: 'white',
        alignItems: 'center', // Centers text horizontally
        justifyContent: 'center',
        textAlign: 'center'
    },
    card: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        backfaceVisibility: 'hidden',
    }
})

export default CardSlotComponent;