import { StyleSheet } from "react-native";
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    height: 70,
    backgroundColor: "#1c94a7c4",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  logo: {
    color: "#fff",
    fontSize: 45,
    fontWeight: "bold",
    fontFamily: "Cookie_400Regular",
  },
  navLinks: { flexDirection: "row", gap: 15 },
  navItem: {
    color: "#fff",
    fontWeight: "500",
    fontFamily: "Newsreader_400Regular",
    fontSize: 20,
  },
  profileIcon: {
    width: 35,
    height: 35,
    borderRadius: 20,
    backgroundColor: "#fff",
  },

  content: { padding: 30, alignItems: "center" },
  questionTitle: {
    fontSize: 32,
    fontWeight: "bold",
    marginVertical: 30,
    fontFamily: "Newsreader_700Bold",
  },
  questionText: {
    fontSize: 16,
    textAlign: "justify",
    lineHeight: 24,
    marginBottom: 40,
    fontFamily: "Newsreader_400Regular",
  },

  optionsContainer: { width: "25%", gap: 15, marginBottom: 40 },
  optionButton: {
    backgroundColor: "#d9d9d9",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  optionSelected: {
    backgroundColor: "#8da9a6", // Color que usaste en los botones de "Check knowledge"
    borderWidth: 1,
    borderColor: "#1a8ea1",
  },
  optionText: {
    fontSize: 18,
    color: "#333",
    fontFamily: "Newsreader_400Regular",
  },

  footerRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },
  progressText: {
    fontSize: 18,
    fontWeight: "500",
    fontFamily: "Newsreader_400Regular",
  },
  nextButton: {
    backgroundColor: "#1a8ea1",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Newsreader_700Bold",
  },
  // FOOTER
  footer: {
    backgroundColor: "#4fd1d9",
    padding: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: { fontSize: 12, color: "#333" },
  socialIcons: { flexDirection: "row" },
  icon: { width: 30, height: 30, marginLeft: 15 },
});

export default styles;
