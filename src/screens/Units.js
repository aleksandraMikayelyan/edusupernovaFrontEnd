import React, { useState, useEffect, useMemo, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Linking } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import styles from "../styles/unitStyles.js";

// ─── Courses that get a PDF formula sheet button ──────────────────────────────
// Match against courseName (case-insensitive)
const PDF_COURSE_KEYWORDS = ['act science', 'act math', 'a level', 'a-level', 'economy', 'economics', 'math'];

const hasPdfSheet = (courseName = '') => {
  const lower = courseName.toLowerCase();
  return PDF_COURSE_KEYWORDS.some(kw => lower.includes(kw));
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const calcReadingTime = (text) => {
  if (!text) return '1 min';
  const words = text.trim().split(/\s+/).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
};

// ─── Text Parser ─────────────────────────────────────────────────────────────

const CALLOUT_KEYWORDS = ['KEY CONCEPT', 'IMPORTANT', 'NOTE', 'EXAMPLE', 'DEFINITION', 'REMEMBER'];

const parseUnitText = (raw) => {
  if (!raw) return [];
  const lines = raw.split('\n');
  const blocks = [];
  let sectionCount = 0;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) { blocks.push({ type: 'spacer' }); i++; continue; }

    const calloutKw = CALLOUT_KEYWORDS.find(kw =>
      trimmed.toUpperCase().startsWith(kw + ':') || trimmed.toUpperCase() === kw
    );
    if (calloutKw) {
      const rest = trimmed.slice(calloutKw.length).replace(/^:\s*/, '');
      const body = rest ? [rest] : [];
      i++;
      while (i < lines.length && lines[i].trim() &&
        !CALLOUT_KEYWORDS.find(kw => lines[i].trim().toUpperCase().startsWith(kw))) {
        body.push(lines[i].trim()); i++;
      }
      blocks.push({ type: 'callout', keyword: calloutKw, text: body.join(' ') });
      continue;
    }

    const letters = trimmed.replace(/[^a-zA-Z]/g, '');
    const upperRatio = letters.length > 0
      ? (trimmed.match(/[A-Z]/g) || []).length / letters.length : 0;

    if (upperRatio >= 0.85 && letters.length >= 4) {
      sectionCount++;
      blocks.push({ type: 'heading', text: trimmed, number: sectionCount });
      i++; continue;
    }
    if (upperRatio >= 0.5 && letters.length >= 4 && trimmed.endsWith(':')) {
      blocks.push({ type: 'subheading', text: trimmed.replace(/:$/, '') });
      i++; continue;
    }
    if (/^[-•*▸→]\s/.test(trimmed) || /^\d+[\.\)]\s/.test(trimmed)) {
      blocks.push({ type: 'bullet', text: trimmed.replace(/^[-•*▸→\d\.\)]\s+/, '') });
      i++; continue;
    }
    blocks.push({ type: 'body', text: trimmed });
    i++;
  }
  return blocks;
};

// ─── Inline KEY TERM emphasis ─────────────────────────────────────────────────

const InlineText = ({ text, base, em }) => {
  const parts = text.split(/(\b[A-Z]{3,}(?:\s[A-Z]{3,})*\b)/g);
  return (
    <Text style={base}>
      {parts.map((p, i) =>
        (/^[A-Z]{3,}/.test(p) && !/[a-z]/.test(p))
          ? <Text key={i} style={em}>{p}</Text>
          : p
      )}
    </Text>
  );
};

// ─── Callout Box ─────────────────────────────────────────────────────────────

const CALLOUT_CFG = {
  'KEY CONCEPT': { iconName: 'lightbulb-on-outline', iconLib: 'material', color: '#0369a1', bg: '#eff8ff', border: '#3b82f6' },
  'IMPORTANT': { iconName: 'alert-circle-outline', iconLib: 'ionicon', color: '#b45309', bg: '#fffbeb', border: '#f59e0b' },
  'NOTE': { iconName: 'pin-outline', iconLib: 'ionicon', color: '#6d28d9', bg: '#f5f3ff', border: '#8b5cf6' },
  'EXAMPLE': { iconName: 'create-outline', iconLib: 'ionicon', color: '#065f46', bg: '#ecfdf5', border: '#10b981' },
  'DEFINITION': { iconName: 'book-open-outline', iconLib: 'material', color: '#9f1239', bg: '#fff1f2', border: '#f43f5e' },
  'REMEMBER': { iconName: 'bulb-outline', iconLib: 'ionicon', color: '#1c94a7', bg: '#e8f7f9', border: '#1c94a7' },
};

const CalloutBox = ({ keyword, text }) => {
  const cfg = CALLOUT_CFG[keyword] || CALLOUT_CFG['NOTE'];
  const IconComponent = cfg.iconLib === 'material' ? MaterialCommunityIcons : Ionicons;
  return (
    <View style={[styles.callout, { backgroundColor: cfg.bg, borderLeftColor: cfg.border }]}>
      <View style={styles.calloutHeader}>
        <IconComponent name={cfg.iconName} size={18} color={cfg.color} />
        <Text style={[styles.calloutLabel, { color: cfg.color }]}>{keyword}</Text>
      </View>
      {!!text && <Text style={styles.calloutText}>{text}</Text>}
    </View>
  );
};

// ─── Section Heading ──────────────────────────────────────────────────────────

const SectionHeading = ({ text, number }) => (
  <View style={styles.sectionHeadingBlock}>
    <Text style={styles.sectionOrdinal}>{String(number).padStart(2, '0')}</Text>
    <View style={styles.sectionDivider} />
    <Text style={styles.sectionHeadingText}>{text}</Text>
  </View>
);

// ─── Article Body ─────────────────────────────────────────────────────────────

const ArticleBody = ({ text }) => {
  const blocks = useMemo(() => parseUnitText(text), [text]);
  return (
    <View style={styles.articleBody}>
      {blocks.map((block, idx) => {
        switch (block.type) {
          case 'heading': return <SectionHeading key={idx} text={block.text} number={block.number} />;
          case 'subheading': return <Text key={idx} style={styles.subheading}>{block.text}</Text>;
          case 'bullet':
            return (
              <View key={idx} style={styles.bulletRow}>
                <View style={styles.bulletDot} />
                <Text style={styles.bulletText}>{block.text}</Text>
              </View>
            );
          case 'body':
            return <InlineText key={idx} text={block.text} base={styles.bodyText} em={styles.emphasisText} />;
          case 'callout': return <CalloutBox key={idx} keyword={block.keyword} text={block.text} />;
          case 'spacer': return <View key={idx} style={styles.spacer} />;
          default: return null;
        }
      })}
    </View>
  );
};

// ─── Sidebar Section (collapsible) ────────────────────────────────────────────

const CollapsibleSection = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <View>
      <TouchableOpacity style={styles.sectionToggle} onPress={() => setOpen(o => !o)} activeOpacity={0.7}>
        <Text style={styles.sectionToggleLabel}>{title}</Text>
        <Text style={styles.sectionToggleChevron}>{open ? '▾' : '▸'}</Text>
      </TouchableOpacity>
      {open && <View style={styles.sectionContent}>{children}</View>}
    </View>
  );
};

// ─── Unit Tab ─────────────────────────────────────────────────────────────────

const UnitTab = ({ unit, index, isActive, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.unitTab, isActive && styles.unitTabActive]}
    activeOpacity={0.7}
  >
    <View style={[styles.unitBadgeSmall, isActive && styles.unitBadgeSmallActive]}>
      <Text style={[styles.unitBadgeSmallText, isActive && styles.unitBadgeSmallTextActive]}>
        {index + 1}
      </Text>
    </View>
    <Text style={[styles.unitTabLabel, isActive && styles.unitTabLabelActive]} numberOfLines={2}>
      {unit.title}
    </Text>
    {isActive && <View style={styles.activeIndicator} />}
  </TouchableOpacity>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

const UnitScreen = ({ route, navigation }) => {
  const { courseId, examType } = route.params;
  const [courseData, setCourseData] = useState(null);
  const [activeUnit, setActiveUnit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    axios.get(`http://localhost:8080/api/units/course/${courseId}`)
      .then(res => {
        setCourseData(res.data);
        if (res.data.units?.length > 0) setActiveUnit(res.data.units[0]);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [courseId]);

  const handleScroll = useCallback((e) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const max = contentSize.height - layoutMeasurement.height;
    if (max > 0) setScrollProgress(Math.min(1, contentOffset.y / max));
  }, []);

  const activeIndex = courseData?.units?.findIndex(u => u.id === activeUnit?.id) ?? 0;
  const readingTime = useMemo(() => calcReadingTime(activeUnit?.summary_path), [activeUnit?.summary_path]);
  const showPdf = hasPdfSheet(courseData?.courseName);

  const articleContent = useMemo(() => {
    if (!activeUnit) return null;
    return (
      <View style={styles.articleWrapper}>
        {/* Hero */}
        <View style={styles.articleHero}>
          <View style={styles.heroBadgeRow}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>Unit {activeIndex + 1}</Text>
            </View>
          </View>
        </View>

        {/* Title block */}
        <View style={styles.articleTitleBlock}>
          <Text style={styles.articleTitle}>{activeUnit.title}</Text>
          <View style={styles.blueBar} />
        </View>

        {/* Body */}
        <ArticleBody text={activeUnit.summary_path} />

        {/* CTA */}
        <View style={styles.ctaSection}>
          <View style={styles.ctaDivider} />
          <Text style={styles.ctaHint}>Ready to test what you've learned?</Text>
          <TouchableOpacity
            style={styles.knowledgeButton}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Test', { courseId, examType, sectionName: courseData?.courseName })}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
              <Text style={styles.knowledgeButtonText}>Check your knowledge</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [activeUnit?.id, activeUnit?.summary_path, activeIndex, readingTime, navigation]);

  if (loading) return (
    <View style={styles.loadingCenter}>
      <ActivityIndicator size="large" color="#1c94a7" />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logoText}>Edusupernova</Text>
        {courseData?.courseName && (
          <Text style={styles.headerCourse}>{courseData.courseName}</Text>
        )}
      </View>

      {/* Reading progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${scrollProgress * 100}%` }]} />
      </View>

      <View style={styles.mainLayout}>
        {/* ── Sidebar ── */}
        <View style={styles.sidebar}>

          {/* PDF Formula Sheet button (STEM courses only) */}
          {showPdf && (
            <TouchableOpacity
              style={styles.pdfButton}
              activeOpacity={0.8}
              onPress={() => Linking.openURL(`http://localhost:8080/api/courses/${courseId}/formula-sheet`)}
            >
              <Ionicons name="document-text-outline" size={18} color="#15803d" />
              <Text style={styles.pdfButtonText}>Formula Sheet PDF</Text>
            </TouchableOpacity>
          )}

          {/* Collapsible unit list */}
          <CollapsibleSection title="COURSE UNITS" defaultOpen={true}>
            {courseData?.units?.map((u, idx) => (
              <UnitTab
                key={u.id}
                unit={u}
                index={idx}
                isActive={activeUnit?.id === u.id}
                onPress={() => activeUnit?.id !== u.id && setActiveUnit(u)}
              />
            ))}
          </CollapsibleSection>

        </View>

        {/* ── Content ── */}
        <ScrollView
          style={styles.contentArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={handleScroll}
        >
          {articleContent}
        </ScrollView>
      </View>
    </View>
  );
};

export default UnitScreen;