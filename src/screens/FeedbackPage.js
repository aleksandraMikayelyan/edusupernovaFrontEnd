import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Animated,
} from "react-native";
import axios from "axios";
import styles from "../styles/feedbackStyles.js";

// Score badge color helper
const getScoreColor = (mark) => {
  if (!mark) return { bg: "#e8f7f9", text: "#1c94a7", border: "#1c94a7" };
  const num = parseFloat(mark);
  if (num >= 8) return { bg: "#edfaf4", text: "#1a7a4a", border: "#2ecc71" };
  if (num >= 5) return { bg: "#fff8e6", text: "#a06a00", border: "#f5a623" };
  return { bg: "#fff0f0", text: "#b02020", border: "#e74c3c" };
};

// ═══════════════════════════════════════════════════════════════════════════
// QUESTION CARD COMPONENT
// Handles both multiple-choice (questions 1-15) and open-ended (16-20)
// ═══════════════════════════════════════════════════════════════════════════

const QuestionCard = ({ item, index }) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const questionNumber = item.id || index + 1;
  const isOpenEnded = questionNumber > 15;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      delay: index * 80,
      useNativeDriver: true,
    }).start();
  }, []);

  // Determine if the answer is correct (for multiple choice)
  const isCorrect = !isOpenEnded && item.userAnswer === item.correctAnswer;

  return (
    <Animated.View
      style={[
        styles.questionCard,
        !isOpenEnded && isCorrect && styles.questionCardCorrect,
        !isOpenEnded && !isCorrect && styles.questionCardIncorrect,
        { opacity: fadeAnim },
      ]}
    >
      {/* Question Header */}
      <View style={styles.questionHeader}>
        <View style={styles.questionBadge}>
          <Text style={styles.questionBadgeText}>Q{questionNumber}</Text>
        </View>
        <Text style={styles.questionLabel}>
          Question {questionNumber} {isOpenEnded ? "(Open-Ended)" : "(Multiple Choice)"}
        </Text>
      </View>

      {/* Question Text */}
      <Text style={styles.questionContent}>{item.text}</Text>

      {/* MULTIPLE CHOICE: Show correct answer if wrong */}
      {!isOpenEnded && (
        <View style={styles.answerSection}>
          {!isCorrect && (
            <View style={[styles.answerRow, styles.answerRowYourAnswer]}>
              <Text style={[styles.answerLabel, styles.answerLabelYours]}>
                Your Answer:
              </Text>
              <Text style={[styles.answerText, styles.answerTextYours]}>
                {item.userAnswer || "No answer provided"}
              </Text>
            </View>
          )}

          <View style={[styles.answerRow, styles.answerRowCorrect]}>
            <Text style={[styles.answerLabel, styles.answerLabelCorrect]}>
              Correct Answer:
            </Text>
            <Text style={[styles.answerText, styles.answerTextCorrect]}>
              {item.correctAnswer || "Not available"}
            </Text>
          </View>

          {isCorrect && (
            <View style={styles.correctIndicator}>
              <View style={styles.correctIcon}>
                <Text style={styles.correctIconText}>✓</Text>
              </View>
              <Text style={styles.correctText}>You got this one right!</Text>
            </View>
          )}
        </View>
      )}

      {/* OPEN-ENDED: Show user's answer and AI feedback */}
      {isOpenEnded && (
        <>
          {/* User's Answer */}
          {item.userAnswer && (
            <View style={styles.userAnswerBox}>
              <Text style={styles.userAnswerLabel}>Your Answer</Text>
              <Text style={styles.userAnswerText}>{item.userAnswer}</Text>
            </View>
          )}

          {/* AI Feedback */}
          <View style={styles.aiBox}>
            <View style={styles.aiBoxHeader}>
              <View style={styles.aiDot} />
              <Text style={styles.aiBoxTitle}>AI Feedback</Text>
            </View>
            <Text style={styles.aiText}>
              {item.aiCorrection || "No feedback provided."}
            </Text>
          </View>
        </>
      )}
    </Animated.View>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN FEEDBACK SCREEN
// ═══════════════════════════════════════════════════════════════════════════

const FeedbackScreen = ({ route, navigation }) => {
  const { userAnswers, testId, examType, sectionName } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoading(true);
        setError(false);
        const response = await axios.post(
          "http://localhost:8080/api/feedback/process",
          userAnswers,
          {
            params: {
              testId,
              examType: examType || "",
              sectionName: sectionName || "",
            }
          }
        );
        setData(response.data);
      } catch (err) {
        console.error("Error fetching feedback:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (userAnswers && userAnswers.length > 0) {
      fetchFeedback();
    } else {
      setLoading(false);
    }
  }, [userAnswers]);

  // ─── LOADING STATE ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color="#1c94a7" />
          <Text style={styles.loadingTitle}>Analyzing Your Exam</Text>
          <Text style={styles.loadingSubtitle}>
            Our AI is reviewing your answers...
          </Text>
        </View>
      </View>
    );
  }

  // ─── ERROR STATE ───────────────────────────────────────────────────────
  if (error || !data) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorCard}>
          <View style={styles.errorIcon}>
            <Text style={styles.errorIconText}>!</Text>
          </View>
          <Text style={styles.errorTitle}>Connection Error</Text>
          <Text style={styles.errorSubtitle}>
            The AI server didn't respond. Please check your connection and try again.
          </Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate("Home")}
          >
            <Text style={styles.actionButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ─── DATA PREPARATION ──────────────────────────────────────────────────
  const scoreColors = getScoreColor(data.testMark);
  const totalQuestions = data.questionsFeedback?.length || 0;
  const multipleChoiceCount = Math.min(15, totalQuestions);
  const openEndedCount = Math.max(0, totalQuestions - 15);

  // ─── MAIN VIEW ─────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.logo}>Edusupernova</Text>
        <View style={styles.navLinks}>
          <TouchableOpacity onPress={() => navigation.navigate("Home")}>
            <Text style={styles.navItem}>Home</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.profileCircle} />
      </View>

      {/* SCROLLABLE CONTENT */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* RESULTS HERO CARD */}
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Your Results</Text>
          <Text style={styles.heroSubtitle}>
            {multipleChoiceCount} multiple choice · {openEndedCount} open-ended questions
          </Text>

          <View
            style={[
              styles.scorePill,
              {
                backgroundColor: scoreColors.bg,
                borderColor: scoreColors.border,
              },
            ]}
          >
            <Text style={[styles.scoreValue, { color: scoreColors.text }]}>
              {data.testMark || "N/A"}
            </Text>
            <Text style={[styles.scoreLabel, { color: scoreColors.text }]}>
              Final Score
            </Text>
          </View>
        </View>

        {/* MULTIPLE CHOICE SECTION */}
        {multipleChoiceCount > 0 && (
          <View style={styles.feedbackSection}>
            <Text style={styles.sectionTitle}>
              Multiple Choice Questions (1-15)
            </Text>
            {data.questionsFeedback?.slice(0, 15).map((item, index) => (
              <QuestionCard key={index} item={item} index={index} />
            ))}
          </View>
        )}

        {/* OPEN-ENDED SECTION */}
        {openEndedCount > 0 && (
          <View style={styles.feedbackSection}>
            <Text style={styles.sectionTitle}>
              Open-Ended Questions (16-20) — AI Evaluated
            </Text>
            {data.questionsFeedback?.slice(15).map((item, index) => (
              <QuestionCard key={index + 15} item={item} index={index + 15} />
            ))}
          </View>
        )}

        {/* EMPTY STATE */}
        {totalQuestions === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No feedback available.</Text>
          </View>
        )}

        {/* BACK TO HOME BUTTON */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation?.navigate("Home")}
        >
          <Text style={styles.actionButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* FOOTER */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2026 Edusupernova</Text>
        <View style={styles.socialIcons}>
          <Image
            source={require("../../assets/Instagram.png")}
            style={styles.icon}
          />
        </View>
      </View>
    </View>
  );
};

export default FeedbackScreen;