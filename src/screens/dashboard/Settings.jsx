import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Pencil, Key, Trash, CheckCircle, WarningCircle, Eye, EyeSlash,
} from "@phosphor-icons/react";
import { UserApi } from "../../api/index.js";
import useAuth     from "../../hooks/useAuth.js";
import AppHeader   from "../../components/common/appHeader.jsx";
import AppFooter   from "../../components/common/appFooter.jsx";

const DARK  = "#062f37";
const BRAND = "#0a5f6e";
const MINT  = "#5DCAA5";
const CREAM = "#F7F4EF";
const SERIF = "Newsreader, Georgia, serif";

// ── Reusable field ────────────────────────────────────────────────────────────

const Field = ({ label, type = "text", value, onChange, placeholder, rightSlot }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <label style={{ fontFamily: SERIF, fontSize: 12, fontWeight: 700,
      color: "#64748B", letterSpacing: "0.06em", textTransform: "uppercase" }}>
      {label}
    </label>
    <div style={{ position: "relative" }}>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%", boxSizing: "border-box",
          padding: rightSlot ? "11px 44px 11px 14px" : "11px 14px",
          borderRadius: 12, border: "1.5px solid #E2EBF0",
          fontFamily: SERIF, fontSize: 14, color: DARK,
          background: "#fff", outline: "none",
          transition: "border-color 0.15s",
        }}
        onFocus={e  => { e.target.style.borderColor = BRAND; }}
        onBlur={e   => { e.target.style.borderColor = "#E2EBF0"; }}
      />
      {rightSlot && (
        <div style={{ position: "absolute", right: 12, top: "50%",
          transform: "translateY(-50%)", cursor: "pointer" }}>
          {rightSlot}
        </div>
      )}
    </div>
  </div>
);

// ── Section card ─────────────────────────────────────────────────────────────

const Section = ({ icon, title, subtitle, children, danger = false }) => (
  <div style={{
    background: "#fff", borderRadius: 20,
    border: danger ? "1.5px solid #fca5a5" : "1px solid #E8EDF4",
    padding: "28px 32px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    display: "flex", flexDirection: "column", gap: 20,
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{
        width: 44, height: 44, borderRadius: 14, flexShrink: 0,
        background: danger ? "#fff0f0" : "#e8f7f9",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {icon}
      </div>
      <div>
        <p style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 700,
          color: danger ? "#b91c1c" : DARK, margin: 0 }}>
          {title}
        </p>
        <p style={{ fontFamily: SERIF, fontSize: 13, color: "#94A3B8", margin: 0 }}>
          {subtitle}
        </p>
      </div>
    </div>
    {children}
  </div>
);

// ── Feedback message ──────────────────────────────────────────────────────────

const Feedback = ({ type, message }) => {
  if (!message) return null;
  const isError = type === "error";
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "10px 14px", borderRadius: 10,
      background: isError ? "#fff0f0" : "#f0fdf4",
      border: `1px solid ${isError ? "#fca5a5" : "#86efac"}`,
    }}>
      {isError
        ? <WarningCircle size={16} weight="fill" color="#dc2626" />
        : <CheckCircle  size={16} weight="fill" color="#16a34a" />}
      <span style={{ fontFamily: SERIF, fontSize: 13,
        color: isError ? "#b91c1c" : "#15803d" }}>
        {message}
      </span>
    </div>
  );
};

// ── Main screen ───────────────────────────────────────────────────────────────

const Settings = () => {
  const navigate = useNavigate();
  const { username, email, clearSession, saveSession } = useAuth();

  // ── Edit profile ────────────────────────────────────────────────────────────
  const [profile, setProfile] = useState({ username: username ?? "", email: email ?? "" });
  const [profileStatus, setProfileStatus] = useState({ loading: false, msg: null, type: null });

  const handleUpdateProfile = () => {
    if (!profile.username.trim() || !profile.email.trim()) {
      setProfileStatus({ loading: false, msg: "All fields are required.", type: "error" });
      return;
    }
    setProfileStatus({ loading: true, msg: null, type: null });
    UserApi.updateProfile(profile.username.trim(), profile.email.trim())
      .then(res => {
        saveSession(res.data);
        setProfileStatus({ loading: false, msg: "Profile updated successfully.", type: "success" });
      })
      .catch(err => setProfileStatus({ loading: false, msg: err.message ?? "Something went wrong.", type: "error" }));
  };

  // ── Change password ─────────────────────────────────────────────────────────
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });
  const [pwStatus, setPwStatus] = useState({ loading: false, msg: null, type: null });

  const handleUpdatePassword = () => {
    if (!pw.current || !pw.next || !pw.confirm) {
      setPwStatus({ loading: false, msg: "All fields are required.", type: "error" });
      return;
    }
    if (pw.next !== pw.confirm) {
      setPwStatus({ loading: false, msg: "New passwords do not match.", type: "error" });
      return;
    }
    if (pw.next.length < 6) {
      setPwStatus({ loading: false, msg: "Password must be at least 6 characters.", type: "error" });
      return;
    }
    setPwStatus({ loading: true, msg: null, type: null });
    UserApi.updatePassword(pw.current, pw.next)
      .then(() => {
        setPw({ current: "", next: "", confirm: "" });
        setPwStatus({ loading: false, msg: "Password updated successfully.", type: "success" });
      })
      .catch(err => setPwStatus({ loading: false, msg: err.message ?? "Something went wrong.", type: "error" }));
  };

  // ── Delete account ──────────────────────────────────────────────────────────
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteStatus,  setDeleteStatus]  = useState({ loading: false, msg: null });

  const handleDeleteAccount = () => {
    setDeleteStatus({ loading: true, msg: null });
    UserApi.deleteAccount()
      .then(() => { clearSession(); navigate("/"); })
      .catch(err => setDeleteStatus({ loading: false, msg: err.message ?? "Something went wrong." }));
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: CREAM, display: "flex", flexDirection: "column" }}>
      <AppHeader />

      {/* Hero */}
      <div style={{
        background: `linear-gradient(145deg, #021a1f 0%, ${DARK} 40%, ${BRAND} 100%)`,
        padding: "40px 48px 56px", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.04,
          backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "28px 28px", pointerEvents: "none" }} />

        <div style={{ maxWidth: 700, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <button
            onClick={() => navigate("/profile")}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 10, padding: "8px 16px", cursor: "pointer",
              fontFamily: SERIF, fontSize: 13, color: "rgba(255,255,255,0.7)",
              marginBottom: 28, transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
          >
            <ArrowLeft size={14} /> Back to profile
          </button>

          <h1 style={{ fontFamily: SERIF, fontSize: "clamp(28px,4vw,42px)",
            fontWeight: 700, color: "#fff", letterSpacing: "-1px",
            lineHeight: 1.1, margin: 0 }}>
            Account Settings
          </h1>
          <p style={{ fontFamily: SERIF, fontSize: 14,
            color: "rgba(255,255,255,0.45)", margin: "8px 0 0" }}>
            Manage your profile, password, and account preferences.
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{
        flex: 1, maxWidth: 700, width: "100%", margin: "0 auto",
        padding: "40px 32px 80px", boxSizing: "border-box",
        display: "flex", flexDirection: "column", gap: 24,
      }}>

        {/* ── Edit profile ── */}
        <Section
          icon={<Pencil size={20} weight="bold" color={BRAND} />}
          title="Edit Profile"
          subtitle="Update your display name and email address."
        >
          <Field
            label="Username"
            value={profile.username}
            onChange={v => setProfile(p => ({ ...p, username: v }))}
            placeholder="Your username"
          />
          <Field
            label="Email"
            type="email"
            value={profile.email}
            onChange={v => setProfile(p => ({ ...p, email: v }))}
            placeholder="you@example.com"
          />
          <Feedback type={profileStatus.type} message={profileStatus.msg} />
          <button
            onClick={handleUpdateProfile}
            disabled={profileStatus.loading}
            style={{
              alignSelf: "flex-start",
              padding: "11px 28px", borderRadius: 12, border: "none",
              background: profileStatus.loading ? "#94A3B8" : MINT,
              cursor: profileStatus.loading ? "not-allowed" : "pointer",
              fontFamily: SERIF, fontSize: 14, fontWeight: 700, color: DARK,
              boxShadow: "0 4px 14px rgba(93,202,165,0.3)",
              transition: "background 0.15s, transform 0.15s",
            }}
            onMouseEnter={e => { if (!profileStatus.loading) e.currentTarget.style.background = "#3aab87"; }}
            onMouseLeave={e => { if (!profileStatus.loading) e.currentTarget.style.background = MINT; }}
          >
            {profileStatus.loading ? "Saving…" : "Save changes"}
          </button>
        </Section>

        {/* ── Change password ── */}
        <Section
          icon={<Key size={20} weight="bold" color={BRAND} />}
          title="Change Password"
          subtitle="Choose a strong password of at least 6 characters."
        >
          {[
            { key: "current", label: "Current password",  placeholder: "Enter current password" },
            { key: "next",    label: "New password",      placeholder: "Enter new password" },
            { key: "confirm", label: "Confirm new password", placeholder: "Repeat new password" },
          ].map(({ key, label, placeholder }) => (
            <Field
              key={key}
              label={label}
              type={showPw[key] ? "text" : "password"}
              value={pw[key]}
              onChange={v => setPw(p => ({ ...p, [key]: v }))}
              placeholder={placeholder}
              rightSlot={
                <span onClick={() => setShowPw(s => ({ ...s, [key]: !s[key] }))}
                  style={{ color: "#94A3B8", lineHeight: 0 }}>
                  {showPw[key]
                    ? <EyeSlash size={18} weight="bold" />
                    : <Eye      size={18} weight="bold" />}
                </span>
              }
            />
          ))}
          <Feedback type={pwStatus.type} message={pwStatus.msg} />
          <button
            onClick={handleUpdatePassword}
            disabled={pwStatus.loading}
            style={{
              alignSelf: "flex-start",
              padding: "11px 28px", borderRadius: 12, border: "none",
              background: pwStatus.loading ? "#94A3B8" : BRAND,
              cursor: pwStatus.loading ? "not-allowed" : "pointer",
              fontFamily: SERIF, fontSize: 14, fontWeight: 700, color: "#fff",
              boxShadow: "0 4px 14px rgba(10,95,110,0.25)",
              transition: "background 0.15s",
            }}
            onMouseEnter={e => { if (!pwStatus.loading) e.currentTarget.style.background = "#084f5c"; }}
            onMouseLeave={e => { if (!pwStatus.loading) e.currentTarget.style.background = BRAND; }}
          >
            {pwStatus.loading ? "Updating…" : "Update password"}
          </button>
        </Section>

        {/* ── Danger zone ── */}
        <Section
          icon={<Trash size={20} weight="bold" color="#dc2626" />}
          title="Delete Account"
          subtitle="Permanently delete your account and all associated data."
          danger
        >
          <p style={{ fontFamily: SERIF, fontSize: 14, color: "#64748B",
            margin: 0, lineHeight: 1.6 }}>
            This action is <strong>permanent and irreversible</strong>. All your tests,
            progress, and personal data will be erased and cannot be recovered.
          </p>

          {!deleteConfirm ? (
            <button
              onClick={() => setDeleteConfirm(true)}
              style={{
                alignSelf: "flex-start",
                padding: "11px 28px", borderRadius: 12,
                border: "1.5px solid #fca5a5",
                background: "transparent", cursor: "pointer",
                fontFamily: SERIF, fontSize: 14, fontWeight: 700, color: "#dc2626",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#fff0f0"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >
              Delete my account
            </button>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{
                background: "#fff0f0", border: "1px solid #fca5a5",
                borderRadius: 12, padding: "14px 16px",
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <WarningCircle size={18} weight="fill" color="#dc2626" />
                <span style={{ fontFamily: SERIF, fontSize: 13, color: "#b91c1c", fontWeight: 600 }}>
                  Are you sure? This cannot be undone.
                </span>
              </div>
              {deleteStatus.msg && (
                <Feedback type="error" message={deleteStatus.msg} />
              )}
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteStatus.loading}
                  style={{
                    padding: "11px 28px", borderRadius: 12, border: "none",
                    background: deleteStatus.loading ? "#94A3B8" : "#dc2626",
                    cursor: deleteStatus.loading ? "not-allowed" : "pointer",
                    fontFamily: SERIF, fontSize: 14, fontWeight: 700, color: "#fff",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={e => { if (!deleteStatus.loading) e.currentTarget.style.background = "#b91c1c"; }}
                  onMouseLeave={e => { if (!deleteStatus.loading) e.currentTarget.style.background = "#dc2626"; }}
                >
                  {deleteStatus.loading ? "Deleting…" : "Yes, delete permanently"}
                </button>
                <button
                  onClick={() => setDeleteConfirm(false)}
                  style={{
                    padding: "11px 28px", borderRadius: 12,
                    border: "1.5px solid #E2EBF0", background: "transparent",
                    cursor: "pointer", fontFamily: SERIF, fontSize: 14,
                    fontWeight: 600, color: "#64748B", transition: "border-color 0.15s, color 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#94A3B8"; e.currentTarget.style.color = DARK; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#E2EBF0"; e.currentTarget.style.color = "#64748B"; }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </Section>

      </div>

      <AppFooter />
    </div>
  );
};

export default Settings;
