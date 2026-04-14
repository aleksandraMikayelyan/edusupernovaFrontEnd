/**
 * api/index.js — All API calls in one place
 *
 * SOLID:
 *   SRP  — each function does exactly one thing
 *   OCP  — add new endpoints here without touching screens
 *   DIP  — screens import these functions, not axios/client directly
 *
 * DTOs (backend contract reference):
 *   AuthResponse      { accessToken, tokenType, expiresIn, rol, user: UserSummaryDTO }
 *   UserSummaryDTO    { id, username, email, rol }
 *   ExamDTO           { id, examname, description, icon, isActive, timeLimitMinutes }
 *   CourseDTO         { id, coursename, description, icon, totalQuestions, examId, examName, papers }
 *   PaperDTO          { id, paperName, instructions, format, totalQuestions, timeLimitMinutes, orderIndex }
 *   EnrollmentDTO     { examId, examName, examIcon, enrolledAt, progress }
 *   TestSessionDTO    { testId, courseName, paperName, paperFormat, totalQuestions, answeredCount,
 *                       totalCorrect, status, startedAt, timeLimitMinutes, remainingSeconds, currentQuestion }
 *   TestQuestionDTO   { testId, quizId, questionNumber, questionText, type, difficulty,
 *                       optionA, optionB, optionC, optionD, optionE, userResponse, correctResponse, feedbackIa,
 *                       groupId, groupTitle, contextText, contextImageUrl, groupOrderIndex, marks }
 *   AnswerFeedbackDTO { quizId, isCorrect, correctAnswer, explanation, aiFeedback, aiScore,
 *                       sessionComplete, nextQuestion }
 *   FeedBackDTO       { testId, courseName, paperName, unitName, totalCorrect, totalQuestions,
 *                       finalScore, grade, startedAt, completedAt, durationSeconds, questionsFeedback }
 *   ApiErrorDTO       { status, error, message, path, timestamp }
 */

import client from "./client.js";

// ── Auth ──────────────────────────────────────────────────────────────────────

export const AuthApi = {
  /** Returns AuthResponse */
  login:    (email, password)           => client.post("/users/login",    { email, password }),
  /** Returns AuthResponse. rol is NOT sent — backend assigns STUDENT by default. */
  register: (username, email, password) => client.post("/users/register", { username, email, password }),
};

// ── Courses / Exams ───────────────────────────────────────────────────────────

export const CoursesApi = {
  /** Returns List<ExamDTO> */
  getExams:         ()         => client.get("/exams/dashboard"),
  /** Returns List<CourseDTO> — each course includes papers[] */
  getCoursesByExam: (examId)   => client.get(`/exams/${examId}`),
  /** Returns CourseUnitsResponse { courseName, courseIcon, units: UnitDTO[] } */
  getUnits:         (courseId) => client.get(`/units/course/${courseId}`),
  /** Returns a URL string (used to open PDF in new tab) */
  getFormulaSheet:  (courseId) => `/api/courses/${courseId}/formula-sheet`,
};

// ── Enrollments ───────────────────────────────────────────────────────────────

export const EnrollmentApi = {
  /** Returns List<EnrollmentDTO> for the authenticated user */
  getMyEnrollments: ()       => client.get("/enrollments/me"),
  /** Body: EnrollmentRequest { examId } — JWT identifies the user */
  enroll:           (examId) => client.post("/enrollments", { examId }),
};

// ── Tests — new per-question flow ─────────────────────────────────────────────

export const TestsApi = {
  /**
   * Starts a new test session.
   * Returns TestSessionDTO (includes testId + first question as currentQuestion).
   * paperId and unitId are optional.
   */
  start: (courseId, paperId = null, unitId = null) => {
    const body = { courseId };
    if (paperId != null) body.paperId = paperId;
    if (unitId  != null) body.unitId  = unitId;
    return client.post("/tests/start", body);
  },

  /**
   * Submits one answer. Returns AnswerFeedbackDTO.
   * nextQuestion is null when sessionComplete = true.
   */
  submitAnswer: (testId, quizId, userResponse) =>
    client.post(`/tests/${testId}/answer`, { quizId, userResponse }),

  /**
   * Fetches all questions for a test (with current userResponse state).
   * Returns List<TestQuestionDTO> — used to pre-fill Paper 2 / Paper 3 screens.
   */
  getQuestions: (testId) =>
    client.get(`/tests/${testId}/questions`),

  /**
   * Fetches the full post-test report. Returns FeedBackDTO.
   * Navigate here when AnswerFeedbackDTO.sessionComplete = true.
   */
  getReport: (testId) =>
    client.get(`/tests/${testId}/report`),
};

// ── Feedback (legacy polling — kept until report page is fully migrated) ──────

export const FeedbackApi = {
  /** Poll until openEndedPending = false */
  poll: (testId) => client.get(`/feedback/${testId}`),
};
