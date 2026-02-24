import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import styles from "../styles/registerLoginStyle.js";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(
        "Campos requeridos",
        "Por favor, introduce tu email y contraseña.",
      );
      return;
    }

    setLoading(true);

    try {
      // IMPORTANTE: Cambia 'localhost' por '10.0.2.2' si usas emulador Android
      const response = await axios.post(
        "http://localhost:8081/api/users/login",
        {
          email: email,
          password: password,
        },
      );

      // 1. CORRECCIÓN: Tu backend devuelve 'accessToken' y 'rol' (no 'token' ni 'user')
      const { accessToken, rol } = response.data;

      if (accessToken) {
        // Guardamos los datos
        await AsyncStorage.setItem("userToken", accessToken);

        if (rol) {
          await AsyncStorage.setItem("userRole", rol);

          // 2. CORRECCIÓN: Limpiamos el rol y comparamos exactamente
          const userRole = rol.trim().toUpperCase();
          console.log("Rol detectado:", userRole);

          if (userRole === "ADMIN") {
            navigation.replace("AdminInterface");
          } else {
            navigation.replace("UserInterface");
          }
        } else {
          // Si por alguna razón no hay rol, mandamos a UserInterface por defecto
          navigation.replace("UserInterface");
        }
      }
    } catch (error) {
      console.log("Error detallado:", error.response?.data || error.message);

      if (error.response) {
        if (error.response.status === 403) {
          Alert.alert(
            "Acceso Denegado",
            "No tienes permiso o el usuario no existe.",
          );
        } else {
          Alert.alert("Error", "Credenciales incorrectas.");
        }
      } else {
        Alert.alert(
          "Error de conexión",
          "Asegúrate de que el backend esté corriendo.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

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

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>Submit</Text>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.linkText}>¿No tienes cuenta? Regístrate</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default LoginScreen;
