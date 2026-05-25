import { gs } from "@/src/styles/globalStyles";
import { Image } from "expo-image";
import { memo, useEffect, useState } from "react";
import { Modal, StyleSheet } from "react-native";
import Animated, { BounceIn, BounceOut, FadeIn, FadeOut } from "react-native-reanimated";

const UnitChangeImageAnimationComponent = memo(({ prevImgURI, nextImgURI, onDone }: {
    prevImgURI: string;
    nextImgURI: string;
    onDone: () => void;
}) => {
    const [isShow, setIsShow] = useState(false);
    useEffect(() => {
        setIsShow(false);
        setTimeout(() => {
            setIsShow(true);
            setTimeout(() => {
                onDone();
            }, 1500);
        }, 1000);
    }, []);

    return (
        <Modal transparent
            animationType="fade">
            <Animated.View
                exiting={FadeOut}
                entering={FadeIn}
                style={[gs.full_size, gs.all_center, {
                    backgroundColor: 'white'
                }]}>
                {!isShow &&
                    <Animated.View style={[styles.body]}
                        exiting={BounceOut}>
                        <Image style={[gs.full_size, gs.border_card]}
                            contentFit="fill"
                            source={prevImgURI}>
                        </Image>
                    </Animated.View>
                }
                {isShow &&
                    <Animated.View style={[styles.body]}
                        entering={BounceIn}>
                        <Image style={[gs.full_size, gs.border_card]}
                            contentFit="fill"
                            source={nextImgURI}>
                        </Image>
                    </Animated.View>
                }
            </Animated.View>
        </Modal>

    )
});

const styles = StyleSheet.create({
    body: {
        height: '80%',
        width: '90%'
    }
})

export default UnitChangeImageAnimationComponent;