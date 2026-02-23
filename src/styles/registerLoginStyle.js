import { StyleSheet } from "react-native";
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  inner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 40,
  },
  logoText: {
    fontSize: 68,
    fontWeight: "700",
    color: "#000",
    fontFamily: "Cookie_400Regular", // Si cargas la fuente script
  },
  logoIcon: {
    width: 100,
    height: 100,
    marginLeft: 10,
    resizeMode: "contain",
  },
  authCard: {
    backgroundColor: "#e8e2d6", // El color crema de tu diseño
    width: "100%",
    maxWidth: 400,
    borderRadius: 30,
    padding: 30,
    alignItems: "center",
    // Sombra para iOS
    boxShadow: "0px 2px 4px rgba(0,0,0,0.25)",
    // Sombra para Android
    elevation: 5,
  },
  cardTitle: {
    fontSize: 24,
    color: "#333",
    marginBottom: 25,
    fontWeight: "500",
    fontFamily: "Newsreader_700Bold",
  },
  input: {
    backgroundColor: "#fff",
    width: "100%",
    height: 55,
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
    marginBottom: 15,
    color: "#333",
    fontFamily: "Newsreader_400Regular",
  },
  submitBtn: {
    backgroundColor: "#1a8ea1",
    paddingVertical: 12,
    paddingHorizontal: 45,
    borderRadius: 25,
    marginTop: 10,
  },
  submitBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "Newsreader_700Bold",
  },
  linkText: {
    color: "#1a8ea1",
    marginTop: 20,
    fontSize: 16,
    fontFamily: "Newsreader_400Regular",
  },
});
export default styles;
