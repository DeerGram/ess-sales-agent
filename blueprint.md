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
