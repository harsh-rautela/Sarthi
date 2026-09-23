# SchemeSathi — Advanced Multi-Factor Government Scheme Recommendation & AI Assistant Portal

**SchemeSathi** is an intelligent, full-stack citizen portal for discovering, verifying, and navigating Indian Central and State government welfare schemes. 

It combines **100% deterministic, rule-based legal eligibility verification** (guaranteeing zero LLM hallucinations) with **multi-dimensional relevance scoring**, **category affinity**, **profile-gap unlock insights**, an interactive **What-If Eligibility Simulator**, and an **AI Assistant orchestrated via LangGraph and Groq (`llama-3.3-70b-versatile`)**.

---

## 🌟 Key Highlights & Architecture

```text
                               +-------------------------------------------------+
                               |             Citizen Profile Attributes          |
                               | (Age, Income, Gender, State, Occupation, etc.)  |
                               +-----------------------+-------------------------+
                                                       |
                                                       v
+------------------------+             +-------------------------------+
|  Verified Government   |             |   Deterministic Rule Engine   |
|     Scheme Catalog     | ----------> |    (eligibilityService.js)    |
|  (24+ Central & State) |             +---------------+---------------+
+------------------------+                             |
                                                       v
                               +-----------------------------------------------+
                               |           Evaluation & Ranking Tier           |
                               |  - Legal Verdict: Eligible / Needs Verif / DQ |
                               |  - Category & Demographic Affinity Boost      |
                               |  - Profile Gap Insights (Unlock Potential)    |
                               +-----------------------+-----------------------+
                                                       |
                         +-----------------------------+-----------------------------+
                         |                                                           |
                         v                                                           v
       +-----------------------------------+                       +-----------------------------------+
       |     Recommendations & Insights    |                       |      LangGraph StateGraph AI      |
       |  - What-If Simulation Engine      |                       |  - Retriever Node                 |
       |  - Smart Filters (Status/Category)|                       |  - Evaluator Node (Facts Ground)  |
       |  - Explainable Rule Breakdowns    |                       |  - Generator (Groq LLaMA 3.3 /    |
       |                                   |                       |               Rule-Engine Fallback|
       +-----------------+-----------------+                       +-----------------+-----------------+
                         |                                                           |
                         +-----------------------------+-----------------------------+
                                                       |
                                                       v
                                       +-------------------------------+
                                       |      React + Vite Frontend    |
                                       |  - Citizen Hub & Dashboard    |
                                       |  - What-If Simulator Drawer   |
                                       |  - Rule Breakdown Modal       |
                                       |  - Conversational Assistant   |
                                       +-------------------------------+
```

---

## 🚀 Core Capabilities

### 1. Deterministic Rule Evaluation Engine
- **Legal Accuracy Guarantee**: Evaluates explicit official criteria without AI approximation or guessing.
- **Granular Checks Supported**:
  - `Age Range`: Minimum / Maximum age thresholds.
  - `Annual Family Income`: Income ceilings or BPL requirements.
  - `Gender`: Female, Male, All.
  - `Geographic Scope`: Central vs State-specific applicability (e.g., MP, Maharashtra, Delhi, Telangana, WB).
  - `Occupation & Education`: Student, Farmer, Entrepreneur, Self-employed, Unemployed, Job Seeker, Degree levels.
  - `Social Categories`: General, OBC, SC, ST, EWS.
  - `Affirmative Categories`: Person with Disability (PwD), Active Farmer, BPL/AAY cardholder, Minority.
- **Explainable Breakdown**:
  - `passedChecks`: Explicit rules satisfied.
  - `failedChecks`: Explicit rules violated.
  - `missingChecks`: Unset profile attributes preventing full verification.
  - `criticalFailureReasons`: Clear human-readable disqualification explanations.
  - `requirementSummary`: Natural language summary (e.g., *"100% Eligible — all 4 criteria satisfied"*).

### 2. Multi-Factor Hybrid Ranking & Affinity Scoring
- **Tiered Match Priority**:
  - **Tier 1 (100% Eligible)**: Base Score 85–100.
  - **Tier 2 (High Match / Needs Verification)**: Base Score 65–84.
  - **Tier 3 (Partial Match)**: Base Score 45–64.
  - **Tier 4 (Disqualified)**: Base Score 0–40.
- **Demographic & Category Affinity Boost**:
  - Occupational synergy (Students $\to$ Scholarships, Farmers $\to$ Agricultural subsidies, Entrepreneurs $\to$ Credit/Loans).
  - Demographic focus (Women empowerment, Senior Citizens, Disability assistive aids).
  - State localization boost for programs matching the citizen's resident state.

### 3. Profile Gap Insights ("Unlock Potential")
- Scans the entire active scheme database against the citizen's profile.
- Ranks which missing profile attributes (e.g., *Annual Income*, *State*, *Occupation*) will unlock or clarify the highest number of pending schemes.
- Provides actionable notifications directly on the Citizen Dashboard and Recommendations Hub.

### 4. Interactive "What-If" Eligibility Simulator
- Slide income limits, switch occupations, change resident state, or toggle farmer/disability flags dynamically.
- Evaluates hypothetical matches in-memory via `POST /api/recommendations/simulate` **without mutating the user's permanent database profile**.
- Displays comparison statistics (e.g., *"+4 newly unlocked schemes under this scenario"*).

### 5. Multi-Step AI Assistant (LangGraph + Groq LLaMA 3.3)
- **LangGraph StateGraph Workflow**:
  - `retrieverNode`: Understands user intent and queries candidate schemes from MongoDB.
  - `evaluatorNode`: Evaluates deterministic eligibility rules against citizen profile and compiles 100% verified facts.
  - `generatorNode`: Synthesizes responses using **Groq (`llama-3.3-70b-versatile`)** with zero-hallucination grounding.
  - **Graceful Fallback**: If no Groq API key is present, automatically falls back to an intelligent deterministic rule synthesizer so the chat never fails or crashes.
- **Conversational Chat UI**:
  - Multi-turn conversation history.
  - 1-click quick suggestion chips (*"Which schemes am I 100% eligible for?"*, *"What scholarships fit my education?"*, etc.).
  - Embedded interactive Scheme Cards with direct details navigation and official portal links.
  - Optional in-browser Groq API Key configuration drawer.

---

## 🏛️ Seeded Scheme Database (24 Realistic Programs)

| # | Scheme Name | Category | Level | Target Demographic |
| :--- | :--- | :--- | :--- | :--- |
| 1 | **Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)** | Agriculture | Central | Farmers (₹6,000/yr DBT) |
| 2 | **Pradhan Mantri Fasal Bima Yojana (PMFBY)** | Agriculture | Central | Farmers (Crop Insurance) |
| 3 | **Mukhyamantri Kisan Kalyan Yojana** | Agriculture | State (MP) | MP Farmers (₹4,000 top-up) |
| 4 | **Rythu Bharosa / Rythu Bandhu** | Agriculture | State (Telangana) | Telangana Farmers (₹10,000/acre) |
| 5 | **Ayushman Bharat - PM-JAY** | Healthcare | Central | Low Income / BPL (₹5 Lakh Cover) |
| 6 | **Mahatma Jyotirao Phule Jan Arogya Yojana** | Healthcare | State (MH) | Maharashtra Residents |
| 7 | **National Merit Scholarship** | Education | Central | College / University Students |
| 8 | **Post-Matric Scholarship for SC/ST** | Education | Central | SC/ST Students (Full Fee Reimbursement) |
| 9 | **National Means-cum-Merit Scholarship (NMMSS)** | Education | Central | School Students (Classes 9–12) |
| 10 | **Kanyashree Prakalpa** | Education | State (WB) | West Bengal Girls (K1 & K2 Grants) |
| 11 | **Delhi Ladli Scheme** | Education | State (Delhi) | Delhi Girl Child Milestone Deposits |
| 12 | **Pudhumai Penn Scheme** | Education | State (TN) | Tamil Nadu Govt School Girls (₹1,000/mo) |
| 13 | **PM SVANidhi** | MSME | Central | Urban Street Vendors (Micro-credit) |
| 14 | **Pradhan Mantri MUDRA Yojana (PMMY)** | Entrepreneurship | Central | Micro-enterprises (Loans up to ₹10L) |
| 15 | **Stand-Up India Scheme** | Entrepreneurship | Central | Women & SC/ST Greenfield Ventures |
| 16 | **Mukhyamantri Ladli Behna Yojana** | Women & Child | State (MP) | MP Women (₹1,250/month DBT) |
| 17 | **Sukanya Samriddhi Yojana (SSY)** | Women & Child | Central | Girl Child Savings (8.2% Tax-free) |
| 18 | **Pradhan Mantri Awas Yojana - Urban (PMAY-U)** | Housing | Central | Urban EWS/LIG (Home Loan Subsidy) |
| 19 | **Pradhan Mantri Awas Yojana - Gramin (PMAY-G)** | Housing | Central | Rural Pucca House Financial Grant |
| 20 | **National Apprenticeship Promotion Scheme (NAPS)**| Skill Dev | Central | Unemployed Youth / Graduates |
| 21 | **Mukhyamantri Yuva Sambal Yojana** | Employment | State (RJ) | Rajasthan Unemployed Graduates |
| 22 | **Indira Gandhi National Old Age Pension (IGNOAPS)**| Social Welfare | Central | Senior Citizens (Age 60+, BPL) |
| 23 | **Assistance to Disabled Persons for Aids (ADIP)** | Disability | Central | PwD Citizens (Free Assistive Devices) |
| 24 | **Deendayal Antyodaya Yojana - NRLM** | Women & Child | Central | Rural Women Self-Help Groups (SHGs) |

---

## 👥 Demo Personas for Testing

All test accounts share the password: `Demo@123`

| Persona | Email | Key Attributes | Target Test Schemes |
| :--- | :--- | :--- | :--- |
| **Student** | `demo@schemesathi.local` | Age 21, Female, Delhi, SC, Income ₹1.8L | Post-Matric SC/ST, National Merit, Delhi Ladli |
| **Farmer** | `farmer@schemesathi.local` | Age 42, Male, MP, Rural, OBC, Income ₹1.2L | PM-KISAN, PMFBY, MP Kisan Kalyan |
| **Entrepreneur**| `entrepreneur@schemesathi.local` | Age 34, Female, Maharashtra, Urban, Self-employed | Stand-Up India, PM MUDRA, MJPJAY Health |
| **Senior Citizen**| `senior@schemesathi.local` | Age 67, Male, UP, Rural, BPL Cardholder | IGNOAPS Old Age Pension, Ayushman Bharat |
| **PwD Seeker** | `pwd@schemesathi.local` | Age 24, Male, Haryana, PwD, Job Seeker | ADIP Disability Aids, NAPS Apprenticeship |
| **Admin** | `admin@schemesathi.local` | Role: `admin` (Password: `Admin@123`) | Scheme Management & Verification |

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router v6, Axios, Lucide Icons
- **Backend**: Node.js (ESM), Express, MongoDB, Mongoose ODM
- **AI & Agent Orchestration**:
  - **LangGraph** (`@langchain/langgraph`): Multi-step state machine (`retriever` $\to$ `evaluator` $\to$ `generator`)
  - **LangChain Groq** (`@langchain/groq`): `llama-3.3-70b-versatile`
  - **LangChain Google GenAI** (`@langchain/google-genai`): Fallback Gemini adapter
- **Vector & Queue Infrastructure (Included)**: Qdrant vector database, Redis & BullMQ
- **Authentication**: JWT with HTTP-only cookies and Bearer token fallback

---
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

## 📡 API Reference

### Recommendations & Simulation
- `GET /api/recommendations`
  - Query params: `category`, `status`, `level`, `minScore`, `search`, `sortBy`, `limit`, `includeIneligible`.
  - Returns: `{ recommendations, stats: { total, eligibleCount, needsVerificationCount, notEligibleCount, categoryCounts } }`.
- `POST /api/recommendations/simulate`
  - Body: `{ profile: { ...hypotheticalProfile } }`.
  - Returns: `{ recommendations, stats, simulationStats: { totalEligible, newlyEligibleCount, newlyEligibleSchemes } }`.
- `GET /api/recommendations/insights`
  - Returns: `{ profileCompleteness, completedCount, totalTrackedFields, highImpactFields, summary }`.
- `POST /api/recommendations/check`
  - Body: `{ schemeId, profile? }`.
  - Returns: Detailed deterministic rule checks for a specific scheme.

### AI Assistant
- `POST /api/assistant/chat`
  - Body: `{ question, history?, apiKey?, profile? }`.
  - Runs LangGraph StateGraph workflow (`retriever` $\to$ `evaluator` $\to$ `generator`).
  - Returns: `{ answer, recommendations, mode, modelUsed }`.

### Citizen Profile
- `GET /api/profile`: Get authenticated citizen profile.
- `PUT /api/profile`: Update profile fields (`age`, `income`, `occupation`, `state`, `maritalStatus`, `disability`, `farmer`, `bplCard`, etc.).

---

## 📂 Project Structure

```text
gov-scheme-portal/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx               # Navigation bar & shell
│   │   │   ├── ProtectedRoute.jsx       # Auth route guard
│   │   │   └── SchemeCard.jsx           # Match badges, progress bar, rule trigger
│   │   ├── lib/
│   │   │   ├── api.js                   # Axios client with credentials
│   │   │   └── AuthContext.jsx          # Authentication state provider
│   │   └── pages/
│   │       ├── Assistant.jsx            # LangGraph conversational chat UI
│   │       ├── Dashboard.jsx            # Citizen stats & profile strength
│   │       ├── Profile.jsx              # Demographic & criteria form
│   │       ├── Recommendations.jsx      # Hub with What-If Simulator & Rule Modal
│   │       ├── SchemeDetail.jsx         # Full breakdown, benefits & process
│   │       └── Schemes.jsx              # Global searchable catalog
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── src/
│   │   ├── ai/
│   │   │   └── schemeAssistantGraph.js  # Compiled LangGraph StateGraph workflow
│   │   ├── controllers/
│   │   │   ├── aiController.js          # Chat endpoint handler
│   │   │   ├── profileController.js     # Citizen profile CRUD
│   │   │   ├── recommendationController.js # Recommendations, Simulator, Insights
│   │   │   └── schemeController.js      # Scheme management
│   │   ├── models/
│   │   │   ├── Scheme.js                # Scheme schema with rule ranges & criteria
│   │   │   └── User.js                  # Citizen profile schema
│   │   ├── routes/
│   │   │   ├── aiRoutes.js              # /api/assistant
│   │   │   └── recommendationRoutes.js  # /api/recommendations
│   │   ├── services/
│   │   │   ├── aiService.js             # Assistant orchestration service
│   │   │   ├── eligibilityService.js    # Deterministic rule evaluation engine
│   │   │   └── recommendationService.js # Hybrid ranking & gap insights engine
│   │   ├── seed.js                      # 24 schemes & 5 personas database seeder
│   │   ├── test-recommendations.js      # 8 algorithmic verification tests
│   │   └── test-ai-assistant.js         # LangGraph workflow test suite
│   ├── package.json
│   └── .env
│
├── docker-compose.yml
├── README.md                            # Original reference README
└── README2.md                           # Comprehensive project documentation
```

---

## 🔒 Security & Privacy Practices

1. **Zero Hallucination Eligibility**: AI models are never used to decide legal eligibility. All decisions derive deterministically from official criteria.
2. **Non-Destructive Simulation**: The What-If Simulator performs evaluations entirely in memory without writing changes to the citizen's profile.
3. **Data Minimization**: Citizens provide only the attributes they wish to be evaluated against.
4. **Official Portals Grounding**: Every scheme includes verified official portal links so citizens submit applications directly through government departments.

