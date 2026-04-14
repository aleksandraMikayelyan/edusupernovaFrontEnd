// ─── Single source of truth for all API configuration ────────────────────────
// Change this one value to switch between local dev, staging, and production.

export const API_BASE = "http://localhost:8080";

// ─── Endpoint builders ────────────────────────────────────────────────────────

export const ENDPOINTS = {
  // Auth
  login:    `${API_BASE}/api/users/login`,
  register: `${API_BASE}/api/users/register`,

  // Exams
  examsDashboard: `${API_BASE}/api/exams/dashboard`,
  coursesByExam:  (examId)   => `${API_BASE}/api/exams/${examId}`,

  // Units
  unitsByCourse: (courseId) => `${API_BASE}/api/units/course/${courseId}`,
  formulaSheet:  (courseId) => `${API_BASE}/api/courses/${courseId}/formula-sheet`,

  // Tests
  startTest:     `${API_BASE}/api/tests/start`,
  testQuestions: (testId)   => `${API_BASE}/api/tests/${testId}/questions`,
  evaluateTest:  (testId)   => `${API_BASE}/api/tests/${testId}/evaluate`,

  // Feedback
  processFeedback: `${API_BASE}/api/feedback/process`,
 
  // ── Feedback / Evaluation ────────────────────────────────────────────────
  //
  // processFeedback  – the SINGLE endpoint that must be called when the student
  //                    submits the test. It:
  //                      1. Saves answers        (testService.saveAnswers)
  //                      2. Scores MC instantly  (EvaluationService Phase 1)
  //                      3. Fires async Groq AI  (EvaluationService Phase 2)
  //                    Returns FeedbackResponse immediately.
  //
  //   Method : POST
  //   Body   : List<TestQuestions>  (answersList)
  //   Params : ?testId=&examType=&sectionName=

 
  //
  // feedbackResult  – polling endpoint used by FeedbackPage when
  //                   openEndedPending === true. Reads current DB state
  //                   and returns the same FeedbackResponse shape.
  //                   Call every 4 s until openEndedPending === false.
  //
  //   Method : GET
  //   Params : none (testId is in the path)
  //
  feedbackResult: (testId) => `${API_BASE}/api/feedback/${testId}`,
};

// ─── Shared domain constants ──────────────────────────────────────────────────
// Kept here so frontend limits stay in sync with the backend QuizService values.

export const MULTIPLE_CHOICE_LIMIT = 15;
export const OPEN_ENDED_LIMIT      = 5;