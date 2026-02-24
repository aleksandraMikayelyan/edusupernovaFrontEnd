import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "../styles/userInterfaceStyles.js";

const { width, height } = Dimensions.get("window");

const UserInterface = ({ navigation }) => {
  const [selectedExam, setSelectedExam] = useState(null);
  // Estado para los exámenes que vienen del Backend
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Cargar exámenes al montar el componente
  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      // Usamos 10.0.2.2 para emulador Android
      const response = await axios.get(
        "http://localhost:8081/api/exams/dashboard",
      );
      setExams(response.data);
    } catch (error) {
      console.error("Error al cargar exámenes:", error);
      Alert.alert("Error", "No se pudieron cargar los exámenes disponibles.");
    } finally {
      setLoading(false);
    }
  };

  const subCategories = {
    "A Levels": [
      { id: 1, name: "Math Tests", icon: require("../../assets/math.png") },
      {
        id: 2,
        name: "Economy Tests",
        icon: require("../../assets/economic.png"),
      },
      {
        id: 3,
        name: "English Tests",
        icon: require("../../assets/travel.png"),
      },
    ],
    TOEFL: [
      { id: 1, name: "Reading", icon: require("../../assets/reading.png") },
      { id: 2, name: "Speaking", icon: require("../../assets/person.png") },
      { id: 3, name: "Writing", icon: require("../../assets/quill-pen.png") },
      { id: 4, name: "Listening", icon: require("../../assets/listening.png") },
      { id: 5, name: "Grammar", icon: require("../../assets/book.png") },
    ],
    // Puedes añadir arrays vacíos o genéricos para los demás por ahora
    IELTS: [
      { id: 1, name: "Reading", icon: require("../../assets/reading.png") },
      { id: 2, name: "Speaking", icon: require("../../assets/person.png") },
      { id: 3, name: "Writing", icon: require("../../assets/letter.png") },
      { id: 4, name: "Grammar", icon: require("../../assets/book.png") },
    ],
    ACT: [
      { id: 1, name: "Science", icon: require("../../assets/science.png") },
      { id: 2, name: "Math", icon: require("../../assets/math.png") },
      { id: 3, name: "English", icon: require("../../assets/person.png") },
      { id: 4, name: "Writing", icon: require("../../assets/quill-pen.png") },
      { id: 5, name: "Reading", icon: require("../../assets/reading.png") },
    ],
    SAT: [
      {
        id: 1,
        name: "Reading & Writing",
        icon: require("../../assets/letter.png"),
      },
      { id: 2, name: "Math", icon: require("../../assets/math.png") },
    ],
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* --- NAVBAR SUPERIOR --- */}
      <View style={styles.navbar}>
        <View style={styles.navLeft}>
          <Text style={styles.navLogo}>Edusupernova</Text>
          <Image
            source={require("../../assets/iconoEdusupernovaSinFondo.png")}
            style={styles.navIcon}
          />
        </View>
        <View style={styles.navLinks}>
          <Text style={styles.linkText}>Home</Text>
          <Text style={styles.linkText}>Exams</Text>
          <Text style={styles.linkText}>Tests</Text>
        </View>
        <View style={styles.profileCircle}>
          <Text style={{ fontSize: 20 }}>👤</Text>
        </View>
      </View>

      {selectedExam && (
        <Pressable
          style={styles.overlay}
          onPress={() => setSelectedExam(null)}
        />
      )}
      <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
        {/* --- EXAM TYPE SELECTION --- */}
        <View style={styles.paddingSection}>
          <Text style={styles.sectionTitle}>Exam Type:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.examScroll}
          >
            {examTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.examCard,
                  selectedExam === type && styles.examCardActive,
                ]}
                onPress={() =>
                  setSelectedExam((prev) => (prev === type ? null : type))
                }
              >
                <Text style={styles.examCardText}>{type}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* --- DYNAMIC SECTION --- */}
        <View style={styles.paddingSection}>
          {selectedExam && (
            <>
              <Text style={styles.selectedTitle}>
                Selected:{" "}
                <Text style={{ fontWeight: "400" }}>{selectedExam}</Text>
              </Text>

              <View style={styles.subjectsGrid}>
                {subCategories[selectedExam]?.map((sub) => (
                  <TouchableOpacity
                    key={sub.id}
                    style={styles.subCard}
                    onPress={() => navigation?.navigate("Units")}
                  >
                    <View style={styles.iconContainer}>
                      <Image source={sub.icon} style={styles.subIcon} />
                    </View>
                    <Text style={styles.subText}>{sub.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* --- FOOTER (Mini) --- */}
      {/* 6. FOOTER */}
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
export default UserInterface;
