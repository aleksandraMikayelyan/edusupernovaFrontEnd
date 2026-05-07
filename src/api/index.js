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
  /** Google OAuth — send the Google ID token; backend returns AuthResponse */
  googleAuth: (token)                   => client.post("/users/google-auth", { idToken: token }),
};

// ── Courses / Exams ───────────────────────────────────────────────────────────

export const CoursesApi = {
  /** Returns List<ExamDTO> */
  getExams:          ()                   => client.get("/exams/dashboard"),
  /** Returns List<CourseDTO> — each course includes papers[]. section: "AS" | "A2" | null */
  getCoursesByExam:  (examId, section = null) => {
    const qs = section ? `?section=${section}` : "";
    return client.get(`/exams/${examId}${qs}`);
  },
  /** Returns CourseUnitsResponse { courseName, courseIcon, units: UnitDTO[] } */
  getUnits:          (courseId)           => client.get(`/units/course/${courseId}`),
  /** Returns a URL string (used to open PDF in new tab) */
  getFormulaSheet:   (courseId)           => `/api/courses/${courseId}/formula-sheet`,
  /** Returns Boolean — true if user is already enrolled in the exam */
  checkEnrollment:   (examId, userId)     => client.get(`/exams/${examId}/status?userId=${userId}`),
  /** Enroll user in exam. Returns 200 "Enrollment successful" or 400 if already enrolled */
  enroll:            (examId, userId)     => client.post(`/exams/${examId}/enroll?userId=${userId}`),
  /** Unenroll user from exam */
  unenroll:          (examId, userId)     => client.delete(`/exams/${examId}/unenroll?userId=${userId}`),
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

  /**
   * Returns DailyStatusDTO { usedToday, limit, isPremium }.
   * Call on TestPage mount to enforce free-tier daily cap.
   */
  getDailyStatus: () =>
    client.get("/tests/daily-status"),
};

// ── Feedback (legacy polling — kept until report page is fully migrated) ──────

export const FeedbackApi = {
  /** Poll until openEndedPending = false */
  poll: (testId) => client.get(`/feedback/${testId}`),
};

// ── Admin ─────────────────────────────────────────────────────────────────────

export const AdminApi = {
  /** POST /admin/questions — AddQuestionDTO payload */
  addQuestion: (payload) => client.post("/admin/questions", payload),
  /** DELETE /admin/questions/{id} */
  deleteQuestion: (id) => client.delete(`/admin/questions/${id}`),
  /** Returns List<ExamDTO> for the exam-type selector */
  getExams: () => client.get("/admin/exams"),
  /** Returns List<CourseDTO> for the subject selector */
  getCourses: (examId) => client.get(`/admin/exams/${examId}/courses`),
};

// ── Progress / Analytics ──────────────────────────────────────────────────────

export const ProgressApi = {
  /**
   * Returns per-exam, per-course progress for the authenticated user.
   * Response: List<ExamProgressDTO>
   *   ExamProgressDTO  { examId, examName, examIcon, courses: CourseProgressDTO[] }
   *   CourseProgressDTO { courseId, courseName, courseIcon, totalLessons,
   *                       completedLessons, averageQuizScore, passPercentage }
   *
   * Pass% formula (server-side):
   *   passPercentage = (completedLessons / totalLessons) × averageQuizScore
   */
  getMyProgress: () => client.get("/progress/me"),
};
