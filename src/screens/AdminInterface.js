import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";

const AdminInterface = () => {
  const [activeMode, setActiveMode] = useState("add");

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.logo}>Edusupernova</Text>
        <View style={styles.navLinks}>
          <Text style={styles.navItem}>Home</Text>
          <Text style={styles.navItem}>Exams</Text>
          <Text style={styles.navItem}>Units</Text>
        </View>
        <View style={styles.searchBar}>
          <Text style={{ color: "#888" }}>🔍</Text>
        </View>
        <View style={styles.profileCircle} />
      </View>

      <View style={styles.mainContainer}>
        {/* BARRA LATERAL - Aseguramos que el ancho no bloquee el centro */}
        <View style={styles.sidebar}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => setActiveMode("add")}
          >
            <Text style={styles.actionBtnText}>Add Exam Questions</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => setActiveMode("delete")}
          >
            <Text style={styles.actionBtnText}>Delete Exam Questions</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => setActiveMode("sources")}
          >
            <Text style={styles.actionBtnText}>Add Sources</Text>
          </TouchableOpacity>

          {activeMode === "sources" && (
            <TouchableOpacity style={styles.uploadBox}>
              <Text style={styles.uploadText}>Upload files</Text>
              <Text style={styles.plusIcon}>+</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionBtn, { marginTop: 40 }]}
            onPress={() => setActiveMode("update")}
          >
            <Text style={styles.actionBtnText}>Update Exam types</Text>
          </TouchableOpacity>
        </View>

        {/* PANEL CENTRAL - ScrollView */}
        <ScrollView
          style={styles.formPanel}
          contentContainerStyle={{ paddingBottom: 50 }}
        >
          <View style={styles.dropdownContainer}>
            {/* Si quieres asegurar clics, NO pongas pointerEvents="none" aquí */}
            <TouchableOpacity style={styles.dropdown} activeOpacity={0.7}>
              <Text style={styles.dropdownText}>Select Exam Type ⌵</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dropdown}>
              <Text style={styles.dropdownText}>Select Subject ⌵</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dynamicForm}>
            {activeMode === "delete" && (
              <View>
                <Text style={styles.helperText}>// Find by ID</Text>
                <TextInput
                  style={styles.inputRound}
                  placeholder="Question ID..."
                />
              </View>
            )}

            {activeMode === "add" && (
              <View>
                <Text style={styles.helperText}>// New Question</Text>
                <TextInput
                  style={styles.inputRound}
                  placeholder="Write here..."
                />

                <View style={styles.optionsRow}>
                  <View style={{ flex: 1, gap: 10 }}>
                    <TextInput
                      style={styles.inputRound}
                      placeholder="Choice 1"
                    />
                    <TextInput
                      style={styles.inputRound}
                      placeholder="Choice 2"
                    />
                  </View>
                </View>
              </View>
            )}

            <View style={{ alignItems: "flex-end", marginTop: 30 }}>
              <TouchableOpacity style={styles.saveBtn}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

// ... (Tus estilos se mantienen igual, son correctos)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    height: 70,
    backgroundColor: "#1a8ea1",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  logo: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  navLinks: { flexDirection: "row", gap: 15 },
  navItem: { color: "#fff", fontSize: 14 },
  searchBar: {
    backgroundColor: "#58afbc",
    width: 100,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  profileCircle: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: "#fff",
  },
  mainContainer: { flex: 1, flexDirection: "row" },
  sidebar: {
    width: "35%",
    padding: 15,
    borderRightWidth: 1,
    borderRightColor: "#eee",
  },
  actionBtn: {
    backgroundColor: "#1a8ea1",
    padding: 12,
    borderRadius: 20,
    marginBottom: 10,
  },
  actionBtnText: { color: "#fff", textAlign: "center", fontSize: 12 },
  uploadBox: {
    borderWidth: 2,
    borderColor: "#000",
    borderStyle: "dashed",
    height: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  uploadText: { fontSize: 16 },
  plusIcon: { fontSize: 24 },
  formPanel: { flex: 1, padding: 20 },
  dropdownContainer: { alignItems: "center", gap: 10 },
  dropdown: {
    backgroundColor: "#1a8ea1",
    width: "90%",
    padding: 12,
    borderRadius: 20,
    alignItems: "center",
  },
  dropdownText: { color: "#fff" },
  dynamicForm: { marginTop: 20 },
  helperText: { color: "#333", fontSize: 11, marginBottom: 5 },
  inputRound: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 40,
    marginBottom: 10,
  },
  optionsRow: { flexDirection: "row" },
  saveBtn: {
    backgroundColor: "#1a8ea1",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  saveBtnText: { color: "#fff", fontWeight: "bold" },
});

export default AdminInterface;
