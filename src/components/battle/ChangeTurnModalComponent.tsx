import { PlayerColor } from "@/src/enums/colorEnum";
import { gs } from "@/src/styles/globalStyles";
import { memo } from "react";
import { Modal, Text, View } from "react-native";
import Animated, { LightSpeedInRight, LightSpeedOutLeft } from "react-native-reanimated";

interface props {
    message: string;
    playerNumber: number
}

const ChangeTurnModalComponent = memo(({ message, playerNumber }: props) => {
    return (
        <Modal
            transparent
            visible={message !== ''}>
            <View style={[gs.full_size, gs.all_center]}>
                <Animated.View
                    entering={LightSpeedInRight}
                    exiting={LightSpeedOutLeft}
                    style={[gs.all_center,
                    { width: '100%', height: '10%', backgroundColor: playerNumber === 1 ? PlayerColor.Player : PlayerColor.Enemy }]
                    }>
                    <Text style={{ color: 'white' }}>{message}</Text>
                </Animated.View>
            </View>
        </Modal>
    )
});

export default ChangeTurnModalComponent;