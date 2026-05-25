import { loginUser } from "@/src/api/auth/service";
import LoadingModalComponent from "@/src/components/general/LoadingModalComponent";
import { checkAlreadyLogin, onLoginSuccess } from "@/src/services/authService";
import { gs } from "@/src/styles/globalStyles";
import { router, useFocusEffect } from "expo-router";
import { memo, useCallback, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

interface props {
}

const Index = memo(({ }: props) => {
  // useRef stores values WITHOUT triggering re-renders
  const emailVal = useRef('');
  const passwordVal = useRef('');
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const checkToken = useCallback(async () => {
    setIsLoading(true);
    try {
      const isLogin = await checkAlreadyLogin();

      if (isLogin) setIsValid(true);
    } catch (e) {
      console.warn("Failed to fetch token", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setIsValid(false);
      checkToken();
    }, [])
  );

  const onPressLogin = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await loginUser({ email: emailVal.current, password: passwordVal.current });
      if (!res.success) { return }

      await onLoginSuccess(res.data);
      setIsValid(true);
    }
    finally {
      setIsLoading(false);
    }
  }, [])

  const toMainMenu = useCallback(() => {
    router.replace('/main-menu');
  }, []);

  function goToRegister() {
    router.push('/register');
  }

  function goToForgot() {
    router.push('/forgot-password');
  }

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
          <View style={[gs.f1, gs.p5]}>
            <View style={[gs.border_card, gs.full_size, gs.p5]}>
              <Text style={[gs.f1, gs.fontM]}>EMAIL</Text>
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
              <Text style={[gs.f1, gs.fontM]}>PASSWORD</Text>
              <TextInput style={[gs.f2, gs.fontM]}
                placeholder="Enter password"
                onChangeText={(text) => { passwordVal.current = text; }}
                returnKeyType="done"
                secureTextEntry
              />
            </View>
          </View>
          <View style={[gs.f05, gs.column]}>
            <Pressable style={[gs.f1, gs.p5]}
              onPress={goToRegister}>
              <View style={[gs.full_size, gs.all_center, gs.border_card]}>
                <Text style={gs.fontM}>REGISTER</Text>
              </View>
            </Pressable>
            <Pressable style={[gs.f2, gs.p5]}
              onPress={onPressLogin}>
              <View style={[gs.full_size, gs.all_center, gs.border_card, { backgroundColor: 'red' }]}>
                <Text style={[gs.fontM, { color: 'white' }]}>SUBMIT</Text>
              </View>
            </Pressable>
          </View>
          <Pressable style={[gs.f05, gs.all_center]}
            onPress={goToForgot}>
            <Text style={[{ color: 'blue' }, gs.fontM]}>Forgot password...</Text>
          </Pressable>
          <View style={[gs.f4]}>
          </View>
        </>
      }
      <LoadingModalComponent visible={isLoading}></LoadingModalComponent>
    </View>
  );
});

const styles = StyleSheet.create({
  text_input: {
    borderBottomWidth: 1
  }
});

export default Index;