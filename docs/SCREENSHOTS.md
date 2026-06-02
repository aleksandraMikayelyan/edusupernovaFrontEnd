# Test Evidence & Screenshots

Visual evidence of EduSupernova's key features working in production at `https://www.edu-supernova.com`.

All image files live in `docs/screenshots/`.

---

## Table of Contents

- [0. Landing Page](#0-landing-page)
- [1. Authentication](#1-authentication)
- [2. Dashboard & Profile](#2-dashboard--profile)
- [3. Test Session](#3-test-session)
- [4. AI Feedback & Results](#4-ai-feedback--results)
- [5. Test History](#5-test-history)
- [6. Account Settings](#6-account-settings)
- [7. Admin Panel](#7-admin-panel)

---

## 0. Landing Page

**Public home page — `/`**

![Landing page](screenshots/01-home.png)

Hero section with value proposition, live question card mockup, and CTAs to register or log in. Lists supported exams: A Levels, SAT, IELTS, ACT, TOEFL.

---

## 1. Authentication

### Register — `/register`

![Register form](screenshots/02-register.png)

Student registration form: username, email, password, confirm password. Also shows the Google OAuth one-click option.

---

### OTP Email Verification — `/register` (step 2)

![OTP verification screen](screenshots/03-otp.png)

After submitting the registration form, a 6-digit code is sent to the user's email. The screen prompts the user to enter it within 10 minutes.

---

### Login — `/login`

![Login form with credentials](screenshots/04-login.png)

Email/password login form with "Continue as [Google account]" option below.

---

### Google OAuth — `/login`

![Login page with Google account chooser](screenshots/05-login-google.png)

Google Identity Services popup triggered from the login page, showing the account chooser for the Google OAuth flow.

---

## 2. Dashboard & Profile

### Course Selection — `/courses` (no exam selected)

![Dashboard empty state](screenshots/06-dashboard-empty.png)

Student dashboard showing the five exam type filters (A Levels, TOEFL, IELTS, ACT, SAT). No exam is selected yet so no courses are displayed.

---

### Course Selection — `/courses` (enrolled)

![Dashboard with A Levels selected](screenshots/07-dashboard-enrolled.png)

A Levels selected: student is enrolled and sees all three subjects (Math Tests, Economy 9708 AS, English 9093 AS) with enrolment status badges.

---

### Student Profile — before tests

![Student profile — 0 lessons completed](screenshots/09-profile-empty.png)

Profile page showing: 1 exam enrolled, 3 courses, 0 lessons completed, 0.0% overall avg score. Course cards show "Continue studying" with no progress yet.

---

### Student Profile — after completing tests

![Student profile — updated with progress](screenshots/18-profile-updated.png)

Same profile after taking two tests: 2 lessons completed, 9.1% overall avg score. Math Tests shows 27.3% avg score (1/7 lessons), Economy shows 1/6 done with last paper listed under "Practice again".

---

## 3. Test Session

### MCQ Question — Question 1 of 11

![MCQ question 1 — inequality](screenshots/10-test-mcq-q1.png)

Multiple choice question with timer (109:54 remaining), progress bar, and four answer options. Answer C is selected and highlighted.

---

### MCQ Question — Question 2 of 11

![MCQ question 2 — transformation](screenshots/11-test-mcq-q2.png)

Next question in the same session (9% complete, 109:32 remaining). Demonstrates navigation flow between questions.

---

### Essay / Open-ended Test — empty

![Essay test — Paper 2 Data Response, empty answers](screenshots/12-test-essay-empty.png)

Split-layout for data response papers: source material on the left, structured open-ended questions (a, b, c) on the right with mark allocations. Answers not yet written.

---

### Essay / Open-ended Test — with autosave

![Essay test — answers filled with autosave indicator](screenshots/13-test-essay-autosave.png)

Same paper after the student starts writing. "Saved at 09:23 / 09:24" timestamps confirm the autosave hook is working. Character count shown per answer.

---

## 4. AI Feedback & Results

### Results Page — overview with AI Feedback

![Test complete — 0% with AI feedback](screenshots/14-feedback-results.png)

"Your Results" page after completing Economy Paper 2 Data Response (0/5 correct, 1m duration). The AI Feedback block appears below the score with "What you did well" and "Areas to improve" sections.

---

### Results Page — AI Feedback (full detail)

![AI feedback — full scrolled view](screenshots/15-feedback-ai-full.png)

Full AI feedback for Q1 essay: **What you did well**, **Areas to improve** broken down by AO1 Knowledge & Understanding, AO2 Application, AO3 Analysis & Evaluation, and Quality of Written Communication, plus **Next Steps** with actionable suggestions.

---

### Results Page — MCQ review with explanations

![MCQ results — correct and incorrect answers](screenshots/16-feedback-mcq.png)

Feedback page for Math Tests Paper 1 (27%, 3/11 correct). Each question shows the student's answer vs. the correct answer, colour-coded red/green, with an explanation of the correct reasoning.

---

## 5. Test History

### Test History — `/history`

![Test history page](screenshots/17-test-history.png)

Lists all completed tests: Paper 1 Pure Mathematics 1 (27%, 3/11, 20s) and Paper 2 Data Response (0%, 0/5, 1m 2s), both completed on 2 Jun 2026. Each row has Review and Retake buttons.

---

## 6. Account Settings

### Edit Profile & Change Password — `/settings`

![Account settings — edit profile](screenshots/19-settings-profile.png)

Settings page: **Edit Profile** section (username + email with "Save changes") and the top of the **Change Password** section.

---

### Change Password & Delete Account — `/settings` (scrolled)

![Account settings — password and delete](screenshots/20-settings-delete.png)

Full Change Password form (current / new / confirm) with "Update password" button, and the **Delete Account** danger zone with a permanent-and-irreversible warning.

---

## 7. Admin Panel

### Question Manager — `/admin`

![Admin panel — Question Manager](screenshots/08-admin-panel.png)

Admin-only interface for content management. Tabs: Add Question, Create Group, Formula Sheet, Delete Question. The Add Question form shows dropdowns for Exam Type, Course, Paper, Question Type (Multiple Choice), Difficulty (Medium), Marks, Question Text, and Answer Choices A–D.

---

## 8. API Tests (DevTools — Network tab)

Real HTTP requests captured from the browser DevTools (Fetch/XHR filter) against the production backend at `https://edusupernova.onrender.com/api`.

### POST `/users/login` — 200 OK

![API login — request and JWT response](screenshots/21-api-login.png)

Email/password login request returning an `AuthResponse` with `accessToken` (JWT), user role, and user details.

---

### POST `/tests/start` — 201 Created

![API start test — request and session response](screenshots/22-api-start-test.png)

Start test request with `courseId` and `paperId`, returning a `TestSessionDTO` with `testId`, first question, and `timeLimitMinutes`.

---

### POST `/tests/{testId}/answer` — 200 OK

![API submit answer — request and feedback response](screenshots/23-api-submit-answer.png)

Answer submission returning an `AnswerFeedbackDTO` with `isCorrect`, `explanation`, and the next question data.

---

### GET `/tests/{testId}/report` — 200 OK

![API test report — full report response](screenshots/24-api-report.png)

Test report endpoint returning the full `FeedBackDTO` with final score, grade, and per-question feedback including AI evaluation results.
