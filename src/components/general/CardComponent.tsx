import { gs } from "@/src/styles/globalStyles";
import { Image } from "expo-image";
import { CircleQuestionMarkIcon } from "lucide-react-native";
import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { GBox } from "./GBoxComponent";

interface props {
    imgURL?: string;
    footerText: string;
    elements: number[];
}

const CardComponent = memo(({ imgURL = '', footerText = '', elements }: props) => {
    return (
        <GBox elements={[elements[0], elements.length > 1 ? elements[1] : elements[0]]} style={[gs.full_size, gs.p5, gs.radius, gs.all_center]}>
            {imgURL === '' &&
                <View style={[styles.card, gs.border_card]}>
                    <CircleQuestionMarkIcon />
                </View>
            }
            {imgURL !== '' &&
                <View style={[styles.card]}>
                    <Image
                        source={imgURL}
                        contentFit="fill"
                        style={[gs.full_size, gs.border_card]}
                    />
                    {footerText !== '' &&
                        <View style={styles.bottomBanner}>
                            <Text style={[gs.fontM, styles.textOnlyBackground]}>
                                {footerText}
                            </Text>
                        </View>
                    }
                </View>
            }
        </GBox>
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

export default CardComponent;