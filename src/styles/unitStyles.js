import { StyleSheet, Platform } from "react-native";

export default StyleSheet.create({

  // ─── Root ────────────────────────────────────────────────────────────────
  container: {
    flex: 1,
    backgroundColor: "#EAEFF4",
    height: Platform.OS === 'web' ? '100vh' : '100%',
  },

  // ─── Header ──────────────────────────────────────────────────────────────
  header: {
    height: 64,
    backgroundColor: "#0a5f6e",
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    zIndex: 10,
  },
  logoText: {
    color: "#FFFFFF",
    fontSize: 30,
    fontFamily: "Cookie_400Regular",
    letterSpacing: 1,
  },
  headerCourse: {
    color: 'rgba(255,255,255,0.6)',
    fontFamily: "Newsreader_400Regular",
    fontSize: 13,
    letterSpacing: 0.5,
  },

  // ─── Reading Progress Bar ────────────────────────────────────────────────
  progressTrack: {
    height: 3,
    backgroundColor: 'rgba(28,148,167,0.15)',
    width: '100%',
  },
  progressFill: {
    height: 3,
    backgroundColor: '#1c94a7',
  },

  // ─── Two-column layout ───────────────────────────────────────────────────
  mainLayout: {
    flexDirection: "row",
    height: Platform.OS === 'web' ? 'calc(100vh - 67px)' : '100%',
  },

  // ─── Sidebar ─────────────────────────────────────────────────────────────
  sidebar: {
    width: 272,
    backgroundColor: "#FFFFFF",
    paddingTop: 28,
    paddingHorizontal: 14,
    paddingBottom: 16,
    borderRightWidth: 1,
    borderColor: "#DDE4EC",
    height: Platform.OS === 'web' ? 'calc(100vh - 67px)' : '100%',
    overflow: 'hidden',
  },
  sidebarLabel: {
    fontSize: 10,
    letterSpacing: 2.5,
    fontFamily: "Newsreader_700Bold",
    color: "#94A3B8",
    marginBottom: 16,
    paddingLeft: 6,
  },

  // PDF Formula Sheet button (STEM courses only)
  pdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
    gap: 8,
  },
  pdfButtonIcon: { fontSize: 16 },
  pdfButtonText: {
    fontSize: 13,
    fontFamily: "Newsreader_700Bold",
    color: '#15803d',
    flex: 1,
  },

  // Collapsible section toggle
  sectionToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 6,
    marginBottom: 8,
  },
  sectionToggleLabel: {
    fontSize: 10,
    letterSpacing: 2.5,
    fontFamily: "Newsreader_700Bold",
    color: "#94A3B8",
  },
  sectionToggleChevron: {
    fontSize: 14,
    color: "#94A3B8",
  },
  sectionContent: {},

  // Unit tab
  unitTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingLeft: 10,
    paddingRight: 6,
    borderRadius: 10,
    marginBottom: 3,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  unitTabActive: {
    backgroundColor: '#edf9fb',
    borderLeftColor: '#1c94a7',
  },
  unitBadgeSmall: {
    width: 26,
    height: 26,
    borderRadius: 7,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    flexShrink: 0,
  },
  unitBadgeSmallActive: {
    backgroundColor: '#1c94a7',
  },
  unitBadgeSmallText: {
    fontSize: 11,
    fontFamily: "Newsreader_700Bold",
    color: '#64748B',
  },
  unitBadgeSmallTextActive: {
    color: '#FFFFFF',
  },
  unitTabLabel: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Newsreader_400Regular",
    color: "#64748B",
    lineHeight: 19,
  },
  unitTabLabelActive: {
    color: "#0a5f6e",
    fontFamily: "Newsreader_700Bold",
  },
  activeIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1c94a7',
    marginLeft: 6,
    flexShrink: 0,
  },

  // ─── Content ScrollView ──────────────────────────────────────────────────
  contentArea: {
    flex: 1,
    backgroundColor: "#EAEFF4",
    ...Platform.select({
      web: {
        height: 'calc(100vh - 67px)',
        overflowY: 'auto',
        overflowX: 'hidden',
      },
    }),
  },
  // Full-width: no centering, no maxWidth, stretch to fill
  scrollContent: {
    alignItems: 'stretch',
    paddingBottom: 80,
  },

  // ─── Article Wrapper (full width) ────────────────────────────────────────
  articleWrapper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    minHeight: '100%',
  },

  // ─── Hero (slim banner) ─────────────────────────────────────────────────
  articleHero: {
    paddingHorizontal: 72,
    paddingVertical: 28,
    ...Platform.select({
      web: {
        background: 'linear-gradient(135deg, #062f37 0%, #0a5f6e 40%, #1c94a7 80%, #2bbacf 100%)',
      },
      default: { backgroundColor: '#0a5f6e' },
    }),
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  heroBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  heroBadgeText: {
    fontSize: 12,
    fontFamily: "Newsreader_700Bold",
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 1,
  },
  heroReadingTime: {
    fontSize: 13,
    fontFamily: "Newsreader_400Regular",
    color: 'rgba(255,255,255,0.6)',
  },

  // Title block — white background, dark text
  articleTitleBlock: {
    backgroundColor: '#FFFFFF',
    paddingTop: 52,
    paddingHorizontal: 72,
    paddingBottom: 0,
  },
  articleTitle: {
    fontSize: 46,
    fontFamily: "Newsreader_700Bold",
    color: "#0F172A",
    lineHeight: 56,
    marginBottom: 20,
  },
  blueBar: {
    height: 4,
    width: 56,
    backgroundColor: "#1c94a7",
    marginBottom: 0,
    borderRadius: 4,
  },

  // ─── Article Body ─────────────────────────────────────────────────────────
  articleBody: {
    paddingHorizontal: 72,
    paddingVertical: 56,
  },

  // Section heading: large ordinal + divider line + text
  sectionHeadingBlock: {
    marginTop: 52,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  sectionOrdinal: {
    fontSize: 48,
    fontFamily: "Newsreader_700Bold",
    color: '#e2f4f7',
    lineHeight: 50,
    flexShrink: 0,
  },
  sectionDivider: {
    height: 2,
    width: 32,
    backgroundColor: '#1c94a7',
    borderRadius: 2,
    flexShrink: 0,
  },
  sectionHeadingText: {
    fontSize: 13,
    fontFamily: "Newsreader_700Bold",
    color: '#1c94a7',
    letterSpacing: 2.5,
    flex: 1,
  },

  // Subheading
  subheading: {
    fontSize: 22,
    fontFamily: "Newsreader_700Bold",
    color: "#0F172A",
    marginTop: 32,
    marginBottom: 12,
  },

  // Body
  bodyText: {
    fontSize: 18,
    lineHeight: 32,
    fontFamily: "Newsreader_400Regular",
    color: "#334155",
    marginBottom: 8,
    ...Platform.select({ web: { wordBreak: 'break-word' }, default: {} }),
  },
  emphasisText: {
    fontSize: 18,
    lineHeight: 32,
    fontFamily: "Newsreader_700Bold",
    color: "#0a5f6e",
  },

  // Bullet
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  bulletDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#1c94a7",
    marginTop: 13,
    marginRight: 14,
    flexShrink: 0,
  },
  bulletText: {
    flex: 1,
    fontSize: 18,
    lineHeight: 32,
    fontFamily: "Newsreader_400Regular",
    color: "#334155",
  },

  // Spacer
  spacer: { height: 14 },

  // ─── Callout Boxes ────────────────────────────────────────────────────────
  callout: {
    borderRadius: 12,
    borderLeftWidth: 4,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginVertical: 24,
  },
  calloutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  calloutIcon: { fontSize: 16 },
  calloutLabel: {
    fontSize: 11,
    fontFamily: "Newsreader_700Bold",
    letterSpacing: 1.5,
  },
  calloutText: {
    fontSize: 16,
    lineHeight: 27,
    fontFamily: "Newsreader_400Regular",
    color: "#374151",
  },

  // ─── CTA Section ─────────────────────────────────────────────────────────
  ctaSection: {
    alignItems: 'center',
    paddingHorizontal: 72,
    paddingBottom: 80,
  },
  ctaDivider: {
    width: '100%',
    height: 1,
    backgroundColor: '#E2E8F0',
    marginBottom: 40,
  },
  ctaHint: {
    fontSize: 15,
    fontFamily: "Newsreader_400Regular",
    color: '#94A3B8',
    marginBottom: 20,
    letterSpacing: 0.3,
  },
  knowledgeButton: {
    backgroundColor: "#1c94a7",
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 50,
    ...Platform.select({
      web: {
        boxShadow: '0 6px 24px rgba(28, 148, 167, 0.4)',
        cursor: 'pointer',
      },
    }),
  },
  knowledgeButtonText: {
    color: "#FFFFFF",
    fontFamily: "Newsreader_700Bold",
    fontSize: 17,
    letterSpacing: 0.5,
  },

  // ─── Loading ─────────────────────────────────────────────────────────────
  loadingCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#EAEFF4",
  },
});