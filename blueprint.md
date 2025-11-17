# EMBER Engineering Blueprint Brain

This living document records major decisions, progress, and references across the EMBER platform. Always update it after meaningful changes.

## Master References
- `docs/EMBER-master.md` – canonical product & delivery specification.
- `README.md` – quick start guide for local dev + Docker orchestration.
- `docker-compose.yml` – reference stack (frontend, backend, Postgres, Redis).

---

### [Step 0 – Repo Reset & EMBER Scaffolding] (Completed on 2025-11-15)
- **What:** Archived the prior Twilio/Gemini workspace and rebuilt the repository to align with the EMBER blueprint. Established pnpm workspace with `frontend/` (Vite + React + Three.js) and `backend/` (Express + TypeScript) plus shared Docker/local tooling.
- **Why:** The existing codebase served a different problem domain. Per request, EMBER requires a one-page adaptive agent with a distinct architecture, so starting fresh prevents architectural drift and simplifies future Cursor-driven generation.
- **Key Outputs:**
  - Frontend scaffolding: Chat page, particle hero, streaming hook, Tailwind design system, Vitest/RTL harness. (`frontend/src/pages/ChatPage.tsx`, `frontend/src/components/organisms/ParticleHero.tsx`, etc.)
  - Backend scaffolding: Express server, `/api/chat` streaming route, AliveState helpers, Vitest + Supertest coverage. (`backend/src/routes/chatRoutes.ts`, `backend/src/services/chat/ChatService.ts`.)
  - DevOps foundations: root pnpm workspace, `.env.example`, Dockerfiles, `docker-compose.yml`, documentation restructure, and spec import into `docs/EMBER-master.md`.
- **Next Steps:**
  1. Flesh out real LLM + persistence wiring inside `ChatService` (Phase 1 requirement).
  2. Introduce settings/learning/sub-agent services per blueprint phases and connect to frontend state machine.
  3. Stand up Postgres schema + Prisma/Drizzle layer and Redis session cache per spec.

---

_Always consult this log plus `docs/EMBER-master.md` before starting new work to avoid duplication and to maintain continuity._

### [Step 1 – React 19 Upgrade & Alive Services] (Completed on 2025-11-15)
- **What:** Raised the frontend stack to React 19, updated Three Fiber/Drei, and expanded Zustand state so AliveState events (learning, theme changes, agent spawning) drive UI feedback. On the backend, replaced the mocked streaming loop with a Prisma + Redis + OpenAI pipeline that persists conversations, caches context, and emits structured event chunks.
- **Why:** Phase 1 called for production-grade persistence plus LLM streaming, and the follow-up bullet asked for richer AliveState signals bound into the UI.
- **Key Outputs:**
  - Prisma schema + client wiring (`backend/prisma/schema.prisma`, `src/db/prisma.ts`) and Redis cache wrapper with in-memory fallback for tests.
  - ChatService now stores messages, streams OpenAI deltas, surfaces setting/agent/learning events, and hydrates AliveState accordingly (`backend/src/services/chat/ChatService.ts`).
  - Settings/Learning/Agent services now commit to Postgres and emit confidence-tagged changes feeding AliveState (`backend/src/services/settings`, `/learning`, `/agents`).
  - Frontend theme/agent awareness via `useEmberStore`, new event handling in `ChatPage`, and React 19 ready dependencies (`frontend/package.json`, `src/pages/ChatPage.tsx`, `src/lib/store.ts`).
- **Next Steps:** Expand integrations + OAuth surface area, and ensure sub-agents can surface their lifecycle in the UI.

### [Step 2 – Integration Scaffolding & Test Harnesses] (Completed on 2025-11-15)
- **What:** Added OAuth-ready integration routes/service with Redis-backed state, spec’d provider configs (Notion/Google/Slack/Gmail), and exposed new API endpoints. Built a dedicated `tests/` workspace hosting Playwright E2E checks, API contract validation via Zod, and a k6 load script, wiring root scripts to run them.
- **Why:** User requested integration scaffolding plus comprehensive tests (E2E, contract, load) before layering more behavior.
- **Key Outputs:**
  - `IntegrationService` + `/api/integrations/**` routes storing auth artifacts in Prisma (`backend/src/services/integrations/IntegrationService.ts`, `src/routes/integrationRoutes.ts`, server wiring).
  - Playwright config + chat streaming spec, contract suite using Vitest + Zod, and k6 scenario (`tests/` workspace with package + configs).
  - Root README and package scripts updated to document/test new workflows.
- **Next Steps:** Hook real providers (swap mocked token exchange for HTTP clients), add CI wiring for the new test suites, and flesh out UI for integration management.
