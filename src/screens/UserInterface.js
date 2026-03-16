import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import iconMap from "../components/icon";
import styles from "../styles/userInterfaceStyles.js";

const UserInterface = ({ navigation }) => {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [networkError, setNetworkError] = useState(false);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setNetworkError(false);
      const response = await axios.get("http://localhost:8080/api/exams/dashboard");
      if (Array.isArray(response.data)) {
        setExams(response.data);
      }
    } catch (error) {
      console.error("Error al traer exámenes:", error);
      setNetworkError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectExam = async (exam) => {
    if (!exam || !exam.id) return; // Cambiado a .id

    setSelectedExam(exam);
    setCourses([]);

    try {
      const response = await axios.get(`http://localhost:8080/api/exams/${exam.id}`); // Cambiado a .id
      if (Array.isArray(response.data)) {
        setCourses(response.data);
      }
    } catch (error) {
      console.error("Error al traer cursos:", error);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1c94a7" />
        <Text style={{ marginTop: 10 }}>Conectando con Edusupernova...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* NAVBAR */}
      <View style={styles.navbar}>
        <View style={styles.navLeft}>
          <Text style={styles.navLogo}>Edusupernova</Text>
          <Image source={require("../../assets/iconoEdusupernovaSinFondo.png")} style={styles.navIcon} />
        </View>
        <View style={styles.navLinks}>
          <Text style={styles.linkText}>Home</Text>
          <Text style={styles.linkText}>Exams</Text>
          <Text style={styles.linkText}>Tests</Text>
        </View>
        <View style={styles.profileCircle}><Ionicons name="person-outline" size={20} color="#1c94a7" /></View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.paddingSection}>
          <Text style={styles.sectionTitle}>Exam Type:</Text>

          {networkError ? (
            <Text style={{ color: 'red' }}>Error de conexión. Revisa el servidor.</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.examScroll}>
              {exams.length > 0 ? (
                exams.map((exam) => (
                  <TouchableOpacity
                    key={exam.id} // Cambiado a .id
                    onPress={() => handleSelectExam(exam)}
                    style={[
                      styles.examCard,
                      selectedExam?.id === exam.id && styles.examCardActive, // Cambiado a .id
                    ]}
                  >
                    <Text style={styles.examCardText}>{exam.examname}</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.helperText}>No hay exámenes en la DB.</Text>
              )}
            </ScrollView>
          )}
        </View>

        <View style={styles.paddingSection}>
          {selectedExam && (
            <>
              <Text style={styles.selectedTitle}>
                Available for: <Text style={{ fontWeight: '400' }}>{selectedExam.examname}</Text>
              </Text>

              <View style={styles.subjectsGrid}>
                {courses.length > 0 ? (
                  courses.map((course) => (
                    <TouchableOpacity
                      key={course.id} // Cambiado a .id
                      style={styles.subCard}
                      onPress={() => navigation.navigate("Units", { courseId: course.id, examType: selectedExam?.examname })} // Cambiado a .id
                    >
                      <View style={styles.iconContainer}>
                        <Image
                          source={iconMap[course.icon] || iconMap['default']}
                          style={styles.subIcon}
                        />
                      </View>
                      <Text style={styles.subText}>{course.coursename}</Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.helperText}>Selecciona un examen para ver materias.</Text>
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default UserInterface;