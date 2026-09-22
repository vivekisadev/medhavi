# Tests

Niyomi ships with **154 automated checks** across two folders.

## Layout

```
tests/
├── unit/          # Self-contained logic tests (no server needed)
│   ├── edge-cases.js        # Edge-case & stress scenarios (OCR, fuzzy matching, rules)
│   └── trust-loop.js        # Merit ranking, notifications, scheme rules, rate limiting, validation, CSV, security
└── integration/   # Hit real HTTP endpoints (a dev/prod server must be running on :3000)
    ├── api.test.js             # Documents OCR + applications API
    └── trust-loop-api.test.js  # Merit, notifications, admin/rules + security probes
```

## Run

Unit tests (no server required):

```bash
node tests/unit/edge-cases.js
node tests/unit/trust-loop.js
```

Integration tests (server must be running first):

```bash
npm run dev                 # terminal 1
node tests/integration/api.test.js
node tests/integration/trust-loop-api.test.js
```

All checks are also executed automatically in CI (`.github/workflows/ci.yml`).

## Coverage

| Area | Checks |
|---|---|
| Eligibility engine (income/age/marks/QS/NET/PVTG/name match) | edge-cases + trust-loop |
| OCR quality & extraction | edge-cases + integration |
| Merit ranking & scoring bands | trust-loop |
| Notification templates & email HTML | trust-loop + integration |
| Configurable scheme rules (GET/update/toggle/reset) | trust-loop + integration |
| Rate limiting (429 on abuse) | trust-loop + integration |
| Input validation & XSS sanitization | trust-loop + integration |
| CSV export | trust-loop |
| API contract & status whitelist | integration |