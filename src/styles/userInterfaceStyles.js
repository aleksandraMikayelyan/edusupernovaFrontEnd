import { StyleSheet, Dimensions } from "react-native";
const { width } = Dimensions.get("window");
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", position: "relative" },
  navbar: {
    height: 100,
    backgroundColor: "#1c94a7c4",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },
  navLeft: { flexDirection: "row", alignItems: "center" },
  navLogo: {
    color: "#fff",
    fontSize: 45,
    fontWeight: "bold",
    fontFamily: "Cookie_400Regular",
  },
  navIcon: { width: 30, height: 30, marginLeft: 8 },
  navLinks: { flexDirection: "row", gap: 15 },
  linkText: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "500",
    fontFamily: "Newsreader_400Regular",
  },
  profileCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },

  paddingSection: { padding: 20, zIndex: 2 },
  sectionTitle: {
    fontSize: 35,
    fontWeight: "600",
    marginBottom: 20,
    fontFamily: "Newsreader_700Bold",
  },
  examScroll: { flexDirection: "row" },
  examCard: {
    backgroundColor: "#e8e2d6",
    width: 150,
    height: 150,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  examCardActive: {
    borderWidth: 2,
    borderColor: "#1a8ea1",
  },
  examCardText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2b2727",
    fontFamily: "Newsreader_700Bold",
  },
  helperText: {
    color: "#888",
    fontStyle: "italic",
    marginTop: 15,
    fontSize: 12,
  },

  selectedTitle: {
    fontSize: 32,
    fontWeight: "700",
    marginVertical: 20,
    fontFamily: "Newsreader_700Bold",
  },
  subjectsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    gap: 20,
  },
  subCard: {
    width: (width - 60) / 4.5, // Ajuste para que quepan 2 o 3
    backgroundColor: "#e8e2d6",
    borderRadius: 25,
    padding: 15,
    alignItems: "center",
  },
  iconContainer: { height: 80, justifyContent: "center", marginBottom: 10 },
  subIcon: { width: 60, height: 60, resizeMode: "contain" },
  subText: {
    fontWeight: "600",
    textAlign: "center",
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
