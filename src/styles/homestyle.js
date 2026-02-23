import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  // HEADER & HERO
  headerOverlay: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 40,
    width: "100%",
    // Cambiamos 'absolute' por una posición relativa o eliminamos el zIndex innecesario
    // si va dentro de un ImageBackground.
    // En RN, los hijos de ImageBackground ya se pintan "encima".
    position: "relative",
    height: 100, // Le damos un alto definido para que no ocupe toda la pantalla
  },
  logoText: {
    fontSize: 45,
    fontWeight: "bold",
    color: "#333",
    fontFamily: "Cookie_400Regular",
  },
  tagline: {
    fontSize: 14,
    color: "#333",
    marginTop: 5,
    fontFamily: "Newsreader_400Regular",
  },

  authButtons: {
    flexDirection: "row",
    alignItems: "center",
    zIndex: 20, // Aseguramos que los botones estén arriba
  },

  loginBtn: {
    backgroundColor: "#1a8ea1",
    paddingHorizontal: 30,
    paddingVertical: 10, // Un poquito más de área de clic
    borderRadius: 35,
    marginRight: 10,
  },
  loginBtnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Newsreader_700Bold",
  },

  registerBtn: {
    backgroundColor: "#333",
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 35,
  },
  registerBtnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Newsreader_700Bold",
  },

  // SECCIÓN "RESULTS THAT SPEAK"
  mainResultsRow: {
    flexDirection: "row",
    minHeight: 250, // Mejor usar minHeight que height fijo
  },
  leftTextCol: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 28, // Bajamos un poco el tamaño para evitar desbordamientos en pantallas pequeñas
    fontWeight: "bold",
    marginBottom: 10,
    color: "#000",
    fontFamily: "Newsreader_700Bold",
  },
  bulletText: {
    fontSize: 13,
    color: "#444",
    marginBottom: 8,
    lineHeight: 18,
    fontFamily: "Newsreader_400Regular",
  },

  centerCardCol: {
    flex: 1,
    backgroundColor: "#1a8ea1",
    padding: 10,
    height: undefined,
    justifyContent: "center",
    width: 200,
    marginBottom: 0,
  },
  tealTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 8,
    fontFamily: "Newsreader_700Bold",
  },
  tealItem: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 5,
    fontFamily: "Newsreader_400Regular",
  },

  rightImageCol: {
    flex: 1,
  },
  sideImage: { width: "100%", height: 350, aspectRatio: 1 },

  // SECCIÓN BIBLIOTECA
  splitSection: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    justifyContent: "flex-end",
  },
  libraryImage: { display: "none" },

  tanCard: {
    backgroundColor: "#e8e2d6",
    padding: 20,
    justifyContent: "center",
    width: 260, // o el tamaño que quieras
    marginLeft: "auto", // esto la empuja a la derecha
  },
  tanItem: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
    fontWeight: "500",
    fontFamily: "Newsreader_400Bold",
  },

  // METODOLOGÍA
  methodContainer: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  methodTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    fontFamily: "Newsreader_400Bold",
  },
  methodText: {
    fontSize: 13,
    textAlign: "center",
    color: "#555",
    lineHeight: 20,
    fontFamily: "Newsreader_400Regular",
  },

  // CTA FINAL
  ctaSection: { alignItems: "center", paddingVertical: 50 },
  logoBig: {
    fontSize: 45,
    fontWeight: "bold",
    marginBottom: 10,
    fontFamily: "Cookie_400Regular",
  },
  ctaButton: {
    backgroundColor: "#1a8ea1",
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
    elevation: 3, // Sombra en Android para indicar que es clicable
    shadowColor: "#000", // Sombra en iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
  },
  ctaButtonText: {
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
