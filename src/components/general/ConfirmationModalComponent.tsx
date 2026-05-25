import { gs } from "@/src/styles/globalStyles";
import { ConfirmationModalData } from "@/src/types/general/confirmationType";
import { memo, useEffect } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

interface props {
    visible: boolean;
    data: ConfirmationModalData;
    onClose: () => void;
    onConfirm: () => void;
}

const ConfirmationModalComponent = memo(({ visible, data, onClose, onConfirm }: props) => {
    useEffect(() => {
        if (!data.yesText) data.yesText = 'YES'
        if (!data.noText) data.noText = 'NO'
    }, [data.yesText, data.noText])

    return (
        <Modal
            visible={visible}
            transparent
            onRequestClose={onClose}
            animationType="fade">
            <View style={[gs.overlay, gs.full_size]}>
                <View style={[styles.modal_view]}>
                    <View style={[gs.f8, gs.all_center]}>
                        <Text style={[gs.text_center, gs.fontM]}>
                            {data.message}
                        </Text>
                    </View>
                    <View style={[gs.f2, gs.column, gs.border_top]}>
                        <Pressable style={[gs.f1, gs.full_size, gs.all_center, gs.border_right]}
                            accessibilityLabel="button"
                            onPress={onConfirm}>
                            <Text style={[gs.fontM]}>
                                {data.yesText}
                            </Text>
                        </Pressable>
                        <Pressable style={[gs.f1, gs.full_size, gs.all_center]}
                            accessibilityLabel="button"
                            onPress={onClose}>
                            <Text style={[gs.fontM]}>
                                {data.noText}
                            </Text>
                        </Pressable>
                    </View>
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

export default ConfirmationModalComponent;