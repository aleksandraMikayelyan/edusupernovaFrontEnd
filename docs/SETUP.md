# Setup Guide

## Table of Contents

- [Prerequisites](#prerequisites)
- [Frontend Setup](#frontend-setup)
  - [Installation](#installation)
  - [Environment Variables — Frontend](#environment-variables--frontend)
  - [Running Locally](#running-locally)
  - [Production Build](#production-build)
- [Backend Setup](#backend-setup)
  - [Installation](#installation-1)
  - [Environment Variables — Backend](#environment-variables--backend)
  - [Running Locally](#running-locally-1)
  - [Running with Docker](#running-with-docker)
- [Database](#database)
- [Deployment](#deployment)
  - [Frontend on Vercel](#frontend-on-vercel)
  - [Backend on Render](#backend-on-render)

---

## Prerequisites

| Tool | Minimum version | Purpose |
|------|----------------|---------|
| Node.js | 18.x | Frontend runtime and build |
| npm | 9.x | Package manager (comes with Node) |
| Java | 21 (LTS) | Backend runtime |
| Maven | 3.9+ | Backend build tool (wrapper `mvnw` included) |
| PostgreSQL | 14+ | Database (or a Supabase project) |
| Git | any | Version control |

Optional but helpful:
- **Docker** — for containerised local development or production deployment
- **IntelliJ IDEA** — recommended IDE for the backend
- **VS Code** — recommended IDE for the frontend

---

## Frontend Setup

### Installation

```bash
git clone <frontend-repo-url>
cd edusupernovaFrontEnd
npm install
```

### Environment Variables — Frontend

Create a `.env` file at the root of `edusupernovaFrontEnd/`:

```env
# Required
VITE_GOOGLE_CLIENT_ID=707182505632-xxxx.apps.googleusercontent.com

# Optional — only needed if the backend is NOT running on localhost:8080
# VITE_API_URL=https://edusupernova.onrender.com
```

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_GOOGLE_CLIENT_ID` | Yes | Google OAuth 2.0 Client ID. Get it from [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials. |
| `VITE_API_URL` | No | Backend base URL. In dev, the Vite proxy forwards `/api/*` to `http://localhost:8080` so this variable is not needed. Set it in production. |

> All Vite environment variables must be prefixed with `VITE_` to be accessible from the browser.

### Running Locally

The frontend expects the backend to be running on port `8080`. The Vite dev server proxies all `/api/*` and `/images/*` requests to `http://localhost:8080` (configured in `vite.config.js`).

```bash
npm run dev
# → http://localhost:5173
```

### Production Build

```bash
npm run build
# Output: dist/
```

The `dist/` folder is a static site. All client-side routes are handled by `vercel.json`'s rewrite rule (`/* → /index.html`).

To preview the production build locally:

```bash
npm run preview
# → http://localhost:4173
```

---

## Backend Setup

### Installation

```bash
git clone <backend-repo-url>
cd edusupernova/EduSuperNova
```

No manual Maven installation is needed — use the included wrapper:

```bash
# On macOS/Linux
chmod +x mvnw
./mvnw --version

# On Windows
mvnw.cmd --version
```

### Environment Variables — Backend

The backend reads configuration from environment variables. Set them in your shell, a `.env` file loaded by your IDE, or the `application-local.properties` file.

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `DB_URL` | Yes | `jdbc:postgresql://db.xxxx.supabase.co:5432/postgres` | JDBC connection string |
| `DB_USERNAME` | Yes | `postgres` | Database username |
| `DB_PASSWORD` | Yes | `supersecret` | Database password |
| `JWT_SECRET` | Yes | 64-char hex string | Secret key used to sign JWTs. Must be at least 256 bits. Generate one with `openssl rand -hex 32`. |
| `GROQ_API_KEY` | Yes | `gsk_xxxxxxxx` | API key for Groq (LLM evaluation). Get it at [console.groq.com](https://console.groq.com). |
| `GOOGLE_CLIENT_ID` | Yes | `xxxx.apps.googleusercontent.com` | Same Google OAuth Client ID as the frontend. |
| `MAIL_HOST` | Yes | `smtp.gmail.com` | SMTP server for sending OTP emails |
| `MAIL_PORT` | Yes | `587` | SMTP port (587 = TLS) |
| `MAIL_USERNAME` | Yes | `your@gmail.com` | SMTP account username |
| `MAIL_PASSWORD` | Yes | `abcd efgh ijkl mnop` | SMTP app password (for Gmail, create one at Google Account → Security → App Passwords) |
| `MAIL_FROM` | No | `noreply@edusupernova.com` | Sender address shown on emails. Defaults to `MAIL_USERNAME`. |
| `UPLOAD_DIR` | Yes | `C:/images/` (dev), `/app/uploads/` (prod) | Directory where formula sheet PDFs are stored |
| `BASE_URL` | Yes | `http://localhost:8080` | Public URL of the backend (used in email links) |
| `PORT` | No | `8080` | Server port. Defaults to `8080`. |
| `VERIFICATION_CODE_TTL` | No | `10` | OTP expiry in minutes. Defaults to `10`. |

**For local development**, create `src/main/resources/application-local.properties`:

```properties
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
jwt.secret=${JWT_SECRET}
groq.api.key=${GROQ_API_KEY}
google.client-id=${GOOGLE_CLIENT_ID}
spring.mail.host=${MAIL_HOST}
spring.mail.port=${MAIL_PORT}
spring.mail.username=${MAIL_USERNAME}
spring.mail.password=${MAIL_PASSWORD}
upload.dir=C:/images/
app.base-url=http://localhost:8080
```

Then run with the `local` profile:

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

### Running Locally

```bash
# Set environment variables first, then:
./mvnw spring-boot:run

# Or with the local properties profile:
./mvnw spring-boot:run -Dspring-boot.run.profiles=local

# → http://localhost:8080
```

The API is available at `http://localhost:8080/api/`.

> **Database note:** The backend uses `spring.jpa.hibernate.ddl-auto=validate`. This means the database schema must already exist. Run the seed SQL scripts in `src/main/resources/db/` against your PostgreSQL instance before starting the app for the first time.

### Running with Docker

```bash
# Build the image
docker build -t edusupernova-backend .

# Run with environment variables
docker run -p 8080:8080 \
  -e DB_URL=jdbc:postgresql://... \
  -e DB_USERNAME=postgres \
  -e DB_PASSWORD=secret \
  -e JWT_SECRET=... \
  -e GROQ_API_KEY=gsk_... \
  -e GOOGLE_CLIENT_ID=... \
  -e MAIL_HOST=smtp.gmail.com \
  -e MAIL_PORT=587 \
  -e MAIL_USERNAME=your@gmail.com \
  -e MAIL_PASSWORD=... \
  -e UPLOAD_DIR=/app/uploads \
  -e BASE_URL=http://localhost:8080 \
  -v /local/uploads:/app/uploads \
  edusupernova-backend
```

The Dockerfile uses a two-stage build: Maven builds the JAR in one stage, and `eclipse-temurin:21-jre-alpine` runs it in the final image (~90 MB).

---

## Database

EduSupernova uses **PostgreSQL**. In production it is hosted on **Supabase** (free tier).

### Initial schema + seed data

1. Create a PostgreSQL database.
2. Apply the schema (ask the team for the DDL file or derive it from the JPA entities).
3. Run the seed scripts in order:

```bash
# Example using psql
psql $DB_URL -f src/main/resources/db/seed_act.sql
psql $DB_URL -f src/main/resources/db/seed_ielts_reading.sql
# ... repeat for each seed file
```

Seed files available:

| File | Content |
|------|---------|
| `seed_act.sql` | ACT exams, courses, papers |
| `seed_act_english.sql` | ACT English questions |
| `seed_act_reading_questions.sql` | ACT Reading questions |
| `seed_act_math_questions.sql` | ACT Math questions |
| `seed_act_science_questions.sql` | ACT Science questions |
| `seed_asLevel_*.sql` | A-Level AS section content |
| `seed_ielts_*.sql` | IELTS content |
| `seed_sat.sql` | SAT content |
| `seed_toefl_*.sql` | TOEFL content |

---

## Deployment

### Frontend on Vercel

1. Push the frontend repo to GitHub.
2. Import the project on [vercel.com](https://vercel.com).
3. Set the following environment variables in Vercel project settings:

   | Variable | Value |
   |----------|-------|
   | `VITE_GOOGLE_CLIENT_ID` | Your Google OAuth Client ID |
   | `VITE_API_URL` | `https://edusupernova.onrender.com` |

4. Vercel detects Vite automatically. Build command: `npm run build`. Output directory: `dist`.
5. The `vercel.json` rewrite rule ensures SPA routing works correctly.

### Backend on Render

1. Push the backend repo to GitHub.
2. Create a new **Web Service** on [render.com](https://render.com).
3. Set the runtime to **Docker** (the `dockerfile` is in the project root).
4. Add all required environment variables listed in the [Backend Environment Variables](#environment-variables--backend) table.
5. Set the health check path to `/keep-alive` (public endpoint that prevents idle timeouts on Render's free tier).

> **Free tier note:** Render's free tier spins down after 15 minutes of inactivity. The `/keep-alive` endpoint is pinged periodically by a scheduled job to keep the service warm.
