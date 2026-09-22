# Medhavi 🎓

**AI-Enabled Scholarship & Fellowship Management System for Scheduled Tribe (ST) Students**

Medhavi is an intelligent, secure, end-to-end digital platform for the Ministry of Tribal Affairs (MoTA) to administer its scholarship and fellowship schemes — from application submission and AI-assisted verification through merit-based selection, communication, and disbursement tracking.

> **Problem Statement SIH-26239 · Theme: Smart Education · Category: Software**

---

## Table of Contents

- [The Problem](#the-problem)
- [How Medhavi Solves It](#how-Medhavi-solves-it)
- [Flagship Schemes](#flagship-schemes)
- [What Is Already Built](#what-is-already-built)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Configuration](#environment-configuration)
- [Testing & Quality](#testing--quality)
- [What Comes Next (Roadmap)](#what-comes-next-roadmap)
- [The Final Product](#the-final-product)
- [Impact](#impact)

---

## The Problem

The Ministry of Tribal Affairs (MoTA) implements multiple scholarship and fellowship schemes to support Scheduled Tribe (ST) students pursuing higher education in India and abroad — including the **National Fellowship for Scheduled Tribes (NFST)** and the **National Overseas Scholarship (NOS)**.

Today, these schemes suffer from:

| Pain Point | Consequence |
|---|---|
| **Manual scrutiny & verification** | Slow processing, repetitive administrative effort |
| **Repeated correspondence** | Long email/letter loops for small corrections |
| **Multiple levels of verification** | Scope for errors and inconsistent decisions |
| **Limited real-time visibility** | Applicants and officials cannot track progress |
| **Scheme-specific rules in silos** | Duplicate systems, no shared infrastructure |
| **Opacity in selection** | Hard to audit and difficult to justify outcomes |

The result: **processing delays, high manual effort, limited transparency, and an uneven digital experience** for applicants and administrators alike.

---

## How Medhavi Solves It

Medhavi replaces the fragmented, manual process with **one common, secure, transparent, and intelligent digital platform** that can manage any MoTA scheme through configuration — while keeping human officials in control of every decision.

```
Applicant submits
      │
      ▼
┌─────────────────┐
│  AI Document     │   OCR + quality check + data extraction
│  Verification    │   (Gemini / OpenAI Vision / local mock)
└────────┬────────┘
         ▼
┌─────────────────┐
│  Eligibility     │   8 configurable rule checks per scheme
│  Engine          │   (income, age, marks, QS rank, NET, PVTG…)
└────────┬────────┘
         ▼
┌─────────────────┐
│  Merit Ranking   │   Weighted composite score → transparent order
│  + Human Review  │   Official inspects, approves / rejects with audit
└────────┬────────┘
         ▼
┌─────────────────┐
│  Communication   │   In-app notifications + email templates
│  & Disbursement  │   (deficiency, approve, reject, disbursement)
└─────────────────┘
```

**Core design principles:**

- **Configurable, not hardcoded** — eligibility rules per scheme are editable by administrators at runtime (no code changes to add or tweak a scheme).
- **AI where it helps, humans where it matters** — OCR/quality engines cut manual effort; officials retain final approval with a full audit trail.
- **Transparent and auditable** — every score, check, and decision is explainable and recorded.
- **Separate portals** — a student portal for applying/tracking and a ministry portal for verification, selection, and analytics.

---

## Flagship Schemes

| | **NOS** — National Overseas Scholarship | **NFST** — National Fellowship for ST |
|---|---|---|
| **Purpose** | Master's / Ph.D. abroad | Research programmes (Ph.D.) in India |
| **Income cap** | ≤ ₹6,00,000/year | No cap |
| **Qualification** | QS Top-1000 university | UGC-NET / JRF required |
| **Age** | ≤ 32 (Masters), ≤ 35 (Ph.D.) | As per scheme |
| **Priority** | — | PVTG candidates prioritized |

---

## What Is Already Built

✅ **End-to-end application flow**
- Multi-step application form (personal → education → documents)
- Auto-generated application numbers, live status tracking
- 3 built-in demo scenarios (valid NOS, NFST/PVTG, deficient application)

✅ **AI document intelligence**
- OCR pipeline via Gemini / OpenAI Vision APIs with a local mock fallback
- Image-quality scoring, blur/contrast detection, size/type validation
- Automatic data extraction (name, income, certificate no., institution…)
- Fuzzy name-matching across documents (Levenshtein + token scoring)

✅ **Eligibility verification engine**
- 8 rule checks per scheme (income, age, qualifying marks, QS rank, NET, caste, name consistency, document quality)
- Explainable pass/fail per rule + overall AI confidence score
- **Admin-editable scheme rules** with enable/disable toggles

✅ **Merit-based selection**
- Weighted composite score: income 25% · marks 30% · age 15% · PVTG 10% · doc quality 20%
- Rank ordering per scheme; score breakdown visible to applicants

✅ **Review & workflow management**
- Official review queue + inspector with rule-check drill-down
- Approve / Reject with confirmation
- Deficiency flagging with actionable feedback & resubmission

✅ **Communication**
- 7 notification templates (submitted, verified, deficiency, approved, rejected, resubmission, disbursement)
- In-app notification bell with unread badges
- HTML email template generator (SMTP-ready)

✅ **Dashboards & analytics**
- Ministry dashboard: status pie chart, scheme comparison, merit bars, application timeline
- CSV export of all applications
- Audit-trail viewer for every action

✅ **Authentication (production-ready)**
- Email/password, Google OAuth, and **DigiLocker** OAuth2.0
- Forgot/update password flows
- **Demo mode**: when no Supabase credentials are present, auth is bypassed and the app runs fully without login

✅ **Security hardening**
- IP-based rate limiting on all write APIs (429 on abuse)
- Input validation (email, income, marks, age, file type/size)
- XSS sanitization (script/style/iframe stripping) on all input
- Status whitelist on all state transitions
- Supabase Row-Level Security schema for student/official roles

---

## Architecture

```
src/
├── proxy.ts                    # Auth proxy (formerly middleware) — guards protected routes
├── app/
│   ├── page.tsx                    # Landing page (marketing + CTA)
│   ├── auth/                       # login, signup, forgot/update password, OAuth callback
│   ├── student/dashboard/          # Student portal
│   ├── official/dashboard/         # Ministry portal (analytics, queue, rules, audit)
│   └── api/
│       ├── applications/           # create / verify / update_status
│       ├── documents/process/      # upload + OCR + quality scoring
│       ├── merit/                  # merit ranking (all / per scheme)
│       ├── notifications/          # generate notification + email HTML
│       ├── admin/rules/            # get / update / toggle / reset scheme rules
│       └── auth/digilocker/        # DigiLocker OAuth2.0 authorize/exchange
├── components/
│   ├── student/                    # form, uploader, tracker, alerts, digilocker, notification bell
│   ├── official/                   # review queue/inspector, analytics+charts, rules editor, audit
│   ├── layout/                     # sidebar, navbar, user menu
│   └── ui/                         # shadcn-style primitives
├── lib/
│   ├── types.ts, utils.ts, store.ts   # shared types, utilities, Zustand state
│   ├── engines/                       # domain logic
│   │   ├── verification-engine.ts     #   8-rule eligibility checks
│   │   ├── merit-engine.ts            #   weighted ranking engine
│   │   ├── ocr-engine.ts              #   quality + OCR extraction + name matching
│   │   └── ai-ocr.ts                  #   Gemini / OpenAI / mock pipeline
│   ├── security/                    # hardening layer
│   │   ├── rate-limit.ts            #   IP rate limiting
│   │   └── validation.ts            #   sanitization + field validation
│   ├── services/                    # outbound capabilities
│   │   ├── notifications.ts         #   templates + email HTML
│   │   └── export.ts                #   CSV generation + download
│   ├── data/                        # configuration & fixtures
│   │   ├── mock-data.ts             #   demo users/applications/documents
│   │   └── scheme-rules.ts          #   configurable scheme rule store
│   └── supabase/                    # browser + server clients (env-guarded)
└── supabase/schema.sql             # tables, RLS policies, triggers

tests/
├── unit/                     # Self-contained logic tests (no server)
│   ├── edge-cases.js              # 30 edge-case & stress checks
│   └── trust-loop.js              # 70 checks (merit, rules, notifications, security)
└── integration/              # Live HTTP tests (server on :3000)
    ├── api.test.js                # 25 API contract checks
    └── trust-loop-api.test.js     # 29 API + security-probe checks
```

**Tech stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Shadcn UI · Zustand · Recharts · Framer Motion · Supabase (Auth + DB) · Lucide Icons

---

## Getting Started

**Prerequisites:** Node.js ≥ 20 (see `.nvmrc`)

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **No configuration needed to try it — works out of the box in demo mode.** Without `.env` credentials, login is skipped and the full flow (apply → upload → AI verify → track) is available immediately.

**Production build & verification:**

```bash
npm run lint       # eslint (0 errors expected)
npm run test:unit  # 100 self-contained checks (no server needed)
npm run build      # production build
npm run start      # serve the production build
npm run test:integration  # 54 live-HTTP checks (server must be running on :3000)
```

Or run the full quality gate in one command: `npm test` (lint + unit tests + production build).

---

## Environment Configuration

Copy `.env.example` → `.env.local` and fill in what you need:

| Variable | Purpose | Required |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Real Auth + persisted DB | For production |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin operations | For production |
| `DIGILOCKER_CLIENT_ID` / `DIGILOCKER_CLIENT_SECRET` | DigiLocker OAuth | Optional |
| `NEXT_PUBLIC_AI_PROVIDER` | `mock` \| `google_gemini` \| `openai` | Defaults to `mock` |
| `GEMINI_API_KEY` / `OPENAI_API_KEY` | Real AI OCR | For real AI |
| `NEXT_PUBLIC_ENABLE_REAL_AI_OCR` | `false` → local mock | Default `false` |
| `NEXT_PUBLIC_MAX_FILE_SIZE_MB` | Upload limit | Default 5 |

See `.env.example` for full details and provider setup links.

---

## Testing & Quality

| Suite | Command | Result |
|---|---|---|
| Edge-case & stress tests | `npm run test:unit` → `tests/unit/edge-cases.js` | 30/30 ✅ |
| Trust-loop unit tests (merit, rules, notifications, validation, security) | `npm run test:unit` → `tests/unit/trust-loop.js` | 70/70 ✅ |
| API integration tests (live server) | `npm run test:integration` → `tests/integration/api.test.js` | 25/25 ✅ |
| Trust-loop API tests (new routes + security probes) | `npm run test:integration` → `tests/integration/trust-loop-api.test.js` | 29/29 ✅ |
| Lint | `npm run lint` | 0 errors, 0 warnings ✅ |
| Build | `npm run build` | Clean ✅ |

**154 automated checks** across four suites — all passing, all wired into GitHub Actions (see `.github/workflows/ci.yml`).

---

## What Comes Next (Roadmap)

### Phase 1 — Production data layer
- [ ] Persist applications, documents, and notifications in Supabase (schema is ready)
- [ ] Server-side file storage (Supabase Storage / S3) instead of in-memory blobs
- [ ] Wire the notification engine to real email/SMS delivery (SendGrid / Gov SMTP)

### Phase 2 — Selection & governance
- [ ] Multi-level review committee workflow (scrutiny → screening → selection)
- [ ] Approval override with mandatory documented reasoning
- [ ] Batch shortlisting and automated merit-list generation
- [ ] Grievance / appeal workflow for rejected applicants

### Phase 3 — Scheme configurability at scale
- [ ] No-code scheme builder (drag-and-drop rules, docs, stages)
- [ ] Dynamic document requirement sets per scheme stage
- [ ] Versioned rule history with audit

### Phase 4 — Deeper AI
- [ ] Duplicate-application and document forgery detection
- [ ] Real document storage + confidence-threshold enforcement
- [ ] Published reasoning/explanation sent to applicants
- [ ] Predictive scheme-performance analytics and alerts

### Phase 5 — Scale & compliance
- [ ] State/district/tribe-level report breakdowns + PDF export
- [ ] Role-based access control expansion (state nodes, district nodes)
- [ ] Full audit & compliance reporting for MoTA
- [ ] Localization (Hindi + regional languages)
- [ ] Accessibility (WCAG 2.1) and penetration-test certification

---

## The Final Product

When complete, Medhavi will be a **national-scale digital spine for MoTA scheme administration**:

- **A student** logs in (even via DigiLocker), uploads documents once, watches AI verify them in real time, sees their merit rank explained component-by-component, gets notified at every step, and can fix deficiencies without a single phone call or office visit.
- **A ministry official** sees a live, ranked pipeline, drills into any application's verification evidence, makes decisions their reasons are logged against, tweaks scheme criteria without engineering help, and exports compliant reports in one click.
- **MoTA** gains a single source of truth — real-time scheme performance, verification health, selection fairness (with a tamper-evident audit trail), and analytics across every tribe, state, and university.

The system is designed to scale from **hundreds of thousands of applications** per cycle with human oversight preserved at every decision point.

---

## Impact

### On applicants
- ⚡ **Faster disbursement** — AI clears routine verification in seconds instead of weeks
- 👁️ **Complete transparency** — real-time status at every stage, with the *why* behind each result
- 🛡️ **Fairness** — consistent, rule-based scoring; merit lists anyone can audit

### On the Ministry
- 🔁 **Repetitive work eliminated** — officers focus on judgment, not photocopying
- 📊 **Evidence-based administration** — live dashboards replace monthly spreadsheets
- 🧾 **Accountability** — full audit trail makes every decision demonstrable and defensible

### On society
- 🎓 **More ST students in higher education** — the barrier of slow, opaque paperwork falls away
- 🇮🇳 **Stronger inclusion** — PVTG and underserved groups prioritized programmatically
- 💡 **A reusable blueprint** — the same configurable platform can govern other welfare schemes

> *"Processing delays, repetitive administrative effort, limited real-time visibility and scope for errors in verification and workflow management" — the exact problems Medhavi was designed to retire.*

---

## License

Proprietary prototype — built for the Ministry of Tribal Affairs context.
This is a working prototype; production deployment requires the Phase-1 data layer configuration above.
