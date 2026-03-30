import { gs } from "@/src/styles/globalStyles";
import { Image } from "expo-image";
import { memo, useEffect } from "react";
import { Modal, StyleSheet, View } from "react-native";
import Animated, { Easing, interpolate, SlideInDown, SlideOutDown, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from "react-native-worklets";

const BattleEvolveModalComponent = memo(({ prevURI, nextURI, onClose }: {
    prevURI: string;
    nextURI: string;
    onClose: () => void;
}) => {
    const spin = useSharedValue(0);

    useEffect(() => {
        setTimeout(() => {
            spin.value = withTiming(7.5, {
                duration: 3000,
                easing: Easing.bezier(0.4, 0, 0.2, 1), // Smooth start/stop,

            }, (finished) => {
                if (finished) {
                    setTimeout(() => {
                        scheduleOnRN(onClose);
                    }, 500);
                }
            });
        }, 500);
    }, []);

    const frontAnimatedStyle = useAnimatedStyle(() => {
        // Map 0-1 to a full 0-360 degree circle
        const rotateValue = interpolate(spin.value, [0, 1], [0, 360]);
        return {
            transform: [{ perspective: 1000 }, { rotateY: `${rotateValue}deg` }],
            backfaceVisibility: 'hidden',
        };
    });

    const backAnimatedStyle = useAnimatedStyle(() => {
        // Back side starts offset by 180 degrees
        const rotateValue = interpolate(spin.value, [0, 1], [180, 540]);
        return {
            transform: [{ perspective: 1000 }, { rotateY: `${rotateValue}deg` }],
            position: 'absolute',
            backfaceVisibility: 'hidden',
        };
    });

    return (
        <Modal transparent>
            <View style={[gs.full_size]}>
                <Animated.View entering={SlideInDown} exiting={SlideOutDown.delay(500)} style={[gs.full_size, { backgroundColor: 'rgba(0,0,0,0.5)' }, gs.all_center]}>
                    <View style={[styles.body]}>
                        <View style={[gs.f9, gs.full_size, gs.p10, gs.all_center]}>
                            {/* Front Side */}
                            <Animated.View style={[gs.full_size, frontAnimatedStyle]}>
                                <Image source={prevURI} style={[gs.border_card, gs.full_size]}>

                                </Image>
                            </Animated.View>

                            {/* Back Side */}
                            <Animated.View style={[gs.full_size, backAnimatedStyle, gs.all_center]}>
                                <Image source={nextURI} style={[gs.border_card, gs.full_size]}>

                                </Image>
                            </Animated.View>
                        </View>
                    </View>
                </Animated.View>
            </View>
        </Modal >
    )
});

const styles = StyleSheet.create({
    body: {
        height: '80%',
        width: '90%'
    }
})
export default BattleEvolveModalComponent;