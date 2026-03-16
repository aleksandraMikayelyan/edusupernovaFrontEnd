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

// Semantic (STEM PDF button)
const SUCCESS_BG = "#f0fdf4";
const SUCCESS_BORDER = "#bbf7d0";
const SUCCESS_TEXT = "#15803d";

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

  // ─── HEADER ──────────────────────────────────────────────────────────────
  header: {
    height: 64,
    backgroundColor: OCEAN_DEEP,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    zIndex: 10,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 12px rgba(10, 95, 110, 0.15)',
      },
    }),
  },
  logoText: {
    color: WHITE,
    fontSize: 30,
    fontFamily: "Cookie_400Regular",
    letterSpacing: 1,
  },
  headerCourse: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: "Newsreader_400Regular",
    fontSize: 13,
    letterSpacing: 0.5,
  },

  // ─── READING PROGRESS BAR ────────────────────────────────────────────────
  progressTrack: {
    height: 3,
    backgroundColor: 'rgba(28, 148, 167, 0.15)',
    width: '100%',
  },
  progressFill: {
    height: 3,
    backgroundColor: OCEAN_BRIGHT,
    ...Platform.select({
      web: {
        transition: 'width 0.3s ease',
      },
    }),
  },

  // ─── TWO-COLUMN LAYOUT ───────────────────────────────────────────────────
  mainLayout: {
    flexDirection: "row",
    ...Platform.select({
      web: {
        height: 'calc(100vh - 67px)',
      },
      default: { height: '100%' },
    }),
  },

  // ─── SIDEBAR ─────────────────────────────────────────────────────────────
  sidebar: {
    width: 280,
    backgroundColor: BG_SIDEBAR,
    paddingTop: 28,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderRightWidth: 1,
    borderColor: BORDER_LIGHT,
    ...Platform.select({
      web: {
        height: 'calc(100vh - 67px)',
        overflowY: 'auto',
        boxShadow: '2px 0 12px rgba(0, 0, 0, 0.04)',
      },
    }),
  },
  sidebarLabel: {
    fontSize: 10,
    letterSpacing: 2.5,
    fontFamily: "Newsreader_700Bold",
    color: TEXT_MUTED,
    marginBottom: 16,
    paddingLeft: 6,
  },

  // PDF Formula Sheet button (STEM courses only)
  pdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SUCCESS_BG,
    borderWidth: 1,
    borderColor: SUCCESS_BORDER,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    gap: 10,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      },
    }),
  },
  pdfButtonIcon: {
    width: 18,
    height: 18,
  },
  pdfButtonText: {
    fontSize: 13,
    fontFamily: "Newsreader_700Bold",
    color: SUCCESS_TEXT,
    flex: 1,
    letterSpacing: 0.3,
  },

  // Collapsible section toggle
  sectionToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 6,
    marginBottom: 10,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  sectionToggleLabel: {
    fontSize: 10,
    letterSpacing: 2.5,
    fontFamily: "Newsreader_700Bold",
    color: TEXT_MUTED,
  },
  sectionToggleChevron: {
    fontSize: 14,
    color: TEXT_MUTED,
  },
  sectionContent: {},

  // Unit tab
  unitTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingLeft: 12,
    paddingRight: 8,
    borderRadius: 12,
    marginBottom: 4,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      },
    }),
  },
  unitTabActive: {
    backgroundColor: OCEAN_LIGHT,
    borderLeftColor: OCEAN_BRIGHT,
  },
  unitBadgeSmall: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  unitBadgeSmallActive: {
    backgroundColor: OCEAN_BRIGHT,
  },
  unitBadgeSmallText: {
    fontSize: 11,
    fontFamily: "Newsreader_700Bold",
    color: TEXT_SECONDARY,
  },
  unitBadgeSmallTextActive: {
    color: WHITE,
  },
  unitTabLabel: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Newsreader_400Regular",
    color: TEXT_SECONDARY,
    lineHeight: 19,
    letterSpacing: 0.2,
  },
  unitTabLabelActive: {
    color: OCEAN_DEEP,
    fontFamily: "Newsreader_700Bold",
  },
  activeIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: OCEAN_BRIGHT,
    marginLeft: 8,
    flexShrink: 0,
  },

  // ─── CONTENT SCROLLVIEW ──────────────────────────────────────────────────
  contentArea: {
    flex: 1,
    backgroundColor: BG_PAGE,
    ...Platform.select({
      web: {
        height: 'calc(100vh - 67px)',
        overflowY: 'auto',
        overflowX: 'hidden',
      },
    }),
  },
  scrollContent: {
    alignItems: 'stretch',
    paddingBottom: 80,
  },

  // ─── ARTICLE WRAPPER (FULL WIDTH) ────────────────────────────────────────
  articleWrapper: {
    flex: 1,
    backgroundColor: BG_CARD,
    minHeight: '100%',
  },

  // ─── HERO (SLIM BANNER) ──────────────────────────────────────────────────
  articleHero: {
    paddingHorizontal: 80,
    paddingVertical: 32,
    ...Platform.select({
      web: {
        background: 'linear-gradient(135deg, #062f37 0%, #0a5f6e 40%, #1c94a7 80%, #2bbacf 100%)',
      },
      default: { backgroundColor: OCEAN_DEEP },
    }),
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  heroBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 24,
  },
  heroBadgeText: {
    fontSize: 11,
    fontFamily: "Newsreader_700Bold",
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 1.5,
  },
  heroReadingTime: {
    fontSize: 13,
    fontFamily: "Newsreader_400Regular",
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: 0.3,
  },

  // Title block — white background, dark text
  articleTitleBlock: {
    backgroundColor: BG_CARD,
    paddingTop: 56,
    paddingHorizontal: 80,
    paddingBottom: 0,
  },
  articleTitle: {
    fontSize: 48,
    fontFamily: "Newsreader_700Bold",
    color: TEXT_PRIMARY,
    lineHeight: 58,
    marginBottom: 20,
    letterSpacing: -0.8,
  },
  blueBar: {
    height: 4,
    width: 60,
    backgroundColor: OCEAN_BRIGHT,
    marginBottom: 0,
    borderRadius: 4,
  },

  // ─── ARTICLE BODY ────────────────────────────────────────────────────────
  articleBody: {
    paddingHorizontal: 80,
    paddingVertical: 60,
  },

  // Section heading: large ordinal + divider line + text
  sectionHeadingBlock: {
    marginTop: 56,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  sectionOrdinal: {
    fontSize: 52,
    fontFamily: "Newsreader_700Bold",
    color: '#e2f4f7',
    lineHeight: 52,
    flexShrink: 0,
  },
  sectionDivider: {
    height: 2,
    width: 36,
    backgroundColor: OCEAN_BRIGHT,
    borderRadius: 2,
    flexShrink: 0,
  },
  sectionHeadingText: {
    fontSize: 13,
    fontFamily: "Newsreader_700Bold",
    color: OCEAN_BRIGHT,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    flex: 1,
  },

  // Subheading
  subheading: {
    fontSize: 24,
    fontFamily: "Newsreader_700Bold",
    color: TEXT_PRIMARY,
    marginTop: 36,
    marginBottom: 14,
    letterSpacing: -0.3,
  },

  // Body text
  bodyText: {
    fontSize: 18,
    lineHeight: 32,
    fontFamily: "Newsreader_400Regular",
    color: TEXT_SECONDARY,
    marginBottom: 8,
    ...Platform.select({
      web: { wordBreak: 'break-word' },
    }),
  },
  emphasisText: {
    fontSize: 18,
    lineHeight: 32,
    fontFamily: "Newsreader_700Bold",
    color: OCEAN_DEEP,
  },

  // Bullet
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bulletDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: OCEAN_BRIGHT,
    marginTop: 13,
    marginRight: 16,
    flexShrink: 0,
  },
  bulletText: {
    flex: 1,
    fontSize: 18,
    lineHeight: 32,
    fontFamily: "Newsreader_400Regular",
    color: TEXT_SECONDARY,
  },

  // Spacer
  spacer: { height: 16 },

  // ─── CALLOUT BOXES ───────────────────────────────────────────────────────
  callout: {
    borderRadius: 16,
    borderLeftWidth: 4,
    paddingVertical: 20,
    paddingHorizontal: 24,
    marginVertical: 28,
  },
  calloutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  calloutIcon: {
    width: 20,
    height: 20,
  },
  calloutLabel: {
    fontSize: 11,
    fontFamily: "Newsreader_700Bold",
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  calloutText: {
    fontSize: 17,
    lineHeight: 28,
    fontFamily: "Newsreader_400Regular",
    color: "#374151",
  },

  // ─── CTA SECTION ─────────────────────────────────────────────────────────
  ctaSection: {
    alignItems: 'center',
    paddingHorizontal: 80,
    paddingBottom: 80,
  },
  ctaDivider: {
    width: '100%',
    height: 1,
    backgroundColor: BORDER_LIGHT,
    marginBottom: 44,
  },
  ctaHint: {
    fontSize: 15,
    fontFamily: "Newsreader_400Regular",
    color: TEXT_MUTED,
    marginBottom: 24,
    letterSpacing: 0.3,
  },
  knowledgeButton: {
    backgroundColor: OCEAN_BRIGHT,
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 50,
    ...Platform.select({
      web: {
        boxShadow: '0 8px 24px rgba(28, 148, 167, 0.4)',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      },
    }),
  },
  knowledgeButtonText: {
    color: WHITE,
    fontFamily: "Newsreader_700Bold",
    fontSize: 17,
    letterSpacing: 0.5,
  },

  // ─── LOADING ─────────────────────────────────────────────────────────────
  loadingCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BG_PAGE,
  },
});