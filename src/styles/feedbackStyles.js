import { StyleSheet } from "react-native";
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
  profileCircle: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: "#fff",
  },

  scrollContainer: { padding: 30 },

  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 40,
    flexWrap: "wrap",
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "500",
    color: "#000",
    fontFamily: "Newsreader_700Bold",
  },
  markLabel: {
    fontSize: 28,
    fontWeight: "500",
    color: "#000",
    fontFamily: "Newsreader_700Bold",
  },
  markValue: { fontSize: 36, fontWeight: "400" },

  feedbackBlock: { marginBottom: 35 },
  questionLabel: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    fontFamily: "Newsreader_600SemiBold",
  },
  questionContent: {
    fontSize: 16,
    lineHeight: 22,
    color: "#333",
    textAlign: "justify",
    fontFamily: "Newsreader_400Regular",
  },

  aiBox: {
    marginTop: 15,
    padding: 15,
    backgroundColor: "#f0f9fa",
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#1a8ea1",
  },
  aiText: {
    fontStyle: "italic",
    color: "#1a8ea1",
    fontWeight: "600",
    fontFamily: "Newsreader_600SemiBold",
  },

  homeBtn: {
    backgroundColor: "#1a8ea1",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 20,
  },
  homeBtnText: {
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
  footerText: { fontSize: 10, color: "#333" },
  socialIcons: { flexDirection: "row" },
  icon: { width: 20, height: 20, marginLeft: 15 },
});
export default styles;
