/**
 * AdminInterface.jsx — Admin panel
 *
 * Centred card layout with top tabs.
 * Wired to AdminApi: addQuestion, deleteQuestion, getExams, getCourses.
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  PlusCircle, Trash, House, CheckCircle, WarningCircle,
  CircleNotch, ShieldCheck, Rows, FilePdf, SignOut,
} from "@phosphor-icons/react";
import { AdminApi } from "../../api/index.js";
import { useAuth } from "../../context/AuthContext.jsx";

const DARK  = "#062f37";
const BRAND = "#0a5f6e";
const MINT  = "#5DCAA5";
const CREAM = "#F7F4EF";
const SERIF = "Newsreader, Georgia, serif";
const SCRIPT = "Cookie, cursive";

const QUESTION_TYPES = ["MULTIPLE_CHOICE", "OPEN_ENDED", "ESSAY", "TRUE_FALSE_NG", "NUMERIC_INPUT"];
const DIFFICULTIES   = ["EASY", "MEDIUM", "HARD"];

// ── Reusable field components ─────────────────────────────────────────────────

const Label = ({ children }) => (
  <p style={{ fontFamily: SERIF, fontSize: 12, fontWeight: 700,
    color: "#64748B", textTransform: "uppercase", letterSpacing: "0.1em",
    margin: "0 0 6px" }}>
    {children}
  </p>
);

const Field = ({ children }) => (
  <div style={{ display: "flex", flexDirection: "column" }}>{children}</div>
);

const inputStyle = (focused) => ({
  width: "100%", boxSizing: "border-box",
  height: 44, background: focused ? "#f0faf7" : "#F8FAFC",
  border: `1.5px solid ${focused ? BRAND : "#E2EBF0"}`,
  borderRadius: 10, padding: "0 14px",
  fontFamily: SERIF, fontSize: 14, color: "#0F172A",
  outline: "none", transition: "border-color 0.15s, background 0.15s",
});

const selectStyle = {
  width: "100%", boxSizing: "border-box",
  height: 44, background: "#F8FAFC",
  border: "1.5px solid #E2EBF0", borderRadius: 10, padding: "0 14px",
  fontFamily: SERIF, fontSize: 14, color: "#0F172A",
  outline: "none", cursor: "pointer", appearance: "none",
};

const FocusInput = ({ value, onChange, placeholder, type = "text" }) => {
  const [f, setF] = useState(false);
  return (
    <input
      type={type} value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={inputStyle(f)}
      onFocus={() => setF(true)} onBlur={() => setF(false)}
    />
  );
};

const FocusTextarea = ({ value, onChange, placeholder, rows = 4 }) => {
  const [f, setF] = useState(false);
  return (
    <textarea
      value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} rows={rows}
      style={{
        ...inputStyle(f), height: "auto", padding: "12px 14px",
        resize: "vertical", lineHeight: 1.65,
      }}
      onFocus={() => setF(true)} onBlur={() => setF(false)}
    />
  );
};

// ── Toast-style feedback ──────────────────────────────────────────────────────

const Toast = ({ type, message }) => {
  const isOk = type === "success";
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      background: isOk ? "#f0fdf4" : "#fff0f0",
      border: `1px solid ${isOk ? "#86efac" : "#fca5a5"}`,
      borderRadius: 12, padding: "12px 18px", marginBottom: 20,
    }}>
      {isOk
        ? <CheckCircle size={18} color="#15803d" weight="fill" />
        : <WarningCircle size={18} color="#b02020" weight="fill" />}
      <span style={{ fontFamily: SERIF, fontSize: 14,
        color: isOk ? "#14532d" : "#b02020" }}>
        {message}
      </span>
    </div>
  );
};

// ── Add Question form ─────────────────────────────────────────────────────────

const AddForm = ({ exams }) => {
  const [examId,        setExamId]        = useState("");
  const [courses,       setCourses]       = useState([]);
  const [courseId,      setCourseId]      = useState("");
  const [papers,        setPapers]        = useState([]);
  const [paperId,       setPaperId]       = useState("");
  const [groups,        setGroups]        = useState([]);
  const [groupId,       setGroupId]       = useState("");
  const [groupOrderIdx, setGroupOrderIdx] = useState("");
  const [qtype,         setQtype]         = useState("MULTIPLE_CHOICE");
  const [diff,          setDiff]          = useState("MEDIUM");
  const [text,          setText]          = useState("");
  const [optA,          setOptA]          = useState("");
  const [optB,          setOptB]          = useState("");
  const [optC,          setOptC]          = useState("");
  const [optD,          setOptD]          = useState("");
  const [correct,       setCorrect]       = useState("");
  const [marks,         setMarks]         = useState("");
  const [expl,          setExpl]          = useState("");
  const [loading,       setLoading]       = useState(false);
  const [feedback,      setFeedback]      = useState(null);

  const isMCQ = ["MULTIPLE_CHOICE", "TRUE_FALSE_NG"].includes(qtype);

  useEffect(() => {
    if (!examId) { setCourses([]); setCourseId(""); setPapers([]); setPaperId(""); return; }
    AdminApi.getCourses(examId)
      .then(r => setCourses(r.data))
      .catch(() => setCourses([]));
  }, [examId]);

  useEffect(() => {
    const course = courses.find(c => String(c.id) === String(courseId));
    setPapers(course?.papers ?? []);
    setPaperId("");
  }, [courseId, courses]);

  useEffect(() => {
    if (!paperId) { setGroups([]); setGroupId(""); return; }
    AdminApi.getGroups(paperId)
      .then(r => setGroups(r.data))
      .catch(() => setGroups([]));
  }, [paperId]);

  const reset = () => {
    setText(""); setOptA(""); setOptB(""); setOptC(""); setOptD("");
    setCorrect(""); setMarks(""); setExpl("");
  };

  const handleSubmit = async () => {
    if (!courseId || !paperId || !text.trim()) {
      setFeedback({ type: "error", message: "Course, paper and question text are required." });
      return;
    }
    setLoading(true);
    setFeedback(null);
    try {
      await AdminApi.addQuestion({
        courseId:        Number(courseId),
        paperId:         Number(paperId),
        groupId:         groupId ? Number(groupId) : null,
        groupOrderIndex: groupOrderIdx ? Number(groupOrderIdx) : null,
        questionType:    qtype,
        questionText:    text.trim(),
        optionA:         optA || null,
        optionB:         optB || null,
        optionC:         optC || null,
        optionD:         optD || null,
        correctAnswer:   correct || null,
        explanation:     expl || null,
        difficulty:      diff,
        marks:           marks ? Number(marks) : null,
      });
      setFeedback({ type: "success", message: "Question added successfully." });
      reset();
    } catch (err) {
      setFeedback({ type: "error", message: err.message ?? "Failed to add question." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {feedback && <Toast {...feedback} />}

      {/* Exam + Course + Paper */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
        <Field>
          <Label>Exam type</Label>
          <div style={{ position: "relative" }}>
            <select value={examId} onChange={e => setExamId(e.target.value)} style={selectStyle}>
              <option value="">Select exam…</option>
              {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.examname}</option>)}
            </select>
            <span style={{ position: "absolute", right: 12, top: "50%",
              transform: "translateY(-50%)", pointerEvents: "none", color: "#94A3B8" }}>▾</span>
          </div>
        </Field>
        <Field>
          <Label>Course</Label>
          <div style={{ position: "relative" }}>
            <select value={courseId} onChange={e => setCourseId(e.target.value)}
              style={{ ...selectStyle, color: courses.length ? "#0F172A" : "#94A3B8" }}
              disabled={!courses.length}>
              <option value="">Select course…</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.coursename}</option>)}
            </select>
            <span style={{ position: "absolute", right: 12, top: "50%",
              transform: "translateY(-50%)", pointerEvents: "none", color: "#94A3B8" }}>▾</span>
          </div>
        </Field>
        <Field>
          <Label>Paper *</Label>
          <div style={{ position: "relative" }}>
            <select value={paperId} onChange={e => setPaperId(e.target.value)}
              style={{ ...selectStyle, color: papers.length ? "#0F172A" : "#94A3B8" }}
              disabled={!papers.length}>
              <option value="">Select paper…</option>
              {papers.map(p => <option key={p.id} value={p.id}>{p.paperName}</option>)}
            </select>
            <span style={{ position: "absolute", right: 12, top: "50%",
              transform: "translateY(-50%)", pointerEvents: "none", color: "#94A3B8" }}>▾</span>
          </div>
        </Field>
      </div>

      {/* Optional question group (passages, data-response extracts) */}
      <div style={{
        background: "#F8FAFC", borderRadius: 12, padding: "16px 18px",
        border: "1px solid #E2EBF0",
      }}>
        <p style={{ fontFamily: SERIF, fontSize: 12, fontWeight: 700,
          color: "#64748B", textTransform: "uppercase", letterSpacing: "0.1em",
          margin: "0 0 12px" }}>
          Question group <span style={{ fontWeight: 400, color: "#94A3B8" }}>(optional — for passages &amp; extracts)</span>
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
          <Field>
            <Label>Existing group</Label>
            <div style={{ position: "relative" }}>
              <select value={groupId} onChange={e => setGroupId(e.target.value)}
                style={{ ...selectStyle, color: groups.length ? "#0F172A" : "#94A3B8" }}>
                <option value="">None (standalone question)</option>
                {groups.map(g => (
                  <option key={g.id} value={g.id}>
                    [{g.orderIndex}] {g.title || `Group #${g.id}`}
                  </option>
                ))}
              </select>
              <span style={{ position: "absolute", right: 12, top: "50%",
                transform: "translateY(-50%)", pointerEvents: "none", color: "#94A3B8" }}>▾</span>
            </div>
            {paperId && groups.length === 0 && (
              <p style={{ fontFamily: SERIF, fontSize: 11, color: "#94A3B8",
                margin: "4px 0 0", fontStyle: "italic" }}>
                No groups for this paper yet — create one in the "Create Group" tab.
              </p>
            )}
          </Field>
          <Field>
            <Label>Order in group</Label>
            <FocusInput value={groupOrderIdx} onChange={setGroupOrderIdx}
              placeholder="1 = (a), 2 = (b)…" type="number" />
          </Field>
        </div>
      </div>

      {/* Type + Difficulty + Marks */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 14 }}>
        <Field>
          <Label>Question type</Label>
          <div style={{ position: "relative" }}>
            <select value={qtype} onChange={e => setQtype(e.target.value)} style={selectStyle}>
              {QUESTION_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
            </select>
            <span style={{ position: "absolute", right: 12, top: "50%",
              transform: "translateY(-50%)", pointerEvents: "none", color: "#94A3B8" }}>▾</span>
          </div>
        </Field>
        <Field>
          <Label>Difficulty</Label>
          <div style={{ position: "relative" }}>
            <select value={diff} onChange={e => setDiff(e.target.value)} style={selectStyle}>
              {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <span style={{ position: "absolute", right: 12, top: "50%",
              transform: "translateY(-50%)", pointerEvents: "none", color: "#94A3B8" }}>▾</span>
          </div>
        </Field>
        <Field>
          <Label>Marks</Label>
          <FocusInput value={marks} onChange={setMarks} placeholder="e.g. 5" type="number" />
        </Field>
      </div>

      {/* Question text */}
      <Field>
        <Label>Question text *</Label>
        <FocusTextarea value={text} onChange={setText}
          placeholder="Write the full question here…" rows={4} />
      </Field>

      {/* MCQ options */}
      {isMCQ && (
        <div>
          <Label>Answer choices</Label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[["A", optA, setOptA], ["B", optB, setOptB],
              ["C", optC, setOptC], ["D", optD, setOptD]].map(([l, v, s]) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: SERIF, fontSize: 13, fontWeight: 700,
                  color: BRAND, width: 18, flexShrink: 0 }}>{l}</span>
                <FocusInput value={v} onChange={s} placeholder={`Choice ${l}`} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Correct answer */}
      <div style={{ display: "grid", gridTemplateColumns: isMCQ ? "1fr 2fr" : "1fr", gap: 14 }}>
        {isMCQ && (
          <Field>
            <Label>Correct answer</Label>
            <div style={{ position: "relative" }}>
              <select value={correct} onChange={e => setCorrect(e.target.value)} style={selectStyle}>
                <option value="">Select…</option>
                {["A","B","C","D"].map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <span style={{ position: "absolute", right: 12, top: "50%",
                transform: "translateY(-50%)", pointerEvents: "none", color: "#94A3B8" }}>▾</span>
            </div>
          </Field>
        )}
        <Field>
          <Label>Explanation (optional)</Label>
          <FocusInput value={expl} onChange={setExpl}
            placeholder="Brief explanation of the correct answer…" />
        </Field>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 4 }}>
        <button onClick={handleSubmit} disabled={loading}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: loading ? "#E2EBF0" : MINT, border: "none", borderRadius: 12,
            padding: "13px 32px", fontFamily: SERIF, fontSize: 15,
            fontWeight: 700, color: loading ? "#94A3B8" : DARK, cursor: loading ? "not-allowed" : "pointer",
            boxShadow: loading ? "none" : "0 8px 24px rgba(93,202,165,0.3)",
            transition: "all 0.18s",
          }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#3aab87"; }}
          onMouseLeave={e => { if (!loading) e.currentTarget.style.background = MINT; }}>
          {loading
            ? <><CircleNotch size={16} style={{ animation: "spin 0.8s linear infinite" }} /> Saving…</>
            : <><PlusCircle size={16} weight="bold" /> Add question</>}
        </button>
      </div>
    </div>
  );
};

// ── Delete Question form ───────────────────────────────────────────────────────

const DeleteForm = () => {
  const [qid,      setQid]      = useState("");
  const [loading,  setLoading]  = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [confirm,  setConfirm]  = useState(false);

  const handleDelete = async () => {
    if (!qid.trim()) {
      setFeedback({ type: "error", message: "Please enter a question ID." }); return;
    }
    if (!confirm) { setConfirm(true); return; }
    setLoading(true); setFeedback(null);
    try {
      await AdminApi.deleteQuestion(Number(qid));
      setFeedback({ type: "success", message: `Question #${qid} deleted.` });
      setQid(""); setConfirm(false);
    } catch (err) {
      setFeedback({ type: "error", message: err.message ?? "Delete failed." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {feedback && <Toast {...feedback} />}

      <div style={{
        background: "#fff8e6", border: "1px solid #fde68a",
        borderRadius: 12, padding: "14px 18px",
      }}>
        <p style={{ fontFamily: SERIF, fontSize: 14, color: "#92400e", margin: 0, lineHeight: 1.6 }}>
          Deleting a question is permanent and cannot be undone. Make sure you have the correct ID.
        </p>
      </div>

      <Field>
        <Label>Question ID *</Label>
        <FocusInput value={qid} onChange={v => { setQid(v); setConfirm(false); }}
          placeholder="Enter the numeric question ID…" type="number" />
      </Field>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={handleDelete} disabled={loading}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: loading ? "#E2EBF0" : confirm ? "#b02020" : "#fff0f0",
            border: `1.5px solid ${confirm ? "#b02020" : "#fca5a5"}`,
            borderRadius: 12, padding: "13px 32px",
            fontFamily: SERIF, fontSize: 15, fontWeight: 700,
            color: loading ? "#94A3B8" : confirm ? "#fff" : "#b02020",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "all 0.18s",
          }}>
          {loading
            ? <><CircleNotch size={16} style={{ animation: "spin 0.8s linear infinite" }} /> Deleting…</>
            : <><Trash size={16} weight="bold" /> {confirm ? "Confirm delete" : "Delete question"}</>}
        </button>
      </div>

      {confirm && !loading && (
        <p style={{ fontFamily: SERIF, fontSize: 13, color: "#b02020",
          textAlign: "right", margin: 0 }}>
          Click again to confirm permanent deletion of question #{qid}.
        </p>
      )}
    </div>
  );
};

// ── Create Group form ─────────────────────────────────────────────────────────

const CreateGroupForm = ({ exams }) => {
  const [examId,   setExamId]   = useState("");
  const [courses,  setCourses]  = useState([]);
  const [courseId, setCourseId] = useState("");
  const [papers,   setPapers]   = useState([]);
  const [paperId,  setPaperId]  = useState("");
  const [title,    setTitle]    = useState("");
  const [context,  setContext]  = useState("");
  const [imgUrl,   setImgUrl]   = useState("");
  const [order,    setOrder]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (!examId) { setCourses([]); setCourseId(""); setPapers([]); setPaperId(""); return; }
    AdminApi.getCourses(examId).then(r => setCourses(r.data)).catch(() => {});
  }, [examId]);

  useEffect(() => {
    const c = courses.find(c => String(c.id) === String(courseId));
    setPapers(c?.papers ?? []); setPaperId("");
  }, [courseId, courses]);

  const handleSubmit = async () => {
    if (!paperId || !title.trim() || !context.trim()) {
      setFeedback({ type: "error", message: "Paper, title and passage text are required." });
      return;
    }
    setLoading(true); setFeedback(null);
    try {
      const res = await AdminApi.createGroup({
        paperId:        Number(paperId),
        title:          title.trim(),
        contextText:    context.trim(),
        contextImageUrl: imgUrl || null,
        orderIndex:     order ? Number(order) : 1,
      });
      setFeedback({ type: "success",
        message: `Group created — ID ${res.data.id}. You can now add questions to it.` });
      setTitle(""); setContext(""); setImgUrl(""); setOrder("");
    } catch (err) {
      setFeedback({ type: "error", message: err.message ?? "Failed to create group." });
    } finally { setLoading(false); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {feedback && <Toast {...feedback} />}

      <div style={{ background: "#e8f7f9", borderRadius: 12, padding: "14px 18px",
        border: "1px solid #99d9e4" }}>
        <p style={{ fontFamily: SERIF, fontSize: 14, color: BRAND, margin: 0, lineHeight: 1.6 }}>
          A <strong>question group</strong> is a shared passage, extract, or data source that
          multiple sub-questions reference. Create the group first, then add questions to it from
          the "Add Question" tab.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
        <Field>
          <Label>Exam</Label>
          <div style={{ position: "relative" }}>
            <select value={examId} onChange={e => setExamId(e.target.value)} style={selectStyle}>
              <option value="">Select exam…</option>
              {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.examname}</option>)}
            </select>
            <span style={{ position: "absolute", right: 12, top: "50%",
              transform: "translateY(-50%)", pointerEvents: "none", color: "#94A3B8" }}>▾</span>
          </div>
        </Field>
        <Field>
          <Label>Course</Label>
          <div style={{ position: "relative" }}>
            <select value={courseId} onChange={e => setCourseId(e.target.value)}
              style={selectStyle} disabled={!courses.length}>
              <option value="">Select course…</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.coursename}</option>)}
            </select>
            <span style={{ position: "absolute", right: 12, top: "50%",
              transform: "translateY(-50%)", pointerEvents: "none", color: "#94A3B8" }}>▾</span>
          </div>
        </Field>
        <Field>
          <Label>Paper *</Label>
          <div style={{ position: "relative" }}>
            <select value={paperId} onChange={e => setPaperId(e.target.value)}
              style={selectStyle} disabled={!papers.length}>
              <option value="">Select paper…</option>
              {papers.map(p => <option key={p.id} value={p.id}>{p.paperName}</option>)}
            </select>
            <span style={{ position: "absolute", right: 12, top: "50%",
              transform: "translateY(-50%)", pointerEvents: "none", color: "#94A3B8" }}>▾</span>
          </div>
        </Field>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr", gap: 14 }}>
        <Field>
          <Label>Group title * (e.g. "Extract A: Economic Growth")</Label>
          <FocusInput value={title} onChange={setTitle}
            placeholder="Descriptive title shown above the passage…" />
        </Field>
        <Field>
          <Label>Order in paper</Label>
          <FocusInput value={order} onChange={setOrder}
            placeholder="1, 2, 3…" type="number" />
        </Field>
      </div>

      <Field>
        <Label>Passage / context text * (the shared reading material)</Label>
        <FocusTextarea value={context} onChange={setContext}
          placeholder="Paste the full passage, extract, data table description, or essay prompt here…"
          rows={8} />
      </Field>

      <Field>
        <Label>Image URL (optional — chart, table, diagram)</Label>
        <FocusInput value={imgUrl} onChange={setImgUrl}
          placeholder="https://…" />
      </Field>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={handleSubmit} disabled={loading}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: loading ? "#E2EBF0" : MINT, border: "none", borderRadius: 12,
            padding: "13px 32px", fontFamily: SERIF, fontSize: 15,
            fontWeight: 700, color: loading ? "#94A3B8" : DARK,
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: loading ? "none" : "0 8px 24px rgba(93,202,165,0.3)",
          }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#3aab87"; }}
          onMouseLeave={e => { if (!loading) e.currentTarget.style.background = MINT; }}>
          {loading
            ? <><CircleNotch size={16} style={{ animation: "spin 0.8s linear infinite" }} /> Creating…</>
            : <><Rows size={16} weight="bold" /> Create group</>}
        </button>
      </div>
    </div>
  );
};

// ── Formula Sheet upload form ─────────────────────────────────────────────────

const FormulaSheetForm = ({ exams }) => {
  const [examId,   setExamId]   = useState("");
  const [courses,  setCourses]  = useState([]);
  const [courseId, setCourseId] = useState("");
  const [file,     setFile]     = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (!examId) { setCourses([]); setCourseId(""); return; }
    AdminApi.getCourses(examId).then(r => setCourses(r.data)).catch(() => {});
  }, [examId]);

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f?.type === "application/pdf") setFile(f);
    else setFeedback({ type: "error", message: "Only PDF files are accepted." });
  };

  const handleSubmit = async () => {
    if (!courseId || !file) {
      setFeedback({ type: "error", message: "Select a course and a PDF file." }); return;
    }
    setLoading(true); setFeedback(null);
    try {
      await AdminApi.uploadFormulaSheet(courseId, file);
      const courseName = courses.find(c => String(c.id) === String(courseId))?.coursename ?? "";
      setFeedback({ type: "success",
        message: `Formula sheet uploaded for "${courseName}". The download button is now active.` });
      setFile(null);
    } catch (err) {
      setFeedback({ type: "error", message: err.message ?? "Upload failed." });
    } finally { setLoading(false); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {feedback && <Toast {...feedback} />}

      <div style={{ background: "#e8f7f9", borderRadius: 12, padding: "14px 18px",
        border: "1px solid #99d9e4" }}>
        <p style={{ fontFamily: SERIF, fontSize: 14, color: BRAND, margin: 0, lineHeight: 1.6 }}>
          Upload a PDF formula/reference sheet for a subject. Once uploaded, students will see
          a <strong>Download Formula Sheet</strong> button on that subject's Units page.
          Uploading again replaces the existing file.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Field>
          <Label>Exam</Label>
          <div style={{ position: "relative" }}>
            <select value={examId} onChange={e => setExamId(e.target.value)} style={selectStyle}>
              <option value="">Select exam…</option>
              {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.examname}</option>)}
            </select>
            <span style={{ position: "absolute", right: 12, top: "50%",
              transform: "translateY(-50%)", pointerEvents: "none", color: "#94A3B8" }}>▾</span>
          </div>
        </Field>
        <Field>
          <Label>Subject / Course *</Label>
          <div style={{ position: "relative" }}>
            <select value={courseId} onChange={e => setCourseId(e.target.value)}
              style={selectStyle} disabled={!courses.length}>
              <option value="">Select course…</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.coursename}</option>)}
            </select>
            <span style={{ position: "absolute", right: 12, top: "50%",
              transform: "translateY(-50%)", pointerEvents: "none", color: "#94A3B8" }}>▾</span>
          </div>
        </Field>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById("fs-file-input").click()}
        style={{
          border: `2px dashed ${dragging ? BRAND : file ? MINT : "#E2EBF0"}`,
          borderRadius: 14, padding: "36px 24px",
          background: dragging ? "#e8f7f9" : file ? "#f0fdf4" : "#F8FAFC",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
          cursor: "pointer", transition: "all 0.2s",
        }}>
        <input id="fs-file-input" type="file" accept="application/pdf"
          style={{ display: "none" }}
          onChange={e => { if (e.target.files[0]) setFile(e.target.files[0]); }} />
        <FilePdf size={36} weight="duotone"
          color={file ? "#15803d" : dragging ? BRAND : "#94A3B8"} />
        {file ? (
          <>
            <p style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 700,
              color: "#15803d", margin: 0 }}>{file.name}</p>
            <p style={{ fontFamily: SERIF, fontSize: 12, color: "#64748B", margin: 0 }}>
              {(file.size / 1024).toFixed(0)} KB · Click to replace
            </p>
          </>
        ) : (
          <>
            <p style={{ fontFamily: SERIF, fontSize: 15, color: "#64748B", margin: 0 }}>
              Drop PDF here or click to browse
            </p>
            <p style={{ fontFamily: SERIF, fontSize: 12, color: "#94A3B8", margin: 0 }}>
              PDF only · Max recommended 10 MB
            </p>
          </>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={handleSubmit} disabled={loading || !file || !courseId}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: (loading || !file || !courseId) ? "#E2EBF0" : MINT,
            border: "none", borderRadius: 12, padding: "13px 32px",
            fontFamily: SERIF, fontSize: 15, fontWeight: 700,
            color: (loading || !file || !courseId) ? "#94A3B8" : DARK,
            cursor: (loading || !file || !courseId) ? "not-allowed" : "pointer",
            boxShadow: (loading || !file || !courseId) ? "none" : "0 8px 24px rgba(93,202,165,0.3)",
          }}
          onMouseEnter={e => { if (!loading && file && courseId) e.currentTarget.style.background = "#3aab87"; }}
          onMouseLeave={e => { if (!loading && file && courseId) e.currentTarget.style.background = MINT; }}>
          {loading
            ? <><CircleNotch size={16} style={{ animation: "spin 0.8s linear infinite" }} /> Uploading…</>
            : <><FilePdf size={16} weight="bold" /> Upload formula sheet</>}
        </button>
      </div>
    </div>
  );
};

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  { key: "add",     label: "Add Question",    Icon: PlusCircle },
  { key: "group",   label: "Create Group",    Icon: Rows       },
  { key: "formula", label: "Formula Sheet",   Icon: FilePdf    },
  { key: "delete",  label: "Delete Question", Icon: Trash      },
];

// ── Main screen ───────────────────────────────────────────────────────────────

const AdminInterface = () => {
  const navigate = useNavigate();
  const { clearSession } = useAuth();
  const [tab,   setTab]   = useState("add");
  const [exams, setExams] = useState([]);

  useEffect(() => {
    AdminApi.getExams()
      .then(r => setExams(r.data))
      .catch(() => {});
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: CREAM, display: "flex", flexDirection: "column" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Header */}
      <header style={{
        height: 56, flexShrink: 0,
        background: `linear-gradient(90deg, ${DARK} 0%, ${BRAND} 100%)`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 32px", boxShadow: "0 2px 12px rgba(0,0,0,0.18)",
      }}>
        <span style={{ fontFamily: SCRIPT, fontSize: 24, color: "#fff", letterSpacing: 0.3 }}>
          edusupernova
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ShieldCheck size={15} weight="fill" color={MINT} />
          <span style={{ fontFamily: SERIF, fontSize: 12, fontWeight: 700,
            color: MINT, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Admin panel
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => navigate("/courses")}
            style={{ display: "flex", alignItems: "center", gap: 6,
              background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 10, padding: "7px 16px", cursor: "pointer",
              fontFamily: SERIF, fontSize: 13, color: "rgba(255,255,255,0.7)",
              transition: "color 0.15s, background 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.14)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}>
            <House size={14} weight="light" /> Back to app
          </button>
          <button onClick={() => { clearSession(); navigate("/login"); }}
            style={{ display: "flex", alignItems: "center", gap: 6,
              background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 10, padding: "7px 16px", cursor: "pointer",
              fontFamily: SERIF, fontSize: 13, color: "rgba(255,255,255,0.7)",
              transition: "color 0.15s, background 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.14)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}>
            <SignOut size={14} weight="light" /> Log out
          </button>
        </div>
      </header>

      {/* Page content — centred */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", padding: "48px 24px 80px" }}>

        {/* Page title */}
        <div style={{ width: "100%", maxWidth: 720, marginBottom: 32 }}>
          <h1 style={{ fontFamily: SERIF, fontSize: 32, fontWeight: 700,
            color: DARK, letterSpacing: "-0.8px", margin: "0 0 6px" }}>
            Question Manager
          </h1>
          <p style={{ fontFamily: SERIF, fontSize: 15, color: "#64748B", margin: 0 }}>
            Add or remove questions from the exam bank.
          </p>
        </div>

        {/* Card */}
        <div style={{
          width: "100%", maxWidth: 720,
          background: "#fff", borderRadius: 24,
          boxShadow: "0 4px 32px rgba(0,0,0,0.07)",
          border: "1px solid #E8EDF4",
          overflow: "hidden",
        }}>
          {/* Tab bar */}
          <div style={{ display: "flex", borderBottom: "1px solid #F1F5F9" }}>
            {TABS.map(({ key, label, Icon }) => {
              const active = tab === key;
              return (
                <button key={key} onClick={() => setTab(key)}
                  style={{
                    flex: 1, display: "flex", alignItems: "center",
                    justifyContent: "center", gap: 8,
                    padding: "16px 0", border: "none", background: "none", cursor: "pointer",
                    fontFamily: SERIF, fontSize: 14, fontWeight: active ? 700 : 400,
                    color: active ? BRAND : "#94A3B8",
                    borderBottom: `2.5px solid ${active ? BRAND : "transparent"}`,
                    transition: "color 0.15s",
                  }}>
                  <Icon size={16} weight={active ? "bold" : "light"} />
                  {label}
                </button>
              );
            })}
          </div>

          {/* Form body */}
          <div style={{ padding: "32px 36px 36px" }}>
            {tab === "add"     && <AddForm          exams={exams} />}
            {tab === "group"   && <CreateGroupForm  exams={exams} />}
            {tab === "formula" && <FormulaSheetForm exams={exams} />}
            {tab === "delete"  && <DeleteForm />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminInterface;
