/**
 * appHeader.jsx — Full-width flush header bar
 * Sits at the very top of the page, integrated into the layout.
 */

import { useNavigate, useLocation } from "react-router-dom";
import { House, Books, User }       from "@phosphor-icons/react";
import { MAIN_TABS } from "../../constants/navTab.js";

const SERIF  = "Newsreader, Georgia, serif";
const SCRIPT = "Cookie, cursive";
const BRAND  = "#0a5f6e";
const DARK   = "#062f37";

const ICON_MAP = {
  "home-outline": House,
  "book-outline": Books,
};

const NavTab = ({ icon, label, path }) => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const IconComp  = ICON_MAP[icon] || House;
  const isActive  = location.pathname === path;

  return (
    <button
      onClick={() => navigate(path)}
      style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "6px 14px", borderRadius: 999, border: "none",
        background: isActive ? "rgba(255,255,255,0.12)" : "transparent",
        cursor: "pointer", transition: "background 0.15s",
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

const ProfileAvatar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname === "/profile";

  return (
    <div
      onClick={() => navigate("/profile")}
      title="My Profile"
      style={{
        width: 32, height: 32, borderRadius: "50%",
        background: isActive ? "rgba(93,202,165,0.25)" : "rgba(255,255,255,0.10)",
        border: `1.5px solid ${isActive ? "rgba(93,202,165,0.6)" : "rgba(255,255,255,0.18)"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", transition: "background 0.15s, border-color 0.15s",
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

const AppHeader = ({ extraLinks = [] }) => (
  <header style={{
    height: 56, flexShrink: 0,
    background: `linear-gradient(90deg, #021a1f 0%, ${DARK} 55%, ${BRAND} 100%)`,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0 32px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    boxShadow: "0 1px 12px rgba(0,0,0,0.18)",
    zIndex: 20, position: "relative",
  }}>

    {/* Logo */}
    <span style={{
      fontFamily: SCRIPT, fontSize: 24, color: "#fff",
      letterSpacing: 0.3, lineHeight: 1, userSelect: "none",
    }}>
      edusupernova
    </span>

    {/* Nav + avatar */}
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      {[...MAIN_TABS, ...extraLinks].map(({ icon, label, path }) => (
        <NavTab key={path} icon={icon} label={label} path={path} />
      ))}

      <div style={{
        width: 1, height: 16,
        background: "rgba(255,255,255,0.15)",
        margin: "0 8px", flexShrink: 0,
      }} />

      <ProfileAvatar />
    </div>
  </header>
);

export { NavTab };
export default AppHeader;
