import { StyleSheet, Platform } from "react-native";

// ═══════════════════════════════════════════════════════════════════════════
// UNIFIED DESIGN SYSTEM - Edusupernova
// ═══════════════════════════════════════════════════════════════════════════

// Primary Brand Colors
const OCEAN_DEEP = "#0a5f6e";      // Primary brand color
const OCEAN_BRIGHT = "#1c94a7";    // Interactive elements
const OCEAN_LIGHT = "#e8f7f9";     // Backgrounds, highlights

// Semantic Colors
const SUCCESS_BG = "#edfaf4";
const SUCCESS_TEXT = "#1a7a4a";
const SUCCESS_BORDER = "#2ecc71";

const WARNING_BG = "#fff8e6";
const WARNING_TEXT = "#a06a00";
const WARNING_BORDER = "#f5a623";

const ERROR_BG = "#fff0f0";
const ERROR_TEXT = "#b02020";
const ERROR_BORDER = "#e74c3c";

const CORRECT_BG = "#f0fdf4";
const CORRECT_TEXT = "#15803d";
const CORRECT_BORDER = "#86efac";

// Neutrals
const WHITE = "#ffffff";
const TEXT_PRIMARY = "#0F172A";
const TEXT_SECONDARY = "#64748B";
const TEXT_MUTED = "#94A3B8";
const BG_PAGE = "#F0F4F8";
const BG_CARD = "#FFFFFF";
const BORDER_LIGHT = "#E2EBF0";
const BORDER_MEDIUM = "#CBD5E1";

// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  // ─── CONTAINERS ──────────────────────────────────────────────────────────
  container: {
    flex: 1,
    backgroundColor: BG_PAGE,
    ...Platform.select({
      web: { height: '100vh' },
    }),
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: BG_PAGE,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    backgroundColor: BG_PAGE,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  // ─── HEADER ──────────────────────────────────────────────────────────────
  header: {
    height: 64,
    backgroundColor: OCEAN_DEEP,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 32,
    zIndex: 10,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 12px rgba(10, 95, 110, 0.15)',
      },
    }),
  },
  logo: {
    color: WHITE,
    fontSize: 30,
    fontWeight: "bold",
    fontFamily: "Cookie_400Regular",
    letterSpacing: 1,
  },
  navLinks: {
    flexDirection: "row",
    gap: 20,
  },
  navItem: {
    color: "rgba(255,255,255,0.9)",
    fontWeight: "500",
    fontFamily: "Newsreader_600SemiBold",
    fontSize: 15,
    letterSpacing: 0.3,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'opacity 0.2s ease',
      },
    }),
  },
  profileCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
  },

  // ─── SCROLL CONTAINER ────────────────────────────────────────────────────
  scrollView: {
    flex: 1,
    ...Platform.select({
      web: {
        height: 'calc(100vh - 64px - 61px)', // viewport height - header - footer
        overflowY: 'auto',
      },
    }),
  },
  scrollContainer: {
    padding: 48,
    paddingTop: 56,
    alignItems: 'center',
  },

  // ─── HERO RESULTS CARD ───────────────────────────────────────────────────
  heroCard: {
    backgroundColor: WHITE,
    borderRadius: 24,
    padding: 56,
    width: '100%',
    maxWidth: 900,
    alignItems: "center",
    marginBottom: 48,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    ...Platform.select({
      web: {
        boxShadow: '0 8px 32px rgba(28, 148, 167, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
      },
    }),
  },
  heroTitle: {
    fontSize: 42,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    fontFamily: "Newsreader_700Bold",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 16,
    color: TEXT_SECONDARY,
    fontFamily: "Newsreader_400Regular",
    marginBottom: 32,
    letterSpacing: 0.2,
  },
  scorePill: {
    borderWidth: 3,
    borderRadius: 70,
    paddingVertical: 20,
    paddingHorizontal: 48,
    alignItems: "center",
    minWidth: 180,
  },
  scoreValue: {
    fontSize: 52,
    fontWeight: "700",
    fontFamily: "Newsreader_700Bold",
    lineHeight: 60,
    letterSpacing: -1,
  },
  scoreLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginTop: 4,
    fontFamily: "Newsreader_700Bold",
  },

  // ─── SECTION CONTAINER ───────────────────────────────────────────────────
  feedbackSection: {
    width: '100%',
    maxWidth: 900,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: TEXT_MUTED,
    textTransform: "uppercase",
    letterSpacing: 2.5,
    marginBottom: 20,
    fontFamily: "Newsreader_700Bold",
  },

  // ─── QUESTION CARD (MULTIPLE CHOICE) ─────────────────────────────────────
  questionCard: {
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 32,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      },
    }),
  },
  questionCardCorrect: {
    borderColor: CORRECT_BORDER,
    borderWidth: 2,
  },
  questionCardIncorrect: {
    borderColor: ERROR_BORDER,
    borderWidth: 2,
  },

  // Question header
  questionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  questionBadge: {
    backgroundColor: OCEAN_LIGHT,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  questionBadgeText: {
    color: OCEAN_DEEP,
    fontSize: 11,
    fontWeight: "700",
    fontFamily: "Newsreader_700Bold",
    letterSpacing: 1.5,
  },
  questionLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: TEXT_PRIMARY,
    fontFamily: "Newsreader_600SemiBold",
    letterSpacing: 0.3,
  },

  // Question content
  questionContent: {
    fontSize: 17,
    lineHeight: 28,
    color: TEXT_PRIMARY,
    fontFamily: "Newsreader_400Regular",
    marginBottom: 20,
  },

  // Answer display (for multiple choice)
  answerSection: {
    gap: 12,
  },
  answerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  answerRowYourAnswer: {
    backgroundColor: ERROR_BG,
    borderColor: ERROR_BORDER,
  },
  answerRowCorrect: {
    backgroundColor: CORRECT_BG,
    borderColor: CORRECT_BORDER,
  },
  answerLabel: {
    fontSize: 12,
    fontFamily: "Newsreader_700Bold",
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    flexShrink: 0,
  },
  answerLabelYours: {
    color: ERROR_TEXT,
  },
  answerLabelCorrect: {
    color: CORRECT_TEXT,
  },
  answerText: {
    fontSize: 16,
    fontFamily: "Newsreader_400Regular",
    lineHeight: 24,
    flex: 1,
  },
  answerTextYours: {
    color: ERROR_TEXT,
  },
  answerTextCorrect: {
    color: CORRECT_TEXT,
  },

  // Correct indicator (checkmark)
  correctIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: CORRECT_BG,
    borderRadius: 10,
    marginTop: 12,
  },
  correctIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: CORRECT_TEXT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  correctIconText: {
    color: WHITE,
    fontSize: 12,
    fontWeight: '700',
  },
  correctText: {
    fontSize: 14,
    fontFamily: "Newsreader_600SemiBold",
    color: CORRECT_TEXT,
  },

  // ─── AI FEEDBACK BOX (OPEN-ENDED) ────────────────────────────────────────
  aiBox: {
    backgroundColor: OCEAN_LIGHT,
    borderRadius: 16,
    padding: 24,
    borderLeftWidth: 4,
    borderLeftColor: OCEAN_BRIGHT,
    marginTop: 4,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(28, 148, 167, 0.08)',
      },
    }),
  },
  aiBoxHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  aiDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: OCEAN_BRIGHT,
  },
  aiBoxTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: OCEAN_DEEP,
    textTransform: "uppercase",
    letterSpacing: 2,
    fontFamily: "Newsreader_700Bold",
  },
  aiText: {
    fontSize: 16,
    lineHeight: 26,
    color: OCEAN_DEEP,
    fontFamily: "Newsreader_400Regular",
  },

  // ─── USER ANSWER DISPLAY (OPEN-ENDED) ───────────────────────────────────
  userAnswerBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BORDER_MEDIUM,
  },
  userAnswerLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: TEXT_MUTED,
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 10,
    fontFamily: "Newsreader_700Bold",
  },
  userAnswerText: {
    fontSize: 16,
    lineHeight: 26,
    color: TEXT_PRIMARY,
    fontFamily: "Newsreader_400Regular",
  },

  // ─── ACTION BUTTONS ──────────────────────────────────────────────────────
  actionButton: {
    backgroundColor: OCEAN_BRIGHT,
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 50,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 40,
    ...Platform.select({
      web: {
        boxShadow: '0 8px 24px rgba(28, 148, 167, 0.3)',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      },
    }),
  },
  actionButtonText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Newsreader_700Bold",
    letterSpacing: 0.5,
  },

  // ─── LOADING STATE ───────────────────────────────────────────────────────
  loadingCard: {
    backgroundColor: WHITE,
    borderRadius: 24,
    padding: 56,
    alignItems: "center",
    width: "90%",
    maxWidth: 500,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    ...Platform.select({
      web: {
        boxShadow: '0 12px 48px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    fontFamily: "Newsreader_700Bold",
    marginTop: 24,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  loadingSubtitle: {
    fontSize: 15,
    color: TEXT_SECONDARY,
    fontFamily: "Newsreader_400Regular",
    textAlign: "center",
    letterSpacing: 0.2,
  },

  // ─── ERROR STATE ─────────────────────────────────────────────────────────
  errorCard: {
    backgroundColor: WHITE,
    borderRadius: 24,
    padding: 48,
    alignItems: "center",
    width: "90%",
    maxWidth: 500,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    ...Platform.select({
      web: {
        boxShadow: '0 12px 48px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  errorIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: ERROR_BG,
    borderWidth: 3,
    borderColor: ERROR_BORDER,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  errorIconText: {
    fontSize: 28,
    color: ERROR_TEXT,
    fontWeight: "700",
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    fontFamily: "Newsreader_700Bold",
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  errorSubtitle: {
    fontSize: 15,
    color: TEXT_SECONDARY,
    textAlign: "center",
    fontFamily: "Newsreader_400Regular",
    marginBottom: 32,
    lineHeight: 24,
    letterSpacing: 0.2,
  },

  // ─── EMPTY STATE ─────────────────────────────────────────────────────────
  emptyState: {
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 48,
    alignItems: "center",
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    marginBottom: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: TEXT_SECONDARY,
    fontFamily: "Newsreader_400Regular",
    textAlign: 'center',
  },

  // ─── FOOTER ──────────────────────────────────────────────────────────────
  footer: {
    backgroundColor: WHITE,
    borderTopWidth: 1,
    borderTopColor: BORDER_LIGHT,
    paddingVertical: 20,
    paddingHorizontal: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontSize: 13,
    color: TEXT_MUTED,
    fontFamily: "Newsreader_400Regular",
    letterSpacing: 0.2,
  },
  socialIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    width: 20,
    height: 20,
    marginLeft: 16,
    opacity: 0.6,
  },
});

export default styles;