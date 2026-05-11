/**
 * appHeader.jsx — Full-width flush header bar
 * Sits at the very top of the page, integrated into the layout.
 */

import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { House, Books, User, ClockCounterClockwise, List, X } from "@phosphor-icons/react";
import { MAIN_TABS } from "../../constants/navTab.js";
import useWindowWidth from "../../hooks/useWindowWidth.js";

const SERIF  = "Newsreader, Georgia, serif";
const SCRIPT = "Cookie, cursive";
const BRAND  = "#0a5f6e";
const DARK   = "#062f37";

const ICON_MAP = {
  "home-outline":    House,
  "book-outline":    Books,
  "history-outline": ClockCounterClockwise,
};

const NavTab = ({ icon, label, path, onClick }) => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const IconComp  = ICON_MAP[icon] || House;
  const isActive  = location.pathname === path;

  return (
    <button
      onClick={() => { navigate(path); if (onClick) onClick(); }}
      style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "6px 14px", borderRadius: 999, border: "none",
        background: isActive ? "rgba(255,255,255,0.12)" : "transparent",
        cursor: "pointer", transition: "background 0.15s",
        width: "100%",
      }}
      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
    >
      <IconComp
        size={14}
        weight={isActive ? "bold" : "light"}
        color={isActive ? "#ffffff" : "rgba(255,255,255,0.5)"}
      />
      <span style={{
        fontFamily: SERIF, fontSize: 13, letterSpacing: "0.01em",
        color: isActive ? "#ffffff" : "rgba(255,255,255,0.5)",
        fontWeight: isActive ? 600 : 400,
      }}>
        {label}
      </span>
    </button>
  );
};

const ProfileAvatar = ({ onClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname === "/profile";

  return (
    <div
      onClick={() => { navigate("/profile"); if (onClick) onClick(); }}
      title="My Profile"
      style={{
        width: 32, height: 32, borderRadius: "50%",
        background: isActive ? "rgba(93,202,165,0.25)" : "rgba(255,255,255,0.10)",
        border: `1.5px solid ${isActive ? "rgba(93,202,165,0.6)" : "rgba(255,255,255,0.18)"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", transition: "background 0.15s, border-color 0.15s",
        flexShrink: 0,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = "rgba(93,202,165,0.2)";
        e.currentTarget.style.borderColor = "rgba(93,202,165,0.5)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = isActive ? "rgba(93,202,165,0.25)" : "rgba(255,255,255,0.10)";
        e.currentTarget.style.borderColor = isActive ? "rgba(93,202,165,0.6)" : "rgba(255,255,255,0.18)";
      }}
    >
      <User size={15} weight="duotone" color={isActive ? "#5DCAA5" : "rgba(255,255,255,0.8)"} />
    </div>
  );
};

const AppHeader = ({ extraLinks = [] }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const width = useWindowWidth();
  const isMobile = width < 768;
  const allTabs = [...MAIN_TABS, ...extraLinks];

  return (
    <header style={{ flexShrink: 0, zIndex: 20, position: "relative" }}>
      {/* ── Main bar ── */}
      <div style={{
        height: 56,
        background: `linear-gradient(90deg, #021a1f 0%, ${DARK} 55%, ${BRAND} 100%)`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: isMobile ? "0 16px" : "0 32px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 1px 12px rgba(0,0,0,0.18)",
      }}>

        {/* Logo */}
        <span style={{
          fontFamily: SCRIPT, fontSize: 24, color: "#fff",
          letterSpacing: 0.3, lineHeight: 1, userSelect: "none",
        }}>
          edusupernova
        </span>

        {/* Desktop: Nav + avatar */}
        {!isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {allTabs.map(({ icon, label, path }) => (
              <NavTab key={path} icon={icon} label={label} path={path} />
            ))}

            <div style={{
              width: 1, height: 16,
              background: "rgba(255,255,255,0.15)",
              margin: "0 8px", flexShrink: 0,
            }} />

            <ProfileAvatar />
          </div>
        )}

        {/* Mobile: avatar + hamburger */}
        {isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ProfileAvatar onClick={() => setMenuOpen(false)} />
            <button
              onClick={() => setMenuOpen(o => !o)}
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 8, padding: "6px 8px", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              {menuOpen
                ? <X size={18} color="#fff" weight="bold" />
                : <List size={18} color="#fff" weight="bold" />}
            </button>
          </div>
        )}
      </div>

      {/* Mobile dropdown menu */}
      {isMobile && menuOpen && (
        <div style={{
          position: "absolute", top: 56, left: 0, right: 0,
          background: "rgba(6,47,55,0.97)", backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          padding: "10px 12px 16px",
          display: "flex", flexDirection: "column", gap: 4,
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        }}>
          {allTabs.map(({ icon, label, path }) => (
            <NavTab key={path} icon={icon} label={label} path={path}
              onClick={() => setMenuOpen(false)} />
          ))}
        </div>
      )}
    </header>
  );
};

export { NavTab };
export default AppHeader;
