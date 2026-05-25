import { forgot } from "@/src/api/auth/service";
import GeneralHeaderBarComponent from "@/src/components/general/GeneralHeaderBarComponent";
import LoadingModalComponent from "@/src/components/general/LoadingModalComponent";
import MessageModalComponent from "@/src/components/general/MessageModalComponent";
import { validateEmail } from "@/src/services/generalService";
import { gs } from "@/src/styles/globalStyles";
import { router, useFocusEffect } from "expo-router";
import { memo, useCallback, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

const ForgotPassword = memo(() => {
    const [isLoading, setIsLoading] = useState(false);
    const emailVal = useRef('');
    const passwordVal = useRef('');
    const rePasswordVal = useRef('');
    const isSuccess = useRef(false);
    const [message, setMessage] = useState('');

    useFocusEffect(
        useCallback(() => {
            isSuccess.current = false;
            setMessage('');
        }, [])
    );

    const onSubmit = useCallback(async () => {
        setIsLoading(true);

        try {
            let msg = '';
            if (emailVal.current === '' || passwordVal.current === '' || rePasswordVal.current === '')
                msg = 'All field must be filled';
            else if (!validateEmail(emailVal.current))
                msg = 'Email not valid';
            else if (passwordVal.current !== rePasswordVal.current)
                msg = 'password not match';
            else if (passwordVal.current.length > 10)
                msg = 'password max length 10';

            if (msg !== '') {
                setMessage(msg);
                return;
            }
            const res = await forgot({
                email: emailVal.current,
                password: passwordVal.current,
            });
            if (!res.success) {
                setMessage(res.message);
            } else {
                isSuccess.current = true;
                setMessage("Success");
            }
        }
        finally {
            setIsLoading(false);
        }
    }, []);

    const onCloseMessage = useCallback(() => {
        setMessage('');
        if (isSuccess.current) {
            isSuccess.current = false;
            router.back();
        }
    }, []);

    return (
        <View style={[gs.full_size]}>
            <View style={[gs.f1]}>
                <GeneralHeaderBarComponent title="FORGOT PASSWORD"></GeneralHeaderBarComponent>
            </View>
            <View style={[gs.f9, gs.full_size]}>
                <View style={[gs.f1, gs.p5]}>
                    <View style={[gs.border_card, gs.full_size, gs.p5]}>
                        <Text style={[gs.f1, styles.label, gs.fontM]}>EMAIL</Text>
                        <TextInput style={[gs.f2, gs.fontM]}
                            placeholder="Enter email"
                            onChangeText={(text) => { emailVal.current = text; }}
                            keyboardType="email-address"
                            returnKeyType="next"
                        />
                    </View>
                </View>
                <View style={[gs.f1, gs.p5]}>
                    <View style={[gs.border_card, gs.full_size, gs.p5]}>
                        <Text style={[gs.f1, styles.label, gs.fontM]}>PASSWORD</Text>
                        <TextInput style={[gs.f2, gs.fontM]}
                            placeholder="Enter password"
                            onChangeText={(text) => { passwordVal.current = text; }}
                            returnKeyType="done"
                            secureTextEntry
                        />
                    </View>
                </View>
                <View style={[gs.f1, gs.p5]}>
                    <View style={[gs.border_card, gs.full_size, gs.p5]}>
                        <Text style={[gs.f1, styles.label, gs.fontM]}>RE-PASSWORD</Text>
                        <TextInput style={[gs.f2, gs.fontM]}
                            placeholder="Enter re-password"
                            onChangeText={(text) => { rePasswordVal.current = text; }}
                            returnKeyType="done"
                            secureTextEntry
                        />
                    </View>
                </View>
                <View style={[gs.f4]}></View>
                <View style={[gs.f1]}>
                    <Pressable accessibilityLabel="button"
                        onPress={onSubmit}
                        style={[gs.full_size, gs.column, gs.p5]}>
                        <View style={[gs.f1]}></View>
                        <View style={[gs.f2, gs.border_card, gs.all_center, { backgroundColor: 'red' }]}>
                            <Text style={[gs.fontM, { color: 'white' }]}>SUBMIT</Text>
                        </View>
                        <View style={[gs.f1]}></View>
                    </Pressable>
                </View>
                <View style={[gs.f1]}></View>
            </View>
            {message !== '' &&
                <MessageModalComponent message={message}
                    onClose={onCloseMessage}></MessageModalComponent>
            }
            <LoadingModalComponent visible={isLoading}></LoadingModalComponent>
        </View>
    )
});

const styles = StyleSheet.create({
    label: {
        alignItems: 'center',
        alignContent: 'center'
    },
    text_box: {
        borderBottomWidth: 1
    }
})

export default ForgotPassword;