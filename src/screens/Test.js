import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import styles from "../styles/testStyles.js";

const API_BASE = "http://localhost:8080";

// ── Decodes a JWT payload safely ──
const decodeToken = (token) => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
};

// ── Parses question options regardless of storage format ──
const parseOptions = (rawOptions) => {
  if (!rawOptions) return [];
  if (Array.isArray(rawOptions)) return rawOptions;
  if (typeof rawOptions === "string") {
    try {
      return JSON.parse(rawOptions);
    } catch {
      const separator = rawOptions.includes("|") ? "|" : "\n";
      return rawOptions.split(separator).map((o) => o.trim()).filter(Boolean);
    }
  }
  return [];
};

const TestScreen = ({ route, navigation }) => {
  const { courseId, examType = "", sectionName = "" } = route?.params || {};

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answers, setAnswers] = useState({});
  const [openEndedText, setOpenEndedText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [testId, setTestId] = useState(null);
  const [error, setError] = useState(null);

  // ── Get auth token and userId from AsyncStorage ──
  const getAuthInfo = async () => {
    const token = await AsyncStorage.getItem("userToken");
    if (!token) return null;
    const payload = decodeToken(token);
    if (!payload) return null;
    const userId = payload.userId || payload.id || payload.sub;
    return { token, userId };
  };

  // ── Initialize test: create it and fetch questions ──
  useEffect(() => {
    if (!courseId) {
      setError("No course selected.");
      setLoading(false);
      return;
    }

    const initTest = async () => {
      try {
        setError(null);

        const auth = await getAuthInfo();
        if (!auth) {
          setError("Session expired. Please log in again.");
          setLoading(false);
          return;
        }

        const headers = { Authorization: `Bearer ${auth.token}` };

        // 1. Create test → get testId
        const startRes = await axios.post(
          `${API_BASE}/api/tests/start`,
          { email: auth.userId, courseId },
          { headers }
        );
        const newTestId = startRes.data;
        setTestId(newTestId);

        // 2. Fetch questions for this test
        const questionsRes = await axios.get(
          `${API_BASE}/api/tests/${newTestId}/questions`,
          { headers }
        );

        const rawData = Array.isArray(questionsRes.data) ? questionsRes.data : [];
        const parsed = rawData.map((q) => {
          const quiz = q.quiz || q;
          return {
            quizId: quiz.id || q.quizId,
            question: quiz.questionText || q.questionText,
            options: parseOptions(quiz.options || q.options),
            type: quiz.type || q.type,
          };
        });

        setQuestions(parsed);
      } catch (err) {
        console.error("Error loading test:", err);
        setError("Could not load the test. Check your connection.");
      } finally {
        setLoading(false);
      }
    };

    initTest();
  }, [courseId]);

  // ── Select a multiple-choice option ──
  const handleSelectOption = (index) => {
    setSelectedOption(index);
    const q = questions[currentIndex];
    if (q) {
      setAnswers((prev) => ({ ...prev, [q.quizId]: q.options[index] }));
    }
  };

  // ── Update open-ended answer ──
  const handleOpenEndedText = (text) => {
    setOpenEndedText(text);
    const q = questions[currentIndex];
    if (q) {
      setAnswers((prev) => ({ ...prev, [q.quizId]: text }));
    }
  };

  const getWordCount = (text) =>
    text.trim().split(/\s+/).filter((w) => w.length > 0).length;

  // ── Move to next question or submit ──
  const handleNext = async () => {
    // Navigate to next question
    if (currentIndex < questions.length - 1) {
      const nextQ = questions[currentIndex + 1];
      const prevAnswer = answers[nextQ.quizId];
      setCurrentIndex(currentIndex + 1);

      if (nextQ.type === "OPEN_ENDED") {
        setOpenEndedText(prevAnswer || "");
        setSelectedOption(null);
      } else {
        setOpenEndedText("");
        setSelectedOption(prevAnswer ? nextQ.options.indexOf(prevAnswer) : null);
      }
      return;
    }

    // ── Submit test ──
    setSubmitting(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) throw new Error("No auth token found");

      const headers = { Authorization: `Bearer ${token}` };

      // 1. Submit answers to evaluate endpoint
      const answersList = questions.map((q) => ({
        id: { testId, quizId: q.quizId },
        userResponse: answers[q.quizId] || "",
      }));

      await axios.post(
        `${API_BASE}/api/tests/${testId}/evaluate`,
        answersList,
        { params: { examType, sectionName }, headers }
      );

      // 2. Build the payload for the feedback endpoint
      // Each item matches the TestQuestions model expected by the backend
      const userAnswers = questions.map((q) => ({
        quiz: { questionText: q.question },
        userResponse: answers[q.quizId] || "",
      }));

      // 3. Navigate to FeedbackPage passing userAnswers
      navigation.navigate("FeedbackPage", {
        userAnswers,
        testId,
        examType,
        sectionName,
      });

    } catch (err) {
      console.error("Error submitting test:", err);
      Alert.alert("Error", "Could not submit your test. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading state ──
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1c94a7" />
      </View>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#94A3B8" />
        <Text style={{ marginTop: 16, fontSize: 16, color: "#64748B", textAlign: "center", paddingHorizontal: 40 }}>
          {error}
        </Text>
        <TouchableOpacity
          style={[styles.nextButton, { marginTop: 24 }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.nextButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Empty questions state ──
  if (questions.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ fontSize: 16, color: "#64748B" }}>
          No questions available for this course.
        </Text>
      </View>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = (currentIndex + 1) / questions.length;
  const isMultipleChoice =
    currentQuestion.type === "MULTIPLE_CHOICE" || !currentQuestion.type;
  const currentWordCount = getWordCount(openEndedText);
  const isValidWordCount = currentWordCount >= 250 && currentWordCount <= 300;
  const isNextDisabled = isMultipleChoice
    ? selectedOption === null || submitting
    : !isValidWordCount || submitting;

  const SidebarItem = ({ icon, label, isActive = false, onPress }) => (
    <TouchableOpacity
      style={[styles.menuItem, isActive && styles.menuItemActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons name={icon} size={20} color={isActive ? "#0d7a8a" : "#64748B"} />
      <Text style={[styles.menuText, isActive && styles.menuTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.mainLayout}>

        {/* ── Sidebar ── */}
        <View style={styles.sidebar}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>Edusupernova</Text>
          </View>
          <Text style={styles.menuLabel}>MENU</Text>
          <SidebarItem icon="home-outline" label="Home" onPress={() => navigation.navigate("Home")} />
          <SidebarItem icon="book-outline" label="Units" onPress={() => navigation.goBack()} />
          <SidebarItem icon="person-outline" label="Profile" onPress={() => { }} />
          <SidebarItem icon="stats-chart-outline" label="Scores" onPress={() => { }} />
          <View style={styles.logoutItem}>
            <SidebarItem icon="log-out-outline" label="Log out" onPress={() => navigation.navigate("Login")} />
          </View>
        </View>

        {/* ── Content ── */}
        <View style={styles.contentArea}>

          {/* Progress Header */}
          <View style={styles.progressHeader}>
            <View style={styles.progressInfo}>
              <Text style={styles.questionIndex}>
                QUESTION {currentIndex + 1} OF {questions.length}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Ionicons name="time-outline" size={16} color="#94A3B8" />
                <Text style={styles.timerText}>12:45 remaining</Text>
              </View>
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
              {isMultipleChoice ? (
                currentQuestion.options.map((option, index) => {
                  const letter = String.fromCharCode(65 + index);
                  const isSelected = selectedOption === index;
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[styles.optionTile, isSelected && styles.optionTileSelected]}
                      onPress={() => handleSelectOption(index)}
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
                })
              ) : (
                <View style={styles.openEndedContainer}>
                  <TextInput
                    style={styles.openEndedInput}
                    multiline
                    textAlignVertical="top"
                    placeholder="Write your answer here (250-300 words)..."
                    placeholderTextColor="#94A3B8"
                    value={openEndedText}
                    onChangeText={handleOpenEndedText}
                    maxLength={2000}
                  />
                  <View style={styles.wordCountContainer}>
                    <Text
                      style={[
                        styles.wordCountText,
                        isValidWordCount
                          ? styles.wordCountValid
                          : styles.wordCountInvalid,
                      ]}
                    >
                      {currentWordCount} / 250-300 words
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Navigation */}
            <View style={styles.navigationRow}>
              <TouchableOpacity
                style={[styles.nextButton, isNextDisabled && styles.nextButtonDisabled]}
                onPress={handleNext}
                disabled={isNextDisabled}
                activeOpacity={0.8}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.nextButtonText}>
                      {currentIndex === questions.length - 1
                        ? "Finish Test"
                        : "Next Question"}
                    </Text>
                    <Text style={styles.nextButtonText}>›</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

        </View>
      </View>
    </View>
  );
};

export default TestScreen;