import { gs } from "@/src/styles/globalStyles";
import { Image } from "expo-image";
import { X } from "lucide-react-native";
import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface props {
    playerUnitID: string;
    imageUrl: string;
    level: number;
    onPressSlot: (playerUnitCode: string, unitLevel: number) => void;
}

const UnitMenuSlotComponent = memo(({ playerUnitID, imageUrl, level, onPressSlot }: props) => {
    const onPress = () => {
        onPressSlot(playerUnitID, level);
    }
    return (
        <View style={[gs.full_size, gs.p5]}>
            {imageUrl !== '' &&
                <Pressable style={gs.full_size} onPress={onPress} >
                    <Image
                        source={imageUrl}
                        contentFit="fill"
                        style={[gs.full_size, gs.border_card, gs.all_center]}
                    />

                    <View style={styles.bottomBanner}>
                        <Text style={[styles.textOnlyBackground, gs.fontS]}>
                            {level}
                        </Text>
                    </View>
                </Pressable>
            }
            {
                imageUrl === '' &&
                <View style={[gs.full_size, gs.border_card, gs.all_center]}>
                    <X />
                </View>
            }
        </View>
    );
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
        width: '80%',

        // 2. Styling
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: 4, // Rounded background for the text
        overflow: 'hidden', // Required for borderRadius to show on iOS Text
        color: 'white',
        alignItems: 'center', // Centers text horizontally
        justifyContent: 'center',
        textAlign: 'center'
    }
});

export default UnitMenuSlotComponent;