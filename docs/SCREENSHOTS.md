# Test Evidence & Screenshots

Visual evidence of EduSupernova's key features and API endpoints working in production.

---

## Table of Contents

- [1. Authentication](#1-authentication)
- [2. Dashboard & Navigation](#2-dashboard--navigation)
- [3. Test Session](#3-test-session)
- [4. AI Feedback](#4-ai-feedback)
- [5. Progress & History](#5-progress--history)
- [6. Admin Panel](#6-admin-panel)
- [7. API Tests (Postman)](#7-api-tests-postman)

---

## 1. Authentication

### Register
<!-- Screenshot: registration form filled in -->

### OTP Verification
<!-- Screenshot: OTP code input screen after registering -->

### Login
<!-- Screenshot: login form -->

### Google OAuth
<!-- Screenshot: Google sign-in popup or redirect -->

---

## 2. Dashboard & Navigation

### Course Selection
<!-- Screenshot: main dashboard showing available exams/courses -->

### Enrolled Courses
<!-- Screenshot: courses the user is enrolled in -->

---

## 3. Test Session

### Starting a Test
<!-- Screenshot: test start screen showing paper name and time limit -->

### Question in Progress (MCQ)
<!-- Screenshot: multiple choice question with timer running -->

### Question in Progress (Essay / Open-ended)
<!-- Screenshot: text input question with autosave indicator -->

### Question Navigation
<!-- Screenshot: dot navigation bar showing answered/unanswered questions -->

---

## 4. AI Feedback

### Feedback Page — Overview
<!-- Screenshot: feedback page with score and grade -->

### AI Feedback on Essay Answer
<!-- Screenshot: AI feedback card showing strengths, criteria, and next steps -->

### MCQ Answer Review
<!-- Screenshot: correct/incorrect MCQ answer with explanation -->

---

## 5. Progress & History

### Test History
<!-- Screenshot: list of past tests with scores and dates -->

### Per-Course Progress
<!-- Screenshot: progress stats for a specific course -->

---

## 6. Admin Panel

### Admin Dashboard
<!-- Screenshot: admin interface overview -->

### Adding a Question
<!-- Screenshot: form to add a new question -->

---

## 7. API Tests (Postman)

### POST /users/login — 200 OK
<!-- Screenshot: Postman request with email/password body and JWT response -->

### POST /tests/start — 201 Created
<!-- Screenshot: Postman request starting a test session -->

### POST /tests/{testId}/answer — Answer submission
<!-- Screenshot: Postman submitting an answer and receiving feedback -->

### GET /tests/{testId}/report — Test report
<!-- Screenshot: Postman fetching the full test report with score and question feedback -->
