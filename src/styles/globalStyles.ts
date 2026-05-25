import { StyleSheet } from "react-native";
import { scaleMin } from "../services/scalingSizeService";

export const gs = StyleSheet.create({
    full_size: {
        width: '100%',
        height: '100%'
    },
    row: {
        flexDirection: 'column',
    },
    column: {
        flexDirection: 'row',
    },
    border_card: {
        borderWidth: scaleMin(1),
        borderRadius: scaleMin(10),
        overflow: 'hidden'
    },
    radius: {
        borderRadius: scaleMin(10)
    },
    f05: {
        flex: 0.5
    },
    f1: {
        flex: 1
    },
    f2: {
        flex: 2
    },
    f3: {
        flex: 3
    },
    f4: {
        flex: 4
    },
    f5: {
        flex: 5
    },
    f6: {
        flex: 6
    },
    f7: {
        flex: 7
    },
    f8: {
        flex: 8
    },
    f9: {
        flex: 9
    },
    f10: {
        flex: 10
    },
    f11: {
        flex: 11
    },
    f12: {
        flex: 12
    },
    f13: {
        flex: 13
    },
    f14: {
        flex: 14
    },
    f15: {
        flex: 15
    },
    px1: {
        paddingRight: scaleMin(1),
    },
    px2: {
        paddingRight: scaleMin(2),
    },
    px3: {
        paddingRight: scaleMin(3),
    },
    px4: {
        paddingRight: scaleMin(4),
    },
    px5: {
        paddingRight: scaleMin(5),
    },
    p1: {
        padding: scaleMin(1)
    },
    p2: {
        padding: scaleMin(2)
    },
    p3: {
        padding: scaleMin(3)
    },
    p4: {
        padding: scaleMin(4)
    },
    p5: {
        padding: scaleMin(5)
    },
    p6: {
        padding: scaleMin(6)
    },
    p7: {
        padding: scaleMin(7)
    },
    p8: {
        padding: scaleMin(8)
    },
    p9: {
        padding: scaleMin(9)
    },
    p10: {
        padding: scaleMin(10)
    },
    m1: {
        margin: scaleMin(1)
    },
    m2: {
        margin: scaleMin(2)
    },
    m3: {
        margin: scaleMin(3)
    },
    m4: {
        margin: scaleMin(4)
    },
    m5: {
        margin: scaleMin(5)
    },
    all_center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    border_x: {
        borderLeftWidth: scaleMin(1),
        borderRightWidth: scaleMin(1),
    },
    border_y: {
        borderTopWidth: scaleMin(1),
        borderBottomWidth: scaleMin(1),
    },
    box_top: {
        borderTopLeftRadius: scaleMin(20),
        borderTopRightRadius: scaleMin(20),
        borderTopWidth: scaleMin(1),
        borderLeftWidth: scaleMin(1),
        borderRightWidth: scaleMin(1),
    },
    box_bottom: {
        borderBottomLeftRadius: scaleMin(20),
        borderBottomRightRadius: scaleMin(20),
        borderBottomWidth: scaleMin(1),
        borderLeftWidth: scaleMin(1),
        borderRightWidth: scaleMin(1),
    },
    overlay: {
        flex: 1,                 // Fills the entire screen
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)', // Optional: Dim background
    },
    header: {
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    text_center: {
        textAlign: 'center'
    },
    border_top: {
        borderTopWidth: scaleMin(1)
    },
    border_bottom: {
        borderBottomWidth: scaleMin(1)
    },
    border_right: {
        borderRightWidth: scaleMin(1)
    },
    overlay_loading: {
        position: 'absolute',
        alignSelf: 'center',
        backgroundColor: 'white'
    },
    available: {
        backgroundColor: '#22C55E',
    },
    unavailable: {
        backgroundColor: '#EF4444',
    },
    available_text: {
        color: '#22C55E',
    },
    unavailable_text: {
        color: '#EF4444',
    },
    damage_color: {
        color: '#B91C1C'
    },
    fontS: {
        fontSize: scaleMin(8)
    },
    fontM: {
        fontSize: scaleMin(12)
    },
    fontL: {
        fontSize: scaleMin(18)
    }
});