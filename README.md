# EMBER – Adaptive AI Agent Platform

EMBER is a one-page, 3D-enhanced conversational agent that adapts to every user interaction in real-time. The platform pairs a high-fidelity React front-end (React, Three.js, Zustand, SWR) with a TypeScript/Express backend that orchestrates chat flows, learning pipelines, settings intelligence, and a future sub-agent execution engine.

## Repository Layout

```
frontend/   # React 19-ready Vite app with particle hero and chat shell
backend/    # Express + TypeScript API with streaming chat and service layer
tests/      # Playwright E2E, API contract, and k6 load harnesses
docs/       # Living documentation, specs, and runbooks
```

Key reference: `docs/EMBER-master.md` mirrors the full production blueprint supplied for Cursor-driven generation.

## Getting Started

1. Ensure Node.js 20+ and pnpm 9+ are installed.
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Copy `.env.example` to `.env` in `backend/` and provide valid secrets.
4. Launch services locally via Docker (recommended):
   ```bash
   docker compose up --build
   ```
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Running Individually

Frontend:
```bash
cd frontend
pnpm dev
```
Backend:
```bash
cd backend
pnpm dev
```

## Scripts

- `pnpm lint` – Runs ESLint across workspaces.
- `pnpm test` – Runs unit tests (Vitest) for frontend and backend.
- `pnpm test:e2e` – Executes Playwright API tests (requires running backend + `API_BASE_URL`).
- `pnpm test:contract` – Runs Zod-backed contract tests against the live API.
- `pnpm test:load` – Runs the k6 scenario defined under `tests/load`.
- `pnpm build` – Creates production bundles for both services.
- `pnpm dev` – Starts the frontend dev server (backend run separately).

## Testing Strategy

The repo seeds:

- **Unit**: Vitest + Testing Library (frontend) and Vitest + Supertest (backend).
- **E2E**: Playwright API tests in `tests/e2e` (requires the backend running with reachable `API_BASE_URL`).
- **Contract**: `tests/contract` validates response envelopes with Zod schemas so the frontend can safely depend on payloads.
- **Load**: `tests/load/chat.ts` is a k6 script for smoke-level throughput checks.

See `docs/EMBER-master.md` for the longer-term test matrix.

## Deployment

`docker-compose.yml` provisions a local stack (frontend, backend, Postgres, Redis). Production deployment should shift to containerized workloads behind an API gateway with CDN/VPC hardening per the blueprint.

## Documentation

- `docs/EMBER-master.md` – Canonical spec.
- `blueprint.md` – Running engineering journal with dated entries, decisions, and references.

Contributions must update `blueprint.md` to capture rationale, links, and follow-up items.
