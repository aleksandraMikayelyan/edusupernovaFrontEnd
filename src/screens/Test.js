import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import styles from "../styles/testStyles.js";

const TestScreen = ({ navigation }) => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simulation of loading questions from backend
  useEffect(() => {
    const fetchQuestions = async () => {
      // Mock data for the demonstration
      const mockData = [
        {
          id: 1,
          question: "Which of the following best describes the economic concept of SCARCITY?",
          options: [
            "A condition where resources are limited but human wants are unlimited.",
            "A situation where there is a surplus of goods and services.",
            "The ability of the government to control all production factors.",
            "A market state where demand and supply are perfectly equal."
          ],
          correct: 0,
        },
        {
          id: 2,
          question: "What is the primary difference between Capital-intensive and Labor-intensive production?",
          options: [
            "The amount of government tax applied to each methodology.",
            "The ratio of machinery vs. manual labor used in the process.",
            "The geographical location where the production takes place.",
            "The final price at which the goods are sold to consumers."
          ],
          correct: 1,
        },
        {
          id: 3,
          question: "In the context of Opportunity Cost, what does choosing one option over another represent?",
          options: [
            "A financial gain from the chosen resource.",
            "The value of the next best alternative given up.",
            "The total cost of production including labor.",
            "A decrease in market competition."
          ],
          correct: 1,
        }
      ];
      setQuestions(mockData);
      setLoading(false);
    };
    fetchQuestions();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1c94a7" />
      </View>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = (currentIndex + 1) / questions.length;

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
    } else {
      navigation.navigate("FeedbackPage");
    }
  };

  const SidebarItem = ({ icon, label, isActive = false, onPress }) => (
    <TouchableOpacity
      style={[styles.menuItem, isActive && styles.menuItemActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text style={[styles.menuText, isActive && styles.menuTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.mainLayout}>

        {/* ── Sidebar Menu ── */}
        <View style={styles.sidebar}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>Edusupernova</Text>
          </View>

          <Text style={styles.menuLabel}>MENU</Text>
          <SidebarItem
            icon="🏠"
            label="Home"
            onPress={() => navigation.navigate("Home")}
          />
          <SidebarItem
            icon="📖"
            label="Units"
            onPress={() => navigation.goBack()}
          />
          <SidebarItem
            icon="👤"
            label="Profile"
            onPress={() => { }}
          />
          <SidebarItem
            icon="📈"
            label="Scores"
            onPress={() => { }}
          />

          <View style={styles.logoutItem}>
            <SidebarItem
              icon="🚪"
              label="Log out"
              onPress={() => navigation.navigate("Login")}
            />
          </View>
        </View>

        {/* ── Content Area ── */}
        <View style={styles.contentArea}>

          {/* Progress Header */}
          <View style={styles.progressHeader}>
            <View style={styles.progressInfo}>
              <Text style={styles.questionIndex}>QUESTION {currentIndex + 1} OF {questions.length}</Text>
              <Text style={styles.timerText}>⏳ 12:45 remaining</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
          </View>

          {/* Question Card */}
          <View style={styles.questionCard}>
            <Text style={styles.questionLabel}>EVALUATION</Text>
            <Text style={styles.questionText}>{currentQuestion.question}</Text>

            <View style={styles.optionsGrid}>
              {currentQuestion.options.map((option, index) => {
                const letter = String.fromCharCode(65 + index); // A, B, C, D
                const isSelected = selectedOption === index;
                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.optionTile, isSelected && styles.optionTileSelected]}
                    onPress={() => setSelectedOption(index)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.optionLetter, isSelected && styles.optionLetterSelected]}>
                      <Text style={[styles.optionLetterText, isSelected && styles.optionLetterTextSelected]}>
                        {letter}
                      </Text>
                    </View>
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Navigation */}
            <View style={styles.navigationRow}>
              <TouchableOpacity
                style={[styles.nextButton, selectedOption === null && styles.nextButtonDisabled]}
                onPress={handleNext}
                disabled={selectedOption === null}
                activeOpacity={0.8}
              >
                <Text style={styles.nextButtonText}>
                  {currentIndex === questions.length - 1 ? "Finish Test" : "Next Question"}
                </Text>
                <Text style={styles.nextButtonText}>›</Text>
              </TouchableOpacity>
            </View>
          </View>

        </View>
      </View>
    </View>
  );
};

export default TestScreen;
