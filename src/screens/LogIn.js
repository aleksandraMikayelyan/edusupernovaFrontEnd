import React from "react";
import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "../styles/registerLoginStyle.js";

const LoginScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>Edusupernova</Text>
        <Image
          source={require("../../assets/iconoEdusupernovaSinFondo.png")}
          style={styles.logoIcon}
        />
      </View>

      <View style={styles.authCard}>
        <Text style={styles.cardTitle}>Log In</Text>
        <TextInput style={styles.input} placeholder="Username/Email" />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
        />
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={() => navigation.navigate("UserInterface")}
        >
          <Text style={styles.submitBtnText}>Submit</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.linkText}>¿No tienes cuenta? Regístrate</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};
export default LoginScreen;
