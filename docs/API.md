# API Reference

All endpoints are prefixed with `/api`. The base URL in production is `https://edusupernova.onrender.com/api`.

Requests that require authentication must include the header:

```
Authorization: Bearer <JWT token>
```

---

## Table of Contents

- [Authentication](#authentication)
- [User Profile](#user-profile)
- [Exams & Courses](#exams--courses)
- [Units](#units)
- [Test Sessions](#test-sessions)
- [Progress](#progress)
- [Feedback (Legacy Polling)](#feedback-legacy-polling)
- [Admin](#admin)
- [Shared Structures](#shared-structures)

---

## Authentication

### POST `/users/register`

Create a new student account. Sends a 6-digit OTP to the provided email (valid for 10 minutes). Does **not** return a token — the user must verify their email first.

**Auth:** Public

**Request body:**
```json
{
  "username": "alice",
  "email": "alice@example.com",
  "password": "Str0ngPass!"
}
```

| Field | Type | Constraints |
|-------|------|-------------|
| `username` | string | 3–50 characters |
| `email` | string | Valid email, unique |
| `password` | string | 8–100 characters |

**Response `202 Accepted`:**
```json
{
  "message": "Verification email sent. Please check your inbox."
}
```

---

### POST `/users/verify-email`

Verify the OTP sent during registration and receive a JWT token.

**Auth:** Public

**Request body:**
```json
{
  "email": "alice@example.com",
  "verificationCode": "482931"
}
```

**Response `200 OK`:** [AuthResponse](#authresponse)

---

### POST `/users/login`

Log in with email and password.

**Auth:** Public

**Request body:**
```json
{
  "email": "alice@example.com",
  "password": "Str0ngPass!"
}
```

**Response `200 OK`:** [AuthResponse](#authresponse)

---

### POST `/users/google-auth`

Authenticate or create an account using a Google ID token. If the email already exists, it links the Google account. If not, a new account is created automatically.

**Auth:** Public

**Request body:**
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIs..."
}
```

**Response `200 OK`:** [AuthResponse](#authresponse)

---

## User Profile

### PUT `/users/profile`

Update the authenticated user's username and/or email.

**Auth:** Required

**Request body:**
```json
{
  "username": "alice_new",
  "email": "alice_new@example.com"
}
```

**Response `200 OK`:** [AuthResponse](#authresponse) (new token with updated claims)

---

### PUT `/users/password`

Change the authenticated user's password.

**Auth:** Required

**Request body:**
```json
{
  "currentPassword": "OldPass123",
  "newPassword": "NewPass456!"
}
```

**Response `200 OK`:**
```json
{ "message": "Password updated successfully." }
```

---

### DELETE `/users/account`

Permanently delete the authenticated user's account. This action is irreversible.

**Auth:** Required

**Request body:** _(empty)_

**Response `200 OK`:**
```json
{ "message": "Account deleted." }
```

---

## Exams & Courses

### GET `/exams/dashboard`

Returns all active exams for the main dashboard.

**Auth:** Public

**Response `200 OK`:**
```json
[
  {
    "id": 1,
    "examname": "A Level",
    "description": "Cambridge International AS & A Levels",
    "icon": "https://...",
    "isActive": true
  }
]
```

---

### GET `/exams/{examId}`

Returns all courses for a specific exam. For A-Level, pass `?section=AS` or `?section=A2` to filter by section.

**Auth:** Public

**Query params:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `section` | string | No | `AS` or `A2` (A-Level only) |

**Response `200 OK`:**
```json
[
  {
    "id": 3,
    "coursename": "Economics",
    "icon": "https://...",
    "section": "AS",
    "totalQuestions": 150
  }
]
```

---

### GET `/exams/{examId}/status`

Check whether a user is enrolled in an exam.

**Auth:** Public

**Query params:** `userId` (long)

**Response `200 OK`:** `true` or `false`

---

### POST `/exams/{examId}/enroll`

Enroll a user in an exam.

**Auth:** Public

**Query params:** `userId` (long)

**Response `200 OK`:** `"Enrolled successfully"`

---

### DELETE `/exams/{examId}/unenroll`

Remove a user's enrollment from an exam.

**Auth:** Public

**Query params:** `userId` (long)

**Response `204 No Content`**

---

### GET `/courses`

Returns courses filtered by exam type, with optional section filter.

**Auth:** Public

**Query params:**

| Param | Type | Required |
|-------|------|----------|
| `examTypeId` | long | Yes |
| `section` | string | No |

**Response `200 OK`:** Array of course objects (same shape as `/exams/{examId}`)

---

### GET `/courses/{courseId}/formula-sheet`

Download the formula sheet PDF for a course.

**Auth:** Public

**Response `200 OK`:** `application/pdf` file stream

---

## Units

### GET `/units/course/{courseId}`

Returns all units and available papers for a course.

**Auth:** Public

**Response `200 OK`:**
```json
{
  "courseName": "Mathematics",
  "courseIcon": "https://...",
  "units": [
    {
      "id": 7,
      "title": "Vectors",
      "content": "In this unit we cover...",
      "queue": 1
    }
  ],
  "papers": [
    {
      "id": 2,
      "paperName": "Paper 1 MCQ",
      "format": "MCQ",
      "totalQuestions": 30,
      "timeLimitMinutes": 60,
      "orderIndex": 1,
      "instructions": "Answer all questions."
    }
  ],
  "hasFormulaSheet": true
}
```

---

## Test Sessions

### POST `/tests/start`

Start a new test session.

**Auth:** Required

**Request body:**
```json
{
  "courseId": 3,
  "paperId": 2,
  "unitId": null,
  "forceGroupId": null
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `courseId` | long | Yes | The course to test |
| `paperId` | long | No | Specific paper; first paper is used if omitted |
| `unitId` | long | No | Restrict questions to a single unit |
| `forceGroupId` | long | No | Practice a specific passage/group again |

**Response `200 OK`:** [TestSessionDTO](#testsessiondto)

---

### POST `/tests/{testId}/answer`

Submit an answer for the current question.

**Auth:** Required

**Request body:**
```json
{
  "quizId": 456,
  "userResponse": "B"
}
```

`userResponse` format by question type:

| Question type | Format | Example |
|---------------|--------|---------|
| `MULTIPLE_CHOICE` | Single letter | `"B"` |
| `TRUE_FALSE_NG` | `TRUE`, `FALSE`, or `NOT_GIVEN` | `"TRUE"` |
| `NUMERIC_INPUT` | Numeric string | `"42"` |
| `ESSAY` / `OPEN_ENDED` | Full text | `"The aggregate demand..."` |

**Response `200 OK`:** [AnswerFeedbackDTO](#answerfeedbackdto)

---

### GET `/tests/{testId}/report`

Retrieve the final report for a completed test.

**Auth:** Required

**Response `200 OK`:** [FeedBackDTO](#feedbackdto)

---

### POST `/tests/{testId}/submit`

Force-submit a test before all questions are answered (e.g., timer expired).

**Auth:** Required

**Response `200 OK`:** [FeedBackDTO](#feedbackdto)

---

### GET `/tests/{testId}/questions`

Returns all questions for a test session (used for review).

**Auth:** Public

**Response `200 OK`:** Array of `TestQuestionDTO`

---

### GET `/tests/history`

Returns the authenticated user's completed test history.

**Auth:** Required

**Response `200 OK`:**
```json
[
  {
    "testId": 123,
    "courseName": "Economics",
    "paperName": "Paper 1",
    "finalScore": 75.0,
    "totalCorrect": 15,
    "totalQuestions": 20,
    "completedAt": "2026-06-01T11:00:00"
  }
]
```

---

### GET `/tests/daily-status`

Returns how many tests the user has taken today (used to enforce free-tier limits).

**Auth:** Required

**Response `200 OK`:**
```json
{
  "testsToday": 2,
  "dailyLimit": 5,
  "limitReached": false
}
```

---

## Progress

### GET `/progress/me`

Returns the authenticated user's progress broken down by exam and course.

**Auth:** Required

**Response `200 OK`:**
```json
[
  {
    "examId": 1,
    "examName": "A Level",
    "examIcon": "https://...",
    "courses": [
      {
        "courseId": 3,
        "courseName": "Economics",
        "courseIcon": "https://...",
        "totalLessons": 10,
        "completedLessons": 3,
        "averageQuizScore": 72.5,
        "passPercentage": 21.75
      }
    ]
  }
]
```

`passPercentage` = `(completedLessons / totalLessons) × averageQuizScore`

---

### GET `/progress/completed-groups`

Returns the list of question groups (passages) the user has already practiced.

**Auth:** Required

**Response `200 OK`:**
```json
[
  {
    "groupId": 10,
    "groupTitle": "Extract A — Economic Growth",
    "paperId": 2
  }
]
```

---

## Feedback (Legacy Polling)

> These endpoints exist for backward compatibility. Prefer using `GET /tests/{testId}/report`.

### GET `/feedback/{testId}`

Poll for AI evaluation results. Returns `openEndedPending: true` while Groq is still processing essay answers.

**Auth:** Public

**Response `200 OK`:**
```json
{
  "totalScore": "75.5/100",
  "openEndedPending": false,
  "questionsFeedback": [ ... ]
}
```

---

## Admin

> All admin endpoints require the `ADMIN` role.

### GET `/admin/exams`

Returns all exams (including inactive ones).

**Response `200 OK`:** Array of `ExamDTO`

---

### GET `/admin/exams/{examId}/courses`

Returns all courses and their papers for an exam.

**Response `200 OK`:**
```json
[
  {
    "id": 3,
    "coursename": "Economics",
    "papers": [
      { "id": 2, "paperName": "Paper 1 MCQ", "format": "MCQ" }
    ]
  }
]
```

---

### GET `/admin/papers/{paperId}/groups`

Returns all question groups (passages) for a paper.

**Response `200 OK`:**
```json
[
  {
    "id": 10,
    "title": "Extract A",
    "contextText": "The following passage...",
    "contextImageUrl": null,
    "orderIndex": 1
  }
]
```

---

### POST `/admin/groups`

Create a new question group (passage/extract) within a paper.

**Request body:**
```json
{
  "paperId": 2,
  "title": "Extract B — Market Failure",
  "contextText": "In a free market, externalities...",
  "contextImageUrl": null,
  "orderIndex": 2
}
```

**Response `200 OK`:** Created `AdminGroupDTO`

---

### POST `/admin/questions`

Add a new question to a paper. `groupId` is optional for grouped (passage-based) questions.

**Request body:**
```json
{
  "courseId": 3,
  "paperId": 2,
  "groupId": 10,
  "groupOrderIndex": 1,
  "questionType": "MULTIPLE_CHOICE",
  "questionText": "Which of the following best defines a public good?",
  "optionA": "A good sold in supermarkets",
  "optionB": "A non-excludable, non-rival good",
  "optionC": "A good provided by charities",
  "optionD": "A good with high elasticity",
  "optionE": null,
  "correctAnswer": "B",
  "explanation": "Public goods are non-excludable and non-rival by definition.",
  "difficulty": "MEDIUM",
  "marks": 4
}
```

**Response `200 OK`**

---

### DELETE `/admin/questions/{id}`

Permanently delete a question.

**Response `204 No Content`**

---

### POST `/admin/courses/{courseId}/formula-sheet`

Upload a formula sheet PDF for a course.

**Content-Type:** `multipart/form-data`

| Field | Type |
|-------|------|
| `file` | PDF file |

**Response `200 OK`**

---

## Shared Structures

### AuthResponse

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "expiresIn": 604800,
  "rol": "STUDENT",
  "user": {
    "id": 1,
    "username": "alice",
    "email": "alice@example.com"
  }
}
```

| Field | Description |
|-------|-------------|
| `accessToken` | JWT to send in `Authorization: Bearer` header |
| `expiresIn` | Seconds until expiry (7 days = 604 800) |
| `rol` | `STUDENT` or `ADMIN` |

---

### TestSessionDTO

```json
{
  "testId": 123,
  "courseName": "Economics",
  "paperName": "Paper 1 MCQ",
  "paperFormat": "MCQ",
  "unitName": null,
  "totalQuestions": 20,
  "answeredCount": 0,
  "totalCorrect": 0,
  "status": "IN_PROGRESS",
  "startedAt": "2026-06-01T10:00:00",
  "timeLimitMinutes": 60,
  "remainingSeconds": 3600,
  "currentQuestion": { }
}
```

`paperFormat` determines which frontend test screen is rendered. Possible values: `MCQ`, `ESSAY`, `DATA_RESPONSE`, `READING_WRITING`, `MULTI_ESSAY`, `LISTENING`, `READING`, `SPEAKING`, `NUMERIC_INPUT`, `TRUE_FALSE_NG`, `SHORT_ANSWER`.

---

### AnswerFeedbackDTO

```json
{
  "quizId": 456,
  "isCorrect": true,
  "correctAnswer": "B",
  "explanation": "Public goods are non-excludable and non-rival.",
  "aiFeedback": null,
  "aiScore": null,
  "sessionComplete": false,
  "nextQuestion": { }
}
```

`aiFeedback` and `aiScore` are `null` for MCQ questions and populated asynchronously for essay questions.

---

### FeedBackDTO

```json
{
  "testId": 123,
  "courseName": "Economics",
  "paperName": "Paper 1 MCQ",
  "unitName": null,
  "totalCorrect": 15,
  "totalQuestions": 20,
  "finalScore": 75.0,
  "grade": "B",
  "startedAt": "2026-06-01T10:00:00",
  "completedAt": "2026-06-01T11:00:00",
  "durationSeconds": 3600,
  "questionsFeedback": [
    {
      "questionNumber": 1,
      "quizId": 456,
      "questionText": "Which of the following best defines a public good?",
      "type": "MULTIPLE_CHOICE",
      "userResponse": "B",
      "correctAnswer": "B",
      "isCorrect": true,
      "explanation": "Public goods are non-excludable and non-rival.",
      "aiFeedback": null,
      "aiScore": null,
      "contextText": null,
      "contextImageUrl": null
    }
  ]
}
```

---

### Error Responses

All errors follow the `ApiErrorDTO` shape:

```json
{
  "status": 400,
  "message": "Verification code is invalid or has expired.",
  "timestamp": "2026-06-01T10:05:00"
}
```

Common status codes:

| Code | Meaning |
|------|---------|
| `400` | Bad request / validation error |
| `401` | Missing or expired JWT |
| `403` | Insufficient role (e.g., non-admin accessing `/admin`) |
| `404` | Resource not found |
| `409` | Conflict (e.g., email already registered) |
| `500` | Internal server error |
