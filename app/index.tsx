import { loginUser } from "@/src/api/auth/service";
import { checkAlreadyLogin, onLoginSuccess } from "@/src/services/authService";
import { gs } from "@/src/styles/globalStyles";
import { router } from "expo-router";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

interface props {
}

const Index = memo(({ }: props) => {
  // useRef stores values WITHOUT triggering re-renders
  const emailVal = useRef('');
  const passwordVal = useRef('');
  const [isValid, setIsValid] = useState(false);

  const checkToken = useCallback(async () => {
    try {
      // 1. Try to get the stored token
      const isLogin = await checkAlreadyLogin();

      if (isLogin) setIsValid(true);
    } catch (e) {
      console.warn("Failed to fetch token", e);
    } finally {
    }
  }, []);

  useEffect(() => {
    setIsValid(false);
    checkToken();
  }, []);

  const onPressLogin = useCallback(async () => {
    const res = await loginUser({ email: emailVal.current, password: passwordVal.current });
    if (!res.success) { return }

    await onLoginSuccess(res.data);
    setIsValid(true);
  }, [])

  const toMainMenu = useCallback(() => {
    router.replace('/main-menu');
  }, []);

  return (
    <View style={[gs.full_size, gs.p5]}>
      {isValid &&
        <>
          <View style={[gs.f3]}>
          </View>
          <View style={[gs.f1, gs.column]}>
            <View style={[gs.f1]}></View>
            <Pressable accessibilityLabel="button" onPress={toMainMenu}
              style={[gs.f4, gs.all_center, gs.border_card, { backgroundColor: 'red' }]}>
              <Text style={{ color: 'white' }}>LOGIN</Text>
            </Pressable>
            <View style={[gs.f1]}></View>
          </View>
          <View style={[gs.f3]}>
          </View>
        </>
      }
      {!isValid &&
        <>
          <View style={[gs.f1]}>
          </View>
          <View style={[gs.f1, gs.all_center]}>
            <Text>EMAIL</Text>
            <TextInput
              placeholder="Enter email"
              style={styles.text_input}
              onChangeText={(text) => { emailVal.current = text; }}
              returnKeyType="next"
            />
          </View>
          <View style={[gs.f1, gs.all_center]}>
            <Text>PASSWORD</Text>
            <TextInput
              style={styles.text_input}
              placeholder="Enter password"
              secureTextEntry
              onChangeText={(text) => { passwordVal.current = text; }}
              returnKeyType="done"
            />
          </View>
          <View style={[gs.f1, gs.column]}>
            <View style={[gs.f1]}></View>
            <Pressable style={[gs.f4, gs.all_center, gs.border_card]}
              onPress={onPressLogin}>
              <Text>SUBMIT</Text>
            </Pressable>
            <View style={[gs.f1]}></View>
          </View>
          <View style={[gs.f3]}>
          </View>
        </>
      }
    </View>
  );
});

const styles = StyleSheet.create({
  text_input: {
    borderBottomWidth: 1
  }
});

export default Index;