# Contributing Guide

## Table of Contents

- [Project Structure Recap](#project-structure-recap)
- [Branching Strategy](#branching-strategy)
- [Commit Convention](#commit-convention)
- [Pull Request Process](#pull-request-process)
- [Frontend Code Conventions](#frontend-code-conventions)
- [Backend Code Conventions](#backend-code-conventions)
- [Running Tests](#running-tests)
- [Adding a New Exam Type](#adding-a-new-exam-type)

---

## Project Structure Recap

There are two separate repositories:

| Repo | Stack | Deploy target |
|------|-------|---------------|
| `edusupernovaFrontEnd` | React 19 + Vite + Tailwind CSS | Vercel |
| `edusupernova` | Spring Boot 3.3 + Java 21 + PostgreSQL | Render (Docker) |

Each repository is developed and deployed independently. Changes that span both repos (e.g., a new API endpoint consumed by the frontend) should be coordinated as two separate PRs.

---

## Branching Strategy

```
main          ← production-ready code; always deployable
  └── feat/short-description     ← new feature
  └── fix/short-description      ← bug fix
  └── chore/short-description    ← dependency bumps, config, tooling
  └── refactor/short-description ← code cleanup without behaviour change
```

Rules:
- **Never commit directly to `main`**. All changes go through a PR.
- Branch names use `kebab-case` and a type prefix (`feat/`, `fix/`, `chore/`, `refactor/`).
- Keep branches short-lived. Merge or close them within a few days.
- Delete branches after merging.

---

## Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>

[optional body]
```

**Types:**

| Type | When to use |
|------|-------------|
| `feat` | New feature visible to users |
| `fix` | Bug fix |
| `chore` | Tooling, dependencies, config, CI |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `style` | Formatting, whitespace (no logic changes) |
| `docs` | Documentation only |
| `test` | Adding or updating tests |

**Examples:**

```
feat(auth): add Google OAuth login button
fix(test): correct timer countdown on reconnect
chore(deps): bump axios to 1.7.5
refactor(feedback): extract ScorePill into shared component
```

---

## Pull Request Process

1. **Create a branch** from `main` with the appropriate prefix.
2. **Make your changes** — keep them focused on one concern per PR.
3. **Test your changes** locally (see [Running Tests](#running-tests)).
4. **Open a PR** against `main` with:
   - A clear title following the commit convention.
   - A short description of *what* changed and *why*.
   - Screenshots or a screen recording for any UI changes.
5. **Request a review** from at least one teammate.
6. **Address review comments** with new commits (do not force-push after review starts).
7. **Merge** using **Squash and Merge** to keep `main`'s history clean.

**PR checklist:**

- [ ] No console errors in the browser
- [ ] No linting errors (`npm run lint` passes for frontend)
- [ ] Backend compiles without warnings (`./mvnw verify`)
- [ ] New API endpoints are documented in `docs/API.md`
- [ ] Environment variables added to `docs/SETUP.md`

---

## Frontend Code Conventions

### General

- Language: **JavaScript** (JSX). No TypeScript (the project uses JSDoc for type hints where needed).
- Formatting: no Prettier config is committed; use 2-space indentation and single quotes consistently.
- Linting: `npm run lint` runs ESLint. Fix all warnings before opening a PR.

### Component structure

```
src/screens/exam/MyExamTest.jsx   ← page-level component
src/components/test/MyWidget.jsx  ← shared component
```

- One component per file, named with `PascalCase`.
- File names match the default export name.
- Shared components go in `src/components/`. Screen-specific components stay in the screen file until there is a clear reuse case.

### State and side effects

- Use `AuthContext` (via `useAuth()`) for all authentication state — do not duplicate token handling in components.
- Use `useAutosave()` for debounced answer saving in test screens.
- Prefer `useState` + `useEffect` for local component state. Reach for Context only for truly global state.

### API calls

- All HTTP calls go through the functions exported from `src/api/index.js`. Do not create ad-hoc Axios calls inside components.
- Handle loading and error states explicitly; never leave the UI blank on error. Use `<LoadingScreen />` and `<ErrorScreen />`.

```jsx
// Good
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  CoursesApi.getExams()
    .then(setData)
    .catch(err => setError(err.message))
    .finally(() => setLoading(false));
}, []);

if (loading) return <LoadingScreen message="Loading exams..." />;
if (error) return <ErrorScreen message={error} />;
```

### Styling

- Use **Tailwind CSS** utility classes. Avoid inline `style={{}}` unless the value is dynamic and cannot be expressed with Tailwind.
- Use the design tokens defined in `tailwind.config.js` (`ocean.deep`, `ocean.bright`, `correct`, `wrong`, etc.) rather than hardcoded hex values.
- Do not add new global CSS to `index.css` unless it is a base reset or a custom scrollbar rule.

### Adding a new route

1. Create the screen component under `src/screens/<section>/`.
2. Import and add a `<Route>` in `src/App.jsx`.
3. Wrap with `<ProtectedRoute>` for authenticated pages or `<PublicOnlyRoute>` for guest-only pages.

```jsx
// src/App.jsx
import MyNewPage from "./screens/dashboard/MyNewPage";

// Inside <Routes>:
<Route path="/my-page" element={
  <ProtectedRoute>
    <MyNewPage />
  </ProtectedRoute>
} />
```

---

## Backend Code Conventions

### General

- Language: **Java 21**.
- Style: [Google Java Style Guide](https://google.github.io/styleguide/javaguide.html) — 4-space indentation, line limit ~120 chars.
- Naming: `camelCase` for methods and variables, `PascalCase` for classes, `UPPER_SNAKE_CASE` for constants.

### Package structure

New features follow the existing vertical-slice structure:

```
com.edusupernova.edusupernova.<domain>/
├── controller/   ← @RestController, request validation, HTTP mapping only
├── dto/
│   ├── request/  ← Java records for incoming payloads
│   └── response/ ← Java records for outgoing payloads
└── service/      ← Business logic, @Transactional, calls repositories
```

Never place business logic in controllers. Never call repositories directly from controllers.

### DTOs

Use Java **records** for all request and response DTOs:

```java
// Request
public record StartTestRequest(
    Long courseId,
    Long paperId,
    Long unitId
) {}

// Response
public record TestSessionDTO(
    Long testId,
    String courseName,
    String paperFormat,
    Integer totalQuestions
    // ...
) {}
```

### Security

- All new endpoints that require authentication must be covered by `SecurityConfig`.
- Admin-only endpoints must be annotated with `@PreAuthorize("hasRole('ADMIN')")` **and** listed in the security config.
- Never log JWT tokens, passwords, or API keys.

### Error handling

Throw the appropriate custom exception from the `exception` package. The `GlobalExceptionHandler` maps them to HTTP responses automatically:

```java
// Good
if (user.isEmpty()) throw new ResourceNotFoundException("User not found");

// Bad — do not build ResponseEntity manually inside services
```

### Adding a new API endpoint

1. Create (or update) the controller in `<domain>/controller/`.
2. Create request/response records in `<domain>/dto/`.
3. Implement the service method.
4. Register the route's security rule in `SecurityConfig`.
5. Document the endpoint in `docs/API.md`.

---

## Running Tests

### Frontend

```bash
# Lint
npm run lint

# No unit test suite is configured yet.
# Manual testing: start the dev server and exercise the feature in the browser.
npm run dev
```

### Backend

```bash
# Compile and run all tests
./mvnw verify

# Run only unit tests (skip integration tests)
./mvnw test

# Run a specific test class
./mvnw test -Dtest=AuthServiceTest
```

Tests are located in `src/test/java/`. Integration tests that require a database connection use `@SpringBootTest` and expect the environment variables to be set.

---

## Adding a New Exam Type

Adding a completely new exam (e.g., "GRE") involves changes in both repos:

### Backend

1. **Seed data** — Add SQL in `src/main/resources/db/` to insert the exam, courses, papers, question groups, and questions.
2. **PaperFormat enum** — If the exam uses a new paper format, add it to the `PaperFormat` enum.
3. **AI Evaluation** (if essay-based) — Create a new `EvaluationStrategy` implementation in `test/service/evaluation/` and register it in `EvaluationStrategyRegistry`.

### Frontend

1. **Test screen** — Create a new directory under `src/screens/<examname>/` and implement the test screen(s) (see the existing TOEFL or IELTS screens as a reference).
2. **Dispatcher** — Add the new `paperFormat` case(s) to `src/screens/test/Test.jsx`.
3. **Navigation** — Update `src/constants/navTab.js` if a new dashboard tab is needed.

No changes to the auth or API layer are needed — the generic `/tests/start` and `/tests/{testId}/answer` endpoints handle any exam type.
