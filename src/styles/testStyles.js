import { StyleSheet, Platform } from "react-native";

export default StyleSheet.create({
  // ─── Root ──────────────────────────────────────────────────────────────
  container: {
    flex: 1,
    backgroundColor: "#F0F4F8",
    height: Platform.OS === 'web' ? '100vh' : '100%',
  },

  // ─── Layout ─────────────────────────────────────────────────────────────
  mainLayout: {
    flexDirection: "row",
    height: "100%",
  },

  // ─── Sidebar (Menu) ──────────────────────────────────────────────────────
  sidebar: {
    width: 280,
    backgroundColor: "#FFFFFF",
    paddingTop: 32,
    paddingHorizontal: 20,
    borderRightWidth: 1,
    borderColor: "#E2EBF0",
    ...Platform.select({
      web: {
        boxShadow: '2px 0 8px rgba(0,0,0,0.04)',
      },
    }),
  },
  logoContainer: {
    marginBottom: 48,
    paddingLeft: 10,
  },
  logoText: {
    color: "#0d7a8a",
    fontSize: 32,
    fontFamily: "Cookie_400Regular",
  },
  menuLabel: {
    fontSize: 10,
    letterSpacing: 2,
    fontFamily: "Newsreader_700Bold",
    color: "#94A3B8",
    marginBottom: 16,
    paddingLeft: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 6,
    gap: 12,
  },
  menuItemActive: {
    backgroundColor: "#e8f7f9",
  },
  menuIcon: {
    fontSize: 18,
  },
  menuText: {
    fontSize: 15,
    fontFamily: "Newsreader_400Regular",
    color: "#64748B",
  },
  menuTextActive: {
    color: "#0d7a8a",
    fontFamily: "Newsreader_700Bold",
  },
  logoutItem: {
    marginTop: 'auto',
    marginBottom: 32,
  },

  // ─── Content Area ───────────────────────────────────────────────────────
  contentArea: {
    flex: 1,
    padding: 48,
    alignItems: "center",
  },

  // ─── Progress Header ─────────────────────────────────────────────────────
  progressHeader: {
    width: '100%',
    maxWidth: 900,
    marginBottom: 40,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  questionIndex: {
    fontSize: 14,
    fontFamily: "Newsreader_700Bold",
    color: "#64748B",
    letterSpacing: 1,
  },
  timerText: {
    fontSize: 14,
    fontFamily: "Newsreader_400Regular",
    color: "#94A3B8",
  },
  progressTrack: {
    height: 6,
    backgroundColor: "#E2E8F0",
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: "#1c94a7",
    borderRadius: 3,
  },

  // ─── Question Card ───────────────────────────────────────────────────────
  questionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 56,
    width: '100%',
    maxWidth: 900,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)',
      },
    }),
  },
  questionLabel: {
    fontSize: 12,
    fontFamily: "Newsreader_700Bold",
    color: "#1c94a7",
    letterSpacing: 2.5,
    textTransform: "uppercase",
    marginBottom: 20,
  },
  questionText: {
    fontSize: 22,
    lineHeight: 34,
    fontFamily: "Newsreader_400Regular",
    color: "#1E293B",
    marginBottom: 48,
  },

  // ─── Options ─────────────────────────────────────────────────────────────
  optionsGrid: {
    gap: 16,
  },
  optionTile: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
    borderWidth: 2,
    borderColor: "transparent",
  },
  optionTileSelected: {
    backgroundColor: "#F0FDFA",
    borderColor: "#1c94a7",
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#E2E8F0",
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionLetterSelected: {
    backgroundColor: "#1c94a7",
  },
  optionLetterText: {
    fontSize: 14,
    fontFamily: "Newsreader_700Bold",
    color: "#64748B",
  },
  optionLetterTextSelected: {
    color: "#FFFFFF",
  },
  optionText: {
    fontSize: 18,
    fontFamily: "Newsreader_400Regular",
    color: "#334155",
  },
  optionTextSelected: {
    color: "#0d7a8a",
    fontFamily: "Newsreader_700Bold",
  },

  // ─── Navigation ──────────────────────────────────────────────────────────
  navigationRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 48,
  },
  nextButton: {
    backgroundColor: "#1c94a7",
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    ...Platform.select({
      web: {
        boxShadow: '0 6px 20px rgba(28, 148, 167, 0.3)',
      },
    }),
  },
  nextButtonDisabled: {
    backgroundColor: "#94A3B8",
    opacity: 0.5,
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Newsreader_700Bold",
  },

  // ─── Loading ─────────────────────────────────────────────────────────────
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F4F8",
  },
});
