/**
 * TestNavBar — previous / next / submit navigation bar for passage-based tests.
 *
 * Props:
 *   onPrev      fn
 *   onNext      fn
 *   onSubmit    fn
 *   canPrev     bool
 *   isLast      bool    — when true shows Submit instead of Next
 *   submitting  bool
 *   nextLabel   string  — override "Next" label (e.g. "Next passage")
 */

import { CaretLeft, CaretRight, PaperPlane } from "@phosphor-icons/react";

const DARK  = "#062f37";
const BRAND = "#0a5f6e";
const MINT  = "#5DCAA5";
const SERIF = "Newsreader, Georgia, serif";

const Btn = ({ onClick, disabled, variant = "secondary", children }) => {
  const isPrimary = variant === "primary";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "13px 28px", borderRadius: 12,
        fontFamily: SERIF, fontSize: 14, fontWeight: 700,
        cursor:     disabled ? "not-allowed" : "pointer",
        background: disabled ? "#E8EDF2" : isPrimary ? MINT : "transparent",
        color:      disabled ? "#94A3B8"  : isPrimary ? DARK  : BRAND,
        border:     isPrimary ? "none" : `2px solid ${disabled ? "#E2EBF0" : BRAND}`,
        boxShadow:  isPrimary && !disabled ? "0 8px 24px rgba(93,202,165,0.3)" : "none",
        transition: "all 0.18s",
      }}
      onMouseEnter={e => {
        if (!disabled && isPrimary) {
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.background = "#3aab87";
        }
      }}
      onMouseLeave={e => {
        if (!disabled && isPrimary) {
          e.currentTarget.style.transform = "none";
          e.currentTarget.style.background = MINT;
        }
      }}
    >
      {children}
    </button>
  );
};

const TestNavBar = ({
  onPrev,
  onNext,
  onSubmit,
  canPrev    = true,
  isLast     = false,
  submitting = false,
  nextLabel  = "Next",
}) => (
  <div style={{
    display: "flex", justifyContent: "space-between",
    alignItems: "center", marginTop: 36,
    paddingTop: 24, borderTop: "1px solid #F1F5F9",
  }}>
    <Btn onClick={onPrev} disabled={!canPrev}>
      <CaretLeft size={15} weight="bold" /> Previous
    </Btn>

    {isLast ? (
      <Btn onClick={onSubmit} disabled={submitting} variant="primary">
        <PaperPlane size={15} weight="bold" />
        {submitting ? "Submitting…" : "Submit test"}
      </Btn>
    ) : (
      <Btn onClick={onNext} variant="primary">
        {nextLabel} <CaretRight size={15} weight="bold" />
      </Btn>
    )}
  </div>
);

export default TestNavBar;
