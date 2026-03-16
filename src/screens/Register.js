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

const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Error", "Todos los campos son obligatorios.");
      return;
    }

    setLoading(true);

    try {
      // 1. IMPORTANTE: Cambiamos localhost por 10.0.2.2 para que Android vea tu PC
      const response = await axios.post(
        "http://localhost:8080/api/users/register",
        {
          username: username,
          email: email,
          password: password,
          rol: "STUDENT",
        },
      );

      // 2. Extraemos los datos exactos que envía tu AuthResponse de Java
      const { accessToken, rol } = response.data;

      // 3. LÓGICA DE NAVEGACIÓN DIRECTA (Sin depender del Alert)
      if (accessToken) {
        console.log("Token recibido, guardando datos...");

        await AsyncStorage.setItem("userToken", accessToken);
        await AsyncStorage.setItem("userRole", rol || "STUDENT");

        // Navegación inmediata
        navigation.replace("UserInterface");
      } else {
        // Si el registro funcionó pero no llegó token por alguna razón
        console.log("Registro OK pero sin token, enviando a Login");
        navigation.navigate("Login");
      }
    } catch (error) {
      console.log("Error detallado:", error.response?.data || error.message);

      // Si el error es 400 o 500 del backend, lo mostramos
      const mensaje =
        error.response?.data?.message || "Error de conexión con el servidor";
      Alert.alert("Error", mensaje);
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
        <Text style={styles.cardTitle}>Register</Text>

        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
        />
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
        <TextInput
          style={styles.input}
          placeholder="Confirm password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>Submit</Text>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.linkText}>¿Ya tienes cuenta? Inicia sesión</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default RegisterScreen;
