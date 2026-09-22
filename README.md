# SchemeSathi — Government Scheme Recommendation Portal

A full-stack MERN reference implementation for discovering and recommending government welfare schemes from a citizen profile. The core recommendation path is deterministic and explainable; the optional LLM layer only explains already-computed results.

> **Important:** Seeded scheme records are explicitly marked **Demo** and are not legal/official eligibility guidance. Replace them with verified records from official government sources before a real deployment.

## Tech stack

- **Frontend:** React 18, Vite, Tailwind CSS, React Router, Axios, Lucide
- **Backend:** Node.js, Express, MongoDB/Mongoose
- **Authentication:** JWT in HTTP-only cookies (also accepts Bearer tokens)
- **Recommendation engine:** deterministic rule evaluator
- **Search:** MongoDB text search; Atlas Search can replace it in production
- **AI assistant:** optional LangChain/Groq adapter; disabled by default
- **RAG infrastructure:** Qdrant included in Docker Compose for expansion
- **Jobs:** Redis included in Docker Compose for BullMQ notifications/ingestion jobs
- **Local infrastructure:** Docker Compose (MongoDB, Redis, Qdrant)

## Features

- Citizen register/login/logout
- Citizen socio-economic profile
- Search and filter scheme directory
- Scheme detail pages with source links
- Rule-based eligibility states: `eligible`, `not_eligible`, `needs_verification`
- Per-rule explanation of eligibility
- Ranked personalized recommendations
- Bookmarks
- Notifications API/UI
- Optional AI explanation of deterministic recommendations
- Admin-only scheme creation and publication view
- Seed script with demo citizen/admin accounts
- Ingestion normalization scaffold for official source data

## Architecture

```text
Official government sources
        |
        v
Ingestion / normalization
        |
        v
Admin verification
        |
        v
MongoDB (structured schemes + rules)
        |
   +----+-------------------+
   |                        |
Rule engine              Search/RAG
   |                        |
   +-----------+------------+
               v
          Express API
               |
               v
          React portal
```

Eligibility is never inferred by the LLM. The rule engine evaluates structured fields stored with each verified scheme.

## 1. Requirements

- Node.js 20+
- npm
- Docker Desktop (recommended)

## 2. Start infrastructure

```bash
docker compose up -d
```

This starts:
- MongoDB: `localhost:27017`
- Redis: `localhost:6379`
- Qdrant: `localhost:6333`

## 3. Configure environment

### Server

```bash
cd server
cp .env.example .env
```

Set a strong `JWT_SECRET`.

### Client

```bash
cd client
cp .env.example .env
```

## 4. Install dependencies

From project root:

```bash
npm install
npm run install:all
```

## 5. Seed demo data

```bash
npm run seed
```

Seed accounts:

```text
Citizen
Email: demo@schemesathi.local
Password: Demo@123

Admin
Email: admin@schemesathi.local
Password: Admin@123
```

Change/remove these accounts before deployment.

## 6. Run

From project root:

```bash
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:5000
- Health: http://localhost:5000/api/health

## Recommendation design

Each scheme stores normalized eligibility rules, e.g.:

```json
{
  "age": { "min": 18, "max": 30 },
  "income": { "max": 250000 },
  "occupations": ["Student"],
  "education": ["Undergraduate"],
  "socialCategories": ["SC", "ST"]
}
```

The evaluator returns:

```json
{
  "status": "eligible",
  "matchScore": 100,
  "checks": [
    {
      "label": "Age",
      "required": "18–30",
      "actual": 21,
      "pass": true
    }
  ]
}
```

Rules that fail make the status `not_eligible`. Required rules that cannot be evaluated because a profile value is missing produce `needs_verification`.

## Adding real government scheme data

Use authoritative sources and respect their terms/robots/access rules. A robust pipeline is:

```text
Official API/page/PDF
    -> raw snapshot
    -> extractor/normalizer
    -> pending verification
    -> admin review
    -> verified Scheme record
    -> recommendations
```

`server/src/ingestion/normalizeScheme.js` is the starting adapter. Keep the source URL and verification timestamp on every record.

## Enabling AI explanations

AI is intentionally off by default.

In `server/.env`:

```env
ENABLE_AI=true
GROQ_API_KEY=your_key
```

The assistant first calls the normal recommendation engine, then gives those structured results to the model with an instruction not to invent eligibility.

For production RAG, ingest verified official documents into Qdrant and retrieve only documents tied to the selected scheme/source. The current code includes Qdrant infrastructure but does not automatically scrape public websites.

## Production checklist

- Replace demo scheme data with verified official records
- Use HTTPS
- Use a strong JWT secret or managed secret store
- Restrict CORS to the deployed frontend
- Add CSRF protection for cookie-authenticated state changes
- Add input validation/rate limiting/Helmet
- Add email/phone verification if needed
- Encrypt sensitive data at rest
- Minimize profile fields and add clear consent/privacy language
- Add audit logs for admin scheme changes
- Add scheme version history and source snapshots
- Add tests around every eligibility rule type
- Verify accessibility and multilingual content
- Do not claim final government eligibility; link to the official application portal

## Project structure

```text
gov-scheme-portal/
├── client/
│   └── src/
│       ├── components/
│       ├── lib/
│       └── pages/
├── server/
│   └── src/
│       ├── controllers/
│       ├── ingestion/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── services/
│       └── utils/
├── docs/API.md
├── docker-compose.yml
└── README.md
```
