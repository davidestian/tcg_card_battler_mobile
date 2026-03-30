import { gs } from "@/src/styles/globalStyles";
import { memo } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

interface props {
    message: string;
    onClose: () => void;
}

const MessageModalComponent = memo(({ message, onClose }: props) => {
    return (
        <Modal
            transparent
            visible={message !== ''}
            onRequestClose={onClose}
            animationType="fade">
            <View style={[gs.overlay, gs.full_size]}>
                <View style={[styles.modal_view, gs.all_center]}>
                    <View style={[gs.f8, gs.all_center]}>
                        <Text style={[gs.text_center]}>
                            {message}
                        </Text>
                    </View>
                    <Pressable style={[gs.f2, gs.full_size, gs.all_center]}
                        onPress={onClose}>
                        <Text style={[gs.text_center]}>
                            OK
                        </Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    )
});

const styles = StyleSheet.create({
    modal_view: {
        height: '30%',
        width: '90%',
        borderRadius: 10,
        borderWidth: 1,
        backgroundColor: 'white'
    }
});

export default MessageModalComponent;