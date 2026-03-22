/**
 * api/index.js — All API calls in one place
 *
 * SOLID:
 *   SRP  — each function does exactly one thing
 *   OCP  — add new endpoints here without touching screens
 *   DIP  — screens import these functions, not axios/client directly
 */

import client from "./client.js";

// ── Auth ──────────────────────────────────────────────────────────────────────

export const AuthApi = {
  login:    (email, password)           => client.post("/users/login",    { email, password }),
  register: (username, email, password) => client.post("/users/register", { username, email, password, rol: "STUDENT" }),
};

// ── Courses / Exams ───────────────────────────────────────────────────────────

export const CoursesApi = {
  getExams:         ()         => client.get("/exams/dashboard"),
  getCoursesByExam: (examId)   => client.get(`/exams/${examId}`),
  getUnits:         (courseId) => client.get(`/units/course/${courseId}`),
  getFormulaSheet:  (courseId) => `/api/courses/${courseId}/formula-sheet`,
};

// ── Tests ─────────────────────────────────────────────────────────────────────

export const TestsApi = {
  start:        (email, courseId) => client.post("/tests/start", { email, courseId }),
  getQuestions: (testId)          => client.get(`/tests/${testId}/questions`),
};

// ── Feedback ──────────────────────────────────────────────────────────────────
//
// FeedbackController:
//   POST /api/feedback/process  — save answers + evaluate (testId as @RequestParam)
//   GET  /api/feedback/{testId} — polling until openEndedPending = false
//
// NOTE: submit sends testId as a query param (?testId=X), NOT in the URL path.
// The @RequestBody is List<TestQuestions> — each item has { id: { testId, quizId }, userResponse }.

export const FeedbackApi = {
  process: (testId, answers, examType = "", sectionName = "") =>
    client.post("/feedback/process", answers, {
      params: { testId, examType, sectionName },
    }),

  poll: (testId) =>
    client.get(`/feedback/${testId}`),
};