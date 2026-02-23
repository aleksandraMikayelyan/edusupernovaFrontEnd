import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import styles from "../styles/testStyles.js";

const TestScreen = ({ navigation }) => {
  // Estados para la lógica del test
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);

  // Simulación de carga desde el Backend
  useEffect(() => {
    const fetchQuestions = async () => {
      // Aquí harías tu: fetch('tu-api.com/tests/random')
      const mockData = [
        {
          id: 1,
          question:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam at porttitor sem. Aliquam erat volutpat. Donec neque orci, accumsan a nibh.",
          options: ["Option A", "Option B", "Option C", "Option D"],
          correct: 0,
        },
        // ... más preguntas
      ];
      setQuestions(mockData);
    };
    fetchQuestions();
  }, []);

  if (questions.length === 0)
    return (
      <View style={styles.container}>
        <Text>Loading Test...</Text>
      </View>
    );

  const currentQuestion = questions[currentIndex];

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null); // Reset para la siguiente pregunta
    } else {
      alert("¡Test finalizado! Enviando a la IA para feedback...");
      navigation.navigate("FeedbackPage"); // Navega al feedback al terminar
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER AZUL (Consistente con tu diseño) */}
      <View style={styles.header}>
        <Text style={styles.logo}>Edusupernova</Text>
        <View style={styles.navLinks}>
          <Text style={styles.navItem}>Home</Text>
          <Text style={styles.navItem}>Exams</Text>
          <Text style={styles.navItem}>Score</Text>
        </View>
        <View style={styles.profileIcon} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.questionTitle}>Question {currentIndex + 1}</Text>

        <Text style={styles.questionText}>{currentQuestion.question}</Text>

        {/* RENDER DE OPCIONES ALEATORIAS */}
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                selectedOption === index && styles.optionSelected,
              ]}
              onPress={() => setSelectedOption(index)}
            >
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* PIE DE PREGUNTA */}
        <View style={styles.footerRow}>
          <Text style={styles.progressText}>
            {currentIndex + 1}/{questions.length}
          </Text>

          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
            //onPress={() => navigation.navigate("FeedbackPage")}
            //disabled={selectedOption === null}
          >
            <Text style={styles.nextButtonText}>Next ›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      {/* FOOTER */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.footerText}>Contact | About Us</Text>
          <Text style={styles.footerText}>Terms and Conditions</Text>
        </View>

        <View style={styles.socialIcons}>
          <Image
            source={require("../../assets/Instagram.png")}
            style={styles.icon}
          />
          <Image
            source={require("../../assets/LinkedInIcon.png")}
            style={styles.icon}
          />
          <Image
            source={require("../../assets/TikTokIcon.png")}
            style={styles.icon}
          />
        </View>

        <Text style={styles.footerText}>© 2026 Edusupernova</Text>
      </View>
    </SafeAreaView>
  );
};

export default TestScreen;
