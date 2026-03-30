import { logout } from "@/src/services/authService";
import { fontL } from "@/src/services/scalingSizeService";
import { gs } from "@/src/styles/globalStyles";
import { router } from "expo-router";
import { LogOutIcon, XIcon } from "lucide-react-native";
import { memo } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { MyText } from "./MyText";

const SettingModalComponent = memo(({ onClose }: {
    onClose: () => void;
}) => {
    const onPressLogOut = async () => {
        await logout();
        router.replace('/');
    }
    return (
        <Modal
            animationType="slide"
            transparent
            onRequestClose={onClose}>
            <View style={styles.overlay} >
                <View style={[styles.body]}>
                    <Pressable style={[gs.f1, { justifyContent: 'center', alignItems: 'flex-end' }]}
                        accessibilityLabel="button"
                        onPress={onClose}>
                        <XIcon size={fontL}></XIcon>
                    </Pressable>
                    <View style={[gs.f2, gs.p5]}>
                        <Pressable style={[gs.border_card, gs.full_size, gs.all_center, gs.column]}
                            accessibilityLabel="button"
                            onPress={onPressLogOut}>
                            <MyText>LOGOUT </MyText><LogOutIcon></LogOutIcon>
                        </Pressable>
                    </View>
                    <View style={[gs.f7]}>
                    </View>
                </View>
            </View>
        </Modal>
    )
});

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)', // Dimmed background
        justifyContent: 'flex-end', // This pushes the body to the bottom
    },
    body: {
        width: '100%',
        height: '50%',
        borderTopStartRadius: 20,
        borderTopEndRadius: 20,
        backgroundColor: 'white',
        // Optional: padding for content
        padding: 20,
    }
})

export default SettingModalComponent;
