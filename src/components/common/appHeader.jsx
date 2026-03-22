/**
 * appHeader.jsx — Option A: floating centered island
 *
 * Layout:
 *   - Full-width transparent wrapper (not teal) — page bg shows through
 *   - Centered teal pill that doesn't touch the edges
 *   - Logo on the left of the pill
 *   - Nav tabs + divider + avatar on the right, grouped inside the pill
 *
 * Icons: @phosphor-icons/react
 *   Nav inactive → Light weight
 *   Nav active   → Bold weight
 *   Avatar       → Duotone weight
 */

import { useNavigate, useLocation } from "react-router-dom";
import { House, Books, User } from "@phosphor-icons/react";
import { MAIN_TABS } from "../../constants/navTab.js";

const ICON_MAP = {
  "home-outline": House,
  "book-outline": Books,
};

const NavTab = ({ icon, label, path }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const IconComp = ICON_MAP[icon] || House;
  const isActive = location.pathname === path;

  return (
    <button
      onClick={() => navigate(path)}
      className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-150"
      style={{
        background: isActive ? "rgba(255,255,255,0.15)" : "transparent",
        border: "none",
      }}
    >
      <IconComp
        size={14}
        weight={isActive ? "bold" : "light"}
        color={isActive ? "#ffffff" : "rgba(255,255,255,0.55)"}
      />
      <span
        className="font-serif text-[13px] tracking-wide"
        style={{
          color: isActive ? "#ffffff" : "rgba(255,255,255,0.55)",
          fontWeight: isActive ? 600 : 400,
        }}
      >
        {label}
      </span>
    </button>
  );
};

const AppHeader = ({ extraLinks = [] }) => (
  /*
   * Outer wrapper — transparent, provides top padding so the pill
   * floats above the page content with space around it.
   * position: relative + z-index so it sits above page content.
   */
  <div
    style={{
      flexShrink: 0,
      paddingTop: 12,
      paddingBottom: 12,
      paddingLeft: 24,
      paddingRight: 24,
      zIndex: 20,
      position: "relative",
    }}
  >
    {/* The floating pill */}
    <div
      style={{
        height: 48,
        background: "rgba(10, 95, 110, 0.96)",
        borderRadius: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingLeft: 20,
        paddingRight: 10,
        boxShadow: "0 4px 28px rgba(10, 95, 110, 0.30), 0 1px 4px rgba(0,0,0,0.08)",
      }}
    >
      {/* Logo */}
      <span
        style={{
          fontFamily: "Cookie, cursive",
          fontSize: 22,
          color: "#ffffff",
          letterSpacing: 0.3,
          lineHeight: 1,
          userSelect: "none",
          flexShrink: 0,
        }}
      >
        edusupernova
      </span>

      {/* Right group — nav + divider + avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: 2 }}>

        {/* Nav tabs */}
        {[...MAIN_TABS, ...extraLinks].map(({ icon, label, path }) => (
          <NavTab key={path} icon={icon} label={label} path={path} />
        ))}

        {/* Divider */}
        <div
          style={{
            width: 1,
            height: 16,
            background: "rgba(255,255,255,0.18)",
            margin: "0 8px",
            flexShrink: 0,
          }}
        />

        {/* Avatar */}
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.12)",
            border: "1.5px solid rgba(255,255,255,0.22)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
            transition: "background 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.22)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
        >
          <User size={15} weight="duotone" color="rgba(255,255,255,0.8)" />
        </div>

      </div>
    </div>
  </div>
);

export { NavTab };
export default AppHeader;