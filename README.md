# EduSupernova — Frontend

**Learn. Dominate. Shine.**

AI-powered exam preparation platform supporting TOEFL, IELTS, SAT, ACT, and A-Level. Students take full exam simulations, receive instant AI-generated feedback, and track their progress over time.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 5 |
| Routing | React Router DOM 6 |
| Styling | Tailwind CSS 3 |
| Auth | Google OAuth (`@react-oauth/google`) |
| HTTP | Axios |
| Icons | Phosphor Icons, Lucide React |
| Deployment | Vercel |
| Backend | Spring Boot (port 8080) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- Backend server running on `http://localhost:8080`

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

### Development

```bash
npm run dev
```

The app runs at `http://localhost:5173`. API requests to `/api/*` are proxied to `http://localhost:8080`.

### Production Build

```bash
npm run build
npm run preview   # preview the build locally
```

---

## Project Structure

```
src/
├── components/
│   ├── common/         # AppHeader, AppFooter, LoadingScreen, ErrorScreen
│   ├── feedback/       # AI feedback display, score pills, answer cards
│   ├── test/           # MCQ cards, navigation dots, progress header, autosave
│   ├── units/          # Article body, callout boxes, collapsible sections
│   └── userInterface/  # Course cards, exam cards
├── context/
│   └── AuthContext.jsx # Global authentication state
├── hooks/
│   ├── useAuth.js      # Auth state access
│   ├── useAutosave.js  # Auto-save for test answers
│   └── useInView.js    # Intersection observer
├── screens/
│   ├── auth/           # Home, LogIn, Register
│   ├── dashboard/      # UserInterface, Units, Profile, TestHistory, Feedback
│   ├── admin/          # AdminInterface
│   └── test/           # Per-exam test screens (see below)
└── main.jsx
```

### Test Screens by Exam

| Exam | Sections |
|---|---|
| **TOEFL** | Reading, Listening, Speaking, Writing |
| **IELTS** | Reading, Listening, Speaking, Writing |
| **SAT** | Math, Reading |
| **ACT** | English, Math, Science, Reading |
| **A-Level** | Reading & Writing, Data Response, Essay, Multi-Essay |

---

## Key Features

- **Exam Simulation** — Full-length test interface with timer, question navigation, and auto-save
- **AI Feedback** — Groq-powered evaluation with personalized guidance on open-ended answers
- **Test History** — Review past attempts with scores and AI commentary
- **Learning Units** — Structured course content per exam and topic
- **Google Sign-In** — OAuth 2.0 authentication
- **Admin Dashboard** — Content and user management (role-gated)

---

## Deployment

The app is deployed on Vercel. The `vercel.json` config handles SPA routing by rewriting all routes to `index.html`.

```json
{
  "outputDirectory": "dist",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## Linting

```bash
npm run lint
```
.....
