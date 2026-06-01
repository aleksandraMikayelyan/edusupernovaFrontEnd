# EduSupernova

> AI-powered international exam preparation platform.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3-6DB33F?logo=springboot&logoColor=white)
![Java](https://img.shields.io/badge/Java-21-ED8B00?logo=openjdk&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)

---

## Table of Contents

- [What is EduSupernova?](#what-is-edusupernova)
- [Supported Exams](#supported-exams)
- [Key Features](#key-features)
- [Quick Start](#quick-start)
- [Repository Structure](#repository-structure)
- [Further Documentation](#further-documentation)

---

## What is EduSupernova?

EduSupernova is a full-stack web application that helps students worldwide prepare for major international exams through:

- **Full-length practice tests** with real-time conditions and timers
- **AI-powered instant feedback** (Groq / LLaMA 3.3-70b) for essay and open-ended answers
- **Automatic grading** for multiple-choice, true/false, and numeric questions
- **Progress tracking** per exam, course, and unit
- **Study content** (unit summaries) integrated directly into the platform
- **Admin panel** for content management (questions, groups, formula sheets)

---

## Supported Exams

| Exam | Sections |
|------|----------|
| **A-Level** | AS and A2 — Economics, English, Mathematics |
| **TOEFL** | Reading, Listening, Writing, Speaking |
| **IELTS** | Reading, Listening, Writing, Speaking |
| **SAT** | Reading & Writing, Math |
| **ACT** | English, Reading, Math, Science |

---

## Key Features

- Email/password authentication with OTP email verification + Google OAuth
- Timed test sessions with autosave, question navigation, and progress indicators
- Structured AI feedback (strengths, rubric criteria, next steps) for written answers
- Exam history and per-course progress statistics
- LaTeX math formula rendering via KaTeX
- Fully responsive design with Tailwind CSS
- Role-based access control (Student / Admin)

---

## Quick Start

### Prerequisites

- Node.js ≥ 18
- Java 21
- PostgreSQL (or a Supabase account)

### Frontend (Vite + React)

```bash
# 1. Clone the frontend repository
git clone <frontend-repo-url>
cd edusupernovaFrontEnd

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env and add VITE_GOOGLE_CLIENT_ID

# 4. Start the development server (requires backend running on :8080)
npm run dev
# → http://localhost:5173
```

### Backend (Spring Boot)

```bash
# 1. Clone the backend repository
git clone <backend-repo-url>
cd edusupernova/EduSuperNova

# 2. Set environment variables (see SETUP.md for the full list)
export DB_URL=jdbc:postgresql://...
export JWT_SECRET=...

# 3. Build and run
./mvnw spring-boot:run
# → http://localhost:8080
```

For detailed installation steps, all required environment variables, and production deployment instructions, see [SETUP.md](SETUP.md).

---

## Repository Structure

```
edusupernovaFrontEnd/          ← This repository (frontend)
├── src/
│   ├── api/                   # HTTP client and API endpoint functions
│   ├── components/            # Reusable UI components
│   ├── context/               # Global state (AuthContext)
│   ├── hooks/                 # Custom React hooks
│   ├── screens/               # Full-page components (routes)
│   └── constants/             # API URLs and app-wide constants
├── public/
├── docs/                      ← Project documentation (you are here)
└── vite.config.js

edusupernova/EduSuperNova/     ← Backend repository
├── src/main/java/.../
│   ├── auth/                  # Authentication and user management
│   ├── exam/                  # Exams, courses, and units
│   ├── test/                  # Test sessions and AI evaluation
│   ├── admin/                 # Admin panel logic
│   ├── model/                 # JPA entities
│   └── config/                # Security, JWT, CORS
└── src/main/resources/
    ├── Summaries/             # Study content (.txt files)
    └── db/                    # SQL seed scripts
```

---

## Further Documentation

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | System architecture diagram, layers, and data flow |
| [API.md](API.md) | Complete REST endpoint reference |
| [SETUP.md](SETUP.md) | Installation, environment variables, and deployment |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Code conventions, branching strategy, and PR process |
