import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "../styles/unitStyles.js";

const { width } = Dimensions.get("window");

const UnitScreen = ({ navigation }) => {
  const [activeUnitId, setActiveUnitId] = useState(1);
  const [showUnits, setShowUnits] = useState(false);

  const subjectData = {
    title: "Mathematics",
    units: [
      {
        id: 1,
        name: "Unit 1: Quadratics",
        content:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quadratics are polynomial equations of the second degree...",
      },
      {
        id: 2,
        name: "Unit 2: Linear Geometry",
        content: "Contenido sobre geometría lineal...",
      },
      {
        id: 3,
        name: "Unit 3: Functions",
        content: "Estudio de las funciones matemáticas...",
      },
      {
        id: 4,
        name: "Unit 4: Derivatives",
        content: "Cálculo diferencial y derivadas...",
      },
      { id: 5, name: "Unit 5: Integrals", content: "Cálculo integral..." },
    ],
  };

  const currentUnit = subjectData.units.find((u) => u.id === activeUnitId);

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.logoSmall}>Edusupernova</Text>

        <View style={styles.navLinks}>
          <Text style={styles.navText}>Home</Text>
          <Text style={styles.navText}>Exams</Text>
          <Text style={styles.navText}>Score</Text>
        </View>

        <View style={styles.profilePlaceholder} />
      </View>

      {/* MAIN LAYOUT */}
      <View style={styles.mainLayout}>
        {/* SIDEBAR */}
        <View style={styles.sidebar}>
          {/* Botón de descarga justo debajo del título */}
          <TouchableOpacity style={[styles.downloadBtn, { marginBottom: 12 }]}>
            <Text style={styles.downloadBtnText}>Download Formula Sheet</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowUnits((s) => !s)}>
            <Text style={styles.subjectTitle}>{subjectData.title} ⌵</Text>
          </TouchableOpacity>

          {showUnits && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ marginTop: 10 }}
            >
              {subjectData.units.map((unit) => (
                <TouchableOpacity
                  key={unit.id}
                  style={[
                    styles.unitButton,
                    activeUnitId === unit.id
                      ? styles.unitButtonActive
                      : styles.unitButtonInactive,
                  ]}
                  onPress={() => setActiveUnitId(unit.id)}
                >
                  <Text
                    style={[
                      styles.unitButtonText,
                      activeUnitId === unit.id
                        ? styles.textWhite
                        : styles.textGrey,
                    ]}
                  >
                    {unit.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* CONTENT AREA */}
        <ScrollView
          style={styles.contentArea}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.unitTitle}>
            {currentUnit.name} Summary and Formula sheet
          </Text>

          <Text style={styles.textContent}>
            {currentUnit.content}
            {"\n\n"}
            {currentUnit.content}
          </Text>

          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.checkKnowledgeBtn}
              onPress={() => navigation.navigate("Test")}
            >
              <Text style={styles.checkKnowledgeText}>
                Check your knowledge
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

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

export default UnitScreen;
