import React from "react";
import { View, StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Importa fuentes
import { useFonts } from "expo-font";
import { Cookie_400Regular } from "@expo-google-fonts/cookie";
import {
  Newsreader_400Regular,
  Newsreader_700Bold,
} from "@expo-google-fonts/newsreader";

// Importa tus componentes
import HomeScreen from "./src/screens/Home";
import LoginScreen from "./src/screens/LogIn";
import RegisterScreen from "./src/screens/Register";
import UserInterface from "./src/screens/UserInterface";
import UnitScreen from "./src/screens/Units";
import TestScreen from "./src/screens/Test";
import FeedbackScreen from "./src/screens/FeedbackPage";
import AdminInterface from "./src/screens/AdminInterface";

const Stack = createStackNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({
    Cookie_400Regular,
    Newsreader_700Bold,
    Newsreader_400Regular,
  });
  if (!fontsLoaded) {
    return null;
  }
  return (
    <SafeAreaProvider>
      {/* 1. Forzamos que el View principal ocupe TODA la pantalla. 
         2. Quitamos cualquier posible interferencia de gestos con pointerEvents="auto" (por si acaso).
      */}
      <View style={{ flex: 1, backgroundColor: "#fff" }} pointerEvents="auto">
        <StatusBar barStyle="dark-content" />

        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerShown: false, // Ocultamos el header por defecto para usar tus diseños personalizados
              cardStyle: { backgroundColor: "#fff" }, // Evita fondos negros durante transiciones
              gestureEnabled: true, // Permite volver atrás deslizando
            }}
          >
            {/* Pantallas Públicas */}
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />

            {/* Flujo de Usuario Principal */}
            <Stack.Screen name="UserInterface" component={UserInterface} />
            <Stack.Screen name="Units" component={UnitScreen} />
            <Stack.Screen name="Test" component={TestScreen} />
            <Stack.Screen name="FeedbackPage" component={FeedbackScreen} />

            {/* Panel de Administración */}
            <Stack.Screen name="AdminInterface" component={AdminInterface} />
          </Stack.Navigator>
        </NavigationContainer>
      </View>
    </SafeAreaProvider>
  );
}
