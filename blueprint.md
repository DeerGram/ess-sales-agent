# Project Scope (dev-focused)

## 1) Tech Stack & Standards

* **Runtime**: Node.js 20 LTS on **Cloud Run** (min instance 1 for latency-critical webhook).
* **Language**: **TypeScript** (strict mode, `noImplicitAny`, `exactOptionalPropertyTypes`).
* **Framework**: Fastify (HTTP), **Zod** (runtime validation), **Pino** (structured logs).
* **Tests**: Vitest + ts-node + **Supertest** (HTTP), **MSW** (API mocks), **Pact** (consumer contracts for Airtable/Twilio/ConvertKit), **Playwright** (E2E webhook).
* **Lint/Format**: ESLint (airbnb+security), Prettier, tsec (TypeScript security), Knip (dead code).
* **CI**: GitHub Actions (lint → typecheck → unit → contract → e2e → container build → deploy to staging).
* **IaC**: Terraform for Cloud Run, Pub/Sub, Secret Manager, Firestore, IAM.
* **Obs**: Cloud Logging, Error Reporting, Uptime checks, Cloud Trace; BigQuery for analytics sink.

## 2) Services (repo packages)

```
/apps
  /router-api          # Twilio webhook + Gemini tool runner
  /worker-tasks        # Pub/Sub async: TTS, outbound voice, retries
/packages
  /shared              # types, zod schemas, constants, utils
  /clients             # airtable, convertkit, twilio, elevenlabs SDK wrappers
  /gemini              # tool schemas, system prompts, few-shots
  /testing             # mocks, fixtures, pact, MSW handlers
/infrastructure
  /terraform           # GCP infra
  /github              # workflows
```

## 3) Core Use Cases (MVP)

1. **Owner sends WhatsApp message or business card photo**

   * OCR/extraction via Gemini multimodal.
   * Ask one clarifying question if needed.
   * Upsert **Lead** in Airtable; log Interaction.
   * Start ConvertKit sequence or send custom WhatsApp message.
2. **Owner asks to call a lead with custom intro**

   * ElevenLabs TTS → Twilio Voice → log interaction.
3. **Owner status checks**

   * “Show me today’s new leads / warm leads” → Aggregation from Airtable.

## 4) Data Contracts

### Leads (Airtable)

```
id: string
name?: string
company?: string
role?: string
phone?: string
email?: string
source: "whatsapp" | "biz_card" | "referral" | "quiz" | "other"
stage: "new" | "cold" | "warm" | "qualified" | "escalated"
tags?: string[]
ownerNotes?: string
createdAt: ISO8601
updatedAt: ISO8601
```

### Interactions

```
id: string
leadId: string
channel: "whatsapp" | "email" | "voice"
direction: "in" | "out"
text?: string
mediaUrl?: string
actionTaken: "created" | "updated" | "tagged" | "sequence_started" | "message_sent" | "call_placed" | "error"
timestamp: ISO8601
```

## 5) HTTP Endpoints (router-api)

* `POST /webhooks/twilio/whatsapp`
  Validate Twilio signature → normalize payload → call Gemini with conversation state → execute returned tool calls → respond to WhatsApp.
* `POST /internal/gemini/tools/*`
  Auth’d endpoints Graph for tools (airtable, convertkit, twilio-msg, elevenlabs, twilio-voice, notify).
* `POST /events/pubsub`
  Pub/Sub push for long tasks (voice calls, retries).

## 6) Security & Perf Requirements

* Verify **Twilio X-Twilio-Signature**; reject on mismatch.
* All input validated with **Zod**; return typed error envelopes.
* Secrets only via **Secret Manager** + least-privileged service accounts.
* **Idempotency**: hash(email|phone|company) for upserts; `Idempotency-Key` header for webhooks.
* **Rate limiting**: token bucket in memory + GCLB/Cloud Armor (optional).
* **Timeouts**: 8s webhook budget; async fan-out via Pub/Sub for long ops.
* **Connection reuse**: keep-alive agents; avoid cold-start bloat.
* **PII**: redact in logs; column-level encryption for email/phone in BigQuery.

---

# Developer Prompts (to generate excellent code & tests)

Use these verbatim when asking your internal codegen assistant (or for code reviews). They enforce best practices and quality.

## A) Global “Code Quality Guardrails” Prompt

> **Role**: Principal Engineer.
> **Task**: Generate TypeScript code for Node.js 20 on Cloud Run.
> **Mandates**:
>
> * Use **Fastify** with typed routes, **Zod** for request/response schemas, **Pino** for logs.
> * Enable `"strict": true` TS config and exhaustive types; no `any`.
> * Security: validate all inputs, verify Twilio signatures, never log PII, use parameterized requests, exponential backoff/retries with jitter for transient 5xx/429.
> * Performance: keep bundle small, share HTTP agents, avoid sync blocking, respect 8s webhook SLO; push slow work to Pub/Sub.
> * Testing: write **Vitest** unit tests with 95%+ line/branch coverage, **Supertest** for HTTP, **MSW** to mock external APIs, and **Pact** for client contract tests. Provide fixtures and table-driven tests for edge cases.
> * Observability: structured logs, correlation IDs, error taxonomy, health/readiness endpoints, metrics counters (basic).
>   **Deliverables**:
> * Implementation .ts files + index.
> * Co-located tests `*.spec.ts`.
> * Zod schemas for all public IO.
> * README snippet for running tests.
> * No placeholders like “TODO”. Provide finished, idiomatic code.

## B) Webhook Endpoint Prompt

> Generate `apps/router-api/src/webhooks/twilioWhatsapp.ts` implementing `POST /webhooks/twilio/whatsapp`:
>
> * Verify Twilio signature (configurable with env TWILIO\_AUTH\_TOKEN).
> * Parse inbound WhatsApp text, media (images), contact cards.
> * Build a **normalized message** `{ from, text?, mediaUrl?, mediaContentType?, timestamp }`.
> * Fetch conversation state from Firestore (by `from`).
> * Call Gemini (Vertex AI, Gemini 1.5 Pro) with:
>
>   * system prompt (from packages/gemini/system.ts)
>   * tools (from packages/gemini/tools.ts)
>   * user content (text + image bytes if present)
> * Execute returned function-calls sequentially; collect results; send a WhatsApp reply via Twilio if Gemini asks you to.
> * If runtime exceeds 6s, enqueue remaining tool calls to Pub/Sub and immediately ACK Twilio with a short receipt.
> * Return 200 with an empty TwiML body.
>   **Tests**:
> * Valid signature vs invalid signature.
> * Text only, image (business card), voice note (transcribed), malformed payload.
> * Timeouts causing async offload.
> * Redaction of PII in logs.

## C) Gemini Tools Prompt

> Generate `packages/gemini/tools.ts` exporting function schemas for:
>
> * `createOrUpsertLead({ name?, company?, role?, phone?, email?, source?, notes?, stage?, tags?[] })`
> * `findLead({ email?, phone? })`
> * `updateLead({ leadId, stage?, tags?[], notesAppend? })`
> * `logInteraction({ leadId, channel, text?, mediaUrl?, outcome })`
> * `startSequence({ leadEmailOrId, sequenceSlug })`
> * `sendWhatsApp({ to, text?, mediaUrl? })`
> * `synthesizeTTS({ voiceId, scriptText })`
> * `placeCall({ to, audioUrl, callerId })`
> * `ownerNotify({ text })`
>   **Requirements**:
> * Zod schemas for parameters + return types.
> * Type-safe function-call dispatcher that enforces **authN/authZ** and **rate-limits**.
> * Unit tests verifying schema parsing and error surfaces (invalid args → typed error).

## D) Airtable Client Prompt

> Generate `packages/clients/airtable.ts`:
>
> * Typed CRUD for `Leads` and `Interactions` tables with **Zod** validation.
> * Idempotent upsert by `(email|phone, company)`; stable hashing.
> * Backoff for 429/5xx; circuit breaker for persistent failures.
> * Pact tests exposing provider contracts; MSW mocks for unit tests.
> * Ensure no PII appears in logs beyond hashed keys.

## E) ConvertKit/Kit Client Prompt

> Generate `packages/clients/convertkit.ts`:
>
> * `applyTag`, `startSequence` with strict inputs; dedupe on repeated requests.
> * Handle missing email gracefully; return actionable error for Gemini.
> * Unit + Pact tests.

## F) Twilio Messaging & Voice Clients Prompt

> Generate `packages/clients/twilio.ts`:
>
> * `sendWhatsApp({ to, text?, mediaUrl? })` → message SID
> * `placeVoiceCall({ to, audioUrl, callerId })` → call SID
> * Include request signing verification helpers for webhook.
> * Unit tests with MSW; ensure safe retries and idempotency.

## G) ElevenLabs Client Prompt

> Generate `packages/clients/elevenlabs.ts`:
>
> * `synthesize({ voiceId, scriptText })` returning `audioUrl` (GCS signed URL optional).
> * Chunk long text; parallel synth with concurrency limit.
> * Unit tests with MSW.

## H) Worker Tasks (Pub/Sub) Prompt

> Generate `apps/worker-tasks/src/index.ts`:
>
> * Handlers for `tts.call.requested`, `outbound.voice.requested`, `retry.toolcall`.
> * Exactly-once with Pub/Sub message dedupe (idempotency keys).
> * Structured success/error events to BigQuery (via Logging sink).
> * Unit tests stubbing external clients.

## I) Firestore Session Store Prompt

> Generate `packages/shared/sessionStore.ts`:
>
> * Get/put conversation state keyed by `whatsapp:from`.
> * TTL 30 days; optimistic concurrency.
> * Unit tests.

## J) Error Taxonomy & Middleware Prompt

> Generate `packages/shared/errors.ts` + Fastify middleware:
>
> * `UserInputError`, `ExternalServiceError`, `RetryableError`, `AuthError`, `RateLimitError`.
> * Map to HTTP status, redact internals, attach correlationId.
> * Unit tests for mappings and log structure.

## K) E2E Test Prompt (Playwright)

> Create `e2e/webhook.spec.ts`:
>
> * Spins up router with test config, uses Supertest to POST Twilio webhook fixtures.
> * MSW mocks: Airtable/ConvertKit/Twilio/ElevenLabs.
> * Scenarios:
>
>   1. Text lead → upsert → start sequence.
>   2. Image business card → OCR extract → ask stage → warm → send WhatsApp intro.
>   3. Missing email for sequence → fallback question → WhatsApp intro.
>   4. Tool failure → retry → DLQ path.

---

# Gemini Prompts (system + few-shots)

## System Prompt (paste into Vertex AI)

> You are the business owner’s WhatsApp assistant.
> Goals: extract lead info from free-form text, images (business cards), or audio; keep Airtable as the source of truth; decide which tools to call and in what order; minimize questions; and confirm only when needed.
> Rules:
>
> 1. **Do not invent PII.** If email/phone is missing for an action that requires it, ask one concise question.
> 2. **Stages**: cold, warm, qualified, escalated. If none given, ask: “cold, warm, or qualified?”
> 3. **Upsert** leads (match by email > phone). Always log an Interaction.
> 4. If asked to start an email sequence without an email, offer: (a) save only, (b) WhatsApp intro instead.
> 5. Keep owner replies short and actionable.
> 6. When calling tools, **prefer a single minimal chain**; avoid redundant updates.
> 7. If confidence < 0.7 on extracted fields, reflect back findings for confirmation.
> 8. Respect safety and privacy; never expose secrets; never send bulk messages without explicit instruction.

## Tool Declarations

Use the function declarations your team implements in `packages/gemini/tools.ts` (same names & shapes listed under “Gemini Tools Prompt”).

## Few-Shot 1 — Business Card (clean)

**User**: *(sends clear card image)*
**Assistant (thought)**: extract {name, email, phone, company, role}. Ask stage.
**Assistant (tool calls)**:

1. `createOrUpsertLead({ …, source:"biz_card" })`
2. `updateLead({ leadId, stage:"warm", tags:["warm"] })`
3. `logInteraction({ leadId, channel:"whatsapp", mediaUrl:"<twilio>", outcome:"created" })`
4. `sendWhatsApp({ to: "<leadPhone>", text:"Hey <name>, great meeting you—..." })` (only if owner asked)
   **Assistant (owner reply)**: “Saved ✅ as **Warm**. Start intro sequence too?”

## Few-Shot 2 — Missing Email for Sequence

**User**: “Start the intro sequence for this person.” *(card image has phone only)*
**Assistant**: “I need an email to start a sequence. Save as **Warm** and send a WhatsApp intro instead?”
*(on “yes”)* → upsert lead (stage warm) → sendWhatsApp → logInteraction → confirm.

## Few-Shot 3 — Outbound Call with Intro

**User**: “Call Sarah with my 20s intro and ask for a Friday slot.”
**Assistant (tool calls)**: findLead → synthesizeTTS → placeCall → logInteraction → ownerNotify.
**Assistant (owner reply)**: “Calling now. I’ll log the outcome here.”

---

# Test Plan (what must pass before merge)

## Unit (Vitest)

* Zod schema validation for every public IO.
* Signature verification (valid/invalid).
* Tool dispatcher auth/rate-limit logic.
* Idempotent upsert hashing collisions.
* Error taxonomy mapping + redaction.

## Contract (Pact)

* Airtable: create/upsert, list, update; verify for expected request/response shapes.
* ConvertKit: startSequence/applyTag happy and error paths.
* Twilio: WhatsApp send; Voice place call (TwiML/REST) stubs.

## Integration (Supertest + MSW)

* Webhook end-to-end for: text, image, audio; async offload path; retry behavior.
* DLQ path correctness (message not lost, alert surfaced).

## E2E (Playwright)

* Full flows described in “E2E Test Prompt”.

## Non-functional

* **Load test** (k6 or Artillery): 100 RPS burst; <300ms median for simple text (cold start excluded).
* **Security scan**: npm audit (block high/critical), ESLint security plugin, tsec.
* **Coverage**: ≥95% lines/branches on `apps/*` and `packages/*` (enforced in CI).

---

# CI/CD (GitHub Actions – sketch)

1. `pnpm i --frozen-lockfile`
2. Lint + typecheck
3. Unit tests + coverage gate
4. Pact verification
5. Integration + E2E (MSW mode)
6. Build Docker images (distroless, non-root)
7. Trivy scan images
8. Deploy to **staging** Cloud Run (Terraform apply)
9. Smoke tests against staging
10. Manual approval → production deploy

---

# Environment & Config (12-factor)

* `TWILIO_AUTH_TOKEN` (webhook verify)
* `TWILIO_ACCOUNT_SID`, `TWILIO_MESSAGING_SID`, `TWILIO_VOICE_CALLER_ID`
* `AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID`, `AIRTABLE_LEADS_TABLE`, `AIRTABLE_INTERACTIONS_TABLE`
* `CONVERTKIT_API_KEY`, `CONVERTKIT_API_SECRET`
* `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`
* `GCP_PROJECT_ID`, `GCP_LOCATION`, `GEMINI_MODEL=projects/.../locations/.../publishers/google/models/gemini-1.5-pro`
* **All pulled at runtime from Secret Manager; never in env files.**

---

## “Definition of Done” (per story)

* All tests pass (unit/contract/integration/e2e) with coverage ≥95%.
* Static analysis clean (ESLint, tsec, Knip).
* Load test within SLOs.
* No secrets or PII in repo or logs.
* Observability: logs/metrics show the new path; dashboards updated.

---

If you want, I can also drop in **starter repo scaffolding** (pnpm workspaces, tsconfig bases, eslint configs, Terraform modules) ready to clone and run.

---

### [Step 0 – Monorepo Scaffolding] (Completed on 2025-08-21)
- Created initial pnpm workspace and base tooling to align with the architecture above.
- Added root configs: `pnpm-workspace.yaml`, `package.json` (workspaces + scripts), `tsconfig/base.json`, `.eslintrc.cjs`, `.prettierrc.json`, `vitest.config.ts`, `.gitignore`.
- Created services and packages:
  - `apps/router-api` with Fastify server and `/health` route (`apps/router-api/src/index.ts`).
  - `apps/worker-tasks` with Fastify server and `/health` route (`apps/worker-tasks/src/index.ts`).
  - `packages/shared` with initial export (`packages/shared/src/index.ts`).
- Verified: workspace install, per-package builds (`tsup`), and per-package typechecks (`tsc --noEmit`) all succeed.
- Notes: Used `npx pnpm@9` to avoid global install due to Corepack permission (EACCES) on this machine.

### [Step 1 – WhatsApp Webhook Skeleton] (Completed on 2025-08-21)
- Implemented `POST /webhooks/twilio/whatsapp` in `apps/router-api/src/webhooks/twilioWhatsapp.ts`.
- Added Twilio signature verification utility `apps/router-api/src/utils/twilioSignature.ts` with constant-time compare.
- Request parsing via `@fastify/formbody`; validation with **Zod** for Twilio form fields.
- Response is minimal TwiML ACK; logs redact PII via masking helper.
- Tests in `apps/router-api/src/webhooks/twilioWhatsapp.spec.ts` cover valid/invalid signatures using Fastify inject and deterministic signature generation.
- Dependencies updated in `apps/router-api/package.json` to include `@fastify/formbody`.

### [Step 2 – Gemini Tools Scaffold] (Completed on 2025-08-21)
- Created `packages/gemini` with Zod schemas and dispatcher:
  - File: `packages/gemini/src/index.ts` exports schemas for all tools listed in the blueprint and a stubbed `dispatch` that validates input, enforces basic auth and a per-key rate limit, and returns mock results.
  - Tests: `packages/gemini/src/index.spec.ts` validate schemas, unauthorized access, and rate limiting.
- Build and tests pass for the package.

### [Step 3 – Airtable Client Scaffold] (Completed on 2025-08-21)
- Created `packages/clients` with `src/airtable.ts` exporting Zod-typed `Lead` and `Interaction` schemas and an `AirtableClient` with:
  - Idempotent `upsertLead` by `(email|phone, company)` using stable hash.
  - In-memory storage for now; stubbed for future REST integration with retries/backoff.
  - `createInteraction`, `getLeadById`, and `updateLead` helpers that validate via Zod and update timestamps.
- Tests in `packages/clients/src/airtable.spec.ts` cover idempotent upsert, interaction creation, and updates.
- Package build and tests are green.

### [Step 4 – Twilio Client Scaffold] (Completed on 2025-08-21)
- Added `packages/clients/src/twilio.ts` with:
  - `sendWhatsApp` and `placeVoiceCall` stubs with Zod-validated params/results.
  - Signature helpers `computeTwilioSignature` and `verifyTwilioSignature` (HMAC-SHA1, constant-time compare).
- Tests in `packages/clients/src/twilio.spec.ts` validate basic behaviors and signature verification.
- Exported from `packages/clients/src/index.ts`.

### [Step 5 – Wire Clients into Webhook] (Completed on 2025-08-21)
- Added Fastify plugin `apps/router-api/src/plugins/clients.ts` to initialize `AirtableClient` and `TwilioClient` and decorate `app.clients`.
- Registered the plugin in `apps/router-api/src/index.ts` and updated the WhatsApp webhook to upsert a Lead and log an Interaction using the in-memory clients.
- Kept behavior stubbed (no external calls); returned `200` with empty TwiML after validation and signature check.
- Tests for the webhook remain green.

### [Step 6 – Session Store Scaffold] (Completed on 2025-08-21)
- Added `packages/shared/src/sessionStore.ts` with Zod-typed `Session` and `InMemorySessionStore` supporting TTL and optimistic concurrency (version increments).
- Exported via `@ess/shared` and added unit tests `packages/shared/src/sessionStore.spec.ts` covering put/get, version conflicts, and TTL expiration.
- Ready to swap with Firestore-backed implementation using the same interface.

### [Step 7 – ConvertKit Client Scaffold] (Completed on 2025-08-21)
- Added `packages/clients/src/convertkit.ts` with Zod-validated `applyTag` and `startSequence` stubs and exported via `packages/clients/src/index.ts`.
- Tests in `packages/clients/src/convertkit.spec.ts` cover happy paths and validation failure for invalid email.
- Package builds and tests pass.

### [Step 8 – ElevenLabs Client Scaffold] (Completed on 2025-08-21)
- Added `packages/clients/src/elevenlabs.ts` with Zod-validated `synthesize` supporting text chunking and a simple concurrency-limited pool.
- Tests in `packages/clients/src/elevenlabs.spec.ts` cover chunk splitting and synthesize behavior.
- Exported via `packages/clients/src/index.ts`; build and tests pass.

