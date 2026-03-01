import { StyleSheet, Platform } from "react-native";

export default StyleSheet.create({
  // 1. CONTENEDOR PRINCIPAL
  container: { 
    flex: 1, 
    backgroundColor: "#F4F7F8",
    // En web, forzamos que ocupe toda la altura de la ventana
    height: Platform.OS === 'web' ? '100vh' : '100%',
  },

  // 2. HEADER
  header: { 
    height: 80, 
    backgroundColor: "#1c94a7", 
    justifyContent: 'center', 
    paddingHorizontal: 30,
    zIndex: 100, // Asegura que el logo siempre esté arriba
  },
  logoText: { 
    color: "#FFFFFF", 
    fontSize: 36, 
    fontFamily: "Cookie_400Regular" 
  },
  
  // 3. LAYOUT DIVIDIDO (Sidebar + Contenido)
  mainLayout: { 
    flex: 1, 
    flexDirection: "row",
    height: Platform.OS === 'web' ? 'calc(100vh - 80px)' : '100%',
  },
  
  // 4. SIDEBAR (Izquierda)
  sidebar: { 
    width: 300, 
    backgroundColor: "#FFFFFF", 
    padding: 20, 
    borderRightWidth: 1, 
    borderColor: "#E2E8F0",
    // En web esto asegura que la sidebar no se mueva con el contenido
    height: '100%',
  },
  courseTitle: { 
    fontSize: 18, 
    fontFamily: "Newsreader_700Bold", 
    marginBottom: 20,
    color: "#1A202C"
  },
  unitTab: { 
    padding: 14, 
    borderRadius: 10, 
    marginBottom: 8 
  },
  unitTabActive: { 
    backgroundColor: "#1c94a7" 
  },
  textActive: { 
    color: "#FFFFFF", 
    fontFamily: "Newsreader_400Regular",
    fontWeight: "600"
  },
  textInactive: { 
    color: "#5F6D7A", 
    fontFamily: "Newsreader_400Regular" 
  },

  // 5. ÁREA DE LECTURA (Derecha)
  contentArea: { 
    flex: 1, 
    backgroundColor: "#F4F7F8",
    width: '100%',
  },
  scrollContent: { 
    flexGrow: 1, 
    alignItems: 'center', 
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  
  // 6. TARJETA DEL ARTÍCULO (El "Papel")
  articleCard: { 
    backgroundColor: "#FFFFFF", 
    padding: 60, 
    borderRadius: 20, 
    width: '95%', 
    // REEMPLAZO DE SOMBRAS: Usamos borde para evitar parpadeo de GPU
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  articleTitle: { 
    fontSize: 34, 
    fontFamily: "Newsreader_700Bold", 
    color: "#1A202C", 
    marginBottom: 10 
  },
  blueBar: { 
    height: 5, 
    width: 80, 
    backgroundColor: "#1c94a7", 
    marginBottom: 35, 
    borderRadius: 10 
  },

  // 7. TEXTO DEL ARCHIVO .TXT
  textWrapper: {
    width: '100%',
  },
  textContent: { 
    fontSize: 20, 
    lineHeight: 34, 
    fontFamily: "Newsreader_400Regular", 
    color: "#2D3748", 
    textAlign: 'justify',
    // CRÍTICO: Mantiene el formato de unit1.txt (listas, tabulaciones, etc)
    ...Platform.select({
      web: {
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      },
      default: {
        // En móvil React Native lo maneja distinto
      }
    })
  },

  // 8. BOTÓN DE KNOWLEDGE
  knowledgeButton: { 
    backgroundColor: "#1c94a7", 
    paddingVertical: 18, 
    paddingHorizontal: 35,
    borderRadius: 50, 
    alignSelf: 'center', 
    marginTop: 60,
    // Una sombra muy sutil que no afecta el rendimiento
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 2,
  },
  knowledgeButtonText: { 
    color: "#FFFFFF", 
    fontFamily: "Newsreader_700Bold", 
    fontSize: 16 
  },
  
  // 9. ESTADOS DE CARGA
  loadingCenter: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: "#F4F7F8"
  }
});