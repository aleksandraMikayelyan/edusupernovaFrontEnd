import { StyleSheet, Platform } from "react-native";

// ═══════════════════════════════════════════════════════════════════════════
// UNIFIED DESIGN SYSTEM - Edusupernova
// ═══════════════════════════════════════════════════════════════════════════

// Primary Brand Colors
const OCEAN_DEEP = "#0a5f6e";      // Primary brand color
const OCEAN_BRIGHT = "#1c94a7";    // Interactive elements
const OCEAN_LIGHT = "#e8f7f9";     // Backgrounds, highlights

// Neutrals
const WHITE = "#ffffff";
const TEXT_PRIMARY = "#0F172A";
const TEXT_SECONDARY = "#64748B";
const TEXT_MUTED = "#94A3B8";
const BG_PAGE = "#F0F4F8";
const BG_CARD = "#FFFFFF";
const BG_SIDEBAR = "#FFFFFF";
const BORDER_LIGHT = "#E2EBF0";
const BORDER_MEDIUM = "#CBD5E1";

// Semantic
const ERROR_TEXT = "#EF4444";

// ═══════════════════════════════════════════════════════════════════════════

export default StyleSheet.create({
  // ─── ROOT ────────────────────────────────────────────────────────────────
  container: {
    flex: 1,
    backgroundColor: BG_PAGE,
    ...Platform.select({
      web: { height: '100vh' },
    }),
  },

  // ─── LAYOUT ──────────────────────────────────────────────────────────────
  mainLayout: {
    flexDirection: "row",
    height: "100%",
  },

  // ─── SIDEBAR (MENU) ──────────────────────────────────────────────────────
  sidebar: {
    width: 280,
    backgroundColor: BG_SIDEBAR,
    paddingTop: 32,
    paddingHorizontal: 20,
    borderRightWidth: 1,
    borderColor: BORDER_LIGHT,
    ...Platform.select({
      web: {
        boxShadow: '2px 0 12px rgba(0, 0, 0, 0.04)',
      },
    }),
  },
  logoContainer: {
    marginBottom: 56,
    paddingLeft: 10,
  },
  logoText: {
    color: OCEAN_DEEP,
    fontSize: 32,
    fontFamily: "Cookie_400Regular",
    letterSpacing: 0.5,
  },
  menuLabel: {
    fontSize: 10,
    letterSpacing: 2.5,
    fontFamily: "Newsreader_700Bold",
    color: TEXT_MUTED,
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
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
      },
    }),
  },
  menuItemActive: {
    backgroundColor: OCEAN_LIGHT,
  },
  menuIcon: {
    width: 20,
    height: 20,
  },
  menuText: {
    fontSize: 15,
    fontFamily: "Newsreader_400Regular",
    color: TEXT_SECONDARY,
    letterSpacing: 0.2,
  },
  menuTextActive: {
    color: OCEAN_DEEP,
    fontFamily: "Newsreader_700Bold",
  },
  logoutItem: {
    marginTop: 'auto',
    marginBottom: 32,
  },

  // ─── CONTENT AREA ────────────────────────────────────────────────────────
  contentArea: {
    flex: 1,
    padding: 48,
    alignItems: "center",
    ...Platform.select({
      web: {
        overflowY: 'auto',
      },
    }),
  },

  // ─── PROGRESS HEADER ─────────────────────────────────────────────────────
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
    fontSize: 13,
    fontFamily: "Newsreader_700Bold",
    color: TEXT_SECONDARY,
    letterSpacing: 1.5,
  },
  timerText: {
    fontSize: 14,
    fontFamily: "Newsreader_400Regular",
    color: TEXT_MUTED,
    letterSpacing: 0.3,
  },
  progressTrack: {
    height: 6,
    backgroundColor: BORDER_LIGHT,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: OCEAN_BRIGHT,
    borderRadius: 3,
    ...Platform.select({
      web: {
        transition: 'width 0.3s ease',
      },
    }),
  },

  // ─── QUESTION CARD ───────────────────────────────────────────────────────
  questionCard: {
    backgroundColor: BG_CARD,
    borderRadius: 24,
    padding: 56,
    width: '100%',
    maxWidth: 900,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    ...Platform.select({
      web: {
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.04)',
      },
    }),
  },
  questionLabel: {
    fontSize: 11,
    fontFamily: "Newsreader_700Bold",
    color: OCEAN_BRIGHT,
    letterSpacing: 2.5,
    textTransform: "uppercase",
    marginBottom: 20,
  },
  questionText: {
    fontSize: 22,
    lineHeight: 36,
    fontFamily: "Newsreader_400Regular",
    color: TEXT_PRIMARY,
    marginBottom: 48,
    letterSpacing: -0.2,
  },

  // ─── OPTIONS (MULTIPLE CHOICE) ───────────────────────────────────────────
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
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      },
    }),
  },
  optionTileSelected: {
    backgroundColor: OCEAN_LIGHT,
    borderColor: OCEAN_BRIGHT,
  },
  optionLetter: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: BORDER_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 18,
    flexShrink: 0,
  },
  optionLetterSelected: {
    backgroundColor: OCEAN_BRIGHT,
  },
  optionLetterText: {
    fontSize: 14,
    fontFamily: "Newsreader_700Bold",
    color: TEXT_SECONDARY,
  },
  optionLetterTextSelected: {
    color: WHITE,
  },
  optionText: {
    fontSize: 18,
    fontFamily: "Newsreader_400Regular",
    color: TEXT_PRIMARY,
    flex: 1,
    lineHeight: 27,
  },
  optionTextSelected: {
    color: OCEAN_DEEP,
    fontFamily: "Newsreader_600SemiBold",
  },

  // ─── OPEN-ENDED TEXT INPUT ───────────────────────────────────────────────
  openEndedContainer: {
    width: "100%",
    minHeight: 400,
  },
  openEndedInput: {
    backgroundColor: "#F8FAFC",
    borderWidth: 2,
    borderColor: BORDER_MEDIUM,
    borderRadius: 16,
    padding: 24,
    fontSize: 18,
    fontFamily: "Newsreader_400Regular",
    color: TEXT_PRIMARY,
    height: 350,
    lineHeight: 30,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
        transition: 'border-color 0.2s ease',
        resize: 'vertical',
      },
    }),
  },
  openEndedInputFocused: {
    borderColor: OCEAN_BRIGHT,
  },
  wordCountContainer: {
    marginTop: 12,
    alignItems: "flex-end",
  },
  wordCountText: {
    fontSize: 13,
    fontFamily: "Newsreader_700Bold",
    letterSpacing: 0.5,
  },
  wordCountValid: {
    color: OCEAN_BRIGHT,
  },
  wordCountInvalid: {
    color: ERROR_TEXT,
  },

  // ─── NAVIGATION ──────────────────────────────────────────────────────────
  navigationRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 48,
  },
  nextButton: {
    backgroundColor: OCEAN_BRIGHT,
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    ...Platform.select({
      web: {
        boxShadow: '0 8px 24px rgba(28, 148, 167, 0.3)',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      },
    }),
  },
  nextButtonDisabled: {
    backgroundColor: TEXT_MUTED,
    opacity: 0.5,
    ...Platform.select({
      web: {
        cursor: 'not-allowed',
        boxShadow: 'none',
      },
    }),
  },
  nextButtonText: {
    color: WHITE,
    fontSize: 16,
    fontFamily: "Newsreader_700Bold",
    letterSpacing: 0.5,
  },

  // ─── LOADING ─────────────────────────────────────────────────────────────
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BG_PAGE,
  },
});