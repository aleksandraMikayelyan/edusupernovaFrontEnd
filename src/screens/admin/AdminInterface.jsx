/**
 * AdminInterface.jsx — Admin panel (WEB) — redesigned 2026
 *
 * SOLID:
 *   SRP  — sub-components handle individual form types
 *   OCP  — add a new MODES entry + form component without touching existing logic
 *   DIP  — ready to wire to AdminApi (currently stub forms)
 *
 * Design: dark sidebar + white form panel
 * Distinct from student UI — intentionally more utilitarian/dashboard-like
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PlusCircle, Trash, UploadSimple,
  PencilSimple, House, MagnifyingGlass, UserCircle
} from "@phosphor-icons/react";

const DARK  = "#062f37"; const BRAND = "#0a5f6e"; const MINT = "#5DCAA5";
const SERIF = "Newsreader, Georgia, serif"; const SCRIPT = "Cookie, cursive";

// ─── Constants ────────────────────────────────────────────────────────────────

const MODES = {
  ADD:     { key:"add",     label:"Add Questions",    Icon:PlusCircle   },
  DELETE:  { key:"delete",  label:"Delete Questions", Icon:Trash        },
  SOURCES: { key:"sources", label:"Upload Sources",   Icon:UploadSimple },
  UPDATE:  { key:"update",  label:"Update Exam Types",Icon:PencilSimple },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const StyledInput = ({ placeholder, style = {} }) => (
  <input placeholder={placeholder}
    style={{ width:"100%", height:44, background:"#F7F4EF",
      border:"1.5px solid #E2EBF0", borderRadius:10, padding:"0 16px",
      fontFamily:SERIF, fontSize:14, color:"#0F172A", outline:"none",
      boxSizing:"border-box", transition:"border-color 0.15s", ...style }}
    onFocus={e=>e.target.style.borderColor=BRAND}
    onBlur={e=>e.target.style.borderColor="#E2EBF0"}
  />
);

const Select = ({ label, options = ["A Levels","SAT","IELTS","ACT","TOEFL"] }) => (
  <div style={{ position:"relative" }}>
    <select style={{ width:"100%", height:44, background:"#F7F4EF",
      border:"1.5px solid #E2EBF0", borderRadius:10, padding:"0 16px",
      fontFamily:SERIF, fontSize:14, color:"#0F172A", outline:"none",
      appearance:"none", cursor:"pointer", boxSizing:"border-box" }}>
      <option value="">{label}</option>
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
    <div style={{ position:"absolute", right:14, top:"50%",
      transform:"translateY(-50%)", pointerEvents:"none", color:"#94A3B8" }}>▾</div>
  </div>
);

const AddForm = () => (
  <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
    <p style={{ fontFamily:SERIF, fontSize:12, color:"#94A3B8",
      textTransform:"uppercase", letterSpacing:"0.1em" }}>Question text</p>
    <textarea placeholder="Write the question here…"
      style={{ width:"100%", minHeight:100, background:"#F7F4EF",
        border:"1.5px solid #E2EBF0", borderRadius:10, padding:"12px 16px",
        fontFamily:SERIF, fontSize:14, color:"#0F172A", outline:"none",
        resize:"vertical", boxSizing:"border-box", lineHeight:1.6 }}
      onFocus={e=>e.target.style.borderColor=BRAND}
      onBlur={e=>e.target.style.borderColor="#E2EBF0"}
    />
    <p style={{ fontFamily:SERIF, fontSize:12, color:"#94A3B8",
      textTransform:"uppercase", letterSpacing:"0.1em" }}>Answer choices</p>
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
      {["A","B","C","D"].map(l => (
        <StyledInput key={l} placeholder={`Choice ${l}`} />
      ))}
    </div>
    <p style={{ fontFamily:SERIF, fontSize:12, color:"#94A3B8",
      textTransform:"uppercase", letterSpacing:"0.1em" }}>Correct answer</p>
    <StyledInput placeholder="e.g. A" style={{ maxWidth:120 }} />
  </div>
);

const DeleteForm = () => (
  <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
    <p style={{ fontFamily:SERIF, fontSize:12, color:"#94A3B8",
      textTransform:"uppercase", letterSpacing:"0.1em" }}>Find by ID</p>
    <StyledInput placeholder="Question ID…" />
  </div>
);

const SourcesForm = () => (
  <div style={{ border:"2px dashed #E2EBF0", borderRadius:16,
    padding:"40px 24px", display:"flex", flexDirection:"column",
    alignItems:"center", gap:12, cursor:"pointer",
    transition:"border-color 0.15s, background 0.15s",
    background:"#F7F4EF" }}
    onMouseEnter={e=>{e.currentTarget.style.borderColor=BRAND;e.currentTarget.style.background="#e8f7f9"}}
    onMouseLeave={e=>{e.currentTarget.style.borderColor="#E2EBF0";e.currentTarget.style.background="#F7F4EF"}}
    onDragOver={e=>e.preventDefault()}>
    <UploadSimple size={32} weight="light" color="#94A3B8" />
    <p style={{ fontFamily:SERIF, fontSize:15, color:"#64748B", textAlign:"center" }}>
      Drop files here or click to upload
    </p>
    <p style={{ fontFamily:SERIF, fontSize:12, color:"#94A3B8" }}>PDF, TXT supported</p>
  </div>
);

const UpdateForm = () => (
  <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
    <p style={{ fontFamily:SERIF, fontSize:12, color:"#94A3B8",
      textTransform:"uppercase", letterSpacing:"0.1em" }}>Exam type name</p>
    <StyledInput placeholder="e.g. A Levels" />
  </div>
);

const FORM_MAP = {
  add:     <AddForm />,
  delete:  <DeleteForm />,
  sources: <SourcesForm />,
  update:  <UpdateForm />,
};

// ─── Screen ───────────────────────────────────────────────────────────────────

const AdminInterface = () => {
  const navigate = useNavigate();
  const [activeMode, setActiveMode] = useState("add");

  return (
    <div style={{ height:"100vh", display:"flex", flexDirection:"column", overflow:"hidden" }}>

      {/* Header */}
      <header style={{ height:56, flexShrink:0,
        background:`linear-gradient(90deg, ${DARK} 0%, ${BRAND} 100%)`,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"0 24px", zIndex:10,
        boxShadow:"0 2px 12px rgba(10,95,110,0.2)" }}>
        <span style={{ fontFamily:SCRIPT, fontSize:24, color:"#fff", letterSpacing:0.3 }}>
          edusupernova
        </span>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ background:"rgba(255,255,255,0.12)",
            border:"1px solid rgba(255,255,255,0.18)",
            borderRadius:999, padding:"3px 10px",
            fontFamily:SERIF, fontSize:11, fontWeight:700,
            color:"rgba(255,255,255,0.7)", letterSpacing:"0.08em",
            textTransform:"uppercase" }}>Admin</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <button onClick={() => navigate("/")}
            style={{ fontFamily:SERIF, fontSize:13, color:"rgba(255,255,255,0.6)",
              background:"none", border:"none", cursor:"pointer",
              display:"flex", alignItems:"center", gap:5,
              transition:"color 0.15s" }}
            onMouseEnter={e=>e.currentTarget.style.color="#fff"}
            onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.6)"}>
            <House size={14} weight="light" /> Home
          </button>
          <div style={{ width:30, height:30, borderRadius:"50%",
            background:"rgba(255,255,255,0.12)",
            border:"1.5px solid rgba(255,255,255,0.2)",
            display:"flex", alignItems:"center", justifyContent:"center" }}>
            <UserCircle size={16} weight="duotone" color="rgba(255,255,255,0.7)" />
          </div>
        </div>
      </header>

      {/* Body — sidebar + form */}
      <div style={{ display:"flex", flex:1, overflow:"hidden" }}>

        {/* Dark sidebar */}
        <aside style={{ width:240, flexShrink:0,
          background:DARK, display:"flex",
          flexDirection:"column", padding:"24px 14px",
          borderRight:"1px solid rgba(255,255,255,0.06)" }}>
          <p style={{ fontFamily:SERIF, fontSize:10, fontWeight:700,
            color:"rgba(255,255,255,0.3)", textTransform:"uppercase",
            letterSpacing:"0.14em", marginBottom:14, paddingLeft:8 }}>
            Actions
          </p>
          {Object.values(MODES).map(({ key, label, Icon }) => {
            const isActive = activeMode === key;
            return (
              <button key={key} onClick={() => setActiveMode(key)}
                style={{ width:"100%", display:"flex", alignItems:"center", gap:10,
                  padding:"11px 12px", borderRadius:12, border:"none",
                  background: isActive ? `rgba(93,202,165,0.12)` : "transparent",
                  fontFamily:SERIF, fontSize:14,
                  color: isActive ? MINT : "rgba(255,255,255,0.5)",
                  cursor:"pointer", textAlign:"left", marginBottom:4,
                  transition:"all 0.15s",
                  borderLeft: isActive ? `2px solid ${MINT}` : "2px solid transparent" }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background="rgba(255,255,255,0.05)"; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background="transparent"; }}
              >
                <Icon size={17} weight={isActive ? "bold" : "light"}
                  color={isActive ? MINT : "rgba(255,255,255,0.4)"} />
                {label}
              </button>
            );
          })}
        </aside>

        {/* Form panel */}
        <main style={{ flex:1, background:"#fff", overflowY:"auto", padding:"36px 40px" }}>

          {/* Dropdowns */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr",
            gap:14, marginBottom:32, maxWidth:600 }}>
            <Select label="Select exam type" />
            <Select label="Select subject"
              options={["Mathematics","Economics","Physics","Chemistry","English"]} />
          </div>

          {/* Section heading */}
          <p style={{ fontFamily:SERIF, fontSize:11, fontWeight:700,
            color:"#94A3B8", textTransform:"uppercase",
            letterSpacing:"0.12em", marginBottom:20 }}>
            {MODES[activeMode.toUpperCase()]?.label ?? "Form"}
          </p>

          {/* Dynamic form */}
          <div style={{ maxWidth:600 }}>
            {FORM_MAP[activeMode]}

            {/* Save button */}
            <div style={{ display:"flex", justifyContent:"flex-end", marginTop:28 }}>
              <button style={{ background:MINT, border:"none", borderRadius:12,
                padding:"13px 32px", fontFamily:SERIF, fontSize:15,
                fontWeight:700, color:DARK, cursor:"pointer",
                boxShadow:"0 8px 24px rgba(93,202,165,0.3)",
                transition:"transform 0.18s, background 0.18s" }}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.background="#3aab87"}}
                onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.background=MINT}}
              >
                Save changes
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminInterface;