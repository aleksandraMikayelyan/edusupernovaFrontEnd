import React, { useState, useEffect, useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import axios from "axios";
import styles from "../styles/unitStyles.js";

const UnitScreen = ({ route }) => {
  const { courseId } = route.params;
  const [courseData, setCourseData] = useState(null);
  const [activeUnit, setActiveUnit] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`http://localhost:8081/api/units/course/${courseId}`)
      .then(res => {
        setCourseData(res.data);
        if (res.data.units?.length > 0) setActiveUnit(res.data.units[0]);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [courseId]);

  const articleContent = useMemo(() => {
    if (!activeUnit) return null;
    return (
      <View style={styles.articleCard}>
        <Text style={styles.articleTitle}>{activeUnit.title}</Text>
        <View style={styles.blueBar} />
        <Text selectable={true} style={styles.textContent}>
          {activeUnit.summary_path}
        </Text>
        <TouchableOpacity style={styles.knowledgeButton}>
          <Text style={styles.knowledgeButtonText}>Check your knowledge</Text>
        </TouchableOpacity>
      </View>
    );
  }, [activeUnit?.id, activeUnit?.summary_path]);

  if (loading) return <View style={styles.loadingCenter}><ActivityIndicator size="large" color="#1c94a7" /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logoText}>EduSuperNova</Text>
      </View>

      <View style={styles.mainLayout}>
        {/* Sidebar con su propio scroll independiente */}
        <View style={styles.sidebar}>
          <Text style={styles.courseTitle}>{courseData?.courseName}</Text>
          <ScrollView 
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
          >
            {courseData?.units?.map((u) => (
              <TouchableOpacity
                key={u.id}
                onPress={() => activeUnit?.id !== u.id && setActiveUnit(u)}
                style={[styles.unitTab, activeUnit?.id === u.id && styles.unitTabActive]}
              >
                <Text style={activeUnit?.id === u.id ? styles.textActive : styles.textInactive}>
                  {u.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* CONTENEDOR PRINCIPAL: flex: 1 es vital para que el scroll funcione */}
        <View style={{ flex: 1, height: '100%', width: '100%' }}>
          <ScrollView 
            style={styles.contentArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
            scrollEnabled={true}
            nestedScrollEnabled={true}
          >
            {articleContent}
          </ScrollView>
        </View>
      </View>
    </View>
  );
};

export default UnitScreen;