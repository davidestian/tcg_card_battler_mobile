import { gs } from "@/src/styles/globalStyles";
import { memo } from "react";
import { StyleSheet, View } from "react-native";

const LoadingModalComponent = memo(() => {
    return (
        <View style={[gs.full_size, styles.overlay]}>
        </View>
    )
});

const styles = StyleSheet.create({
    modal_view: {
        height: '30%',
        width: '90%',
        borderRadius: 10,
        borderWidth: 1,
        backgroundColor: 'white'
    },
    overlay: {
        flex: 1,
        position: 'absolute',
        width: '100%',        // Makes it span the full width
        alignItems: 'center', // Centers text horizontally
        justifyContent: 'center',
        textAlign: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)', // Optional: Dim background
    }
});

export default LoadingModalComponent;