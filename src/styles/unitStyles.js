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
  logoSmall: {
    color: "#fff",
    fontSize: 45,
    fontWeight: "bold",
    fontFamily: "Cookie_400Regular",
  },
  navLinks: { flexDirection: "row", gap: 15 },
  navText: { color: "#fff", fontSize: 20, fontFamily: "Newsreader_400Regular" },
  profilePlaceholder: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#fff",
  },

  mainLayout: { flex: 1, flexDirection: "row" },

  // Sidebar
  sidebar: {
    width: "25%",
    backgroundColor: "#fff",
    padding: 15,
    borderRightWidth: 1,
    borderRightColor: "#eee",
  },
  subjectTitle: {
    fontSize: 28,
    fontWeight: "bold",
    padding: 20,
    marginBottom: 20,
    color: "#000",
    fontFamily: "Newsreader_400Bold",
  },
  unitButton: { padding: 12, borderRadius: 10, marginBottom: 10 },
  unitButtonActive: { backgroundColor: "#1a8ea1" },
  unitButtonInactive: { backgroundColor: "#e0e0e0" },
  unitButtonText: {
    fontSize: 20,
    fontWeight: "500",
    textAlign: "center",
    fontFamily: "Newsreader_400Bold",
  },
  textWhite: { color: "#fff" },
  textGrey: { color: "#555" },
  downloadBtn: {
    backgroundColor: "#bdbdbd",
    padding: 15,
    borderRadius: 20,
    marginTop: 20,
    alignItems: "center",
  },
  downloadBtnText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1b1b1b",
    fontFamily: "Newsreader_400Regular",
  },

  // Content Area
  contentArea: { width: "65%", backgroundColor: "#fff" },
  scrollContent: { padding: 25 },
  unitTitle: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    color: "#000",
    fontFamily: "Newsreader_400Bold",
  },
  textContent: {
    fontSize: 15,
    lineHeight: 24,
    color: "#333",
    textAlign: "justify",
    fontFamily: "Newsreader_400Regular",
  },

  actionContainer: { alignItems: "flex-end", marginTop: 40 },
  checkKnowledgeBtn: {
    backgroundColor: "#8da9a6",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 20,
  },
  checkKnowledgeText: {
    color: "#292929",
    fontSize: 14,
    fontFamily: "Newsreader_400Bold",
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
